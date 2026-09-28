/**
 * Turns raw events into what the leads page and the alerts show: visits, companies, people,
 * pages, and the networks that could not be named. Scoring rules live in config.ts.
 */
import { EVENT_POINTS, ICP_POINTS, PAGE_POINTS } from './config'
import { getIdentity, type IntelEvent, type Org, type Person } from './store'

export interface Visit {
  key: string
  day: string
  start: string
  end: string
  org?: Org
  country?: string
  city?: string
  vid?: string
  person?: Person
  pages: { p: string; title?: string; ts: string }[]
  scrolls: number
  forms: number
  ms: number
  ref?: string
  utm?: Record<string, string>
  linked: boolean
  score: number
  reasons: string[]
}

export interface CompanyRow {
  key: string
  name: string
  domain?: string
  icp: boolean
  visits: number
  visitors: number
  people: Person[]
  pages: Map<string, number>
  firstSeen: string
  lastSeen: string
  /** Highest single-day score, the one alerts use. */
  score: number
  hotDay?: string
  reasons: string[]
  countries: Set<string>
  recent: Visit[]
}

export interface PersonRow {
  email: string
  name?: string
  company?: string
  role?: string
  source: Person['source']
  visits: number
  pages: string[]
  lastSeen: string
  score: number
}

const pagePoints = (p: string) => {
  const rule = PAGE_POINTS.find((r) => (r.prefix === '/' ? p === '/' : p === r.prefix || p.startsWith(`${r.prefix}/`)))
  return rule ?? { points: 2, label: p }
}

export async function buildVisits(events: IntelEvent[]): Promise<Visit[]> {
  const byKey = new Map<string, Visit>()
  for (const e of events) {
    const k = `${e.ts.slice(0, 10)}:${e.vk}`
    let v = byKey.get(k)
    if (!v) {
      v = { key: k, day: e.ts.slice(0, 10), start: e.ts, end: e.ts, pages: [], scrolls: 0, forms: 0, ms: 0, linked: false, score: 0, reasons: [] }
      byKey.set(k, v)
    }
    v.end = e.ts
    if (e.org && (!v.org || v.org.kind !== 'company')) v.org = e.org
    v.country ??= e.country
    v.city ??= e.city
    v.vid ??= e.vid
    v.ref ??= e.ref
    v.utm ??= e.utm
    if (e.t === 'pv' && e.p) v.pages.push({ p: e.p, title: e.title, ts: e.ts })
    if (e.t === 'scroll') v.scrolls++
    if (e.t === 'form') v.forms++
    if (e.t === 'leave') v.ms += e.ms ?? 0
    if ((e.t === 'identify' || e.t === 'link') && e.person) {
      v.person = e.person
      if (e.t === 'link') v.linked = true
    }
  }

  // A consented visitor id carries its person across visits and days.
  const vids = [...new Set([...byKey.values()].map((v) => v.vid).filter(Boolean) as string[])]
  const ids = new Map<string, Person | null>(await Promise.all(vids.map(async (vid) => [vid, await getIdentity(vid)] as const)))
  for (const v of byKey.values()) {
    if (!v.person && v.vid) v.person = ids.get(v.vid) ?? undefined
    scoreVisit(v)
  }
  return [...byKey.values()].sort((a, b) => b.end.localeCompare(a.end))
}

function scoreVisit(v: Visit) {
  const seen = new Set<string>()
  for (const pg of v.pages) {
    if (seen.has(pg.p)) continue
    seen.add(pg.p)
    const r = pagePoints(pg.p)
    if (r.points) { v.score += r.points; if (r.points >= 8) v.reasons.push(r.label) }
  }
  if (seen.size > 1) v.score += (seen.size - 1) * EVENT_POINTS.depth
  if (v.scrolls) v.score += v.scrolls * EVENT_POINTS.scroll
  if (v.forms) { v.score += EVENT_POINTS.form; v.reasons.push('sent a form') }
  if (v.person?.source === 'form') v.score += EVENT_POINTS.identify
  if (v.linked) { v.score += EVENT_POINTS.link; v.reasons.push('opened our email link') }
  if (v.org?.icp) { v.score += ICP_POINTS; v.reasons.push('target account') }
}

