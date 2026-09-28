/**
 * Ospry visitor identification tag (Legion Code Inc., https://www.ospry.ai). Entry doc: docs/OSPRY.md.
 *
 * ONE CONSTANT, ONE PLACE, ONE LOADER. Only lib/consent.ts inserts this tag, and only after the
 * visitor clicks Allow; scripts/check-ospry.mjs fails the build if it ever reaches server HTML.
 * The `/c/` loader decides per account whether Ospry's own banner runs (off for this account,
 * measured 28.09.2026) and then appends the pixel at `/s/<id>`.
 */
export const OSPRY_ACCOUNT_ID = '8aa13ecc-57d0-43d5-94ee-8b0bd224ffa8'
export const OSPRY_TAG_SRC = `https://px.lspxl.com/c/${OSPRY_ACCOUNT_ID}`

/** Published by the vendor at https://www.ospry.ai/legal, read 28.09.2026. */
export const OSPRY_LEGAL_URL = 'https://www.ospry.ai/legal'
