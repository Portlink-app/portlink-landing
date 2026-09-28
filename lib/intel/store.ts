/**
 * Visitor-intelligence storage: Netlify Blobs, store `visitor-intel`, on the same site and by the
 * same pattern as the Seatrade lead store (lib/seatrade/store.ts). No database, by design.
 *
 * Keys
 *   e/<YYYY-MM-DD>/<ms>-<rand>   one event, append-only. Never updated, so concurrent writes
 *                                cannot lose each other (Blobs has no transactions).
 *   org/net/<prefix>             /24 (v4) or /48 (v6) → org lookup, cached 30 days
 *   org/asn/<asn>                ASN → holder, domain, kind, cached 30 days
 *   id/<vid>                     consented visitor id → the person it was linked to
 *   salt/<YYYY-MM-DD>            that day's random salt for visit keys; deleted after two days
 *   alert/<YYYY-MM-DD>/<key>     a hot-company alert already sent today
 *   meta/<name>                  bookkeeping (last digest)
 *
 * Nothing here stores an IP address, whole or truncated, next to anything about a visit.
 */
import { randomBytes } from 'node:crypto'
import { getStore, type Store } from '@netlify/blobs'
import { INTEL_STORE } from './config'

let cached: Store | null = null

export function intelStore(): Store {
  if (cached) return cached
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
  cached = siteID && token
    ? getStore({ name: INTEL_STORE, siteID, token, consistency: 'strong' })
    : getStore({ name: INTEL_STORE, consistency: 'strong' })
  return cached
}

export type EventType = 'pv' | 'scroll' | 'form' | 'leave' | 'identify' | 'link' | 'forget'

export interface Org {
  /** What the site shows: the curated ICP name, else the network holder's organisation name. */
  name: string
  /** From the network's registry (RDAP) contact domain, e.g. carnival.com. */
  domain?: string
  asn?: string
  /** company = a named organisation; network = ISP, cloud, VPN or proxy (not shown as a lead). */
  kind: 'company' | 'network' | 'unknown'
  icp?: boolean
}

export interface Person {
  email: string
  name?: string
  company?: string
  role?: string
  source: 'form' | 'link'
  linkedAt: string
}

export interface IntelEvent {
  ts: string
  t: EventType
  /** Visit key: hash of the day's salt, IP and user agent. Unlinkable once the salt is deleted. */
  vk: string
  /** Consented visitor id, only when "Remember me" is on. */
  vid?: string
  p?: string
  title?: string
  ref?: string
  utm?: Record<string, string>
  ms?: number
  formId?: string
  country?: string
  city?: string
  org?: Org
  /** On identify and link events only. */
  person?: Person
}

export const day = (d: Date = new Date()) => d.toISOString().slice(0, 10)

export async function putEvent(ev: IntelEvent): Promise<void> {
  const key = `e/${ev.ts.slice(0, 10)}/${Date.parse(ev.ts)}-${randomBytes(4).toString('hex')}`
  await intelStore().setJSON(key, ev)
}

/** Every event from the last `days` days, oldest first. Fine for a marketing site's volume. */
export async function listEvents(days: number, now: Date = new Date()): Promise<IntelEvent[]> {
  const store = intelStore()
  const out: IntelEvent[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = day(new Date(now.getTime() - i * 86_400_000))
    const { blobs } = await store.list({ prefix: `e/${d}/` })
    const docs = await Promise.all(blobs.map((b) => store.get(b.key, { type: 'json' }) as Promise<IntelEvent | null>))
    for (const doc of docs) if (doc) out.push(doc)
  }
  return out.sort((a, b) => a.ts.localeCompare(b.ts))
}

/** The day's salt, created on first use. Deleting it is what makes that day's visit keys unlinkable. */
export async function daySalt(d: string = day()): Promise<string> {
  const store = intelStore()
  const existing = (await store.get(`salt/${d}`, { type: 'text' })) as string | null
  if (existing) return existing
  const salt = randomBytes(32).toString('hex')
  await store.set(`salt/${d}`, salt)
  // Two instances racing on the first event of a day may each write one; re-read so both use
  // whichever landed. A visit split across the two in that first second is the whole cost.
  return ((await store.get(`salt/${d}`, { type: 'text' })) as string | null) ?? salt
}

export async function getCached<T>(key: string, maxAgeDays: number): Promise<T | null> {
  const doc = (await intelStore().get(key, { type: 'json' })) as { at: string; v: T } | null
  if (!doc) return null
  return Date.now() - Date.parse(doc.at) < maxAgeDays * 86_400_000 ? doc.v : null
}

export async function setCached<T>(key: string, v: T): Promise<void> {
  await intelStore().setJSON(key, { at: new Date().toISOString(), v })
}

export async function getIdentity(vid: string): Promise<Person | null> {
  return (await intelStore().get(`id/${vid}`, { type: 'json' })) as Person | null
}

export async function setIdentity(vid: string, person: Person): Promise<void> {
  await intelStore().setJSON(`id/${vid}`, person)
}

/**
 * Withdrawal of "Remember me": the identity link goes, and so does every event carrying this
 * visitor id, because those are the ones that could be tied back to the person.
 */
export async function forgetVisitor(vid: string): Promise<number> {
  const store = intelStore()
  await store.delete(`id/${vid}`)
  let removed = 0
  const { blobs } = await store.list({ prefix: 'e/' })
  for (const b of blobs) {
    const ev = (await store.get(b.key, { type: 'json' })) as IntelEvent | null
    if (ev?.vid === vid) {
      await store.delete(b.key)
      removed++
    }
  }
  return removed
}

/** Retention: raw events past RETENTION_DAYS, and salts older than yesterday. */
export async function sweep(retentionDays: number, now: Date = new Date()): Promise<{ events: number; salts: number }> {
  const store = intelStore()
  const cutoff = day(new Date(now.getTime() - retentionDays * 86_400_000))
  const keepSalt = new Set([day(now), day(new Date(now.getTime() - 86_400_000))])
  let events = 0
  let salts = 0
  const ev = await store.list({ prefix: 'e/', directories: true })
  for (const dir of ev.directories) {
    const d = dir.replace(/^e\//, '').replace(/\/$/, '')
    if (d < cutoff) {
      const { blobs } = await store.list({ prefix: `e/${d}/` })
      for (const b of blobs) { await store.delete(b.key); events++ }
    }
  }
  const s = await store.list({ prefix: 'salt/' })
  for (const b of s.blobs) {
    if (!keepSalt.has(b.key.replace('salt/', ''))) { await store.delete(b.key); salts++ }
  }
  return { events, salts }
}

export async function getMeta(name: string): Promise<string | null> {
  return (await intelStore().get(`meta/${name}`, { type: 'text' })) as string | null
}

export async function setMeta(name: string, value: string): Promise<void> {
  await intelStore().set(`meta/${name}`, value)
}

export async function alreadyAlerted(key: string, d: string = day()): Promise<boolean> {
  return !!(await intelStore().get(`alert/${d}/${key}`, { type: 'text' }))
}

export async function markAlerted(key: string, d: string = day()): Promise<void> {
  await intelStore().set(`alert/${d}/${key}`, new Date().toISOString())
}