export const companyKey = (org: Org) => (org.domain ?? org.name).toLowerCase().replace(/[^a-z0-9.-]+/g, '-')

export function buildCompanies(visits: Visit[]): CompanyRow[] {
  const rows = new Map<string, CompanyRow>()
  const dayScores = new Map<string, Map<string, { score: number; visitors: Set<string>; reasons: Set<string> }>>()
  for (const v of visits) {
    if (v.org?.kind !== 'company') continue
    const key = companyKey(v.org)
    let r = rows.get(key)
    if (!r) {
      r = { key, name: v.org.name, domain: v.org.domain, icp: !!v.org.icp, visits: 0, visitors: 0, people: [], pages: new Map(), firstSeen: v.start, lastSeen: v.end, score: 0, reasons: [], countries: new Set(), recent: [] }
      rows.set(key, r)
    }
    r.visits++
    if (v.start < r.firstSeen) r.firstSeen = v.start
    if (v.end > r.lastSeen) r.lastSeen = v.end
    for (const pg of v.pages) r.pages.set(pg.p, (r.pages.get(pg.p) ?? 0) + 1)
    if (v.country) r.countries.add(v.country)
    if (v.person && !r.people.some((x) => x.email === v.person!.email)) r.people.push(v.person)
    r.recent.push(v)
    let days = dayScores.get(key)
    if (!days) { days = new Map(); dayScores.set(key, days) }
    let d = days.get(v.day)
    if (!d) { d = { score: 0, visitors: new Set(), reasons: new Set() }; days.set(v.day, d) }
    d.score += v.score
    d.visitors.add(v.vid ?? v.key)
    v.reasons.forEach((x) => d!.reasons.add(x))
  }
  for (const [key, r] of rows) {
    r.visitors = new Set(r.recent.map((v) => v.vid ?? v.key)).size
    for (const [d, s] of dayScores.get(key) ?? []) {
      const colleagues = Math.max(0, s.visitors.size - 1)
      const total = s.score + colleagues * EVENT_POINTS.colleague
      if (colleagues) s.reasons.add(`${s.visitors.size} people from the company`)
      if (total > r.score) { r.score = total; r.hotDay = d; r.reasons = [...s.reasons] }
    }
    r.recent = r.recent.slice(0, 10)
  }
  return [...rows.values()].sort((a, b) => b.score - a.score || b.lastSeen.localeCompare(a.lastSeen))
}

export function buildPeople(visits: Visit[]): PersonRow[] {
  const rows = new Map<string, PersonRow>()
  for (const v of visits) {
    if (!v.person) continue
    let r = rows.get(v.person.email)
    if (!r) {
      r = { ...v.person, visits: 0, pages: [], lastSeen: v.end, score: 0 }
      rows.set(v.person.email, r)
    }
    r.visits++
    r.score += v.score
    if (v.end > r.lastSeen) r.lastSeen = v.end
    for (const pg of v.pages) if (!r.pages.includes(pg.p)) r.pages.push(pg.p)
  }
  return [...rows.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen))
}

export function unresolvedNetworks(visits: Visit[]): { name: string; asn?: string; visits: number }[] {
  const m = new Map<string, { name: string; asn?: string; visits: number }>()
  for (const v of visits) {
    if (!v.org || v.org.kind === 'company') continue
    const k = v.org.asn ?? v.org.name
    const r = m.get(k) ?? { name: v.org.name, asn: v.org.asn, visits: 0 }
    r.visits++
    m.set(k, r)
  }
  return [...m.values()].sort((a, b) => b.visits - a.visits)
}

export function topPages(visits: Visit[]): { p: string; views: number; visitors: number }[] {
  const m = new Map<string, { views: number; visitors: Set<string> }>()
  for (const v of visits) for (const pg of v.pages) {
    const r = m.get(pg.p) ?? { views: 0, visitors: new Set<string>() }
    r.views++
    r.visitors.add(v.vid ?? v.key)
    m.set(pg.p, r)
  }
  return [...m.entries()].map(([p, r]) => ({ p, views: r.views, visitors: r.visitors.size })).sort((a, b) => b.views - a.views)
}
