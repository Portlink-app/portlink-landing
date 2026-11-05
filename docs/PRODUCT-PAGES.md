# Product pages: /portlink and /embark

Entry doc for the two product landing pages (phase 3 of the product landing plan, 05.11.2026).
Direction, storyboard and feature inventory: Tiller (Design), `RESEARCH/PORTLINK_PRODUCT_LANDING_REFS_2026-11-05/`
in the Buzz workspace. Plan: `PLANS/PORTLINK_PRODUCT_LANDING_PAGES_2026-11-05.md` there.

## Map

| Path | What |
|---|---|
| `app/(product)/layout.tsx` | Loads the D14 faces (next/font/local) and `product.css` for these two routes only |
| `app/(product)/product.css` | All styles, scoped under `.pp`. The first block is the one swap point for D14 tokens |
| `app/(product)/portlink/page.tsx` | Portlink: one port call's day, 48 h to 21.00, ground day, dusk, night |
| `app/(product)/embark/page.tsx` | Embark: the guide's phone on a fjord photo, departures, payment, DMC requests |
| `components/product/RoleLens.tsx` | Live thing on /portlink: pick a seat, the record re-renders by the platform's `SECTION_VIS` |
| `components/product/CheckIn.tsx` | Live thing on /embark: tap a booking, the aboard count follows |
| `components/product/ProductMotion.tsx` | Entrances per section part (75 ms stagger, 700 ms ease-out), meters fill; skipped under reduced motion |
| `components/product/config.ts` | Robots setting and the one demo action (`/#access`, "Book a 20-minute demo") |
| `app/_fonts/schibsted-grotesk-latin.woff2`, `manrope-latin.woff2` | Byte copies from `@portlink/tokens` 1.3.0 with their OFL licences |
| `public/product/*.webp` | Embark's own demo tour photos (Unsplash licence, `CREDITS.md`), 800 and 1600 wide |

## Rules that hold here

- No third-party asset. `npm run check:provenance` runs in `verify` and `prebuild`; the two D14 families are in its
  `FAMILIES` list.
- Every demo action carries `data-cta` (`demo-portlink-*`, `demo-embark-*`), so the visitor-intelligence funnel counts it.
- Pages are `noindex, follow` and absent from `app/sitemap.ts` until phase 4 acceptance (`config.ts` says how to flip).
- The first screen is never animated: the largest paint must not wait for an entrance.
- Running text is full ink: `.pp p { color: inherit }` undoes the vendored DS's grey `p`.

## Decisions

- Chose `font-display: optional` with preload. Over: `swap`. Because: with `swap` the h1 repainted when the face
  arrived and Lighthouse mobile measured LCP 5,0 s on /portlink. Revisit-if: D14 Gate A vendors the tokens package.
- Chose product fragments in HTML built from the product's own strings and D14 values, with the two live things as
  real controls. Over: raster captures from a seeded local platform, which the phase 3 spec asks for. Because: the
  local Supabase stack on this Mac was at migration 0483 against main's 0543 on 05.11.2026, and bringing a shared
  local database forward is its own job. Revisit-if: a seeded local platform at main is available; then add one
  muted screen recording per page and crop real stills to the fragments shown.
- Night close: the action sits under the heading on its column (Starboard acceptance fix, 05.11.2026).
- Money chapter: the heading says what the card shows. PDA 412 380 kr, FDA 401 250 kr, difference −11 130 kr,
  stated in the copy and in the card.

## Verified (05.11.2026, Keel)

Measured on `next build && next start`: lint-defaults clean, taste lint 0 FAIL; taste inspect 1 FAIL per page, which
is the site's cookie banner (with consent stored, no heading is covered), plus defended WARNs (the banner's Plus
Jakarta face, the product card's inner padding, sample data instead of footage). Embark hero text measured against
the photo pixels: worst pixel 4,87:1 for body on desktop, 4,90:1 on a 390 px phone. Keyboard: both live things
reachable by Tab and operated by Enter or Space with a visible focus ring. Reduced motion: no start state, nothing
animates. Lighthouse mobile: see the PR.

## Still unmapped

Real usage of each feature (the inventory ranks by code maturity); real captures (above); the dusk ground with real
captures; Embark's own brand mark beyond the wordmark.
