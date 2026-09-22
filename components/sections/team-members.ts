/**
 * The team, in one place, because it is rendered in two.
 *
 * `/team` renders the full grid with biographies; the homepage renders a condensed proof strip.
 * Those are two compositions of one fact set, not two fact sets, and the fact set is the part that
 * must never disagree with itself: a role or an affiliation edited on one surface and not the other
 * is the page contradicting itself in public.
 *
 * ⛔ NO FIGURE HERE THAT IS NOT SOURCED. Each line carries only what the person's own CV states.
 * "Sixteen years" and "a decade" are theirs; nothing else gets a number until somebody sources one.
 * Founders first, then advisors. Both founders carry the same role and the same shape of sentence:
 * no CEO, no chair, nothing that ranks one above the other (David, 15.09.2026). The advisors'
 * positions are the ones they publish themselves at pallefabrik.dk.
 */
export type Member = {
  name: string
  role: string
  /** The full biography, for the team page. */
  bio?: string
  /** One line for the homepage strip. Never a claim the full biography does not already make. */
  short: string
  affiliation?: string
  href?: string
  photo: string
}

export const founders: Member[] = [
  {
    name: 'David Bakke',
    role: 'Co-Founder',
    bio: 'Digital product and e-commerce. Sixteen years building and running digital services at Volkswagen Møller Bilfinans, Telenor and Nortura, with executive education in artificial intelligence at MIT.',
    short: 'Sixteen years building digital services at Volkswagen Møller Bilfinans, Telenor and Nortura.',
    photo: '/team/david.jpg',
  },
  {
    name: 'Kris Willassen',
    role: 'Co-Founder',
    bio: 'Cruise port operations. A decade of itinerary planning, deployment and nautical planning at SeaDream Yacht Club and Hurtigruten Expeditions, including expedition compliance and permitting, most recently as Vice President of Deployment and Port Operations.',
    short: 'A decade of itinerary planning and nautical operations at SeaDream Yacht Club and Hurtigruten Expeditions.',
    photo: '/team/kris.jpg',
  },
]

export const advisors: Member[] = [
  {
    name: 'Dann Handberg Madsen',
    role: 'Advisor and Investor',
    affiliation: 'CEO and owner, Pallefabrik',
    short: 'CEO and owner of Pallefabrik, a logistics business he grew himself.',
    href: 'https://www.pallefabrik.dk/kontakt-os',
    photo: '/team/dann.jpg',
  },
  {
    name: 'Leo Hansen',
    role: 'Advisor',
    affiliation: 'CFO, Pallefabrik',
    short: 'CFO of Pallefabrik.',
    href: 'https://www.pallefabrik.dk/kontakt-os',
    photo: '/team/leo.jpg',
  },
]

export const everyone: Member[] = [...founders, ...advisors]
