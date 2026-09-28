/**
 * POST /api/intel/cron: hot-lead alerts every hour, the daily digest at 07.00 Oslo time, and the
 * retention sweep. Called by the scheduled function netlify/functions/intel-cron.mts with the
 * header `x-intel-secret: <INTEL_SECRET>`; anything else gets a 404.
 *
 * It only ever mails ADMIN_EMAIL, a fixed address from the site's env, never an address from a
 * request, which is why scripts/check-mail-routes.mjs lists it as exempt from check:access.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { HOT_SCORE, RETENTION_DAYS } from '@/lib/intel/config'
import { buildCompanies, buildPeople, buildVisits, companyKey, type CompanyRow } from '@/lib/intel/aggregate'
import { alreadyAlerted, day, getMeta, listEvents, markAlerted, setMeta, sweep } from '@/lib/intel/store'
import { isAdminSecret } from '@/lib/intel/token'
import { escapeHtml as esc, wrap } from '@/lib/email/wrap'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portlink.app'
const FROM = 'Portlink leads <pilot@portlink.app>'
const osloHour = () => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Oslo', hour: '2-digit', hourCycle: 'h23' }).format(new Date()))
const loginLink = () => `${siteUrl}/api/intel/login/?k=${encodeURIComponent(process.env.INTEL_SECRET ?? '')}`

function companyBlock(c: CompanyRow): string {
  const pages = [...c.pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([p, n]) => `${esc(p)} (${n})`).join(', ')
  const people = c.people.map((p) => esc(p.name ? `${p.name} <${p.email}>` : p.email)).join(', ')
  return `<p style="margin:0 0 14px"><strong>${esc(c.name)}</strong>${c.domain ? ` · ${esc(c.domain)}` : ''}${c.icp ? ' · <strong>target account</strong>' : ''}<br>
Score ${c.score} · ${c.visits} visit${c.visits === 1 ? '' : 's'} · ${c.visitors} visitor${c.visitors === 1 ? '' : 's'}<br>
${c.reasons.length ? `Why: ${esc(c.reasons.join(', '))}<br>` : ''}Pages: ${pages}${people ? `<br>People: ${people}` : ''}</p>`
}

export async function POST(request: Request) {
  if (!isAdminSecret(request.headers.get('x-intel-secret'))) return new NextResponse('Not found', { status: 404 })
  const resend = new Resend(process.env.RESEND_API_KEY)
  const today = day()
  const result: Record<string, unknown> = {}

  // 1. Hot companies today, one alert per company per day.
  const todayVisits = await buildVisits(await listEvents(1))
  const hot = buildCompanies(todayVisits).filter((c) => c.score >= HOT_SCORE && c.hotDay === today)
  const fresh: CompanyRow[] = []
  for (const c of hot) if (!(await alreadyAlerted(companyKey({ name: c.name, domain: c.domain, kind: 'company' })))) fresh.push(c)
  if (fresh.length) {
    const res = await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: fresh.length === 1 ? `Hot lead on portlink.app: ${fresh[0].name}` : `${fresh.length} hot leads on portlink.app`,
      html: wrap(`<p>Visiting portlink.app today and scoring ${HOT_SCORE}+:</p>${fresh.map(companyBlock).join('')}<p><a href="${loginLink()}">Open the leads page</a></p>`),
    })
    if (!res.error) for (const c of fresh) await markAlerted(companyKey({ name: c.name, domain: c.domain, kind: 'company' }))
    result.alerted = res.error ? `failed: ${res.error.message}` : fresh.map((c) => c.name)
  }

  // 2. Daily digest after 07.00 Oslo, once a day, only when there is something to report.
  // `?digest=now` (still behind the secret) sends it immediately, for testing and on demand.
  const forceDigest = new URL(request.url).searchParams.get('digest') === 'now'
  if (forceDigest || (osloHour() >= 7 && (await getMeta('last-digest')) !== today)) {
    const visits = await buildVisits(await listEvents(2))
    const since = Date.now() - 86_400_000
    const recent = visits.filter((v) => Date.parse(v.end) >= since)
    const companies = buildCompanies(recent)
    const people = buildPeople(recent)
    if (recent.length) {
      const res = await resend.emails.send({
        from: FROM,
        to: ADMIN_EMAIL,
        subject: `portlink.app last 24 h: ${companies.length} compan${companies.length === 1 ? 'y' : 'ies'}, ${recent.length} visits`,
        html: wrap(`<p>${recent.length} visits in the last 24 hours, ${companies.length} from named companies${people.length ? `, ${people.length} identified people` : ''}.</p>
${companies.slice(0, 15).map(companyBlock).join('') || '<p>No named companies.</p>'}
${people.length ? `<p><strong>People</strong><br>${people.map((p) => esc(`${p.name ?? p.email} (${p.company ?? 'no company'}) · ${p.visits} visit(s)`)).join('<br>')}</p>` : ''}
<p><a href="${loginLink()}">Open the leads page</a></p>`),
      })
      result.digest = res.error ? `failed: ${res.error.message}` : 'sent'
      if (!res.error) await setMeta('last-digest', today)
    } else {
      await setMeta('last-digest', today)
      result.digest = 'nothing to report'
    }
    result.sweep = await sweep(RETENTION_DAYS)
  }

  return NextResponse.json({ ok: true, ...result })
}
