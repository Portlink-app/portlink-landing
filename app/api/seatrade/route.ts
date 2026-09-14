/**
 * POST /api/seatrade/ — the scorecard sign-up.
 *
 * 1. Validate (honeypot, consent, complete answers, sane name/company, a WORK email: free-mail and
 *    disposable providers are refused with a message).
 * 2. Re-score server-side. The client's number is never trusted.
 * 3. Store the lead (Netlify Blobs), deduped by normalised email: a second submission updates the
 *    document, re-sends e1 with the new score, and does NOT book the sequence or change referrals.
 * 4. New leads get a referral code, an optional `referredBy` (the code they arrived with, never
 *    their own), e1 now, a "confirm your email" reminder at +20 h, and e2–e4 via `scheduledAt`.
 * 5. Add the contact to the Resend audience (best effort) and notify the admin (best effort).
 * 6. Return the result, the referral link and live stats so the page can show "you vs the show".
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ADMIN_EMAIL, FROM, ME_PATH, RESEND_AUDIENCE_ID, SEQUENCE, VERIFY_REMINDER_HOURS, referralUrl, scheduleAt } from '@/lib/seatrade/config'
import { cleanCode, domainMatch, emailDomain, normalizeEmail, workEmailProblem } from '@/lib/seatrade/eligibility'
import { renderAdmin, renderE1, renderE2, renderE3, renderE4, renderVerifyReminder, unsubscribeHeaders, type LeadEmailInput } from '@/lib/seatrade/emails'
import { cleanSource, isComplete, score, type Answers } from '@/lib/seatrade/scorecard'
import { findLeadByCode, findLeadByEmail, getStats, invalidateStats, newLeadId, newReferralCode, saveLead, type Lead } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

interface Body {
  name?: unknown
  email?: unknown
  company?: unknown
  roleDetail?: unknown
  answers?: unknown
  consent?: unknown
  source?: unknown
  /** Referral code from ?r=, carried by the page. */
  ref?: unknown
  /** Honeypot. Humans never see it; bots fill it. */
  website?: unknown
  /** Set only by the verification script; keeps test leads out of the benchmark and the draw. */
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
  const rawEmail = str(body.email, 120)
  const company = str(body.company, 120)
  const roleDetail = str(body.roleDetail, 120)
  const answers = body.answers as Partial<Answers> | undefined

  if (name.length < 2) return NextResponse.json({ error: 'Please enter your name.' }, { status: 400 })
  const emailProblem = workEmailProblem(rawEmail)
  if (emailProblem) return NextResponse.json({ error: emailProblem }, { status: 400 })
  if (company.length < 2) return NextResponse.json({ error: 'Please enter where you work.' }, { status: 400 })
  if (body.consent !== true) return NextResponse.json({ error: 'Please tick the box so we can email you.' }, { status: 400 })
  if (!answers || typeof answers !== 'object' || !isComplete(answers)) {
    return NextResponse.json({ error: 'Please answer every question.' }, { status: 400 })
  }
  if (answers.role === 'other' && roleDetail.length < 3) {
    return NextResponse.json({ error: 'Tell us in a few words what you do in the industry.' }, { status: 400 })
  }

  const email = normalizeEmail(rawEmail)
  const domain = emailDomain(email)
  const result = score(answers)
  const now = new Date()
  const resend = new Resend(process.env.RESEND_API_KEY)

  // ── Store (dedupe by email) ──
  const existing = await findLeadByEmail(email)
  const isNew = !existing

  // Referral: only on a first submission, only a code that exists, never your own.
  let referrer: Lead | null = null
  if (isNew) {
    const code = cleanCode(body.ref)
    if (code) {
      const found = await findLeadByCode(code)
      if (found && found.email !== email && !found.test) referrer = found
    }
  }

  const lead: Lead = existing
    ? {
        ...existing,
        name, company, answers,
        roleDetail: answers.role === 'other' ? roleDetail : undefined,
        emailDomain: domain,
        domainMatch: domainMatch(company, domain),
        score: result.score, band: result.band.id,
        updatedAt: now.toISOString(),
        submissions: (existing.submissions ?? 1) + 1,
        referralCode: existing.referralCode || (await newReferralCode()),
        userAgent: request.headers.get('user-agent') ?? existing.userAgent,
      }
    : {
        id: newLeadId(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        source: cleanSource(body.source),
        name, email, company, answers,
        roleDetail: answers.role === 'other' ? roleDetail : undefined,
        emailDomain: domain,
        domainMatch: domainMatch(company, domain),
        score: result.score,
        band: result.band.id,
        consent: true,
        referralCode: await newReferralCode(),
        referredBy: referrer?.id,
        resend: {},
        submissions: 1,
        test: body.test === true || undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      }

  const input: LeadEmailInput = { id: lead.id, name, email, company, answers, result, referralCode: lead.referralCode }

  // ── e1 now ──
  const e1 = renderE1(input, { confirmed: !!lead.verifiedAt })
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

  // ── Reminder + e2–e4 scheduled (first submission only) ──
  if (isNew) {
    const reminder = renderVerifyReminder(input)
    const remRes = await resend.emails.send({
      from: FROM,
      to: email,
      replyTo: ADMIN_EMAIL,
      subject: reminder.subject,
      html: reminder.html,
      text: reminder.text,
      scheduledAt: new Date(now.getTime() + VERIFY_REMINDER_HOURS * 60 * 60 * 1000).toISOString(),
      headers: { ...unsubscribeHeaders(lead.id), 'X-Portlink-Seatrade': 'verify' },
    })
    if (remRes.error) console.error('[seatrade] verify reminder schedule failed', remRes.error)
    else lead.resend.verify = remRes.data?.id

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
      const admin = renderAdmin({
        ...input,
        source: lead.source,
        submissions: lead.submissions,
        emailDomain: domain,
        domainMatch: lead.domainMatch,
        roleDetail: lead.roleDetail,
        referrer: referrer ? { name: referrer.name, company: referrer.company, code: referrer.referralCode } : undefined,
      })
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
    stats: { n: stats.n, avg: stats.avg, emailShare: stats.emailShare, topEntries: stats.topEntries },
    isNew,
    verified: !!lead.verifiedAt,
    referralCode: lead.referralCode,
    referralUrl: referralUrl(lead.referralCode),
    mePath: `${ME_PATH}?t=${lead.id}`,
    invitedBy: referrer ? referrer.name.split(/\s+/)[0] : null,
  })
}
