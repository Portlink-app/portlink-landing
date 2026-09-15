/**
 * GET /api/seatrade/stats/ — the live benchmark, no PII.
 * Cached in-process for 30 s (lib/seatrade/store.ts); safe to poll from a booth screen.
 */
import { NextResponse } from 'next/server'
import { getStats } from '@/lib/seatrade/store'

export const dynamic = 'force-dynamic'

export async function GET() {
  const stats = await getStats()
  return NextResponse.json(stats, {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' },
  })
}
