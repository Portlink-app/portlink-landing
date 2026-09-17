/**
 * Who may ask for a pilot, and therefore who `/api/access` will send mail to.
 *
 * WHY THIS EXISTS. `/api/access` sends a confirmation email, from the verified sender
 * `pilot@portlink.app`, to whatever address the request body happens to carry. Until this module
 * existed the only check on that address was that the field was not empty, so the endpoint would
 * deliver a message signed by our domain to any address on earth, on demand, at no cost to the
 * caller. That is a deliverability and sender-reputation exposure, not a tidiness one.
 *
 * ONE RULE SET, TWO SENTENCES. The pilot form and the Seatrade draw form ask an address the same
 * question: is this a real, deliverable work address at a company rather than a consumer mailbox
 * or a throwaway? That question is answered in exactly one place, `lib/seatrade/eligibility.ts`,
 * and this module delegates to it rather than keeping a second copy of the provider lists. What
 * legitimately differs between the two flows is the sentence the visitor reads: one is about
 * entering a draw, the other is about joining the pilot. Rules are shared, copy is per flow.
 *
 * Client and server both import from here, so the instant feedback in the form and the decision
 * in the API can never drift apart. One form now serves both intents, so there is one module for
 * both rather than a second copy for the build enquiry.
 */
import { EMAIL_RE, normalizeEmail, workEmailProblem } from '@/lib/seatrade/eligibility'

/**
 * The kinds of organisation the form offers, and the only values `/api/access` accepts. The API
 * refuses anything else, because this value selects the confirmation copy, the detail fields shown
 * to the admin and the admin subject line, and an unrecognised value silently fell through to the
 * Cruise Line template before.
 *
 * FOUR AUDIENCES, NOT THREE, from 17.09.2026: ports and terminals are a first-class side of a port
 * call and were missing from every surface of this site. `Something else` exists because the form
 * asks one question before it knows what the visitor is, and a shipyard or a port authority that
 * picks it must not be refused by the endpoint the form itself accepted. Every member here has
 * confirmation copy, an admin block and a badge colour in `app/api/access/route.ts`; a member
 * without them is a `Record` that will not type-check, which is the point of the exhaustive maps.
 *
 * ⛔ THE VALUES ARE THE WIRE FORMAT, THE LABELS ARE NOT. `Port Agent` stays spelled that way
 * because the confirmation copy, the admin subject and the guard's fixtures are keyed on it;
 * the visitor reads `ORG_TYPE_LABEL` below. Change a label freely, change a value never.
 */
export const PILOT_ROLES = [
  'Cruise Line',
  'Port or Terminal',
  'Port Agent',
  'Tour Operator',
  'Something else',
] as const
export type PilotRole = (typeof PILOT_ROLES)[number]

/** What the visitor reads for each wire value, in the order the form offers them. */
export const ORG_TYPE_LABEL: Record<PilotRole, string> = {
  'Cruise Line': 'Cruise line',
  'Port or Terminal': 'Port or terminal',
  'Port Agent': 'Port agency',
  'Tour Operator': 'Tour operator',
  'Something else': 'Something else',
}

export function isPilotRole(value: string): value is PilotRole {
  return (PILOT_ROLES as readonly string[]).includes(value)
}

/**
 * Why the visitor is writing: to use the platform, or to have something built.
 *
 * It is a separate axis from the organisation type, because both questions have to be answered
 * before either answer is useful: a port agency can want the pilot or a bespoke build, and the
 * reply they get is completely different. One form, one endpoint, two routes through it.
 */
export const CONTACT_INTENTS = ['pilot', 'build'] as const
export type ContactIntent = (typeof CONTACT_INTENTS)[number]

export function isContactIntent(value: string): value is ContactIntent {
  return (CONTACT_INTENTS as readonly string[]).includes(value)
}

/**
 * The mailbox an address actually reaches, for use as a rate-limit key.
 *
 * `ada+1@corp.com` and `ada+2@corp.com` are one inbox, so they must share one counter or the
 * limit is a formality. Only the COUNTER is normalised: the confirmation is still sent to the
 * address the visitor typed, plus tag intact, because that is the address they will look for.
 */
export function recipientKey(raw: string): string {
  return normalizeEmail(raw)
}

/**
 * Null when the address may be sent pilot mail; otherwise the sentence to show the visitor.
 *
 * The decision is `workEmailProblem`'s, unchanged. Only the wording is re-cast for this flow, and
 * the malformed case is separated out first because "use your work email" is useless advice to
 * somebody who has typed half an address.
 */
export function pilotEmailProblem(raw: string): string | null {
  if (workEmailProblem(raw) === null) return null
  if (!EMAIL_RE.test(normalizeEmail(raw))) return 'Please enter a valid email address.'
  return 'Please use your work email address. We work with teams at ports and terminals, cruise lines, port agencies and tour operators, and your domain is how we see where you work.'
}
