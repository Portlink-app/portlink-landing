/**
 * Who counts as a lead, and therefore as an entry in the Seatrade Med draw.
 *
 * Pure module, shared by the client form (instant feedback) and the API (the decision).
 *
 * Rule: a work email at a company domain. Free-mail and disposable providers are refused with a
 * message, not silently downgraded, because the visitor is standing there and can fix it. Whether
 * the company name and the domain belong together is a heuristic (`domainMatch`) recorded for
 * David's review before the draw, never a block: "MSC Cruises" at msccruises.com is obvious to a
 * person and hard to prove to a machine.
 */

/** First label of the domain (before the first dot) for the big consumer providers, so that
 *  outlook.es, hotmail.co.uk and yahoo.fr are all caught without listing every country. */
const FREE_MAIL_LABELS = new Set([
  'gmail', 'googlemail', 'hotmail', 'outlook', 'live', 'msn', 'yahoo', 'ymail', 'rocketmail',
  'icloud', 'me', 'mac', 'aol', 'protonmail', 'proton', 'pm', 'gmx', 'mail', 'email', 'yandex',
  'zoho', 'zohomail', 'qq', '163', '126', 'sina', 'web', 't-online', 'orange', 'wanadoo', 'free',
  'laposte', 'sfr', 'libero', 'virgilio', 'tiscali', 'alice', 'telenor', 'online', 'getmail',
  'hey', 'fastmail', 'tutanota', 'tuta', 'mailbox', 'posteo', 'seznam', 'wp', 'o2', 'interia',
  'bluewin', 'skynet', 'telenet', 'ziggo', 'kpnmail', 'home', 'terra', 'uol', 'bol', 'rediffmail',
])

const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', '10minutemail.com', 'temp-mail.org',
  'tempmail.com', 'yopmail.com', 'yopmail.fr', 'trashmail.com', 'getnada.com', 'dispostable.com',
  'sharklasers.com', 'maildrop.cc', 'throwawaymail.com', 'fakeinbox.com', 'mohmal.com',
  'emailondeck.com', 'tempr.email', 'mintemail.com', 'spamgourmet.com',
])

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Lower-case, trimmed, with a `+tag` stripped from the local part so one person is one entry. */
export function normalizeEmail(raw: string): string {
  const s = raw.trim().toLowerCase()
  const at = s.lastIndexOf('@')
  if (at < 0) return s
  const local = s.slice(0, at).replace(/\+.*$/, '')
  return `${local}@${s.slice(at + 1)}`
}

export function emailDomain(email: string): string {
  const at = email.lastIndexOf('@')
  return at < 0 ? '' : email.slice(at + 1).toLowerCase()
}

export function isFreeMail(domain: string): boolean {
  const first = domain.split('.')[0]
  return FREE_MAIL_LABELS.has(first) || DISPOSABLE_DOMAINS.has(domain)
}

/** Null when the address is acceptable; otherwise the sentence to show the visitor. */
export function workEmailProblem(raw: string): string | null {
  const email = normalizeEmail(raw)
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.'
  const domain = emailDomain(email)
  if (DISPOSABLE_DOMAINS.has(domain)) return 'Temporary addresses cannot enter the draw. Please use your work email.'
  if (isFreeMail(domain)) return 'Please use your work email. The draw is for people in the industry, and the domain is how we see where you work.'
  return null
}

const STOP = new Set(['the', 'and', 'of', 'de', 'del', 'la', 'le', 'di', 'da', 'as', 'sa', 'srl', 'spa', 'ltd', 'limited',
  'inc', 'llc', 'gmbh', 'ag', 'bv', 'nv', 'plc', 'co', 'company', 'group', 'holding', 'holdings', 'international',
  'services', 'service', 'agency', 'agencies', 'maritime', 'shipping', 'cruise', 'cruises', 'port', 'ports',
  'tours', 'tour', 'travel', 'dmc', 'destination', 'management', 'authority', 'terminal', 'terminals', 'line', 'lines'])

/**
 * 'likely' when a distinctive token of the company name appears in the domain (or the domain's
 * label appears in the company name); 'unclear' otherwise. Review aid, not a gate.
 */
export function domainMatch(company: string, domain: string): 'likely' | 'unclear' {
  const label = domain.split('.')[0].replace(/[^a-z0-9]/g, '')
  if (!label) return 'unclear'
  const tokens = company.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .split(/[^a-z0-9]+/).filter(t => t.length >= 3 && !STOP.has(t))
  const squashed = tokens.join('')
  if (tokens.some(t => label.includes(t))) return 'likely'
  if (squashed && label.length >= 4 && squashed.includes(label)) return 'likely'
  // Initials: "Global Ports Holding" → gph
  const initials = company.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).map(w => w[0]).join('')
  if (initials.length >= 3 && label === initials) return 'likely'
  return 'unclear'
}

/** Referral codes: 6 characters, no look-alikes (I, L, O, 0, 1), easy to read out at a stand. */
export const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const CODE_RE = /^[A-Z2-9]{6}$/

export function cleanCode(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const c = raw.trim().toUpperCase().replace(/^PL-?/, '').replace(/[^A-Z2-9]/g, '')
  return CODE_RE.test(c) ? c : null
}
