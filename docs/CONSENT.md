# Consent on portlink.app (and the retired Ospry integration)

Entry doc for the consent banner. **Ospry was retired on 29.09.2026** and replaced by our own visitor
intelligence (`docs/VISITOR-INTELLIGENCE.md`); its consent row `insight` became `remember`
("Remember me", our own `pl_vid` cookie), CONSENT_VERSION 4. The Ospry sections below are kept as the
record of why no optional tag may ever be in server HTML (`scripts/check-consent-gate.mjs`). Leftover
`lgn_*` cookies are cleared on every visit by `loadAllowed()`.

## How it works now

- **Nothing of Ospry's is in any page until the visitor switches on "Company insight" (or Accept all).** `lib/consent.ts` is the only
  code that inserts the tag. `scripts/check-consent-gate.mjs --built` (postbuild) fails the build if the tag
  or any Ospry host reaches rendered HTML.
- **The banner** (`components/consent/ConsentManager.tsx`, mounted in `app/layout.tsx`) asks once the
  visitor has engaged: scrolled past 60 % of the first screen, opened a second page, or stayed 12 s.
- **Layered (since 28.09.2026; CONSENT_VERSION 3 since Google Analytics was added).** First layer: one
  general sentence ("We'd like to use optional cookies to see how the site is used and which companies
  visit, so we can improve it and follow up with the right teams. Nothing optional runs until you
  choose."), **Accept all**
  and **Reject all** as identical buttons, and **Settings**. Settings shows one row per category with a
  switch (`ConsentPreferences.tsx`, the same component `/privacy/#choices` renders), plus the Necessary
  row that is always on. Categories live in `CATEGORIES` in `lib/consent.ts`, each with its own load and
  clear; **adding a future cookie = one row there**, and a stored choice missing a registered category
  counts as no choice, so a new category is always asked. Cookie: `pl_consent=v<CONSENT_VERSION>.<ms>.<id>-<0|1>_…`,
  365 days if anything is allowed, 180 if everything is refused.
  Bump `CONSENT_VERSION` whenever the banner wording or the tag's behaviour changes; older choices are
  then asked again.
- **Withdrawal:** footer "Cookie settings" (opens straight on the switches) on every page, and
  `/privacy/#choices`. Switching a category off after it loaded calls `SightConsent.revoke()`, deletes every `lgn_*` cookie, localStorage and sessionStorage
  key, and reloads the page without the tag.
- **Global Privacy Control** = a standing no: never asked, nothing loads.
- **Not on `/seatrade/*`.** The draw is archived (David, 28.09.2026); the landing page is the scope.

## Google Analytics (category `analytics`, added 28.09.2026)

- GA account **Portlink AS** under David's Google login (davidbakke85@gmail.com, which he uses for all
  projects), property **portlink.app** (Norway, NOK, Norway time), web stream https://portlink.app,
  stream id 15861671503, measurement id **`G-41922W5K8H`** (in `lib/analytics.ts`). Created with all
  four account data-sharing settings OFF; GA Terms (Norway) and the GDPR Data Processing Terms accepted
  with David's approval. Enhanced measurement on (page views incl. history changes, scrolls, outbound
  clicks, site search, video, file downloads, form interactions; no field values).
- Consent Mode **basic**: gtag.js is only inserted after Analytics is on, so no cookieless pings before
  consent. `ad_storage`, `ad_user_data`, `ad_personalization` denied; Google signals and ad
  personalisation off; `_ga` cookies capped at 13 months (`cookie_expires`).
- Switching Analytics off sets `ga-disable-G-41922W5K8H`, updates consent to denied, clears `_ga*`, reloads.
- Verified locally 28.09.2026: Analytics only loads gtag and sends `g/collect` with Ospry absent;
  Accept all adds Ospry; switching Analytics off reloads with no `_ga` cookie and no gtag.
- `check-consent-gate.mjs --built` refuses googletagmanager.com / google-analytics.com in server HTML too.

## What the tag does, read from its served source 28.09.2026

- `px.lspxl.com/c/<id>` is a 1,5 KB loader. For this account `wantLoader = false` (Ospry's own
  banner OFF) and `wantPixel = true`; it appends `px.lspxl.com/s/<id>` (47 KB, an RB2B-derived pixel).
- The pixel only runs on `ALLOWED = ["portlink.app"]`, so on localhost or a deploy preview it loads
  and does nothing. End-to-end identification can only be observed on portlink.app.
- It records page views (including client-side navigation via history/popstate), scroll depth,
  and **every field of any submitted form** (SSN and card numbers dropped). Popups and the
  security module are off. It stores `lgn_vid`, `lgn_consent`, `lgn_v`, `lgn_visitor_id`,
  `lgn_anonymous_id`, `lgn_pk`, `lgn_pop_*`; beacons to `i.lspxl.com`.
