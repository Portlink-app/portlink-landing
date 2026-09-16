/**
 * GET /api/seatrade/leaderboard/ — the public draw standings.
 *
 * First name and company only; the row type cannot carry anything else (lib/seatrade/leaderboard.ts).
 * Cached for 30 s like the benchmark, so a booth screen or a landing page can poll it.
 */
import { NextResponse } from 'next/server'
import { getLeaderboard } from '@/lib/seatrade/leaderboard'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const raw = Number(new URL(request.url).searchParams.get('limit'))
  const limit = Number.isFinite(raw) ? Math.min(Math.max(Math.trunc(raw), 1), 100) : 25
  const board = await getLeaderboard(limit)
  return NextResponse.json(board, {
    headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' },
  })
}
