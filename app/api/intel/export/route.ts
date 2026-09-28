/**
 * GET /api/intel/export?days=30: companies and people as CSV, for the /leads admin only.
 */
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/intel/config'
import { buildCompanies, buildPeople, buildVisits } from '@/lib/intel/aggregate'
import { listEvents } from '@/lib/intel/store'
import { isAdminCookie } from '@/lib/intel/token'

export const dynamic = 'force-dynamic'

const cell = (v: unknown) => {
  const s = v === undefined || v === null ? '' : String(v)
  // Leading = + - @ would run as a formula in a spreadsheet; prefix them.
  const safe = /^[=+\-@]/.test(s) ? `'${s}` : s
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

export async function GET(request: Request) {
  const jar = await cookies()
  if (!isAdminCookie(jar.get(ADMIN_COOKIE)?.value)) return new NextResponse('Not found', { status: 404 })
  const days = Math.min(Math.max(Number(new URL(request.url).searchParams.get('days')) || 30, 1), 395)
  const visits = await buildVisits(await listEvents(days))
  const rows: unknown[][] = [['type', 'name', 'domain_or_email', 'company', 'target', 'score', 'visits', 'people', 'top_pages', 'first_seen', 'last_seen']]
  for (const c of buildCompanies(visits)) {
    rows.push(['company', c.name, c.domain, '', c.icp ? 'yes' : '', c.score, c.visits, c.people.map((p) => p.email).join(' '),
      [...c.pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p]) => p).join(' '), c.firstSeen, c.lastSeen])
  }
  for (const p of buildPeople(visits)) {
    rows.push(['person', p.name, p.email, p.company, '', p.score, p.visits, '', p.pages.slice(0, 5).join(' '), '', p.lastSeen])
  }
  const csv = rows.map((r) => r.map(cell).join(',')).join('\n')
  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="portlink-leads-${new Date().toISOString().slice(0, 10)}-${days}d.csv"`,
    },
  })
}
