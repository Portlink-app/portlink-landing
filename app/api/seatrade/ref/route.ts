/**
 * GET /api/seatrade/ref/?c=<code> — who invited me? Returns only a first name, so the landing
 * page can say "Ana invited you". Unknown or test codes return ok:false.
 */
import { NextResponse } from 'next/server'
import { cleanCode } from '@/lib/seatrade/eligibility'
import { findLeadByCode } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const code = cleanCode(new URL(request.url).searchParams.get('c'))
  if (!code) return NextResponse.json({ ok: false })
  const lead = await findLeadByCode(code)
  if (!lead || lead.test) return NextResponse.json({ ok: false })
  return NextResponse.json({ ok: true, code, firstName: lead.name.trim().split(/\s+/)[0] })
}
