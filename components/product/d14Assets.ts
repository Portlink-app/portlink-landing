/**
 * Canonical Phase 5 D14 2x Retina Asset Registry for /portlink and /embark.
 * Active stills are encoded as 2x Retina WebP (cwebp -q 90 -sharp_yuv) from Tiller's master captures
 * in RESEARCH/PORTLINK_PRODUCT_LANDING_REFS_2026-11-05/phase5-assets-d14/.
 *
 * Film paths omit the .mp4 extension so Next.js server HTML does not serialize literal .mp4 strings
 * (enforced by scripts/check-film-motion.mjs).
 */

export const D14_BASE = '/product-pages/d14'

export const PORTLINK_D14_ASSETS = {
  ch1Hero: {
    desktop: `${D14_BASE}/portlink-ch1-hero-readiness-2880x1800.webp`,
    width: 2880,
    height: 1800,
    alt: 'Portlink D14 Port-Call Readiness workspace for MS Aster Brisa at Bergen Skolten North Berth 3 on 06.08.2026',
  },
  ch3VoyageAis: {
    desktop: `${D14_BASE}/portlink-ch3-voyage-ais-2880x1800.webp`,
    filmBase: `${D14_BASE}/portlink-voyage-ais-d14`,
    width: 2880,
    height: 1800,
    alt: 'Portlink Voyage and Nautical Chart workspace with Kystverket Hovedled fairways, follow-water autorouting, and SHIP AT position scrubber from Bergen to Florø, Ålesund, and Molde (257,0 NM)',
  },
  ch4GangwaySignoff: {
    mobile: `${D14_BASE}/portlink-ch4-gangway-signoff-mobile-780x1688.webp`,
    mobileWidth: 780,
    mobileHeight: 1688,
    alt: 'Portlink on-board gangway departure report with dual signatures from Port Agent and Ship Master',
  },
  ch6Deployment: {
    desktop: `${D14_BASE}/portlink-ch6-season-deployment-2880x1800.webp`,
    width: 2880,
    height: 1800,
    alt: 'Portlink 2026/2027 season deployment and multi-vessel port-call readiness matrix',
  },
} as const

export const EMBARK_D14_ASSETS = {
  ch1Hero: {
    desktop: `${D14_BASE}/embark-ch1-hero-departures-2880x1800.webp`,
    width: 2880,
    height: 1800,
    alt: 'Embark D14 daily departures board for Fjordland Adventures AS showing RIB Havørn and MS Fjordsyn capacity',
  },
  ch3DispatchRoster: {
    desktop: `${D14_BASE}/embark-ch3-dispatch-roster-2880x1800.webp`,
    filmBase: `${D14_BASE}/embark-dispatch-d14`,
    width: 2880,
    height: 1800,
    alt: 'Embark departures, fleet, and guide roster stage with boat capacity lock and NO, EN, DE language tags',
  },
  ch4WidgetInvoicing: {
    desktop: `${D14_BASE}/embark-ch4-widget-invoicing-2880x1800.webp`,
    width: 2880,
    height: 1800,
    alt: 'Embark embeddable direct booking widget (/w/fjordland) alongside automated Vipps and invoice settlement',
  },
  ch6OperatorOverview: {
    desktop: `${D14_BASE}/embark-ch6-operator-overview-2880x1800.webp`,
    width: 2880,
    height: 1800,
    alt: 'Embark operator season overview and active tour catalog across direct web and Portlink DMC channels',
  },
} as const
