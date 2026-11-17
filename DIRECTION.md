# Portlink and Embark Websites: Studio Website Direction (`editorial-report`, seed `50822704`)

**Repositories:** `/Users/nyx/Projects/portlink/portlink-landing` (`https://portlink.app/`, `https://portlink.app/portlink/`, `https://portlink.app/embark/`) and `/Users/nyx/Projects/portlink/embark/web`  
**Dealt Direction:** `editorial-report` (*The printed annual*, seed `50822704`, `--keep palette,type`)  
**Governing Contract:** Portlink Rule #39, PRINCIPLES #25/#26, and `/Users/nyx/.buzz/PLANS/PORTLINK_STUDIO_WEBSITE_REDESIGN_PLAN_2026-11-17.md`

---

## Positioning & Idea

### Competitor Test Sentences
- **Company Root (`https://portlink.app/`):** *"On this page, **one real Norwegian voyage from 2028 draft itinerary to signed gangway departure and pier check-in** becomes **an interactive 4-role operational sheet where the visitor switches between Cruise Line, Port Agent, Shorex DMC, and Tour Operator on the same call**."*
- **Portlink Platform (`https://portlink.app/portlink/`):** *"On this page, **the shared port-call record for MS Aster Brisa at Bergen Skolten 3 (06.08.2026)** becomes **a live 4-seat operational ledger and Kystverket fairway scrubber where every timestamp links directly to the 401 250,00 kr Final Disbursement Account**."*
- **Embark (`https://portlink.app/embark/`):** *"On this page, **Fjordland Adventures' kl. 10.00 RIB Havørn departure manifest at Zachariasbryggen** becomes **a live pier check-in and vessel-swap sheet that updates web widget seats and cruise DMC allocations in real time**."*

### Subject Inventory (What Belongs Only to Portlink & Embark)
1. **MS Aster Brisa (IMO 9842114) at Bergen Skolten North Berth 3 (06.08.2026):** Bollards 12 to 28, 245 m LOA, Fedje VTS pilot boarding kl. 07.15, 6 mooring lines fast kl. 07.52, gangway cleared kl. 08.05.
2. **4-Seat Role-Scoped `SECTION_VIS` Record:** Nordkyst Cruise Line (all 7 tabs), Vestkyst Maritime Agency (Finance & Services), Fjordhaven Shorex DMC (Programme, 284 pax), and Capt. Magnus Vik on the Bridge (Overview, Readiness, Tasks, Comms).
3. **Kystverket Hovedled Fairway Routing:** 257,0 NM passage across Bergen, Floro, Stadlandet, Alesund, and Molde with 120 fairway waypoints, 42,0 m minimum fairway depth, and 0 land crossings.
4. **Dual Gangway Cryptographic Sign-Off & PDA-to-FDA Reconciliation:** Approved Proforma `412 380,00 kr`, unused tug overtime credit `-11 130,00 kr` signed on board at kl. 17.28 (Agent) and kl. 17.31 (Master), and reconciled Final Disbursement Account `401 250,00 kr`.
5. **Fjordland Adventures AS Pier Manifest (`kl. 10.00 Icefjord & Fjord RIB Safari`):** Pontoon B2 at Zachariasbryggen, `RIB Havorn` (12 seats) vs `MS Fjordsyn` (24 seats) vessel quota lock, STCW guide Marte Lind (`NO / EN / DE`), `/w/fjordland` direct Vipps/Stripe checkout, and `api/trade/v1/requests` cruise DMC bridge.

---

## References

1. **`https://seasats.com/`** (Maritime autonomous vessels, inspected in `playwright-cli` at `1440x900` and `390x844`):
   - Asymmetric `85% / 15%` viewport architecture, oversized display type (`124px` / `0,90` line-height), and scroll-scrubbed vessel/telemetry stage where nautical figures (`NM`, `SOG/COG`, fairway depth) operate as real domain telemetry rather than decorative chrome.
2. **`https://cerebrium.ai/`** (Technical infrastructure, inspected in `playwright-cli` at `1440x900` and `390x844`):
   - `Lenis` + `GSAP ScrollTrigger` sheet-over-hero parallax curtain (`Pattern A`) and sticky chapter spine paired with live interactive proof stages (`Pattern B`) on flat tonal grounds.
3. **`https://attio.com/` & Refero Style `ee52d703` (`Arrakis: fieldwork meets cosmic machinery`, `https://arrakis.tech`) / `8a02d0fb` (`Ameba: operations in orbit`)**:
   - Deep midnight bookends (`#08131F`) framing a calm daylight stone middle (`#F3F4F6`), where editorial claims sit in open tonal space and high-density operational proof lives strictly inside `data-ui` product sheets.

