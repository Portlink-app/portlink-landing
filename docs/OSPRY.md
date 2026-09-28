# Ospry visitor identification on portlink.app

Entry doc for the Ospry tag. Added 28.09.2026 at David's request.

## State, measured 28.09.2026

| What | State | How it was measured |
|---|---|---|
| Tag in `<head>`, once, async, every prerendered page | **yes**, 10 of 10 pages | `node scripts/check-ospry.mjs --built` (runs in `postbuild`) |
| Tag loads once per visit, not again on client navigation | **yes** | local browser: `/privacy/` → `/seatrade/terms/` soft nav, 1 tag, 1 request |
| Tag endpoint `https://px.lspxl.com/c/8aa13ecc-57d0-43d5-94ee-8b0bd224ffa8` | **404 "Not found"** | curl with and without a portlink.app Referer and browser fetch headers, and a real browser tab |
| Ospry consent banner, European visitor | **not verified** | cannot be measured while the endpoint answers 404 |

**So the tag ships inert.** It requests the script, gets a 404, and nothing runs. Likely cause: the
Ospry account is not active for this domain yet ("verify your domain" is a step in Ospry's
onboarding). It flips on without any change here once Ospry serves the script.
`npm run check:ospry` prints `INERT` or `ACTIVE` for the live endpoint and checks the tag on portlink.app.

## What Ospry says about itself (https://www.ospry.ai/legal, read 28.09.2026)

- Legion Code Inc., US. Identifies business visitors: company-level worldwide, **person-level only
  for visitors located in the United States**.
- Customers must install a consent banner that **blocks the tag until the visitor accepts**, publish
  privacy and cookie language that describes the tag, and link to the opt-out.
- Ospry ships its own consent platform (free). The CSP list issued with this tag names
  `cdn.lgncmp.com` for scripts and styles, which is why the working reading is that the `/c/` tag
  carries that banner. Their homepage example uses a different path (`/s/<id>`).
- For identification results Ospry and its data providers are **independent controllers**, not our
  processor. The DPA covers only data we upload to them.
- Opt-out and deletion for anyone, Global Privacy Control honoured.
- The full policy pages (privacy, cookie, terms, DPA, EULA) rendered **empty** on 28.09.2026; only the
  `/legal` summary has text. The sub-processor page is a 404.

## Decision

**Chose:** the vendor's tag as issued, first in the root layout's `<head>`, relying on Ospry's own
consent banner as the gate, plus a privacy section attributing the behaviour to Ospry.
**Over:** (a) our own consent banner that loads the tag only after "accept": compliant by construction,
but if `/c/` carries Ospry's banner the visitor is asked twice, and Ospry needs its own consent record
to identify anyone; (b) holding the tag back until the endpoint serves: Ospry's onboarding likely
checks for the tag on the domain, so holding it back may be what keeps it at 404.
**Because:** it is what David asked for, it is inert today, and the one open risk (the banner's
behaviour for EEA visitors) can only be measured once the script is served.
**Revisit if:** at activation the banner does not appear before any identification request for a
Norwegian or EU visitor. Then switch to (a): gate the tag behind a first-party consent check in
`app/layout.tsx`, which is where the tag lives and the only place it is rendered.

## At activation (`npm run check:ospry` prints ACTIVE)

1. Open portlink.app from a Norwegian IP in a clean browser profile. The banner must appear, and
   no request to `i.lspxl.com`, `t.lspxl.com` or `sec.lspxl.com` may leave before "Allow".
2. Refuse, reload, confirm nothing fires. Accept, confirm the events fire, and that a client-side
   navigation (footer or nav link) is recorded as a page view.
3. If Ospry's banner exposes a "reopen preferences" call, add a Cookie preferences link to
   `components/sections/Footer.tsx`, and name the cookies on `/privacy/` from what the browser shows.

## CSP

The site sends no Content-Security-Policy (see `netlify.toml`). If one is added, the tag needs:
scripts `https://px.lspxl.com https://cdn.lgncmp.com`, styles `https://cdn.lgncmp.com`, connect
`https://lgncmp.com https://i.lspxl.com https://popup.lspxl.com https://sec.lspxl.com https://t.lspxl.com`.

## Files

- `lib/ospry.ts`: account id and tag URL, the one place they live.
- `app/layout.tsx`: renders the tag in `<head>`.
- `app/privacy/page.tsx`: "Recognising business visitors".
- `scripts/check-ospry.mjs`: `--built` (postbuild gate) and `--live`.
