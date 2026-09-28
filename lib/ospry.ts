/**
 * Ospry visitor identification tag (Legion Code Inc., https://www.ospry.ai). Entry doc: docs/OSPRY.md.
 *
 * ONE CONSTANT, ONE PLACE. The root layout renders it in <head> on every page, and
 * scripts/check-ospry.mjs asserts that against the built HTML. Changing the account id is a
 * one-line edit here; the privacy page reads the vendor facts below, never its own copy of them.
 *
 * The `/c/` path is the tag Ospry's onboarding issued for this account. Its CSP list names the
 * vendor's consent platform (cdn.lgncmp.com, scripts AND styles), which is why the working reading
 * is that `/c/` ships the consent banner that gates identification. Measured 28.09.2026: the URL
 * answers 404 "Not found" to curl and to a real browser, so its behaviour is not yet verified.
 */
export const OSPRY_ACCOUNT_ID = '8aa13ecc-57d0-43d5-94ee-8b0bd224ffa8'
export const OSPRY_TAG_SRC = `https://px.lspxl.com/c/${OSPRY_ACCOUNT_ID}`

/** Published by the vendor at https://www.ospry.ai/legal, read 28.09.2026. */
export const OSPRY_LEGAL_URL = 'https://www.ospry.ai/legal'
