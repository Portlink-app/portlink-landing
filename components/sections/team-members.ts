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
 * no CEO, no chair, nothing that ranks one above the other (David, 15.09.2026). The advisors are
 * presented through Handberg Holding, not Pallefabrik (Kris, 11.10.2026); no link until the holding
 * company has a page of its own to point at. Their biographies match the founders' in shape and
 * length (Kris, 11.10.2026): Dann's from his registered roles (proff.dk, ownr.dk) and TV Midtvest's
 * 2022 portrait of him, Leo's from his LinkedIn. Leo's "three decades" is counted from his CV, which starts at Gerber Technology in 1994.
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
    role: 'Co-Owner & Advisor',
    affiliation: 'CEO and owner, Handberg Holding',
    bio: 'Industry and ownership. From the graphic industry to timber and forestry. Today he owns Handberg Holding and a group of companies, among them je.dk, SkovPro and Feldborg Savværk.',
    short: 'Owner of Handberg Holding, with companies from je.dk to SkovPro and Feldborg Savværk.',
    photo: '/team/dann.jpg',
  },
  {
    name: 'Leo Hansen',
    role: 'Advisor',
    affiliation: 'CFO, Handberg Holding',
    bio: 'Finance and leadership. Three decades in finance, as CFO of Handberg Holding, Aurion and Nupark Innovation, CEO of Solid Production and the Nupark Accelerace investment fund, and ERP lead at Vestas.',
    short: 'Three decades in finance, as CFO of Handberg Holding, Aurion and Nupark Innovation.',
    photo: '/team/leo.jpg',
  },
]

export const everyone: Member[] = [...founders, ...advisors]
