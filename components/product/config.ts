/**
 * Shared settings for the product pages /portlink and /embark.
 *
 * Chose: index: true, follow: true alongside /portlink/ and /embark/ in app/sitemap.ts.
 * Over: keeping noindex after Phase 5 Gate C / Phase D acceptance. Because: provenance,
 * D14 fictional showcase data, WCAG AA contrast, and mobile performance gates are verified,
 * so crawlers meet the accepted production pages (Netlify still sends X-Robots-Tag: noindex
 * on deploy previews automatically). Revisit-if: either route is retired or gated behind auth.
 */
export const PRODUCT_PAGE_ROBOTS = { index: true, follow: true } as const

/** The site's one primary action, worded and routed as everywhere else (Nav.tsx, conversion Batch 1). */
export const DEMO_HREF = '/#access'
export const DEMO_LABEL = 'Book a 20-minute demo'
