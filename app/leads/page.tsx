/**
 * /leads: the private visitor-intelligence page. Entry doc: docs/VISITOR-INTELLIGENCE.md.
 *
 * Open it with the link in any alert or digest email (/api/intel/login?k=…), which sets the admin
 * cookie. Without that cookie the page is a 404, it is disallowed in robots.txt, marked noindex,
 * and never recorded by the tracker (UNTRACKED_PREFIXES).
 */
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { ADMIN_COOKIE } from '@/lib/intel/config'
import { buildCompanies, buildPeople, buildVisits, topPages, unresolvedNetworks, type Visit } from '@/lib/intel/aggregate'
import { listEvents } from '@/lib/intel/store'
import { isAdminCookie } from '@/lib/intel/token'
import styles from './leads.module.css'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Leads · Portlink', robots: { index: false, follow: false } }

const RANGES = [1, 7, 30, 90] as const

const when = (iso: string) =>
  new Intl.DateTimeFormat('nb-NO', { timeZone: 'Europe/Oslo', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    .format(new Date(iso)).replace(',', ' kl.').replace(/(\d{2}):(\d{2})$/, '$1.$2')

const mins = (ms: number) => (ms < 60_000 ? `${Math.round(ms / 1000)} s` : `${Math.round(ms / 60_000)} min`)

function VisitLine({ v }: { v: Visit }) {
  return (
    <li>
      <span className={styles.muted}>{when(v.start)}</span>{' '}
      {v.pages.map((p) => p.p).join(' → ') || '(no page view)'}
      {v.ms ? <span className={styles.muted}> · {mins(v.ms)}</span> : null}
      {v.ref ? <span className={styles.muted}> · from {v.ref}</span> : null}
      {v.utm?.campaign ? <span className={styles.muted}> · campaign {v.utm.campaign}</span> : null}
      {v.person ? <span className={styles.tag}>{v.person.name ?? v.person.email}</span> : null}
    </li>
  )
}

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const jar = await cookies()
  if (!isAdminCookie(jar.get(ADMIN_COOKIE)?.value)) notFound()

  const { days: raw } = await searchParams
  const days = RANGES.find((d) => String(d) === raw) ?? 30
  const events = await listEvents(days)
  const visits = await buildVisits(events)
  const companies = buildCompanies(visits)
  const people = buildPeople(visits)
  const pages = topPages(visits).slice(0, 15)
  const networks = unresolvedNetworks(visits).slice(0, 15)
  const named = visits.filter((v) => v.org?.kind === 'company').length

  return (
    <main className={styles.page}>
      <header className={styles.head}>
        <h1>Leads</h1>
        <nav aria-label="Range">
          {RANGES.map((d) => (
            <a key={d} href={`/leads/?days=${d}`} aria-current={d === days ? 'page' : undefined}>{d === 1 ? 'Today' : `${d} days`}</a>
          ))}
          <a href={`/api/intel/export/?days=${days}`}>CSV</a>
        </nav>
      </header>

      <section className={styles.stats} aria-label="Summary">
        <p><strong>{visits.length}</strong> visits</p>
        <p><strong>{named}</strong> from a named company ({visits.length ? Math.round((named / visits.length) * 100) : 0} %)</p>
        <p><strong>{companies.length}</strong> companies</p>
        <p><strong>{people.length}</strong> people</p>
      </section>

      <section>
        <h2>Companies</h2>
        {companies.length === 0 ? <p className={styles.muted}>No named companies in this range yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Company</th><th>Score</th><th>Visits</th><th>People</th><th>Pages</th><th>Last seen</th></tr></thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.key}>
                  <td>
                    <details>
                      <summary>
                        <strong>{c.name}</strong>{c.icp ? <span className={styles.tag}>target</span> : null}
                        {c.domain ? <span className={styles.muted}> {c.domain}</span> : null}
                      </summary>
                      {c.reasons.length ? <p className={styles.muted}>Why: {c.reasons.join(', ')}</p> : null}
                      <ul className={styles.visits}>{c.recent.map((v) => <VisitLine key={v.key} v={v} />)}</ul>
                    </details>
                  </td>
                  <td>{c.score}</td>
                  <td>{c.visits} ({c.visitors} {c.visitors === 1 ? 'visitor' : 'visitors'})</td>
                  <td>{c.people.map((p) => p.name ?? p.email).join(', ') || '·'}</td>
                  <td>{[...c.pages.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([p]) => p).join(', ')}</td>
                  <td>{when(c.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section>
        <h2>People</h2>
        <p className={styles.muted}>Visitors who switched on &ldquo;Remember me&rdquo; and sent the contact form, or opened a signed link we emailed them.</p>
        {people.length === 0 ? <p className={styles.muted}>Nobody identified in this range yet.</p> : (
          <table className={styles.table}>
            <thead><tr><th>Person</th><th>Company</th><th>How</th><th>Visits</th><th>Pages</th><th>Last seen</th></tr></thead>
            <tbody>
              {people.map((p) => (
                <tr key={p.email}>
                  <td><strong>{p.name ?? p.email}</strong><br /><a href={`mailto:${p.email}`}>{p.email}</a></td>
                  <td>{p.company ?? '·'}{p.role ? <span className={styles.muted}> ({p.role})</span> : null}</td>
                  <td>{p.source === 'form' ? 'contact form' : 'email link'}</td>
                  <td>{p.visits}</td>
                  <td>{p.pages.slice(0, 5).join(', ')}</td>
                  <td>{when(p.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <div className={styles.split}>
        <section>
          <h2>Top pages</h2>
          <table className={styles.table}>
            <thead><tr><th>Page</th><th>Views</th><th>Visitors</th></tr></thead>
            <tbody>{pages.map((p) => <tr key={p.p}><td>{p.p}</td><td>{p.views}</td><td>{p.visitors}</td></tr>)}</tbody>
          </table>
        </section>
        <section>
          <h2>Networks not shown as companies</h2>
          <p className={styles.muted}>Internet providers, clouds and VPNs. A real company here belongs in NOT_A_COMPANY&rsquo;s exceptions or ICP_DOMAINS (lib/intel/config.ts).</p>
          <table className={styles.table}>
            <thead><tr><th>Network</th><th>ASN</th><th>Visits</th></tr></thead>
            <tbody>{networks.map((n) => <tr key={n.asn ?? n.name}><td>{n.name}</td><td>{n.asn ? `AS${n.asn}` : '·'}</td><td>{n.visits}</td></tr>)}</tbody>
          </table>
        </section>
      </div>

      <section>
        <h2>Latest visits</h2>
        <ul className={styles.visits}>
          {visits.slice(0, 40).map((v) => (
            <li key={v.key}>
              <strong>{v.org?.kind === 'company' ? v.org.name : v.org ? `${v.org.name} (network)` : 'Unknown network'}</strong>
              <span className={styles.muted}> · {[v.city, v.country].filter(Boolean).join(', ')}</span>
              <ul><VisitLine v={v} /></ul>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
