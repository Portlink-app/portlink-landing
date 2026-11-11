# Acquisition handoff

Owner: Keel. Execution-ID: portlink-acquisition-onboarding-2026-11-11.
Full brief: Buzz workspace PLANS/PORTLINK_ACQUISITION_EXECUTION_2026-11-11.md.

## Current increment

The additive GET /start route translates the existing role IDs into Platform's existing /start
segment parameter. It returns a non-cacheable redirect and never creates accounts, signs terms,
sets entitlements, starts clocks or makes payment requests. The primary demo fallback remains in place; the shared opening now offers audience-aware trial exploration while full trial acceptance remains open.

| Input audience | Platform segment | Result with configured trial origin |
| --- | --- | --- |
| cruise, or no explicit audience | cruise_line | Platform /start |
| agent | port_agent | Platform /start |
| tour | dmc | Platform /start |
| vessel, port, operator, company or unknown | none | Existing /#access |

Use /start/?product=platform&audience=agent from the agreed acquisition controls. Product may be
omitted for the existing Platform default. Explicit unknown products, Embark and Wheelhouse
return to assisted entry. They must not inherit Platform terms or be silently sold a cruise-line
plan. No new trial label, price, bundle or eligibility claim is introduced.

## Source and data flow

Existing role vocabulary: components/sections/portCallStory.ts, imported as a type only.
Observed Platform catalogue: src/lib/billing/catalogue.ts has cruise_line, port_agent and dmc.
Observed Platform /start reads segment, band and period; it validates these against its own
catalogue and reads prices from Stripe. Landing forwards only the mapped segment. It does not
copy prices, accept redirect destinations, or forward arbitrary query data.

NEXT_PUBLIC_SELF_SERVE_URL remains the existing build-time switch. Only a HTTPS origin with no
credentials, path, query or fragment is accepted. An unset or malformed value falls back to
/#access. Deployment environment changes require rebuilding, as before. This is not proof that
a configured product is accepted for public trial: the full signed-journey gate still controls
when the setting and new visible trial actions may be enabled.

app/start/route.ts -> lib/acquisition.ts -> configured Platform /start or local /#access.
The response is private/no-store, noindex/nofollow and no-referrer. It never changes the existing
consent or conversion collectors; the 15.11.2026 conversion checkpoint remains with its owner.

## Scope and verification