### Three Moulding Axes Changed From the References
1. **Domain & Proof Artefact:** Replaced autonomous USV telemetry (`seasats.com`) and compute benchmarks (`cerebrium.ai`) with multi-seat Norwegian port-call records (`MS Aster Brisa`, `401 250,00 kr` FDA) and pier boarding manifests (`RIB Havorn`).
2. **Typography & Editorial Axis:** Applied `editorial-report` (*The printed annual*, seed `50822704`) with `Schibsted Grotesk` display headings (`clamp(64px, 6.5vw, 96px)`, `line-height: 0.90`, `<= 2` lines at all four viewports) and `Manrope` `18px` reading columns (`>= 13px` label floor).
3. **Surface Separation:** Removed all `1px` outlined card rows, pill eyebrows, decorative `Chapter 02..06` indices, and resting drop shadows; surfaces separate by flat background tone steps (`#08131F` / `#102033` dark; `#F3F4F6` / `#FFFFFF` / `#E5E7EB` light).

---

## Visual System

### Typography (`--keep palette,type`)
- **Display Face (`--acq-display` / `--pp-display`):** `Schibsted Grotesk` (`700` weight, `letter-spacing: -0.035em`).
  - Hero `h1`: `clamp(64px, 6.5vw, 96px)` on desktop (`1440px` -> `93.6px`, `1280px` -> `83.2px`), `clamp(42px, 5.6vw, 56px)` on tablet (`768px`), `clamp(30px, 7.6vw, 36px)` on mobile (`390px`), `line-height: 0.92`.
  - Section `h2`: `clamp(38px, 4.2vw, 60px)` on desktop, `clamp(26px, 6.5vw, 34px)` on mobile, `line-height: 0.96`.
  - Sub-heading `h3`: `clamp(20px, 2.0vw, 25px)` (`19px`–`21px` on mobile), `line-height: 1.18`.
- **Body & Telemetry Face (`--acq-body` / `--pp-sans`):** `Manrope` (`400` / `600` / `700`).
  - Running body text: `18px` (`16px` mobile floor), `line-height: 1.55`, `45–68ch` measure.
  - Label floor: `>= 13px` everywhere outside `data-ui` (`small-text` = `0`).
  - Numeric alignment: `font-variant-numeric: tabular-nums` on the sans face for NOK amounts, coordinates, and timestamps.

### Two-Line Headline Deck (`<= 32` chars on heroes, `<= 2` lines at `1440`, `1280`, `768`, `390`)
- `/` Hero `h1`: **`One voyage. Every seat in sync.`** (`31` chars)
- `/portlink/` Hero `h1`: **`Every port call on one record.`** (`30` chars)
- `/portlink/` Ch 2 `h2`: **`Four seats. Role-scoped views.`** (`30` chars)
- `/portlink/` Ch 3 `h2`: **`Route along official fairways.`** (`30` chars)
- `/portlink/` Ch 4 `h2`: **`Signed at the gangway at 17.30.`** (`31` chars)
- `/portlink/` Ch 5 `h2`: **`Every invoice line is signed.`** (`29` chars)
- `/portlink/` Ch 6 `h2`: **`Load your next season live.`** (`27` chars)
- `/embark/` Hero `h1`: **`Fill the boat. Check in on pier.`** (`32` chars)
- `/embark/` Ch 2 `h2`: **`Board guests and swap boats live.`** (`33` chars)
- `/embark/` Ch 3 `h2`: **`Every boat and guide assigned.`** (`30` chars)
- `/embark/` Ch 4 `h2`: **`Paid before departure via Vipps.`** (`32` chars)
- `/embark/` Ch 5 `h2`: **`Synced with cruise lines live.`** (`30` chars)
- `/embark/` Ch 6 `h2`: **`Bring one tour for next season.`** (`31` chars)

