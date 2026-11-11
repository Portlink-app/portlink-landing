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
