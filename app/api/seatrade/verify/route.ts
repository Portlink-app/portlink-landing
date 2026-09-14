/**
 * GET /api/seatrade/verify/?t=<lead id> — "Confirm my email".
 *
 * Marks the lead verified, cancels the +20 h reminder, and, if they came through someone's link,
 * tells that referrer they gained an entry. Then sends the person to their own page. Idempotent:
 * a second click just shows the page. Unknown ids get the page's "link not valid" state.
 *
 * The lead id is a random UUID v4 that only appears in that person's own emails, so it doubles as
 * the capability token, same as the unsubscribe link.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ADMIN_EMAIL, FROM, ME_PATH, SITE_URL } from '@/lib/seatrade/config'
import { renderReferralCredited, unsubscribeHeaders } from '@/lib/seatrade/emails'
import { score } from '@/lib/seatrade/scorecard'
import { getLead, invalidateStats, listLeads, saveLead, tallyEntries, tallyFor } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const t = new URL(request.url).searchParams.get('t') ?? ''
  const lead = await getLead(t)
  if (!lead) return NextResponse.redirect(`${SITE_URL}${ME_PATH}`, { status: 303 })

  if (!lead.verifiedAt) {
    lead.verifiedAt = new Date().toISOString()
    lead.updatedAt = lead.verifiedAt
    const resend = new Resend(process.env.RESEND_API_KEY)

    if (lead.resend.verify) {
      try { await resend.emails.cancel(lead.resend.verify) } catch (err) {
        console.warn('[seatrade] cancel verify reminder', err instanceof Error ? err.message : err)
      }
    }
    await saveLead(lead)
    invalidateStats()

    // Tell the referrer, if they exist, are confirmed themselves, and have not unsubscribed.
    if (lead.referredBy && !lead.test) {
      const referrer = await getLead(lead.referredBy)
      if (referrer && referrer.verifiedAt && !referrer.unsubscribedAt && !referrer.test) {
        const tally = tallyFor(referrer.id, tallyEntries(await listLeads()))
        const mail = renderReferralCredited(
          { id: referrer.id, name: referrer.name, email: referrer.email, company: referrer.company, answers: referrer.answers, result: score(referrer.answers), referralCode: referrer.referralCode },
          tally.entries, tally.countedReferrals,
        )
        const res = await resend.emails.send({
          from: FROM, to: referrer.email, replyTo: ADMIN_EMAIL,
          subject: mail.subject, html: mail.html, text: mail.text,
          headers: { ...unsubscribeHeaders(referrer.id), 'X-Portlink-Seatrade': 'credited' },
        })
        if (res.error) console.error('[seatrade] credited send failed', res.error)
      }
    }
  }

  return NextResponse.redirect(`${SITE_URL}${ME_PATH}?t=${lead.id}&confirmed=1`, { status: 303 })
}
