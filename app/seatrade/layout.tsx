import type { Metadata } from 'next'
import { PRIZE_NAME } from '@/lib/seatrade/config'
import { siteUrl } from '@/lib/site'

/**
 * The share card for the funnel, which is the funnel's real front door.
 *
 * The draw travels by referral, and the referral people actually send is a link. On LinkedIn,
 * David's own channel, ShareBox hands the share dialog a URL and no text at all, so the card IS the
 * message: whatever it leaves out is left out of the whole invitation. It therefore names the prize
 * in the description, in the Open Graph title, and in the image itself.
 *
 * ⛔ THE IMAGE URL IS RESOLVED, THE PAGE URL IS NOT, AND THAT ASYMMETRY IS DELIBERATE.
 * og:url is this content's canonical identity and is always the production page. og:image is a
 * fetch instruction, and a preview that advertises a production image advertises one that does not
 * exist there yet: the card cannot be checked in a debugger before it is merged, which is the exact
 * failure lib/site.ts was written to prevent. Previews are served noindex by Netlify, so a
 * preview-host image is visible to nobody but whoever is verifying it.
 *
 * The card is generated, never hand-drawn: scripts/og/seatrade-card.html plus
 * scripts/build-og-card.sh, which injects PRIZE_NAME and refuses to write a card that lost the
 * brand face or the artwork. The filename carries its date because /og/* is served immutable for a
 * year, so a re-cut is a new path rather than an edit fighting a cached entry.
 */

const title = 'Port Call Friction Score · Seatrade Cruise Med 2026'

/** What a share shows. Different from the document title on purpose: this one has one job. */
const shareTitle = `Your port call friction score, and the draw for ${PRIZE_NAME}`

const description =
  `Seven taps, about a minute, and you are in the draw for ${PRIZE_NAME}. See how much of your port call still runs on email, and how you compare with the rest of Seatrade Cruise Med in Las Palmas.`

const card = `${siteUrl}/og/seatrade-2026-09-16.png`
const cardAlt = `What is your port call friction score? Seven taps, and you are in the draw for ${PRIZE_NAME} at Seatrade Cruise Med 2026.`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: 'https://portlink.app/seatrade/' },
  openGraph: {
    title: shareTitle,
    description,
    url: 'https://portlink.app/seatrade/',
    siteName: 'Portlink',
    type: 'website',
    images: [{ url: card, width: 1200, height: 630, alt: cardAlt }],
  },
  twitter: {
    card: 'summary_large_image',
    title: shareTitle,
    description,
    images: [card],
  },
}

export default function SeatradeLayout({ children }: { children: React.ReactNode }) {
  return children
}
