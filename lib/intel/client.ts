/**
 * Browser side of visitor intelligence. Client only. Entry doc: docs/VISITOR-INTELLIGENCE.md.
 *
 * Sends small JSON events to /api/intel/v with sendBeacon. Writes exactly one cookie, `pl_vid`,
 * and only when the visitor has switched on "Remember me" (lib/consent.ts calls ensureVid).
 */
import { OPTOUT_COOKIE, UNTRACKED_PREFIXES, VID_COOKIE, VID_DAYS } from './config'

const ENDPOINT = '/api/intel/v/'  // trailing slash: next.config trailingSlash would 308 the bare path

function readCookie(name: string): string {
  if (typeof document === 'undefined') return ''
  const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : ''
}

function writeCookie(name: string, value: string, days: number) {
  const secure = location.protocol === 'https:' ? ';secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)};max-age=${days * 86400};path=/;samesite=lax${secure}`
}

export function isUntracked(pathname: string | null): boolean {
  return !!pathname && UNTRACKED_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/** A visitor who objected, or whose browser sends Global Privacy Control, is never recorded. */
export function trackingRefused(): boolean {
  if (typeof navigator !== 'undefined' && (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl) return true
  return readCookie(OPTOUT_COOKIE) === '1'
}

export function send(event: Record<string, unknown>) {
  try {
    if (trackingRefused()) return
    const body = new Blob([JSON.stringify(event)], { type: 'application/json' })
    if (navigator.sendBeacon?.(ENDPOINT, body)) return
    void fetch(ENDPOINT, { method: 'POST', body, keepalive: true, credentials: 'same-origin' }).catch(() => {})
  } catch {
    // Tracking never breaks the page.
  }
}

export const currentVid = () => {
  const v = readCookie(VID_COOKIE)
  return /^v_[A-Za-z0-9_-]{16,40}$/.test(v) ? v : ''
}

/** Called by the consent registry when "Remember me" is on. Idempotent. */
export function ensureVid() {
  if (currentVid()) return
  const bytes = crypto.getRandomValues(new Uint8Array(18))
  const id = 'v_' + btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  writeCookie(VID_COOKIE, id, VID_DAYS)
}

/** Called when "Remember me" is switched off: the server erases the link and the events, then the cookie goes. */
export function forgetVid() {
  const vid = currentVid()
  if (!vid) return
  send({ t: 'forget', vid })
  document.cookie = `${VID_COOKIE}=;max-age=0;path=/`
}

/** After a successful contact-form send. Does nothing unless "Remember me" is on. */
export function reportIdentity(person: { email: string; name?: string; company?: string; role?: string }) {
  if (!currentVid()) return
  send({ t: 'identify', ...person })
}

/** Objection to company-level recording, from /privacy/#choices. */
export function setObjection(objects: boolean) {
  if (objects) writeCookie(OPTOUT_COOKIE, '1', 365)
  else document.cookie = `${OPTOUT_COOKIE}=;max-age=0;path=/`
}

export const hasObjected = () => readCookie(OPTOUT_COOKIE) === '1'
