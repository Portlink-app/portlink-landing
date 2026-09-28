/**
 * IP → the organisation that owns the network. Free, no account, no key.
 *
 *   1. Truncate: IPv4 to its /24, IPv6 to its /48. Only the truncated prefix ever leaves our server.
 *   2. RIPEstat network-info (RIPE NCC, Amsterdam): prefix → originating ASN.
 *   3. RIPEstat as-overview: ASN → holder name, e.g. "CCL-ASN - Carnival Corporation".
 *   4. RDAP (rdap.org → the regional registry): ASN → contact e-mail domain, e.g. carnival.com.
 *   5. PeeringDB: ASN → network type. "Cable/DSL/ISP", "NSP" and "Content" are networks, not leads.
 *   6. NOT_A_COMPANY keywords catch the ISPs, clouds and VPNs PeeringDB does not list.
 *
 * Measured 29.09.2026 before this was written: a Carnival prefix resolved to AS30598
 * "CCL-ASN - Carnival Corporation" with RDAP domain carnival.com; AS30066 → ncl.com, AS28749 →
 * msc.com, AS198772 → costa.it; Telenor AS2119 is "Cable/DSL/ISP" in PeeringDB.
 *
 * Every step is cached in Blobs (prefix and ASN, 30 days) and bounded by a timeout, so a slow
 * registry costs one visitor's lookup, never the collector.
 */
import { isIP } from 'node:net'
import { ICP_DOMAINS, NOT_A_COMPANY } from './config'
import { getCached, setCached, type Org } from './store'

const TIMEOUT_MS = 3500
const CACHE_DAYS = 30
const NETWORK_TYPES = new Set(['Cable/DSL/ISP', 'NSP', 'Content', 'Route Server', 'Network Services'])
const REGISTRY_DOMAINS = /(^|\.)(arin\.net|ripe\.net|apnic\.net|lacnic\.net|afrinic\.net|iana\.org|rdap\.org)$/

const notACompany = new RegExp(
  NOT_A_COMPANY.map((w) => `\\b${w.replace(/[.*+?^${}()|[\]\\&]/g, '\\$&')}`).join('|'),
  'i',
)

/** "203.0.113.57" → "203.0.113.0"; IPv6 → its /48. Null for anything private or malformed. */
export function truncateIp(ip: string): string | null {
  const v = isIP(ip)
  if (v === 4) {
    const parts = ip.split('.').map(Number)
    if (parts[0] === 10 || parts[0] === 127 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)) return null
    return `${parts[0]}.${parts[1]}.${parts[2]}.0`
  }
  if (v === 6) {
    const full = expandV6(ip)
    if (!full || /^(fc|fd|fe80|0000:0000:0000:0000:0000:0000:0000:0001)/.test(full)) return null
    return full.split(':').slice(0, 3).join(':') + '::'
  }
  return null
}

function expandV6(ip: string): string | null {
  const [head, tail = ''] = ip.split('::')
  const h = head ? head.split(':') : []
  const t = tail ? tail.split(':') : []
  if (ip.includes('.')) return null
  const fill = 8 - h.length - t.length
  if (fill < 0) return null
  return [...h, ...Array(ip.includes('::') ? fill : 0).fill('0'), ...t].map((x) => x.padStart(4, '0')).join(':')
}

async function getJson(url: string): Promise<unknown> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { accept: 'application/json, application/rdap+json', 'user-agent': 'portlink.app visitor-intel (pilot@portlink.app)' },
  })
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  return res.json()
}

/** "CCL-ASN - Carnival Corporation" → "Carnival Corporation". */
export function holderName(holder: string): string {
  const parts = holder.split(' - ')
  return (parts.length > 1 ? parts.slice(1).join(' - ') : holder).trim()
}

async function asnInfo(asn: string): Promise<Org> {
  const key = `org/asn/${asn}`
  const hit = await getCached<Org>(key, CACHE_DAYS)
  if (hit) return hit

  const [overview, rdap, peering] = await Promise.allSettled([
    getJson(`https://stat.ripe.net/data/as-overview/data.json?resource=AS${asn}&sourceapp=portlink-intel`),
    getJson(`https://rdap.org/autnum/${asn}`),
    getJson(`https://www.peeringdb.com/api/net?asn=${asn}`),
  ])
  const holder = overview.status === 'fulfilled'
    ? String((overview.value as { data?: { holder?: string } }).data?.holder ?? '')
    : ''
  const domains = rdap.status === 'fulfilled'
    ? [...JSON.stringify(rdap.value).matchAll(/[\w.+-]+@([\w-]+(?:\.[\w-]+)+)/g)].map((m) => m[1].toLowerCase()).filter((d) => !REGISTRY_DOMAINS.test(d))
    : []
  const domain = mostCommon(domains)
  const pType = peering.status === 'fulfilled'
    ? String(((peering.value as { data?: { info_type?: string }[] }).data ?? [])[0]?.info_type ?? '')
    : ''

  const icpName = domain ? ICP_DOMAINS[domain] : undefined
  const name = icpName ?? (holder ? holderName(holder) : `AS${asn}`)
  const isNetwork = !icpName && (NETWORK_TYPES.has(pType) || notACompany.test(holder) || (domain ? notACompany.test(domain) : false))
  const org: Org = {
    name,
    domain,
    asn,
    kind: !holder && !domain ? 'unknown' : isNetwork ? 'network' : 'company',
    icp: !!icpName,
  }
  // A total lookup failure is not cached, so the next visit tries again instead of remembering nothing.
  if (overview.status === 'fulfilled' || rdap.status === 'fulfilled') await setCached(key, org)
  return org
}

function mostCommon(xs: string[]): string | undefined {
  const counts = new Map<string, number>()
  for (const x of xs) counts.set(x, (counts.get(x) ?? 0) + 1)
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
}

/** The owner of this visitor's network, or null when it cannot be told. Never throws. */
export async function resolveOrg(ip: string | null): Promise<Org | null> {
  try {
    if (!ip) return null
    const prefix = truncateIp(ip)
    if (!prefix) return null
    const netKey = `org/net/${prefix.replace(/:/g, '_')}`
    let asn = await getCached<string>(netKey, CACHE_DAYS)
    if (!asn) {
      const info = (await getJson(`https://stat.ripe.net/data/network-info/data.json?resource=${prefix}&sourceapp=portlink-intel`)) as { data?: { asns?: string[] } }
      asn = info.data?.asns?.[0] ?? null
      if (!asn) return null
      await setCached(netKey, asn)
    }
    return await asnInfo(asn)
  } catch (err) {
    console.error('[intel] org lookup failed', err instanceof Error ? err.message : err)
    return null
  }
}
