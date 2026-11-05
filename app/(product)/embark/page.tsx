/**
 * /embark: product page for tour operators.
 *
 * Clone method (David, 05.11.2026 kl. 11.42, plan PORTLINK_PRODUCT_LANDING_PAGES_2026-11-05):
 * butter.video's homepage, literally. Landing PR #26 had already rebuilt it with Embark's content
 * (b25b2b2, archived as refs/archive/product-family-b25b2b2), so this route serves that markup
 * (scripts/clone/port-embark-26.mjs) with Butter's stylesheet scoped under `.bt`
 * (scripts/clone/scope-css.mjs) and its two scripts: the walkthrough and film scrubbing
 * (products.js) and the three.js keyring (keyring.js, three.js MIT). Butter's faces and CSS are
 * preview-only: the provenance guard refuses them in a production build. Entry doc:
 * docs/PRODUCT-PAGES.md.
 */
import type { Metadata } from 'next'
import Script from 'next/script'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import { EMBARK_BODY } from '@/components/clone/butter/embark-body'
import EmbarkFilm from './EmbarkFilm'

export const metadata: Metadata = {
  title: 'Embark: run the departure',
  description:
    'Embark is the Portlink product for tour operators: bookings, departures with seats and guides, payment before the day, and requests from cruise DMCs.',
  alternates: { canonical: '/embark/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function EmbarkPage() {
  return (
    <>
      <link rel="stylesheet" href="/clone/butter/butter.css" precedence="clone" />
      <link rel="stylesheet" href="/clone/butter/overrides.css" precedence="clone-x" />
      <main id="main" tabIndex={-1} className="bt" data-product="embark" dangerouslySetInnerHTML={{ __html: EMBARK_BODY }} />
      <EmbarkFilm />
      <Script src="/clone/butter/assets/products.js" strategy="afterInteractive" />
      {/* lazyOnload: the keyring PNG is the LCP and stands in until three.js is ready; loading three.js
          at idle keeps it off the critical path. */}
      <Script src="/clone/butter/assets/keyring.js" type="module" strategy="lazyOnload" />
    </>
  )
}
