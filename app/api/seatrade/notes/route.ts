/**
 * POST /api/seatrade/notes/ - the two open questions, answered after the entry exists.
 *
 * This route deliberately touches NOTHING the draw depends on. It reads a lead by id, writes
 * `openAnswers` on the document, and mails the admin. It never creates a lead, never scores,
 * never verifies, never grants or counts an entry, never books a Resend sequence and never
 * invalidates the benchmark cache: the open answers are not part of the score, so the aggregate
 * cannot move. A failure here leaves the entry exactly as it was.
 *
 * The lead id is the same bearer handle already used by /seatrade/me/ and the unsubscribe link.
 * Two things keep it from being an admin-mail amplifier: an unchanged payload is stored without
 * mailing, and an empty payload is a no-op.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ADMIN_EMAIL, FROM } from '@/lib/seatrade/config'
import { renderOpenAnswers } from '@/lib/seatrade/emails'
import { cleanOpenAnswers, sameOpenAnswers } from '@/lib/seatrade/openQuestions'
import { getLead, saveLead } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  let body: { t?: unknown; answers?: unknown }
  try {
    body = (await request.json()) as { t?: unknown; answers?: unknown }
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 })
  }

  const id = typeof body.t === 'string' ? body.t : ''
  const lead = await getLead(id)
  if (!lead) return NextResponse.json({ ok: false, error: 'Unknown entry.' }, { status: 404 })

  const answers = cleanOpenAnswers(body.answers)
  // Both boxes left blank. Nothing to record, and nothing has gone wrong.
  if (!answers) return NextResponse.json({ ok: true, saved: false })

  // Merge, never replace. This is text a person wrote about their own work: a later payload that
  // carries only one of the two answers must not silently delete the other.
  const merged = { ...lead.openAnswers, ...answers }
  const unchanged = sameOpenAnswers(lead.openAnswers, merged)
  lead.openAnswers = { ...merged, savedAt: new Date().toISOString() }
  lead.updatedAt = new Date().toISOString()
  await saveLead(lead)

  if (!unchanged) {
    const mail = renderOpenAnswers(lead, merged)
    const res = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      replyTo: lead.email,
      subject: (lead.test ? '[TEST] ' : '') + mail.subject,
      html: mail.html,
      text: mail.text,
    })
    // Best effort: the answers are already stored, so a mail failure must not fail the request.
    if (res.error) console.error('[seatrade] open answers notification failed', res.error)
  }

  return NextResponse.json({ ok: true, saved: true })
}
