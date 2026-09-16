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

/** The big consumer providers, by the one label that identifies them, so that outlook.es,
 *  hotmail.co.uk and yahoo.fr are all caught without listing every country they operate in.
 *  A label counts as free mail only when it is the WHOLE registrable domain — see `isFreeMail`. */
export const FREE_MAIL_LABELS = new Set([
  'gmail', 'googlemail', 'hotmail', 'outlook', 'live', 'msn', 'yahoo', 'ymail', 'rocketmail',
  'icloud', 'me', 'mac', 'aol', 'protonmail', 'proton', 'pm', 'gmx', 'mail', 'email', 'yandex',
  'zoho', 'zohomail', 'qq', '163', '126', 'sina', 'web', 't-online', 'orange', 'wanadoo', 'free',
  'laposte', 'sfr', 'libero', 'virgilio', 'tiscali', 'alice', 'telenor', 'online', 'getmail',
  'hey', 'fastmail', 'tutanota', 'tuta', 'mailbox', 'posteo', 'seznam', 'wp', 'o2', 'interia',
  'bluewin', 'skynet', 'telenet', 'ziggo', 'kpnmail', 'home', 'terra', 'uol', 'bol', 'rediffmail',
])

/** Exported, with FREE_MAIL_LABELS, so `scripts/check-eligibility.mjs` generates its corpus from
 *  the real sets. A provider added here tomorrow is then covered without editing a second list. */
export const DISPOSABLE_DOMAINS = new Set([
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

/**
 * Public suffixes that occupy two labels, so that the label in front of them is the registrable
 * name rather than a host. Without this, `hotmail.co.uk` reads as the company "hotmail.co" and is
 * accepted as work email.
 *
 * WHY A HAND TABLE AND NOT `psl`. This is lead qualification, not a security control, and the two
 * want opposite failure directions. A suffix missing from this table makes `isFreeMail` ACCEPT an
 * address it should have refused — one free-mail lead on a list David reads, which costs nothing
 * and is visible. The failure it prevents is the silent refusal of a real prospect, which costs a
 * customer and tells nobody. Twenty-nine auditable lines beat a dependency and its data file on a
 * marketing site that rebuilds on every push. Revisit if this rule is ever used to gate something
 * that matters more than a lead, because then the failure direction flips and `psl` is the answer.
 *
 * Only genuine multi-label public suffixes belong here: a wrong entry refuses a real company. And
 * none may lead with a provider label — `me.uk` is a real suffix and is left out for that reason,
 * because it would make `mail.me.uk` read as the provider `mail` standing alone. It buys nothing:
 * no consumer provider operates under it, and a company at `acme.me.uk` is accepted either way.
 */
export const TWO_LABEL_SUFFIXES = new Set([
  'co.uk', 'org.uk', 'com.au', 'net.au', 'org.au', 'com.br', 'co.jp', 'ne.jp', 'or.jp', 'co.za',
  'com.mx', 'co.in', 'co.nz', 'com.sg', 'co.kr', 'com.tr', 'com.ar', 'co.il', 'com.hk',
  'com.cn', 'com.co', 'com.pl', 'com.ua', 'co.id', 'com.ph', 'com.my', 'com.vn', 'com.pe', 'com.tw',
])

/**
 * True when the address belongs to a consumer provider or a throwaway, rather than to a company.
 *
 * The rule is the free-mail label standing alone as the registrable domain, with a known two-label
 * public suffix stripped first. `gmail.com`, `web.de`, `hotmail.co.uk` and `yahoo.com.au` are all
 * the provider itself and are refused. `mail.portagent.no`, `email.msccruises.com` and
 * `home.tallink.ee` are a company running mail on a subdomain of its own name and are accepted.
 *
 * The earlier rule tested only the first label, which refused every such company: any firm whose
 * mail host sits on `mail.`, `email.`, `web.`, `home.` or `online.` under its own domain was read
 * as free mail. That is a silently lost lead, the direction nobody reports, and it reached two
 * funnels through `workEmailProblem`. MSC Cruises — this file's own worked example of a company a
 * person recognises — would have been refused at `email.msccruises.com`.
 *
 * This is strictly a widening of the old rule, by construction rather than by inspection: it can
 * only refuse when the first label is a free-mail label, which is exactly when the old rule already
 * refused. `scripts/check-eligibility.mjs` asserts that over a generated corpus, in both directions.
 */
export function isFreeMail(domain: string): boolean {
  if (DISPOSABLE_DOMAINS.has(domain)) return true
  const labels = domain.split('.')
  const core = TWO_LABEL_SUFFIXES.has(labels.slice(-2).join('.')) ? labels.slice(0, -2) : labels.slice(0, -1)
  return core.length === 1 && FREE_MAIL_LABELS.has(core[0])
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
