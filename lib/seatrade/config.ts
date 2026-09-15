/**
 * Seatrade Cruise Med 2026 funnel — constants. Nothing secret lives here.
 *
 * Secrets (RESEND_API_KEY) and the admin address (ADMIN_EMAIL) come from the Netlify site env
 * (set for all contexts) and locally from `op run --env-file=.env.op`. See CLAUDE.md.
 */

export const EVENT = {
  name: 'Seatrade Cruise Med 2026',
  city: 'Las Palmas de Gran Canaria',
  venue: 'Santa Catalina Terminal',
  dates: '16–17 September 2026',
  hashtag: '#STCMed',
  /** Last day of the show, used to phrase the follow-ups ("after the show"). */
  endsOn: '2026-09-17',
} as const

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://portlink.app').replace(/\/$/, '')

/** Where the funnel lives. Trailing slash matters: next.config has trailingSlash: true. */
export const FUNNEL_PATH = '/seatrade/'
export const REPORT_PATH = '/seatrade/report/'
export const ME_PATH = '/seatrade/me/'
export const TERMS_PATH = '/seatrade/terms/'
export const PILOT_URL = `${SITE_URL}/#access`

export const FROM = 'Portlink <pilot@portlink.app>'
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portlink.app'

/** Resend audience "Seatrade Med 2026", created 14.09.2026 in the Portlink Resend account. */
export const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID || '462446b9-df54-4ce1-ace1-8cf07e3b4d7b'

/** Netlify Blobs store holding one JSON document per lead. Site-wide, shared by every deploy. */
export const LEAD_STORE = 'seatrade-leads'

// ── The draw ──────────────────────────────────────────────────────────────────

/** ONE place to change the prize. Copy everywhere reads "the draw for {PRIZE_NAME}". */
export const PRIZE_NAME = process.env.SEATRADE_PRIZE_NAME || 'an iPhone'

export const DRAW = {
  /** Entries close a week after the show so referrals sent from Las Palmas still count. */
  closesAt: '2026-09-26T21:59:59Z',
  closesLabel: '26 September 2026 at 23.59 (Madrid time)',
  drawDate: '2026-09-29',
  drawLabel: '29 September 2026',
} as const

/** Entries: 1 for your own verified sign-up + 1 per verified referral, capped. */
export const REFERRAL_CAP = 10
/** Of those, at most this many may come from the referrer's own email domain. */
export const SAME_DOMAIN_CAP = 3
/** "Your entry is not active yet" goes out this many hours after sign-up unless they confirm. */
export const VERIFY_REMINDER_HOURS = 20

export function referralUrl(code: string): string {
  return `${SITE_URL}${FUNNEL_PATH}?r=${code}`
}

export function verifyUrl(id: string): string {
  return `${SITE_URL}/api/seatrade/verify/?t=${id}`
}

export function meUrl(id: string): string {
  return `${SITE_URL}${ME_PATH}?t=${id}`
}

export function drawIsOpen(now = new Date()): boolean {
  return now.getTime() <= Date.parse(DRAW.closesAt)
}

// ── The email sequence ────────────────────────────────────────────────────────

/**
 * The drip: days after sign-up, delivered at 09:00 Europe/Madrid (07:00Z in September).
 * Resend allows scheduling up to 30 days ahead; the whole sequence is booked at sign-up.
 */
export const SEQUENCE = [
  { key: 'e2', daysAfter: 2 },
  { key: 'e3', daysAfter: 6 },
  { key: 'e4', daysAfter: 12 },
] as const

export type SequenceKey = 'e1' | (typeof SEQUENCE)[number]['key']

/** The show's last day at 07:00Z. Sign-ups before this (LinkedIn, pre-show mail) count from here,
 *  so nobody gets "Seatrade Med is over" while the doors are still open. */
export const SEQUENCE_ANCHOR = new Date(`${EVENT.endsOn}T07:00:00Z`)

/** 09:00 Madrid on the Nth day after `from` (or after the show, whichever is later).
 *  Sept/Oct 2026 is CEST (UTC+2), so 07:00Z. */
export function scheduleAt(from: Date, daysAfter: number): string {
  const base = from.getTime() > SEQUENCE_ANCHOR.getTime() ? from : SEQUENCE_ANCHOR
  const d = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + daysAfter, 7, 0, 0))
  // Never inside the next hour (Resend rejects the past; a sign-up at 06:59Z would otherwise be tight).
  if (d.getTime() < from.getTime() + 60 * 60 * 1000) d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString()
}

/** Minimum gap between two CSV exports mailed to the admin (abuse guard, no auth needed). */
export const EXPORT_MIN_INTERVAL_MS = 10 * 60 * 1000
