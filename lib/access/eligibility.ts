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
 * in the API can never drift apart.
 */
import { EMAIL_RE, normalizeEmail, workEmailProblem } from '@/lib/seatrade/eligibility'

/**
 * The roles the pilot form offers. The API refuses anything else, because the role selects the
 * confirmation copy, the detail fields shown to the admin and the admin subject line, and an
 * unrecognised value silently fell through to the Cruise Line template before.
 */
export const PILOT_ROLES = ['Cruise Line', 'Port Agent', 'Tour Operator'] as const
export type PilotRole = (typeof PILOT_ROLES)[number]

export function isPilotRole(value: string): value is PilotRole {
  return (PILOT_ROLES as readonly string[]).includes(value)
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
  return 'Please use your work email address. The pilot is for teams at cruise lines, port agencies and tour operators, and your domain is how we see where you work.'
}
