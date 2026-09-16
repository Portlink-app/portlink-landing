/**
 * Lead store for the Seatrade funnel — Netlify Blobs, one JSON document per lead.
 *
 * Why Blobs and not Supabase: the landing site has no database on purpose (CLAUDE.md), and the
 * product database belongs to portlink-platform, where a marketing table would need a migration
 * through the two-agent PR flow. Blobs ship with the site, need no new credentials in production,
 * and a few hundred documents is well inside "list everything and aggregate in memory".
 *
 * Keys
 *   lead/<uuid>            the lead document
 *   email/<sha256(email)>  → { id }   dedupe: a second submission updates instead of duplicating
 *   code/<REFERRAL CODE>   → { id }   referral code lookup
 *   meta/last-export       ISO timestamp of the last CSV mailed to the admin
 *
 * Local dev: `netlify dev` injects the Blobs context. Plain `next dev` does not, so the helper
 * falls back to NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN when both are present in the env.
 */
import { createHash, randomInt, randomUUID } from 'node:crypto'
import { getStore, type Store } from '@netlify/blobs'
import { LEAD_STORE, REFERRAL_CAP, SAME_DOMAIN_CAP } from './config'
import { CODE_ALPHABET } from './eligibility'
import { BANDS, QUESTIONS, type Answers, type BandId, type QuestionId } from './scorecard'
import { type OpenAnswers } from './openQuestions'

export type ResendStep = 'e1' | 'e2' | 'e3' | 'e4' | 'verify'

