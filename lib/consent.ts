/**
 * The visitor's cookie choices, and the only code that may load an optional tag. Client only.
 * Entry doc: docs/CONSENT.md.
 *
 * LAYERED, ONE CATEGORY PER PURPOSE (28.09.2026). The first layer says one sentence and offers
 * Accept all / Reject all as equals; the per-cookie detail lives in the settings layer, one switch
 * per category. Adding a tag later means adding a row to CATEGORIES (with its load and clear), not
 * new banner code. A stored choice that lacks a registered category is treated as no choice, so a
 * new category is always asked about rather than assumed.
 *
 * ⛔ WHY NO OPTIONAL TAG IS EVER IN SERVER HTML. Measured 28.09.2026 on the live site: the loader
 * Ospry serves for this account has its own banner switched off, and the pixel it loads, finding no
 * consent platform on the page, grants consent to itself after 1.2 seconds and identifies the
 * visitor. The only gate that holds by construction is ours: the script element does not exist
 * until the visitor has switched its category on. scripts/check-consent-gate.mjs fails the build if the
 * tag ever reaches rendered HTML again.
 *
 * The choice lives in a first-party cookie, `pl_consent`, which stores nothing but the choice
 * itself. Remembering a refusal is strictly necessary and needs no consent of its own.
 */
import { currentVid, ensureVid, forgetVid } from './intel/client'
import { analyticsLoaded, disableAnalytics, loadAnalytics } from './analytics'

/**
 * Bump when the banner's wording or what a tag does changes. Stored with every choice, so a
 * recorded yes can be tied to the exact text in git the visitor agreed to, and an older yes is
 * asked again rather than stretched over something it never covered. 2 = the layered banner,
 * 3 = Google Analytics added and the first layer made general, 4 = Ospry replaced by our own
 * "Remember me" and the first layer reworded (docs/VISITOR-INTELLIGENCE.md).
 */
export const CONSENT_VERSION = 4
const COOKIE = 'pl_consent'
/** How long a choice is remembered: a year if anything was allowed, six months if all refused. */
const KEEP_DAYS = { anyAllowed: 365, allRefused: 180 }
/** Paths where no optional tag loads and the banner never shows: the archived Seatrade draw. */
const EXCLUDED_PREFIXES = ['/seatrade']

type Category = {
  id: string
  name: string
  /** One or two plain sentences: who, what, and anything a visitor would not expect. */
  description: string
  load: () => void
  isLoaded: () => boolean
  /** Removes what the tag stored in this browser. */
  clear: () => void
}

/**
 * Removes every cookie and storage key with this prefix. Google Analytics stores `_ga` and
 * `_ga_<stream>` on the site's root domain; the retired Ospry pixel stored `lgn_*` (28.09.2026).
 */
function clearByPrefix(prefix: string) {
  const host = location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0].trim()
    if (!name.startsWith(prefix)) continue
    for (const d of domains) document.cookie = `${name}=;max-age=0;path=/${d ? `;domain=${d}` : ''}`
  }
  for (const store of [localStorage, sessionStorage]) {
    try {
      Object.keys(store).filter((k) => k.startsWith(prefix)).forEach((k) => store.removeItem(k))
    } catch {
      // Storage can be blocked outright; there is then nothing of theirs in it either.
    }
  }
}

export const CATEGORIES = [
  {
    id: 'analytics',
    name: 'Analytics',
    description:
      'Google Analytics counts visits and shows which pages are read and how people found us. ' +
      'Google receives your IP address and device details; we do not use it for advertising. ' +
      'Its cookies start with _ga and last up to 13 months.',
    load: loadAnalytics,
    isLoaded: analyticsLoaded,
    clear() {
      disableAnalytics()
      clearByPrefix('_ga')
    },
  },
  {
    id: 'remember',
    name: 'Remember me',
    description:
      'A Portlink cookie (pl_vid) links your visits, and links them to you if you send us our contact ' +
      'form or open a link we emailed you, so our follow-up matches what you read. It stays with ' +
      'Portlink, is never shared, and lasts up to 13 months.',
    load: ensureVid,
    isLoaded: () => !!currentVid(),
    clear: forgetVid,
  },
] as const satisfies readonly Category[]

