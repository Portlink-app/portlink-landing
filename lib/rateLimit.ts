/**
 * A sliding-window counter for the public endpoints that can cause an email to be sent.
 *
 * WHAT IT IS, PLAINLY. It remembers recent hits per key in the memory of one running instance and
 * says yes or no. Nothing is stored, nothing is shared between instances, and it forgets
 * everything when the instance is recycled.
 *
 * WHAT IT IS NOT, AND THIS MATTERS MORE. Netlify runs this site's routes as serverless functions.
 * A warm container keeps this module's memory between requests, so one caller hammering the
 * endpoint at a normal pace is counted and stopped. A caller with enough concurrency to be spread
 * across fresh containers is not. So this is a speed bump on the cheapest abuse, not a guarantee,
 * and saying so here is deliberate: a limiter that is mistaken for protection is worse than none,
 * because it ends the search for the real ceiling.
 *
 * The real ceiling is the refusal rules in front of it. An address that cannot pass
 * `pilotEmailProblem` is never mailed, however many times or from however many places it is
 * submitted, because no mail client is even constructed on that path.
 */

export interface RateLimitRule {
  /** Hits allowed inside the window. The hit that would exceed it is refused. */
  limit: number
  windowMs: number
}

/** key -> timestamps of the hits that were allowed, oldest first. */
const hits = new Map<string, number[]>()

/** Housekeeping bound. One key per caller per rule; a sweep runs when the map gets broad. */
const SWEEP_AT_KEYS = 2_000
const MAX_RETENTION_MS = 60 * 60 * 1000

/**
 * True when this hit is allowed, false when it exceeds the rule.
 *
 * A refused hit is NOT recorded. Recording it would let a burst hold a key shut for as long as the
 * burst continues, which punishes the visitor who retries after a genuine failure rather than the
 * script, and the script is not the one who gives up.
 */
export function rateLimit(key: string, rule: RateLimitRule, now: number = Date.now()): boolean {
  const cutoff = now - rule.windowMs
  const recent = (hits.get(key) ?? []).filter(t => t > cutoff)
  const allowed = recent.length < rule.limit
  if (allowed) recent.push(now)
  if (recent.length) hits.set(key, recent)
  else hits.delete(key)
  if (hits.size > SWEEP_AT_KEYS) sweep(now)
  return allowed
}

function sweep(now: number): void {
  const cutoff = now - MAX_RETENTION_MS
  for (const [key, times] of hits) {
    const kept = times.filter(t => t > cutoff)
    if (kept.length) hits.set(key, kept)
    else hits.delete(key)
  }
}

/** Test seam. Never called by request handling. */
export function resetRateLimits(): void {
  hits.clear()
}

/**
 * Cloudflare's published edge ranges (https://www.cloudflare.com/ips-v4 and /ips-v6, read
 * 29.09.2026). portlink.app is proxied through Cloudflare in front of Netlify (nameservers
 * *.ns.cloudflare.com, `server: cloudflare`), so the connection Netlify sees comes from one of these.
 */
const CLOUDFLARE_V4 = ['173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22', '141.101.64.0/18',
  '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20', '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15',
  '104.16.0.0/13', '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22']
const CLOUDFLARE_V6 = ['2400:cb00::/32', '2606:4700::/32', '2803:f800::/32', '2405:b500::/32', '2405:8100::/32',
  '2a06:98c0::/29', '2c0f:f248::/32']

function v4ToInt(ip: string): number | null {
  const p = ip.split('.').map(Number)
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return null
  return ((p[0] << 24) >>> 0) + (p[1] << 16) + (p[2] << 8) + p[3]
}

function v6ToBigInt(ip: string): bigint | null {
  if (!ip.includes(':') || ip.includes('.')) return null
  const [head, tail = ''] = ip.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  const groups = [...h, ...Array(ip.includes('::') ? 8 - h.length - t.length : 0).fill('0'), ...t]
  if (groups.length !== 8 || groups.some((g) => !/^[0-9a-f]{1,4}$/i.test(g))) return null
  return groups.reduce((acc, g) => (acc << BigInt(16)) + BigInt(parseInt(g, 16)), BigInt(0))
}

/** True when the address is inside one of Cloudflare's edge ranges. */
export function isCloudflareEdge(ip: string): boolean {
  const n4 = v4ToInt(ip)
  if (n4 !== null) {
    return CLOUDFLARE_V4.some((cidr) => {
      const [base, bits] = cidr.split('/')
      const b = v4ToInt(base)!
      const mask = Number(bits) === 0 ? 0 : (~0 << (32 - Number(bits))) >>> 0
      return ((n4 & mask) >>> 0) === ((b & mask) >>> 0)
    })
  }
  const n6 = v6ToBigInt(ip)
  if (n6 === null) return false
  return CLOUDFLARE_V6.some((cidr) => {
    const [base, bits] = cidr.split('/')
    const shift = BigInt(128 - Number(bits))
    return (n6 >> shift) === (v6ToBigInt(base)! >> shift)
  })
}

/**
 * The caller's address, or null when no header carries one.
 *
 * ⛔ BEHIND CLOUDFLARE, THE CONNECTION IS CLOUDFLARE. Measured 29.09.2026: every visit recorded by
 * visitor intelligence came from "Cloudflare, Inc.", this Mac's own request included, while its real
 * egress was GlobalConnect (AS2116). The visitor's address is in `cf-connecting-ip`, and it is
 * believed ONLY when the connection Netlify saw is itself a Cloudflare edge, so a caller that hits
 * the Netlify origin directly cannot pick its own address. The same defect had pooled the per-IP
 * rate limits of /api/access and /api/havn per Cloudflare location.
 *
 * Null means "do not apply the per-caller rule", never "one shared bucket for everyone": a shared
 * bucket would let a single script lock out every visitor whose address we could not read, which
 * turns a missing header into an outage. The per-recipient rule still applies on that path.
 */
export function clientIp(request: Request): string | null {
  const direct = request.headers.get('x-nf-client-connection-ip')?.trim() || null
  const viaCloudflare = request.headers.get('cf-connecting-ip')?.trim() || null
  if (direct && viaCloudflare && isCloudflareEdge(direct)) return viaCloudflare
  if (direct) return direct
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return null
}

/**
 * The visitor's country code. Behind Cloudflare, Netlify's own geo header describes the Cloudflare
 * edge, not the visitor, so Cloudflare's `cf-ipcountry` wins when the connection is a Cloudflare edge.
 * City is only known when the connection is direct (Netlify geo), so it is dropped otherwise.
 */
export function clientGeo(request: Request): { country?: string; city?: string } {
  const direct = request.headers.get('x-nf-client-connection-ip')?.trim()
  if (direct && isCloudflareEdge(direct)) {
    const cc = request.headers.get('cf-ipcountry')?.trim()
    return cc && /^[A-Z]{2}$/.test(cc) && cc !== 'XX' && cc !== 'T1' ? { country: cc } : {}
  }
  const raw = request.headers.get('x-nf-geo')
  if (!raw) return {}
  try {
    const g = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as { country?: { code?: string }; city?: string }
    return { country: g.country?.code, city: g.city }
  } catch {
    return {}
  }
}
