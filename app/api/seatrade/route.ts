/**
 * POST /api/seatrade/ — the scorecard sign-up.
 *
 * 1. Validate (honeypot, consent, complete answers, sane name/email/company).
 * 2. Re-score server-side. The client's number is never trusted.
 * 3. Store the lead (Netlify Blobs), deduped by email: a second submission updates the document,
 *    re-sends e1 with the new score, and does NOT book the sequence again.
 * 4. Send e1 now; on a first submission book e2–e4 with Resend `scheduledAt`.
 * 5. Add the contact to the Resend audience (best effort) and notify the admin (best effort).
 * 6. Return the result + live stats so the page can show "you vs the show".
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ADMIN_EMAIL, FROM, RESEND_AUDIENCE_ID, SEQUENCE, scheduleAt } from '@/lib/seatrade/config'
import { renderAdmin, renderE1, renderE2, renderE3, renderE4, unsubscribeHeaders, type LeadEmailInput } from '@/lib/seatrade/emails'
import { cleanSource, isComplete, score, type Answers } from '@/lib/seatrade/scorecard'
import { findLeadByEmail, getStats, invalidateStats, newLeadId, saveLead, type Lead } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

interface Body {
  name?: unknown
  email?: unknown
  company?: unknown
  answers?: unknown
  consent?: unknown
  source?: unknown
  /** Honeypot. Humans never see it; bots fill it. */
  website?: unknown
  /** Set only by the verification script; keeps test leads out of the benchmark. */
  test?: unknown
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (str(body.website, 10)) {
    // Honeypot tripped. Pretend success so the bot moves on.
    return NextResponse.json({ ok: true })
  }

  const name = str(body.name, 80)
  const email = str(body.email, 120).toLowerCase()
  const company = str(body.company, 120)
  const answers = body.answers as Partial<Answers> | undefined

  if (name.length < 2) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Please enter a valid work email.' }, { status: 400 })
  if (company.length < 2) return NextResponse.json({ error: 'Please enter your company.' }, { status: 400 })
  if (body.consent !== true) return NextResponse.json({ error: 'Please tick the box so we can email you.' }, { status: 400 })
  if (!answers || typeof answers !== 'object' || !isComplete(answers)) {
    return NextResponse.json({ error: 'Please answer every question.' }, { status: 400 })
  }

  const result = score(answers)
  const now = new Date()
  const resend = new Resend(process.env.RESEND_API_KEY)

  // ── Store (dedupe by email) ──
  const existing = await findLeadByEmail(email)
  const isNew = !existing
  const lead: Lead = existing
    ? {
        ...existing,
        name, company, answers,
        score: result.score, band: result.band.id,
        updatedAt: now.toISOString(),
        submissions: (existing.submissions ?? 1) + 1,
        userAgent: request.headers.get('user-agent') ?? existing.userAgent,
      }
    : {
        id: newLeadId(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        source: cleanSource(body.source),
        name, email, company, answers,
        score: result.score,
        band: result.band.id,
        consent: true,
        resend: {},
        submissions: 1,
        test: body.test === true || undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      }

  const input: LeadEmailInput = { id: lead.id, name, email, company, answers, result }

  // ── e1 now ──
  const e1 = renderE1(input)
  const e1Res = await resend.emails.send({
    from: FROM,
    to: email,
    replyTo: ADMIN_EMAIL,
    subject: e1.subject,
    html: e1.html,
    text: e1.text,
    headers: { ...unsubscribeHeaders(lead.id), 'X-Portlink-Seatrade': 'e1' },
  })
  if (e1Res.error) {
    console.error('[seatrade] e1 send failed', e1Res.error)
    return NextResponse.json({ error: 'We could not send your scorecard. Please try again.' }, { status: 502 })
  }
  lead.resend.e1 = e1Res.data?.id

  // ── e2–e4 scheduled (first submission only, never after an unsubscribe) ──
  if (isNew) {
    const renderers = { e2: renderE2, e3: renderE3, e4: renderE4 } as const
    for (const step of SEQUENCE) {
      const rendered = renderers[step.key](input)
      const res = await resend.emails.send({
        from: FROM,
        to: email,
        replyTo: ADMIN_EMAIL,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        scheduledAt: scheduleAt(now, step.daysAfter),
        headers: { ...unsubscribeHeaders(lead.id), 'X-Portlink-Seatrade': step.key },
      })
      if (res.error) console.error(`[seatrade] ${step.key} schedule failed`, res.error)
      else lead.resend[step.key] = res.data?.id
    }
  }

  await saveLead(lead)
  invalidateStats()

  // ── Best-effort side effects: audience contact + admin notification ──
  const [firstName, ...rest] = name.split(/\s+/)
  await Promise.allSettled([
    isNew
      ? resend.contacts.create({ audienceId: RESEND_AUDIENCE_ID, email, firstName, lastName: rest.join(' ') || undefined, unsubscribed: false })
      : Promise.resolve(),
    (() => {
      const admin = renderAdmin({ ...input, source: lead.source, submissions: lead.submissions })
      return resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: (lead.test ? '[TEST] ' : '') + admin.subject,
        html: admin.html,
        text: admin.text,
      })
    })(),
  ]).then(results => {
    results.forEach((r, i) => { if (r.status === 'rejected') console.error('[seatrade] side effect failed', i, r.reason) })
  })

  const stats = await getStats({ fresh: true })

  return NextResponse.json({
    ok: true,
    id: lead.id,
    score: result.score,
    band: result.band,
    findings: result.findings,
    stats: { n: stats.n, avg: stats.avg, emailShare: stats.emailShare },
    isNew,
  })
}
