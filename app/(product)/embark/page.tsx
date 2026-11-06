/**
 * /embark: product page for tour operators.
 *
 * Clone method (David, 05.11.2026 kl. 11.42, plan PORTLINK_PRODUCT_LANDING_PAGES_2026-11-05):
 * butter.video's homepage structure, with Embark's content from landing PR #26 (b25b2b2, archived
 * as refs/archive/product-family-b25b2b2). The markup (components/clone/butter/embark-body.ts) and
 * the stylesheet (public/product-pages/embark.css, scoped under `.bt`) carry our own class names and
 * our open faces (Inter Tight and Red Hat Mono, app/_fonts/). Two scripts: the walkthrough and film
 * scrubbing (products.js) and the three.js keyring (keyring.js, three.js MIT). No reference file
 * ships: the provenance guard refuses one in every build. Entry doc: docs/PRODUCT-PAGES.md.
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
      <link rel="stylesheet" href="/product-pages/embark.css" precedence="product-page" />
      <main id="main" tabIndex={-1} className="bt" data-product="embark" dangerouslySetInnerHTML={{ __html: EMBARK_BODY }} />
      <EmbarkFilm />
      <Script src="/product-pages/embark/products.js" strategy="afterInteractive" />
      {/* lazyOnload: the keyring PNG is the LCP and stands in until three.js is ready; loading three.js
          at idle keeps it off the critical path. */}
      <Script src="/product-pages/embark/keyring.js" type="module" strategy="lazyOnload" />
    </>
  )
}