- ⛔ **Its consent fallback:** with no consent platform detected on the page it grants itself
  consent after 1,2 s (`maybeAutoUnlock`). This is why the tag must never load before our yes.

## The incident this design answers

28.09.2026 kl. 12.16 the tag shipped in `<head>` (eea07f0) on the reading that the vendor banner
gated it. The endpoint had answered 404 until then; the deploy activated it, the loader turned out
to have the banner off, and every visitor was identified without consent until the revert
(d804d49) was live kl. 12.27. Visitors in that window: data went to Ospry, which is an independent
controller for identification results.

## Decision

**Chose:** our own first-party consent banner; the tag is inserted only after Allow.
**Over:** (a) Ospry's CMP (`cdn.lgncmp.com`): off for this account today, US-state geo rules are its
stated design, and its loader would itself run before consent; (b) no banner, relying on legitimate
interest for company-level data: ekomloven §3-15 requires consent for the cookies and storage the
pixel writes, whatever the GDPR basis.
**Because:** it is the only form compliant by construction, and it keeps the design and the opt-in
levers in our hands.
**Revisit if:** Ospry's dashboard turns its own banner on (`npm run check:consent-gate` prints it). Then turn
it off again, or visitors get asked twice.

## Consent design: what raises "Allow" lawfully

Research 28.09.2026 (EDPB Cookie Banner Taskforce 17.01.2023, EDPB 03/2022 deceptive design,
Datatilsynet guidance on informasjonskapsler, Nkom on ekomloven §3-15; Utz et al. CCS 2019;
Nouwens et al. CHI 2020; vendor benchmarks from Didomi, Usercentrics, Cookiebot).

| Rule | Why | Where |
|---|---|---|
| Reject all on the first layer, same size, colour and weight as Accept all | LAW (EDPB taskforce, Datatilsynet; CNIL fines) | one `.button` class for both |
| No cookie wall, page fully usable with the card open | LAW | non-modal card, no overlay |
| Withdraw as easily as consenting | LAW, GDPR art. 7(3) | footer + `/privacy/#choices` |
| First layer states the purpose and that a US partner does it; the vendor, what it records and US person-level identification are one click away in Settings (EDPB: layered information is allowed when the first layer carries the purpose) | LAW (informed), minimum text (David, 28.09.2026: "do what is required but not more") | banner lead + CATEGORIES descriptions |
| Ask after engagement, not on arrival | Lawful because nothing loads before consent; a visitor who has read the page trusts us more than one who has just landed, and reflexive dismissal (Cookiebot: 1,4 s decision time in 2025) is what an arrival banner gets | `ENGAGE_*` in ConsentManager |
| Honest value in the visitor's terms ("follow up only with teams who are really looking") | plain purpose framing, no false benefit | banner body |
| Non-blocking card, bottom-left | lower friction and bounce than a modal; Utz 2019 bottom-left interaction | `.banner` |
| One switch per purpose category, none pre-ticked | granularity (GDPR art. 4(11), EDPB 05/2020) and room for future cookies | `CATEGORIES` |
| Honour GPC | not mandated in the EEA; safer, and Ospry honours it too | `hasGpc()` |
| AVOID: pre-ticked, scroll-as-consent, asymmetric buttons, "we value your privacy" boilerplate, re-asking after Decline within 6 months | LAW / dark pattern | |

## Ospry dashboard (David's account, app.ospry.ai)

Compliance setup asks three confirmations. True as of this change: consent banner installed that
blocks the script until accept (ours); cookie-notice language at https://portlink.app/privacy/;
opt-out link https://portlink.app/privacy/#choices. Keep **"Configure CMP banner"** off (see Decision).

## Verify

- `npm run build` (runs the `--built` gate) and `npm run verify`.
- `npm run check:consent-gate`: endpoint state, vendor-banner flag, and no tag in live HTML.
- Browser, clean profile, on portlink.app: no `lspxl` request before a choice; Decline, nothing;
  Allow, `px.lspxl.com/c` and `/s` load and a beacon goes to `i.lspxl.com`; Cookie settings, Decline:
  page reloads, no `lgn_*` left.

## CSP

The site sends no Content-Security-Policy (see `netlify.toml`). If one is added, the tag needs
scripts `https://px.lspxl.com`, connect `https://i.lspxl.com https://popup.lspxl.com https://sec.lspxl.com https://t.lspxl.com`
(Ospry's list also names `cdn.lgncmp.com` and `lgncmp.com`, only needed if their banner is enabled).

## Files

`lib/ospry.ts` (id, URLs) · `lib/consent.ts` (state, loading, withdrawal) ·
`components/consent/*` (banner, privacy controls, footer button, styles) ·
`app/privacy/page.tsx` · `scripts/check-consent-gate.mjs`.
