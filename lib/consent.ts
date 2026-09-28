/**
 * The visitor's consent for Ospry, and the only code that may load the Ospry tag. Client only.
 * Entry doc: docs/OSPRY.md.
 *
 * ⛔ WHY THE TAG IS NEVER IN SERVER HTML. Measured 28.09.2026 on the live site: the loader Ospry
 * serves for this account has its own banner switched off, and the pixel it loads, finding no
 * consent platform on the page, grants consent to itself after 1.2 seconds and identifies the
 * visitor. So "the vendor's banner gates it" was false, and the only gate that holds by
 * construction is ours: the script element does not exist until the visitor has said yes.
 * scripts/check-ospry.mjs fails the build if the tag ever reaches rendered HTML again.
 *
 * The choice lives in a first-party cookie, `pl_consent`, which stores nothing but the choice
 * itself. Remembering a refusal is strictly necessary and needs no consent of its own.
 */
import { OSPRY_TAG_SRC } from './ospry'

export type ConsentChoice = 'granted' | 'denied'
export type ConsentState = ConsentChoice | 'unset'

const COOKIE = 'pl_consent'
/**
 * Bump when the banner's wording or what the tag does changes. Stored with every choice, so a
 * recorded yes can be tied to the exact text in git that the visitor agreed to, and an older yes
 * is asked again rather than stretched over something it never covered.
 */
export const CONSENT_VERSION = 1
/** How long a choice is remembered before the visitor is asked again. */
const KEEP_DAYS: Record<ConsentChoice, number> = { granted: 365, denied: 180 }
/** Paths where the tag is never loaded and the banner never shows: the archived Seatrade draw. */
const EXCLUDED_PREFIXES = ['/seatrade']

type Listener = () => void
const listeners = new Set<Listener>()
let openRequested = false

declare global {
  interface Window {
    SightConsent?: { granted?: boolean; denied?: boolean; revoke?: () => void }
  }
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

export function readConsent(): ConsentState {
  if (typeof document === 'undefined') return 'unset'
  const m = document.cookie.match(/(?:^|;\s*)pl_consent=(granted|denied)\.v(\d+)\./)
  return m && Number(m[2]) === CONSENT_VERSION ? (m[1] as ConsentChoice) : 'unset'
}

function writeCookie(choice: ConsentChoice) {
  const secure = location.protocol === 'https:' ? ';secure' : ''
  document.cookie = `${COOKIE}=${choice}.v${CONSENT_VERSION}.${Date.now()};max-age=${KEEP_DAYS[choice] * 86400};path=/;samesite=lax${secure}`
}

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

/** Inserts the tag once. Safe to call repeatedly; does nothing unless consent is on record. */
export function loadOspry() {
  if (readConsent() !== 'granted' || hasGpc()) return
  if (document.querySelector(`script[src="${OSPRY_TAG_SRC}"]`)) return
  // Tell the pixel consent exists before it runs, so it fires on the visit that granted it rather
  // than after its own 1.2 second fallback. It reads this object on load.
  window.SightConsent = { ...(window.SightConsent ?? {}), granted: true, denied: false }
  const s = document.createElement('script')
  s.async = true
  s.src = OSPRY_TAG_SRC
  document.head.appendChild(s)
}

/** Everything the pixel stores on this origin, measured from its source on 28.09.2026: `lgn_*`. */
function clearOspryStorage() {
  const host = location.hostname
  const domains = ['', host, `.${host}`, `.${host.split('.').slice(-2).join('.')}`]
  for (const part of document.cookie.split(';')) {
    const name = part.split('=')[0].trim()
    if (!name.startsWith('lgn_')) continue
    for (const d of domains) {
      document.cookie = `${name}=;max-age=0;path=/${d ? `;domain=${d}` : ''}`
    }
  }
  for (const store of [localStorage, sessionStorage]) {
    try {
      Object.keys(store).filter((k) => k.startsWith('lgn_')).forEach((k) => store.removeItem(k))
    } catch {
      // Storage can be blocked outright; there is then nothing of theirs in it either.
    }
  }
}

export function choose(choice: ConsentChoice) {
  const wasLoaded = !!document.querySelector(`script[src="${OSPRY_TAG_SRC}"]`)
  writeCookie(choice)
  openRequested = false
  if (choice === 'granted') {
    loadOspry()
    emit()
    return
  }
  try {
    window.SightConsent?.revoke?.()
  } catch {
    // The pixel's own revoke is a courtesy; the reload below is what actually stops it.
  }
  clearOspryStorage()
  emit()
  // A running script cannot be unloaded. Withdrawing after it loaded therefore reloads the page,
  // which comes back without it because the cookie now says denied.
  if (wasLoaded) location.reload()
}
