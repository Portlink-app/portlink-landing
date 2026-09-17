/**
 * What happens when somebody writes to us. One copy, three renderings.
 *
 * These three sentences appear on `/contact/`, in door B of `TwoDoorsSection` on the homepage, and
 * in the confirmation mail `/api/access` sends for a build enquiry. They are promises to a person
 * who has not met us, so the page, the section and the mail agreeing is not tidiness: the argument
 * of the whole site after 17.09.2026 is that a reader can go and check what we say, and the first
 * thing they can check is whether the reply matches what they were told they would get.
 *
 * ⛔ EVERY ONE OF THEM IS CHECKABLE, AND THAT IS THE BAR FOR ADDING A FOURTH. "48 hours" is not a
 * claim invented for a landing page; `app/api/access/route.ts` has promised it in the confirmation
 * mail since before any of this, which is the only reason it survives here. Do not add a promise
 * about response quality, customer count, uptime or a certification. Nothing on this site may
 * claim a customer we do not have.
 */
export type ContactPromise = {
  /** The commitment, in one short sentence. Bold on every surface that renders it. */
  lead: string
  /** Why it is true, or what it rules out. */
  body: string
}

export const CONTACT_PROMISES: ContactPromise[] = [
  {
    lead: 'David or Kris reads it.',
    body: 'There is no sales team. The person who replies is one of the two people who decide what gets built.',
  },
  {
    lead: 'You get a real answer within 48 hours.',
    body: 'Either what we would build and roughly what that takes, or a straight no with the reason.',
  },
  {
    lead: 'If it goes further, we talk to the people who do the work.',
    body: 'Not to a procurement contact. To the planner, the agent, the duty officer.',
  },
]