export interface Lead {
  id: string
  createdAt: string
  updatedAt: string
  source: string
  name: string
  email: string
  emailDomain: string
  /** Heuristic: does the company name look like it belongs to the email domain. Review aid. */
  domainMatch: 'likely' | 'unclear'
  company: string
  /** Free text when role is "Something else": what they do in the industry. */
  roleDetail?: string
  answers: Answers
  score: number
  band: BandId
  /** The two optional open questions, answered on the "sent" screen after the entry exists.
   *  Absent until they write something; never required, never part of the score or the draw. */
  openAnswers?: OpenAnswers
  consent: true
  /** Their own invitation code (6 chars). Link: /seatrade/?r=CODE */
  referralCode: string
  /** Lead id of the person whose link they came through. Set once, on first submission. */
  referredBy?: string
  /** Set when they click "Confirm my email". Only verified leads count and hold entries. */
  verifiedAt?: string
  /** Resend message ids per step; e2–e4 and the verify reminder are scheduled and cancellable. */
  resend: Partial<Record<ResendStep, string>>
  unsubscribedAt?: string
  submissions: number
  /** Set on leads created during verification so they never count in the benchmark or the draw. */
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

export async function findLeadByCode(code: string): Promise<Lead | null> {
  const store = leadStore()
  const ref = (await store.get(`code/${code}`, { type: 'json' })) as { id: string } | null
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
  if (lead.referralCode) await store.setJSON(`code/${lead.referralCode}`, { id: lead.id })
}

export function newLeadId(): string {
  return randomUUID()
}

/** A fresh 6-character code that no lead holds yet. */
export async function newReferralCode(): Promise<string> {
  const store = leadStore()
  for (let attempt = 0; attempt < 8; attempt++) {
    let code = ''
    for (let i = 0; i < 6; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
    const taken = await store.get(`code/${code}`, { type: 'json' })
    if (!taken) return code
  }
  throw new Error('Could not allocate a referral code')
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

// ── Entries in the draw ───────────────────────────────────────────────────────

export interface Tally {
  /** People who came through this lead's link and confirmed their email. */
  verifiedReferrals: number
  /** Came through the link, not confirmed yet. */
  pendingReferrals: number
  /** Verified referrals after the caps (REFERRAL_CAP total, SAME_DOMAIN_CAP from own domain). */
  countedReferrals: number
  /** 0 until this lead has confirmed their own email; then 1 + countedReferrals. */
  entries: number
  eligible: boolean
}

const EMPTY_TALLY: Tally = { verifiedReferrals: 0, pendingReferrals: 0, countedReferrals: 0, entries: 0, eligible: false }

/** Entries for every live lead, in one pass. Test leads neither hold nor grant entries. */
export function tallyEntries(leads: Lead[]): Map<string, Tally> {
  const live = leads.filter(l => !l.test)
  const byReferrer = new Map<string, Lead[]>()
  for (const l of live) {
    if (!l.referredBy) continue
    const arr = byReferrer.get(l.referredBy) ?? []
    arr.push(l)
    byReferrer.set(l.referredBy, arr)
  }
  const out = new Map<string, Tally>()
  for (const l of live) {
    const refs = byReferrer.get(l.id) ?? []
    const verified = refs.filter(r => r.verifiedAt).sort((a, b) => (a.verifiedAt ?? '').localeCompare(b.verifiedAt ?? ''))
    let counted = 0
    let sameDomain = 0
    for (const r of verified) {
      if (counted >= REFERRAL_CAP) break
      if (r.emailDomain === l.emailDomain) {
        if (sameDomain >= SAME_DOMAIN_CAP) continue
        sameDomain++
      }
      counted++
    }
    const eligible = !!l.verifiedAt
    out.set(l.id, {
      verifiedReferrals: verified.length,
      pendingReferrals: refs.length - verified.length,
      countedReferrals: counted,
      entries: eligible ? 1 + counted : 0,
      eligible,
    })
  }
  return out
}

export function tallyFor(id: string, tallies: Map<string, Tally>): Tally {
  return tallies.get(id) ?? EMPTY_TALLY
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
  /** Draw: confirmed sign-ups, total entries, and the current leader's entries (no names). */
  verified: number
  entries: number
  topEntries: number
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

  const tallies = tallyEntries(live)
  let entries = 0
  let topEntries = 0
  let verified = 0
  for (const t of tallies.values()) {
    entries += t.entries
    if (t.entries > topEntries) topEntries = t.entries
    if (t.eligible) verified++
  }

  const n = live.length
  return {
    n,
    avg: n ? Math.round(total / n) : null,
    bands,
    answers,
    emailShare: n ? emailish / n : null,
    verified,
    entries,
    topEntries,
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
  const tallies = tallyEntries(leads)
  const codeToName = new Map(leads.map(l => [l.id, l.referralCode]))
  const cols = ['createdAt', 'name', 'email', 'emailDomain', 'domainMatch', 'company', 'role', 'roleDetail', 'score', 'band', 'source',
    ...QUESTIONS.filter(q => q.id !== 'role').map(q => q.id),
    'openFriction', 'openWish',
    'verifiedAt', 'referralCode', 'referredByCode', 'referralsVerified', 'referralsPending', 'entries', 'eligible',
    'unsubscribedAt', 'submissions', 'test', 'id']
  const esc = (v: unknown) => {
    const s = v === undefined || v === null ? '' : String(v)
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const rows = leads.map(l => {
    const t = tallyFor(l.id, tallies)
    return [
      l.createdAt, l.name, l.email, l.emailDomain ?? '', l.domainMatch ?? '', l.company, l.answers.role, l.roleDetail ?? '', l.score, l.band, l.source,
      ...QUESTIONS.filter(q => q.id !== 'role').map(q => l.answers[q.id]),
      l.openAnswers?.friction ?? '', l.openAnswers?.wish ?? '',
      l.verifiedAt ?? '', l.referralCode ?? '', l.referredBy ? (codeToName.get(l.referredBy) ?? '') : '',
      t.verifiedReferrals, t.pendingReferrals, t.entries, t.eligible ? 'yes' : '',
      l.unsubscribedAt ?? '', l.submissions, l.test ? 'yes' : '', l.id,
    ].map(esc).join(',')
  })
  return [cols.join(','), ...rows].join('\n') + '\n'
}
