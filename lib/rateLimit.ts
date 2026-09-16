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
 * The caller's address, or null when no header carries one.
 *
 * Null means "do not apply the per-caller rule", never "one shared bucket for everyone": a shared
 * bucket would let a single script lock out every visitor whose address we could not read, which
 * turns a missing header into an outage. The per-recipient rule still applies on that path.
 */
export function clientIp(request: Request): string | null {
  const direct = request.headers.get('x-nf-client-connection-ip')
  if (direct) return direct.trim()
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0].trim()
    if (first) return first
  }
  return null
}
