/**
 * Signed values for visitor intelligence, all keyed by INTEL_SECRET (Netlify env; 1Password item
 * named in docs/VISITOR-INTELLIGENCE.md).
 *
 *   Link token  `?pl=<payload>.<sig>` on links in emails WE send one person. The payload is
 *               base64url JSON { e: email, n?: name, c?: company }. Made by scripts/lead-link.mjs.
 *               Only a token this secret signed is believed, so a visitor cannot claim to be
 *               someone else by editing a URL.
 *   Admin       the /leads session cookie is an HMAC of a fixed label, so it proves knowledge of
 *               the secret without being the secret.
 */
import { createHmac, timingSafeEqual } from 'node:crypto'

function secret(): string | null {
  const s = process.env.INTEL_SECRET
  return s && s.length >= 32 ? s : null
}

function sign(data: string, key: string): string {
  return createHmac('sha256', key).update(data).digest('base64url')
}

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a)
  const y = Buffer.from(b)
  return x.length === y.length && timingSafeEqual(x, y)
}

export interface LinkIdentity {
  e: string
  n?: string
  c?: string
}

export function makeLinkToken(id: LinkIdentity, key: string | null = secret()): string {
  if (!key) throw new Error('INTEL_SECRET is not set (32+ characters).')
  const payload = Buffer.from(JSON.stringify(id)).toString('base64url')
  return `${payload}.${sign(`link:${payload}`, key)}`
}

export function readLinkToken(token: string | null | undefined, key: string | null = secret()): LinkIdentity | null {
  if (!token || !key || token.length > 1200) return null
  const [payload, sig] = token.split('.')
  if (!payload || !sig || !safeEqual(sig, sign(`link:${payload}`, key))) return null
  try {
    const id = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as LinkIdentity
    return typeof id.e === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(id.e) ? id : null
  } catch {
    return null
  }
}

/** The value of the /leads admin cookie. Null when the secret is missing, so nothing can match it. */
export function adminCookieValue(key: string | null = secret()): string | null {
  return key ? sign('admin:leads:v1', key) : null
}

export function isAdminSecret(candidate: string | null | undefined, key: string | null = secret()): boolean {
  return !!candidate && !!key && safeEqual(candidate, key)
}

export function isAdminCookie(value: string | null | undefined): boolean {
  const expected = adminCookieValue()
  return !!value && !!expected && safeEqual(value, expected)
}
