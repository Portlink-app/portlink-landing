/**
 * GET /api/seatrade/export/ — mails the full lead list as CSV to ADMIN_EMAIL.
 *
 * No authentication on purpose: the only thing a stranger can make it do is send the admin an
 * email, and a 10-minute throttle caps that. Nothing is returned to the caller but a status.
 * The admin notification for every lead links here, so David is one click from a fresh list.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { ADMIN_EMAIL, EXPORT_MIN_INTERVAL_MS, FROM } from '@/lib/seatrade/config'
import { computeStats, getMeta, leadsToCsv, listLeads, setMeta } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const last = await getMeta('last-export')
  const since = last ? Date.now() - Date.parse(last) : Infinity
  if (since < EXPORT_MIN_INTERVAL_MS) {
    const retryIn = Math.ceil((EXPORT_MIN_INTERVAL_MS - since) / 1000)
    return NextResponse.json(
      { ok: false, error: `An export was sent less than 10 minutes ago. Try again in ${retryIn} s.` },
      { status: 429, headers: { 'Retry-After': String(retryIn) } },
    )
  }

  const leads = await listLeads()
  const stats = computeStats(leads)
  const csv = leadsToCsv(leads)
  const stamp = new Date().toISOString().slice(0, 16).replace('T', ' ')

  const resend = new Resend(process.env.RESEND_API_KEY)
  const res = await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `Seatrade leads export · ${leads.length} leads · ${stamp}Z`,
    text: [
      `Attached: every Seatrade Med 2026 scorecard lead as CSV (${leads.length} rows, ${stats.n} counted in the live benchmark).`,
      stats.avg !== null ? `Show average so far: ${stats.avg}/100. Email or single-inbox port calls: ${Math.round((stats.emailShare ?? 0) * 100)} %.` : 'No benchmark yet.',
      'Columns: createdAt, name, email, company, role, score, band, source, volume, system, reentry, change, status, pain, unsubscribedAt, submissions, test, id.',
    ].join('\n\n'),
    attachments: [{ filename: `seatrade-leads-${stamp.slice(0, 10)}.csv`, content: Buffer.from(csv, 'utf8'), contentType: 'text/csv' }],
  })

  if (res.error) {
    console.error('[seatrade] export send failed', res.error)
    return NextResponse.json({ ok: false, error: 'Could not send the export.' }, { status: 502 })
  }

  await setMeta('last-export', new Date().toISOString())
  return NextResponse.json({ ok: true, leads: leads.length, sentTo: ADMIN_EMAIL.replace(/^(.).*(@.*)$/, '$1…$2') })
}