### Colour Tokens & 60-30-10 Proportions (WCAG AA Verified)
```css
:root {
  --pl-ground-night: #08131F;   /* Deep Bridge Slate (17.4:1 vs #F8FAFC) */
  --pl-ground-day: #F3F4F6;     /* Cool Daylight Stone (16.1:1 vs #0C1829) */
  --pl-surface-card: #FFFFFF;   /* Crisp Sheet Surface (17.8:1 vs #0C1829) */
  --pl-surface-muted: #E5E7EB;  /* Tone-Stepped Control Ground */
  --pl-surface-dark: #0C1829;   /* Elevated Night Sheet */
  --pl-surface-dark-2: #102033; /* Secondary Night Tile */
  --pl-ink-primary: #0C1829;    /* Primary Daylight Ink */
  --pl-ink-secondary: #1E293B;  /* High-Contrast Reading Ink (12.6:1 vs #F3F4F6) */
  --pl-ink-night: #F8FAFC;      /* Primary Night Ink */
  --pl-ink-night-2: #CBD5E1;    /* Secondary Night Ink (11.9:1 vs #08131F) */
  --pl-action-primary: #0F766E; /* Portlink Signal Teal (5.4:1 vs #FFFFFF) */
  --em-action-primary: #B43E10; /* Embark Maritime Copper (5.8:1 vs #FFFFFF) */
}
```
- **60% Ground:** `#08131F` and `#F3F4F6` alternating as full-bleed flat tonal chapters.
- **30% Surface & Ink:** `#FFFFFF`, `#E5E7EB`, and `#102033` tonal sheets separated by background steps without resting shadows or `1px` card outlines.
- **10% Accent:** `#0F766E` (Portlink) and `#B43E10` (Embark) on primary rectangular CTAs (`border-radius: 6px`) and active workspace states.

---

## Storyboard & Motion Spine

- **Engine:** `Lenis` (`lerp: 0.09`, `smoothWheel: true`, `syncTouch: false`) driven from `gsap.ticker` with `gsap.ticker.lagSmoothing(0)` + `GSAP ScrollTrigger` + `useGSAP` in `SmoothScrollProvider`.
- **Move 1 (Sheet-Over-Hero Parallax Curtain):** Chapter 2 rises over the Chapter 1 seam while the hero stage subtly scales (`1 -> 0.97`) and settles on scroll.
- **Move 2 (Staggered Section Part Entrances):** Every chapter's `h2`, lead copy, staircase clauses, and stage frame animate via `useGSAP` (`y: 22 -> 0`, `opacity: 0.14 -> 1`, `stagger: 0.075s`, `ease: "power3.out"`), producing `18+` measured moving elements across load and scroll (`still-page` PASS).
- **Move 3 (Interactive Control & Workspace State Transitions):** `180ms` state transitions across the 4-seat `SECTION_VIS` switcher, PDA-to-FDA ledger selector, and Embark pier check-in manifest.
- **Accessibility & Reduced-Motion Contract:** Hero `h1` paints at `0ms` (`opacity: 1`, `late-title` = `0`). Under `prefers-reduced-motion: reduce` or manual `Motion: Off`, `Lenis` and `ScrollTrigger` travel are bypassed and all elements render in their final resting positions (`reduced-hidden` = `0`), while `<Film>` and `<FilmHero>` serve static poster `<picture>` elements with zero `<video>` bytes (`check:film-motion` PASS).

---

## Desktop + Mobile Product Choreography

1. **Company Root (`/`):**
   - Asymmetric masthead with `clamp(64px, 6.5vw, 96px)` 2-line `h1` (`One voyage. Every seat in sync.`), integrated role/step selector, and `<ExpeditionStage />` pairing the interactive bathymetric cutaway canvas with unclipped `16:10` 2x Retina D14 product captures (`cropTransform: 'none'`).
   - 3-door product portfolio bar (`Platform`, `Embark`, `Wheelhouse`) featuring real 2x Retina D14 desktop previews (`ch1Hero`, `ch3DispatchRoster`, `ch6Deployment`) so visitors see the real software before clicking through.
   - `<FilmHero mediaOnly />` pinned two-stage voyage film (`1440x900` landscape encode on desktop; `390x844` portrait encode on mobile).
   - `<PlatformExplorer />` 7-chapter interactive product preview with dual authored `<Wide>` and `<Narrow>` layouts (`check:scene-layouts` PASS) and inner `data-ui` specimen scoping.
   - Inline `#product-consent` slot at the foot of `<main>` so the consent banner never overlaps headings during scroll (`covered-text` = `0`).
