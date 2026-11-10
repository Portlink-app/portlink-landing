# Product Pages (`/portlink`, `/embark`)

Two product landing pages for the Portlink family (`portlink-landing`, Phase 5 perfection rebuild, 09.11.2026):
- **`/portlink`** (`app/(product)/portlink/page.tsx`): Portlink Maritime Operations for cruise lines, port agents, shorex DMCs, and vessels.
- **`/embark`** (`app/(product)/embark/page.tsx`): Embark by Portlink for shore-excursion and tour operators.

Governing plan: `/Users/nyx/.buzz/PLANS/PORTLINK_PRODUCT_LANDING_PERFECTION_PLAN_2026-11-09.md` (`Execution-ID: portlink-landing-perfection-2026-11-09`).
Stage & color specification: `/Users/nyx/.buzz/RESEARCH/PORTLINK_PRODUCT_LANDING_REFS_2026-11-05/phase5-assets-d14/SPEC.md`.

---

## Where Things Live

| Path | Role |
|---|---|
| `app/(product)/layout.tsx` | Loads the D14 display (`Schibsted Grotesk`) and text (`Manrope`) faces from `app/_fonts/` via `next/font/local` (`display: 'optional'`) and imports `./product.css`. |
| `app/(product)/product.css` | Scoped `.pp` stylesheet implementing the 6-Chapter Architecture, 3-Layer Stage Depth (`Front, Middle, Back` with real maritime Back Layer photography and `140px` Chapter 1 bottom seam overhang), 60-30-10 color tokens (`--pl-*`, `--em-*` with `#BE4412` + `#FFFFFF` `5,35:1` AA primary action), upright mobile frames, and reduced-motion / `html[data-motion="off"]` freeze rules. |
| `app/(product)/portlink/page.tsx` | 6-chapter `/portlink` page (`#overview`, `#live-record`, `#voyage-ais`, `#gangway-signoff`, `#pda-fda`, `#demo`). |
| `app/(product)/embark/page.tsx` | 6-chapter `/embark` page (`#hero`, `#quay-checkin`, `#dispatch`, `#paid-before`, `#cruise-bridge`, `#demo`). |
| `components/product/ProductHeader.tsx` | Shared single-line 72px top header bar with `Portlink` / `Embark` product switcher, chapter anchor links, persistent `Motion: On / Off` toggle (`aria-pressed`), and primary `Book a 20-minute demo` CTA (`data-cta`). |
| `components/product/PortlinkLiveWorkspaceSample.tsx` | Phase B.1 interactive Free Sample for `/portlink`: `<PortlinkLiveWorkspaceSample />` (4 seats: `Cruise Line Ops`, `Port Agent`, `Shorex DMC`, `Ship Master` x 4 call timeline stages, enforcing `SECTION_VIS` role gating) and `<PortlinkPdaFdaDiffSample />` (interactive PDA `412 380,00 kr` → signed gangway consumption `-11 130,00 kr` → FDA `401 250,00 kr` ledger). |
| `components/product/EmbarkQuayCheckInSample.tsx` | Phase B.2 interactive Free Sample for `/embark`: `<EmbarkQuayCheckInSample />` (live quay check-in `6 of 12` → `12 of 12` aboard, boat capacity swap `RIB Havørn (12 seats)` ⇄ `MS Fjordsyn (24 seats)`, guide assignment, and incoming Portlink DMC allocation) and `<EmbarkCruiseTradeBridge />` (two-sided Portlink DMC request ⇄ Embark operator confirmation). |
| `components/product/d14Assets.ts` | Canonical Phase 5 2x Retina D14 asset bindings (`/product-pages/d14/*.png` and 60fps MP4 clips `portlink-voyage-ais-d14.mp4`, `embark-dispatch-d14.mp4`). |
| `components/film/useFilm.ts` | Reduced-motion and viewport hooks (`useMotionAllowed`, `setManualMotion`) honouring both `prefers-reduced-motion: reduce` and the manual `Motion: On / Off` header toggle. |
| `components/product/config.ts` | `PRODUCT_PAGES_NOINDEX`: keeps both routes `noindex,nofollow` and out of `app/sitemap.ts` until Phase D final sign-off. |

---

## Architectural & Design Decisions (Chose / Over / Because / Revisit-if)

- **Chose:** A purpose-built **6-Chapter, 3-Layer Stage (`Front, Middle, Back`)** architecture in native React JSX with unique 2x Retina D14 captures (`2880x1800`, natural 16:10 aspect), upright mobile 2x captures (`780x1688`), 2 60fps H.264 clips, real maritime Back Layer photography (`fjord-cruise-1600.webp` with neutral atmospheric scrims keeping text contrast `>= 12:1` AAA), and full-width interactive React Free Sample components (`<PortlinkLiveWorkspaceSample />`, `<PortlinkPdaFdaDiffSample />`, `<EmbarkQuayCheckInSample />`, `<EmbarkCruiseTradeBridge />`).
- **Over:** Retaining Waabi's 9-section photo-cropped layout, Butter's 11-section layout (`keyring.js` + Three.js 750 KB 3D spinning ring, duplicate carousels), right-edge-clipped `1600x1200` macro side-cards, or static full-window screenshots duplicated underneath interactive samples.
- **Because:** Waabi and Butter containers sliced 16:10 B2B data tables with `object-fit: cover`, while side-by-side macro crops clipped right-hand table labels and duplicated the main stage. Rendering one full, unclipped 16:10 stage or interactive workspace per chapter lets every operational figure read cleanly without squinting and cuts over 750 KB of unused Three.js script weight.
- **Revisit-if:** Post-launch conversion telemetry after the `15.11.2026` Conversion Batch 1 window shows any chapter drop-off exceeding 35%.

- **Chose:** `--em-action-primary: #BE4412` with explicit `.pp a.pp-cta-btn, .pp .pp-cta-btn { color: #FFFFFF; }` (`5,35:1` WCAG AA) and `lining-nums proportional-nums` on `Schibsted Grotesk` display amounts.
- **Over:** `#C84B15` (`4,49:1` against `#F8FAFC`) with bare `.pp-cta-btn` specificity (`0,1,0`, overridden by `.pp a` `0,1,1`) and `tabular-nums` on `Schibsted Grotesk` display amounts.
- **Because:** `.pp a { color: inherit; }` inherited `#14181D` on light chapters (`3,80:1` fail), and `Schibsted Grotesk`'s `tnum` table widens the comma glyph into `"412 380 , 00 kr"`.
- **Revisit-if:** Never; WCAG AA `>= 4,5:1` contrast and Norwegian `412 380,00 kr` typography are permanent gates.

- **Chose:** Extending `useMotionAllowed()` in `components/film/useFilm.ts` with `setManualMotion()` and `html[data-motion="off"]`.
- **Over:** A page-local state prop threaded only to a subset of components.
- **Because:** Putting the manual motion override inside `useMotionAllowed()` means every `<Film />` video component and every CSS transition across the site obeys both OS-level `prefers-reduced-motion: reduce` and the visitor's one-click `Motion: On / Off` header toggle by construction (`scripts/check-film-motion.mjs` stays green).
- **Revisit-if:** Never; first-class reduced-motion and manual pause are permanent accessibility requirements.
