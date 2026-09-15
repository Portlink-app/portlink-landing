/**
 * /api/seatrade/unsubscribe/?t=<lead id>
 *
 * GET  — from the footer link. Marks the lead unsubscribed, cancels every still-scheduled email
 *        of the sequence, redirects to /seatrade/unsubscribed/.
 * POST — RFC 8058 one-click (List-Unsubscribe-Post header). Same effect, 200 with no body.
 *
 * The lead id is a random UUID v4 and is never shown anywhere but that lead's own emails, so it
 * doubles as the capability token. Unknown ids get the same redirect: nothing to enumerate.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { SITE_URL } from '@/lib/seatrade/config'
import { getLead, invalidateStats, saveLead } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

async function unsubscribe(id: string | null): Promise<void> {
  if (!id) return
  const lead = await getLead(id)
  if (!lead || lead.unsubscribedAt) return

  const resend = new Resend(process.env.RESEND_API_KEY)
  for (const key of ['e2', 'e3', 'e4'] as const) {
    const msgId = lead.resend[key]
    if (!msgId) continue
    try {
      await resend.emails.cancel(msgId)
    } catch (err) {
      // Already sent or already cancelled: nothing to do, keep going.
      console.warn(`[seatrade] cancel ${key} for ${id}:`, err instanceof Error ? err.message : err)
    }
  }
  lead.unsubscribedAt = new Date().toISOString()
  lead.updatedAt = lead.unsubscribedAt
  await saveLead(lead)
  invalidateStats()
}

export async function GET(request: Request) {
  const t = new URL(request.url).searchParams.get('t')
  await unsubscribe(t)
  return NextResponse.redirect(`${SITE_URL}/seatrade/unsubscribed/`, { status: 303 })
}

export async function POST(request: Request) {
  const t = new URL(request.url).searchParams.get('t')
  await unsubscribe(t)
  return new NextResponse(null, { status: 200 })
}