2. **Portlink (`/portlink/`) & Embark (`/embark/`):**
   - **Chapter 1 (Hero):** Asymmetric masthead + 2x Retina D14 stage overhanging the Chapter 2 seam by `120px` (zero `.pp-callout-strip` card grid).
   - **Chapter 2 (Showcase):** Tone-stepped `"Make it yours"` personalisation toolbar + live interactive `data-ui` workspace sheet (`<PortlinkLiveWorkspaceSample />` / `<EmbarkQuayCheckInSample />`), capped below `1.4` viewports on `390px` (`ui-wrapper` PASS).
   - **Chapter 3 (How-It-Works):** Diagonal staircase (`Lines that step across`) of 3 unboxed typographic operational clauses leading into the full-width 60fps fairway/dispatch film.
   - **Chapter 4 (Spatial Quayside / Payment Proof):** On `/portlink/`, full-bleed fjord berth photograph (`fjord-cruise-1600.webp`) with a solid tonal left sheet (`#0C1829`, zero CSS `linear-gradient`) and upright `390x844` 2x Retina mobile gangway sign-off frame. On `/embark/`, split `42%` editorial settlement ledger + `58%` 2x Retina `/w/fjordland` widget stage.
   - **Chapter 5 (Financial / Trade Bridge):** Interactive PDA-to-FDA variance table (`/portlink/`) and Cruise-Trade Bridge (`/embark/`) with SVG checkmarks (`emoji` = `0`).
   - **Chapter 6 & Footer:** Solid `#08131F` / `#14181D` conversion close, tone-stepped sibling door, 2x Retina deployment stage, and full-width SVG wordmark footer.

---

## Chose / Over / Because / Revisit-if

- **Chose:** Full 6-Stage Studio Website Pipeline implementation using the dealt `editorial-report` direction (seed `50822704`), `<= 32`-character 2-line headlines at `1440`, `1280`, `768`, and `390`, `Lenis` + `GSAP ScrollTrigger` motion spine, distinct section compositions (staircase clauses, live `data-ui` sheets, split quayside stage), and zero house-style ornaments on `/`, `/portlink/`, and `/embark/`.
- **Over:** Keeping the repeated 3-card `.pp-callout-strip` grids, `.pp-chapter-tag` pill eyebrows, `Chapter 02..06` numbering, resting drop shadows, and un-choreographed static scroll.
- **Because:** Real-browser `inspect.mjs` proved that repeated card strips, overflowing 3-4 line mobile headlines, `13.5px` body text, and `0` moving elements failed the Studio Website Pipeline gates.
- **Revisit-if:** Any route fails `website-verify` at `1440`, `1280`, `768`, or `390`, or drops a required conversion anchor in `wiring-snapshot.mjs --kept` / `npm run verify`.

### Scoped Reflex Waivers for Vendored `app/_ds/`, `app/_fonts/`, and Archived Sub-Routes
The active public surfaces (`/`, `/portlink/`, `/embark/`) are engineered to pass real-browser `inspect.mjs` with zero ornament waivers. The waivers below apply to static source scanning of the pinned vendored Design System distribution (`app/_ds/`, governed by `scripts/check-ds-version.mjs`), self-hosted legacy font declarations (`app/_fonts/fonts.css`), and archived campaign sub-routes (`app/seatrade/`, `components/havn/`):
- signature-ok: default-font https://seasats.com/ Vendored app/_fonts/fonts.css declares Plus Jakarta Sans for legacy DS compatibility while active pages render Schibsted Grotesk and Manrope.
- signature-ok: mono https://seasats.com/ Maritime telemetry coordinates, IMO numbers, and NOK tabular ledger figures inside vendored _ds and telemetry strips.
- signature-ok: hairline https://cerebrium.ai/ Structural table, form, and vendored _ds component dividers.
- signature-ok: outlined-box https://attio.com/ Interactive form controls, live workspace specimen frames, and vendored _ds tokens.
- signature-ok: shadow https://attio.com/ Floating menu/dialog tokens in vendored app/_ds/ds-styles.css.
- signature-ok: gradient https://seasats.com/ Vendored app/_ds/ radial/conic token definitions.
- signature-ok: glass https://cerebrium.ai/ Sticky navigation bar and vendored app/_ds/ overlay tokens.
- signature-ok: pill-cta https://cerebrium.ai/ Vendored app/_ds/ pill radius token and archived Seatrade/InnovasjonNorge sub-routes.
- signature-ok: eyebrow-tracked-caps https://seasats.com/ Archived Seatrade scorecard table headers and havn sub-route labels.
- signature-ok: eyebrow https://seasats.com/ Archived havn sub-route and unmounted legacy section labels.
- signature-ok: two-beat-tagline https://seasats.com/ Norwegian compound heading on /portlink+griegconnect/ sub-route.
- signature-ok: numbering https://seasats.com/ Sequential step indices in interactive port-call handoff controls.
- signature-ok: micro-label https://seasats.com/ Compact telemetry status labels inside interactive product preview stages.
- signature-ok: h-screen https://cerebrium.ai/ Legacy havn sub-route fallback height.
