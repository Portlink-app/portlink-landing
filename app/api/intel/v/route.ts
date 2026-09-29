/**
 * POST /api/intel/v: the visitor-intelligence collector. Entry doc: docs/VISITOR-INTELLIGENCE.md.
 *
 * Receives one small JSON event per page view, deep scroll, form send or page exit from
 * components/intel/VisitorTracker.tsx, and stores it with the company that owns the visitor's
 * network. What it deliberately does NOT do:
 *   - store an IP, whole or truncated, next to the event (only the org it resolved to);
 *   - set or read any cookie except `pl_vid`, which exists only after "Remember me";
 *   - accept a person's identity from the client except (a) right after they sent our contact
 *     form with "Remember me" on, or (b) through a link token only our secret can sign.
 * Every failure answers 204: the page never waits on this, and a tracker that errors is a tracker
 * someone switches off.
 */
import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { clientGeo, clientIp, rateLimit } from '@/lib/rateLimit'
import { OPTOUT_COOKIE, UNTRACKED_PREFIXES, VID_COOKIE } from '@/lib/intel/config'
import { resolveOrg } from '@/lib/intel/org'
import { daySalt, day, forgetVisitor, putEvent, setIdentity, type EventType, type IntelEvent } from '@/lib/intel/store'
import { readLinkToken } from '@/lib/intel/token'

export const dynamic = 'force-dynamic'

const TYPES: EventType[] = ['pv', 'scroll', 'form', 'leave', 'identify', 'link', 'forget']
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|preview|facebookexternalhit|embedly|monitor|curl|wget|python-requests|axios|node-fetch|go-http/i
const PER_IP = { limit: 120, windowMs: 10 * 60 * 1000 }
const done = () => new NextResponse(null, { status: 204 })

const str = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

function cookie(request: Request, name: string): string {
  const m = (request.headers.get('cookie') ?? '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
  return m ? decodeURIComponent(m[1]) : ''
}

export async function POST(request: Request) {
  try {
    const ua = request.headers.get('user-agent') ?? ''
    if (!ua || BOT.test(ua)) return done()
    if (cookie(request, OPTOUT_COOKIE) === '1' || request.headers.get('sec-gpc') === '1') return done()

    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
    if (!body) return done()
    const t = str(body.t, 12) as EventType
    if (!TYPES.includes(t)) return done()
    const p = str(body.p, 300)
    if (p && UNTRACKED_PREFIXES.some((x) => p === x || p.startsWith(`${x}/`))) return done()

    const ip = clientIp(request)
    if (ip && !rateLimit(`intel:${ip}`, PER_IP)) return done()

    // "Remember me" is on only if the consented cookie is present and well formed.
    const vidRaw = cookie(request, VID_COOKIE)
    const vid = /^v_[A-Za-z0-9_-]{16,40}$/.test(vidRaw) ? vidRaw : undefined

    if (t === 'forget') {
      // The id is a random 144-bit value that only the visitor's own browser holds, so knowing it is the
      // proof. The cookie itself may already be gone: the client deletes it right after sending this.
      const target = str(body.vid, 60)
      if (/^v_[A-Za-z0-9_-]{16,40}$/.test(target)) await forgetVisitor(target)
      return done()
    }

    const salt = await daySalt(day())
    const vk = createHash('sha256').update(`${salt}|${ip ?? ''}|${ua}`).digest('base64url').slice(0, 22)

    const ev: IntelEvent = { ts: new Date().toISOString(), t, vk, vid, p: p || undefined, ...clientGeo(request) }
    const title = str(body.title, 160)
    if (title) ev.title = title
    const ref = str(body.ref, 200)
    if (ref) ev.ref = ref
    if (body.utm && typeof body.utm === 'object') {
      const utm: Record<string, string> = {}
      for (const k of ['source', 'medium', 'campaign', 'term', 'content']) {
        const v = str((body.utm as Record<string, unknown>)[k], 100)
        if (v) utm[k] = v
      }
      if (Object.keys(utm).length) ev.utm = utm
    }
    if (t === 'leave') ev.ms = Math.max(0, Math.min(Number(body.ms) || 0, 6 * 3600_000))
    if (t === 'form') ev.formId = str(body.formId, 60) || undefined

    if (t === 'link') {
      const id = readLinkToken(str(body.token, 1200))
      if (!id) return done()
      ev.person = { email: id.e.toLowerCase(), name: id.n, company: id.c, source: 'link', linkedAt: ev.ts }
      if (vid) await setIdentity(vid, ev.person)
    }

    if (t === 'identify') {
      // Only a consented visitor, and only with what they just typed into our own form.
      if (!vid) return done()
      const email = str(body.email, 160).toLowerCase()
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return done()
      ev.person = {
        email,
        name: str(body.name, 80) || undefined,
        company: str(body.company, 120) || undefined,
        role: str(body.role, 40) || undefined,
        source: 'form',
        linkedAt: ev.ts,
      }
      await setIdentity(vid, ev.person)
    }

    const org = await resolveOrg(ip)
    if (org) ev.org = org
    await putEvent(ev)
    return done()
  } catch (err) {
    console.error('[intel] collector failed', err instanceof Error ? err.message : err)
    return done()
  }
}
