/**
 * Shared settings for the product pages /portlink and /embark.
 *
 * Chose: noindex (follow) and absent from the sitemap until Starboard's phase 4 acceptance.
 * Over: indexing on first publish. Because: the pages carry sample data and are being judged
 * against the storyboard; a crawler should meet the accepted version. Revisit-if: phase 4 accepts
 * them; then set index: true here and add both routes to app/sitemap.ts in the same commit.
 */
export const PRODUCT_PAGE_ROBOTS = { index: false, follow: true } as const

/** The site's one primary action, worded and routed as everywhere else (Nav.tsx, conversion Batch 1). */
export const DEMO_HREF = '/#access'
export const DEMO_LABEL = 'Book a 20-minute demo'
