/**
 * Lead store for the Seatrade funnel — Netlify Blobs, one JSON document per lead.
 *
 * Why Blobs and not Supabase: the landing site has no database on purpose (CLAUDE.md), and the
 * product database belongs to portlink-platform, where a marketing table would need a migration
 * through the two-agent PR flow. Blobs ship with the site, need no new credentials in production,
 * and a few hundred documents is well inside "list everything and aggregate in memory".
 *
 * Keys
 *   lead/<uuid>          the lead document
 *   email/<sha256(email)> → { id }   dedupe: a second submission updates instead of duplicating
 *   meta/last-export     ISO timestamp of the last CSV mailed to the admin
 *
 * Local dev: `netlify dev` injects the Blobs context. Plain `next dev` does not, so the helper
 * falls back to NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN when both are present in the env.
 */
import { createHash, randomUUID } from 'node:crypto'
import { getStore, type Store } from '@netlify/blobs'
import { LEAD_STORE } from './config'
import { BANDS, QUESTIONS, type Answers, type BandId, type QuestionId } from './scorecard'

export interface Lead {
  id: string
  createdAt: string
  updatedAt: string
  source: string
  name: string
  email: string
  company: string
  answers: Answers
  score: number
  band: BandId
  consent: true
  /** Resend message ids per step of the sequence; e2–e4 are scheduled sends and can be cancelled. */
  resend: Partial<Record<'e1' | 'e2' | 'e3' | 'e4', string>>
  unsubscribedAt?: string
  submissions: number
  /** Set on leads created during verification so they never count in the live benchmark. */
  test?: boolean
  userAgent?: string
}

let cachedStore: Store | null = null

export function leadStore(): Store {
  if (cachedStore) return cachedStore
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
  cachedStore = siteID && token
    ? getStore({ name: LEAD_STORE, siteID, token, consistency: 'strong' })
    : getStore({ name: LEAD_STORE, consistency: 'strong' })
  return cachedStore
}

export function emailKey(email: string): string {
  return 'email/' + createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

export async function findLeadByEmail(email: string): Promise<Lead | null> {
  const store = leadStore()
  const ref = (await store.get(emailKey(email), { type: 'json' })) as { id: string } | null
  if (!ref?.id) return null
  return (await store.get(`lead/${ref.id}`, { type: 'json' })) as Lead | null
}

export async function getLead(id: string): Promise<Lead | null> {
  if (!/^[0-9a-f-]{36}$/.test(id)) return null
  return (await leadStore().get(`lead/${id}`, { type: 'json' })) as Lead | null
}

export async function saveLead(lead: Lead): Promise<void> {
  const store = leadStore()
  await store.setJSON(`lead/${lead.id}`, lead)
  await store.setJSON(emailKey(lead.email), { id: lead.id })
}

export function newLeadId(): string {
  return randomUUID()
}

export async function listLeads(): Promise<Lead[]> {
  const store = leadStore()
  const { blobs } = await store.list({ prefix: 'lead/' })
  const leads: Lead[] = []
  // Small batches: Blobs has no multi-get, and a burst of 200 parallel reads is unnecessary.
  for (let i = 0; i < blobs.length; i += 25) {
    const chunk = blobs.slice(i, i + 25)
    const docs = await Promise.all(chunk.map(b => store.get(b.key, { type: 'json' }) as Promise<Lead | null>))
    for (const d of docs) if (d) leads.push(d)
  }
  return leads.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export async function getMeta(key: string): Promise<string | null> {
  return (await leadStore().get(`meta/${key}`, { type: 'text' })) as string | null
}

export async function setMeta(key: string, value: string): Promise<void> {
  await leadStore().set(`meta/${key}`, value)
}

// ── Aggregate (the live benchmark) ────────────────────────────────────────────

export interface Stats {
  n: number
  avg: number | null
  bands: Record<BandId, number>
  /** Per question: option id → count. Role and pain included. */
  answers: Record<QuestionId, Record<string, number>>
  /** Share (0–1) whose port call lives in email or one inbox. The headline stat. */
  emailShare: number | null
  updatedAt: string
}

let statsCache: { at: number; value: Stats } | null = null
const STATS_TTL_MS = 30 * 1000

export function computeStats(leads: Lead[]): Stats {
  const live = leads.filter(l => !l.test)
  const bands = Object.fromEntries(BANDS.map(b => [b.id, 0])) as Record<BandId, number>
  const answers = Object.fromEntries(
    QUESTIONS.map(q => [q.id, Object.fromEntries(q.options.map(o => [o.id, 0]))]),
  ) as Record<QuestionId, Record<string, number>>

  let total = 0
  let emailish = 0
  for (const l of live) {
    total += l.score
    bands[l.band] = (bands[l.band] ?? 0) + 1
    for (const q of QUESTIONS) {
      const a = l.answers[q.id]
      if (a in answers[q.id]) answers[q.id][a] += 1
    }
    if (l.answers.system === 'email' || l.answers.system === 'inbox') emailish += 1
  }

  const n = live.length
  return {
    n,
    avg: n ? Math.round(total / n) : null,
    bands,
    answers,
    emailShare: n ? emailish / n : null,
    updatedAt: new Date().toISOString(),
  }
}

export async function getStats(opts: { fresh?: boolean } = {}): Promise<Stats> {
  if (!opts.fresh && statsCache && Date.now() - statsCache.at < STATS_TTL_MS) return statsCache.value
  const value = computeStats(await listLeads())
  statsCache = { at: Date.now(), value }
  return value
}

export function invalidateStats(): void {
  statsCache = null
}

// ── CSV export ────────────────────────────────────────────────────────────────

export function leadsToCsv(leads: Lead[]): string {
  const cols = ['createdAt', 'name', 'email', 'company', 'role', 'score', 'band', 'source',
    ...QUESTIONS.filter(q => q.id !== 'role').map(q => q.id), 'unsubscribedAt', 'submissions', 'test', 'id']
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = leads.map(l => [
    l.createdAt, l.name, l.email, l.company, l.answers.role, l.score, l.band, l.source,
    ...QUESTIONS.filter(q => q.id !== 'role').map(q => l.answers[q.id]),
    l.unsubscribedAt ?? '', l.submissions, l.test ? 'yes' : '', l.id,
  ].map(esc).join(','))
  return [cols.join(','), ...rows].join('\n') + '\n'
}