export type CategoryId = (typeof CATEGORIES)[number]['id']
export type Choices = Record<CategoryId, boolean>
/** The raw stored choice, e.g. "analytics-1_remember-0", or 'unset'. A string so React can compare snapshots. */
export type ConsentKey = string

type Listener = () => void
const listeners = new Set<Listener>()
let openRequested = false

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean
  }
}

export function isExcludedPath(pathname: string | null): boolean {
  return !!pathname && EXCLUDED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** Global Privacy Control is a standing refusal, so a browser that sends it is never asked. */
export function hasGpc(): boolean {
  return typeof navigator !== 'undefined' && navigator.globalPrivacyControl === true
}

export function readConsentKey(): ConsentKey {
  if (typeof document === 'undefined') return 'unset'
  const m = document.cookie.match(/(?:^|;\s*)pl_consent=v(\d+)\.\d+\.([a-z0-9_-]*)/)
  if (!m || Number(m[1]) !== CONSENT_VERSION) return 'unset'
  return parseChoices(m[2]) ? m[2] : 'unset'
}

/** "analytics-1_remember-0" → { analytics: true, remember: false }. Null when any registered category is missing. */
export function parseChoices(key: ConsentKey): Choices | null {
  if (key === 'unset') return null
  const stored = Object.fromEntries(key.split('_').map((p) => [p.slice(0, -2), p.endsWith('-1')]))
  const out = {} as Choices
  for (const c of CATEGORIES) {
    if (!(c.id in stored)) return null
    out[c.id] = stored[c.id]
  }
  return out
}

function toKey(choices: Choices): ConsentKey {
  return CATEGORIES.map((c) => `${c.id}-${choices[c.id] ? 1 : 0}`).join('_')
}

export const allChoices = (value: boolean): Choices =>
  Object.fromEntries(CATEGORIES.map((c) => [c.id, value])) as Choices

function emit() {
  listeners.forEach((l) => l())
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Whether something (the footer link, the privacy page) asked for the banner to reopen. */
export function isOpenRequested(): boolean {
  return openRequested
}

export function requestOpen() {
  openRequested = true
  emit()
}

export function closeRequested() {
  openRequested = false
  emit()
}

/** Loads every allowed tag once. Safe to call repeatedly; does nothing without a stored yes. */
export function loadAllowed() {
  // Ospry was retired on 29.09.2026. Visitors who allowed it before then still carry its lgn_*
  // cookie and storage; remove them on every visit so nothing of it outlives the tool.
  clearByPrefix('lgn_')
  if (hasGpc()) return
  const choices = parseChoices(readConsentKey())
  if (!choices) return
  for (const c of CATEGORIES) if (choices[c.id]) c.load()
}

export function choose(choices: Choices) {
  const anyAllowed = CATEGORIES.some((c) => choices[c.id])
  const days = anyAllowed ? KEEP_DAYS.anyAllowed : KEEP_DAYS.allRefused
  const secure = location.protocol === 'https:' ? ';secure' : ''
  document.cookie = `${COOKIE}=v${CONSENT_VERSION}.${Date.now()}.${toKey(choices)};max-age=${days * 86400};path=/;samesite=lax${secure}`
  openRequested = false

  // A running script cannot be unloaded. Switching a loaded tag off therefore clears what it
  // stored and reloads the page, which comes back without it because the cookie now says no.
  let mustReload = false
  for (const c of CATEGORIES) {
    if (choices[c.id]) continue
    if (c.isLoaded()) mustReload = true
    c.clear()
  }
  loadAllowed()
  emit()
  if (mustReload) location.reload()
}
