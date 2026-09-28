/**
 * Visitor intelligence: Portlink's own lead tracking, built 29.09.2026 to replace Ospry.
 * Entry doc: docs/VISITOR-INTELLIGENCE.md. Everything tunable lives in this file.
 *
 * Two tiers, and the line between them is the whole legal design:
 *   COMPANY  every visitor, no cookie, no device storage. The IP is truncated, looked up to the
 *            network owner, and discarded. Basis: legitimate interest (docs/LIA-VISITOR-INTELLIGENCE.md).
 *   PERSON   only with the "Remember me" consent category (lib/consent.ts), or for the single
 *            landing of a signed link we emailed that person ourselves.
 */

/** INTEL_STORE_NAME overrides it for local and scripted tests, so they never write into production data. */
export const INTEL_STORE = process.env.INTEL_STORE_NAME || 'visitor-intel'

/** Paths that are never recorded: the private leads page, and the archived Seatrade draw. */
export const UNTRACKED_PREFIXES = ['/leads', '/seatrade', '/api']

/** How long raw events are kept. Matches the Analytics cookie ceiling. */
export const RETENTION_DAYS = 395

/** The first-party visitor id, set only after "Remember me" is switched on. */
export const VID_COOKIE = 'pl_vid'
export const VID_DAYS = 395
/** Objection to company-level recording, set from /privacy/#choices. Strictly necessary. */
export const OPTOUT_COOKIE = 'pl_optout'
/** Signed link parameter for outreach emails, made by scripts/lead-link.mjs. */
export const LINK_PARAM = 'pl'
/** The admin session cookie for /leads, set by /api/intel/login. */
export const ADMIN_COOKIE = 'pl_admin'

/**
 * What makes a visit interesting, in points. A company crosses HOT_SCORE in one day and the admin
 * gets an email (once per company per day). Paths are matched as prefixes.
 */
export const PAGE_POINTS: { prefix: string; points: number; label: string }[] = [
  { prefix: '/contact', points: 25, label: 'contact page' },
  { prefix: '/team', points: 8, label: 'team page' },
  { prefix: '/portlink+griegconnect', points: 12, label: 'Grieg Connect page' },
  { prefix: '/innovasjon-norge', points: 3, label: 'Innovasjon Norge page' },
  { prefix: '/privacy', points: 0, label: 'privacy page' },
  { prefix: '/', points: 4, label: 'homepage' },
]
export const EVENT_POINTS = {
  scroll: 5,
  form: 40,
  identify: 40,
  link: 30,
  /** Per extra distinct visitor from the same company on the same day. */
  colleague: 15,
  /** Per extra page beyond the first in one visit. */
  depth: 3,
}
export const HOT_SCORE = 30

/**
 * Networks that are not a company: ISPs, mobile carriers, clouds, VPNs and security proxies.
 * PeeringDB's own type is checked first; these catch what it does not list. Matched case-insensitive
 * against the network holder name. Extend from the "unresolved networks" table on /leads.
 */
export const NOT_A_COMPANY = [
  'telenor', 'telia', 'ice communication', 'altibox', 'globalconnect', 'lyse', 'broadnet', 'nextgentel',
  'comcast', 'verizon', 'at&t', 'att-', 'charter', 'spectrum', 'cox communications', 't-mobile', 'vodafone',
  'orange', 'deutsche telekom', 'telefonica', 'bt-', 'british telecommunications', 'sky ', 'virgin media',
  'liberty global', 'tele2', 'telstra', 'rogers', 'bell canada', 'swisscom', 'proximus', 'kpn', 'ziggo',
  'amazon', 'aws', 'google', 'microsoft', 'azure', 'cloudflare', 'akamai', 'fastly', 'digitalocean',
  'ovh', 'hetzner', 'linode', 'oracle', 'alibaba', 'tencent', 'zscaler', 'netskope', 'palo alto',
  'forcepoint', 'iboss', 'mullvad', 'nordvpn', 'expressvpn', 'm247', 'datacamp', 'apple', 'starlink',
  'space exploration', 'hurricane electric', 'cogent', 'level3', 'lumen', 'zayo', 'gtt', 'telecom',
  'broadband', 'mobile', 'cable', 'wireless', 'internet service', 'isp', 'hosting', 'datacenter',
  'data center', 'vpn', 'satellite',
]

/**
 * Accounts Portlink sells to. A match marks the visit ICP and adds points. Keyed by the domain the
 * network's registry record names (RDAP), which is how the lookup identifies a company.
 */
export const ICP_DOMAINS: Record<string, string> = {
  'carnival.com': 'Carnival Corporation',
  'ncl.com': 'Norwegian Cruise Line Holdings',
  'msc.com': 'MSC',
  'costa.it': 'Costa Crociere',
  'rccl.com': 'Royal Caribbean Group',
  'hurtigruten.com': 'Hurtigruten',
  'havila.no': 'Havila Voyages',
  'vikingcruises.com': 'Viking',
  'tui.com': 'TUI',
  'disney.com': 'Disney Cruise Line',
  'princess.com': 'Princess Cruises',
  'hollandamerica.com': 'Holland America Line',
  'aida.de': 'AIDA Cruises',
  'ponant.com': 'Ponant',
  'silversea.com': 'Silversea',
  'bergenhavn.no': 'Bergen Havn',
  'oslohavn.no': 'Oslo Havn',
  'griegconnect.com': 'Grieg Connect',
}
export const ICP_POINTS = 20