Owned files: lib/acquisition.ts, app/start/route.ts, scripts/check-acquisition.mjs, this document,
next.config.ts, scripts/check-acquisition-http.mjs and package.json gate wiring. Generated design assets remain untouched. The composition increment also owns components/acquisition/*, the three page consumers, ProductHeader labels and FilmHero media-only composition.
Reverse with this task commit's revert. Build and verify both run check:acquisition.
The test calls the real GET handler, calibrates successful segment handoffs against assisted
fallbacks, rejects duplicate keys and malformed configuration, and verifies that tenant, email,
price-band and redirect parameters do not leak into the destination.

Chose one server-side handoff over parallel signup logic or unverified cross-product activation.
Because product identity, signing, pricing and entitlement remain authoritative in each product.
Revisit-if independently accepted Embark signup or Wheelhouse commercial entry becomes available.

Still unmapped: live payment/flag state, cross-product identity and provisioning, privileged access
bypasses, final cinematic acceptance and customer-journey release evidence. This
increment is routing preparation, not a claim that the complete acquisition journey is delivered.

The built server originally replaced the handler's no-referrer header with the global policy.
A narrow /start header rule fixes that at the configuration source. The postbuild HTTP gate
checks canonical trailing-slash redirects, actual handoff headers, unsupported product fallback
and the unchanged header policies on the homepage, both product pages and contact page. It never
follows external redirects. Run with the same NEXT_PUBLIC_SELF_SERVE_URL as the build; a fixture
build exercises configured entry, and an unconfigured build exercises the closed entry.

Assisted responses use a relative Location: /#access. Next's production request URL can use an
internal hostname behind a proxy; deriving an absolute fallback from it sent the local proof to
localhost instead of the requested address. The HTTP guard now requires the relative fallback.

## Shared opening composition

Consumes Tiller acquisition-1, manifest SHA256 `01f8e4ce2208a6d7ea5aad545fe6dab5542728cf840684b8b25a39da22f2531d`.
The pinned contract fields roles/platform/embark are copied without the illustrative signing state machine into components/acquisition/contract.json. This snapshot is authored sample content, not authenticated product captures. Its source is the Buzz acquisition-contract directory; update only against a new reviewed pin.

One AcquisitionOpening serves company, Platform and Embark. Company roles map the contract's dmc key to the existing tour role; operator stays Embark-only. One choice drives headline, image, destination and lower workflow. Chapter buttons are deterministic, keyboard-operable, deep-linkable and replayable. No-JavaScript visitors receive the initial frame plus the later workflow text and ordinary product/demo links. Film motion uses useMotionAllowed and setManualMotion; reduced motion wins over manual enablement.

Chose: existing D14 materials and one React composition over embedding specimen HTML or a new rendering engine. Because the same role and motion authorities govern all consumers. References: Apple AirPods Pro stage hierarchy, Linear product detail, Crypto.com product orientation, as documented in Tiller DIRECTION.md. Revisit-if: an accepted cinematic renderer is delivered.

The previous product sample blocks that implied automatic cross-product synchronization are no longer mounted. Existing voyage footage remains below discovery via FilmHero mediaOnly; removing it also removed the motion guard's real positive control. No guard was weakened. Old public fragment aliases and conversion demo event names remain.

Current limitation: this is a composed comparator, not accepted cinematic design. Full-page taste inspection retains legacy chapter findings (heading length, labels, shadows, outlines, type hierarchy and sticky overlap) plus the comparator's limited motion. These remain open for the shared design review, followed by a complete rendered audit. Authentic product capture, mobile performance, billing/access review and live customer journeys remain required. No production publication is authorised by these local proofs.

## Consolidated review correction, 11.11.2026

C1-C5 source: `WORK_LOGS/TILLER_ACQUISITION_REVIEW_20261111/REVIEW.md`.
The old product-page studio images and clips contained claims inside their pixels as well as the
surrounding copy. They are unmounted from both product pages. Their source assets remain archived
in the existing asset registry; they must not be remounted as authenticated evidence. Replacement
records are explicitly illustrative HTML, readable at phone width. They make no fairway-depth,
daylight-check, automatic recalculation, automatic FDA transfer, payout or cross-product sync claim.
The actual authenticated chart/capture gate remains open; the route detail is not a navigation chart.

The financial example retains a semantic table in an explicitly labelled, focusable horizontal
scroll region, with keyboard instructions. All columns remain available. Product example links
preserve the selected chapter hash and clear the sticky header. Product pages use the header's
single motion preference control; company keeps its caption control. Tablet intros stack by 900px.
Shared product typography follows Schibsted/Manrope and the reviewed responsive scale. Decorative
chapter labels, callout stacks and static shadows are removed; real table and control boundaries
remain. The neutral maritime photo scrim and D14 cream are intentional direction exceptions.

Reversal: revert this correction commit. Forms, consent policy, assisted entry, role mapping and
conversion event names retain their existing behaviour. Tiller's immutable manifest is unchanged.

This is still the fallback comparator. C6 expedition framing, authentic product captures,
performance acceptance, complete signed trial/access verification and authorised publication remain
open. Full-page company audit also exposes older lower-page typography and composition findings;
those findings are recorded with the consolidated evidence, not dismissed by a clean source lint.

## Consumption and company follow-up, 11.11.2026

Preview head 6192c9b1db3e55c348d215dd208fc326acdbeb14 has two additional measured
proofs: Tab-only entry followed by ArrowRight exposes every final ledger cell at 390px;
one labelled synthetic demo-portlink-hero CTA is persisted in the configured visitor-intel
store. No form, personal data, mail endpoint or cron was used. This is collector persistence,
not trial conversion or signed-access acceptance. Full evidence is in the Buzz workspace
WORK_LOGS/KEEL_ACQUISITION_20261111/consumption/STATE.md.

The company composition now inherits D14 Schibsted/Manrope through a consumer wrapper.
One font declaration serves all three openings and the two product layouts; the company
page can remain a server composition around existing interactive children. Pain and explorer
copy use readable sizes with fewer decorative labels. The opening product headings retain
their intended scale, and the lower Platform photo selects a responsive source.

Chose existing consumer font aliases over editing generated design-system tokens or global
consent typography. Because those global consumers have a broader scope than this correction.
Revisit-if a measured cross-page typography review accepts replacing the legacy root fonts.

The controlled browser baseline and after-run show company font downloads falling from five
to four, but no material LCP improvement. This does not close the Lighthouse performance gate.
The company audit still retains older film, ecosystem, team and footer findings; no visual
acceptance or cinematic completion is claimed. Reversal is this increment's revert.

## Film interval and remaining review wording

Product chapter labels now describe passage planning and booking arrangements while retaining
the public fragment IDs. The Platform sibling paragraph uses supported departure, booking and
capacity wording instead of unverified payment integration copy. The operator lead clarifies
independent tour operations through an editorial adapter; the immutable contract stays intact.

Viewport captures at the company film's start, middle and end show visible media throughout the
normal pinned interval, with sequential stills under reduced motion. Do not shorten the track
based on a stitched full-page blank. Below the opening, FilmHero now delays video mounting until
its track is within 300px of the viewport and uses lazy SSR stills. Its default opening mode stays
eager. Existing responsive encodes, motion preferences, chapter anchors and playback hooks remain
authoritative. Browser regression evidence must assert no MP4 request before approaching the film,
then actual playback in view and both stills in reduced motion.

Chose resource deferral over changing the correctly rendered track geometry. Because offscreen
video requests compete with discovery without helping the visitor. Revisit-if viewport capture
shows a blank first in-view frame or the film fails to start on a supported device.

C6 effect expansion remains gated by the storyboard's mobile LCP requirement. Static framing
targets can be prepared for review; they do not establish an implemented cinematic scene. The
configured preview currently injects Netlify collaboration scripts and tutorial videos; measurements
that exclude those requests are diagnostic only and do not establish unmodified preview acceptance.
Full comparison and film evidence: WORK_LOGS/KEEL_ACQUISITION_20261111/cinematic/STATE.md.

## Composed static scene states

AcquisitionOpening now renders the scene record and lower workflow from the same immutable
contract state, selected through the existing role, chapter and fragment lifecycle. Company
foreground belongs to the itinerary planner. Port agent and DMC are separate labelled supporting
organisations. The future itinerary context remains visible through request and acceptance;
acceptance is its own visitor-selected chapter after a valid returned quote. Embark starts with
independent operator preparation and keeps ten seats, twelve bookings and two unresolved guests
visible during review. No automatic reassignment, integration or live booking is implied.

Scene chapter buttons are ordinary HTML controls. They share state with the existing workflow
controls and do not add an autoplay timeline, camera engine or WebGL dependency. Both motion
preferences use viewport-specific static scenery and the same readable HTML. Missing images
leave the solid-backed record usable. No-JS retains the first record and subsequent chapter text.
Only the lower, existing workflow status is a live region, avoiding duplicate announcements.

Chose authored static scenery with HTML records over shipping generated paper text or introducing
a second renderer. Because first-frame review is authorised while effects remain gated by mobile
performance. Four compressed files under public/acquisition are illustrative campaign assets, each
below the 250 KB poster budget. Their README records provenance. Frame review, performance,
authentic product evidence and full signed trial/access acceptance remain open.

The browser icon generator now keeps 16/32/48px ICO frames and the separate existing
180/192/512px PNG app icons. Removing the redundant uncompressed 256px ICO frame reduces the
favicon from 285478 to 15086 bytes. Retained frames are pixel-identical, and all three PNG hashes
are unchanged. A 32 KiB generator guard prevents recurrence. This is a measured byte reduction,
not an inferred mobile LCP pass; CSS, fonts and preview tooling remain separate candidates.

## Viewport discovery and initial script scope

Scene controls now precede the scenery and full record in DOM order. An adjacent plain-text
example status follows the same chapter state. At 390 × 844, the controls begin at 563px on
company and 509px on both product routes, rather than below 1173px. Type, record fields, actors
and the existing single live region remain intact. Ordinary viewport captures, including reduced
motion, are in WORK_LOGS/KEEL_ACQUISITION_20261111/viewport/.

MotionProvider now wraps the two ContactForm mounts instead of every route. Seatrade Scorecard
retains its own MotionConfig. A future remount of legacy Framer components must supply the
reduced-motion provider locally. Company/contact forward and back navigation, focus and both
motion preferences are exercised without submitting the access form.

Chose the bounded provider scope over a larger server/client explorer rewrite. The measured
product script savings are only 846 and 842 bytes; controlled local LCP changes by 40 and 20ms.
This does not establish a performance improvement or satisfy the mobile gate. The next bounded
investigation is the seven scene imports in PlatformExplorer's client graph; preserve its
selection/hash behaviour and server-rendered fallback before moving any code.

Starboard owns acceptance. Release follows acceptance through the authorised execution lane.
Cinematic framing, authentic product evidence, performance and full trial/access gates remain open.


## Responsive phone scenery

The shared picture keeps the original wide image for desktop. Next getImageProps supplies
400px and native640px phone candidates; the browser chooses for viewport and DPR.
The quality allowlist is encoder-specific: native Next75, Netlify50. Measured Netlify75 AVIF
exceeded the source bytes at640px; local Next50 visibly lost detail. The default Next loader
chooses the sole allowed quality in SSR and hydration. Verify actual hosted bytes and frames
when either encoder changes; matching quality numbers do not mean matching output.
The image endpoint permits only the two local phone crops, with AVIF/WebP negotiation and no
remote sources. Existing raw img consumers bypass it. These width limits belong to these assets;
review native dimensions and all consumers before adding another optimized image.

Chose framework delivery over host-specific markup or forcing400px on dense phones. Because
local and hosted previews must exercise the same markup and high-density fidelity must remain.
Revisit-if endpoint negotiation, image fidelity or repeatable page performance regresses.
Controlled response-rewrite probes supported this candidate, but are not release acceptance.
Evidence: WORK_LOGS/KEEL_ACQUISITION_20261111/scenery-control/STATE.md in the Buzz workspace.
