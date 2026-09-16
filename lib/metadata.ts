import type { Metadata } from 'next'
import { siteUrl } from './site'

/**
 * The parts of the share card every page shares, in one place.
 *
 * ⛔ NEXT REPLACES `openGraph` AND `twitter`, IT DOES NOT MERGE THEM. A page that declares
 * `openGraph: { title }` does not inherit the root's `images`; it loses them. Measured
 * 16.09.2026 on /team: declaring only title, description and url dropped og:image and
 * og:site_name entirely and silently downgraded twitter:card from summary_large_image to
 * summary, which is a different, smaller card. That is worse than the bare inheritance it was
 * meant to improve, and nothing in the build warns about it.
 *
 * So a page spreads these and overrides only what is genuinely its own:
 *
 *   openGraph: { ...ogDefaults, title, description, url: '/team/' }
 *   twitter:   { ...twitterDefaults, title, description }
 */

/* Dated file, served immutable for a year: a re-cut lands at a new path rather than fighting a
   cached entry on a name that never changes. Rebuild with scripts/build-og-card.sh, never by hand. */
export const ogImage = '/og/portlink-2026-09-16.png'

export const siteTitle = 'Portlink · The Port Call Platform'
export const siteDescription =
  'One platform for cruise lines, port agents, and tour operators to coordinate port calls in real time.'

export const ogDefaults = {
  type: 'website',
  siteName: 'Portlink',
  locale: 'en_GB',
  images: [
    {
      url: ogImage,
      width: 1200,
      height: 630,
      alt: 'Portlink: every port call on one live record, shown on the passage-plan chart.',
    },
  ],
} satisfies Metadata['openGraph']

export const twitterDefaults = {
  card: 'summary_large_image',
  images: [ogImage],
} satisfies Metadata['twitter']

export { siteUrl }
