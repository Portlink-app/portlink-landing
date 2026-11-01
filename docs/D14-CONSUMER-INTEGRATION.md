# D14 consumer integration

Execution-ID: portlink-d14-cross-surface-2026-11-01. Owner: Keel.
Coordination: PLANS/PORTLINK_D14_CROSS_SURFACE_EXECUTION_2026-11-01.md in the Buzz workspace.
Development root: 1aa79d6ca78caa015867db5494317cdda0b9a6e0563452aa10a3efc03a2b8296.

## Progress

- [x] Reconcile landing main and the existing conversion work.
- [x] Inventory source consumers and measure the email baseline.
- [x] Inspect the public desktop homepage without submitting a form.
- [ ] In progress: receive Tiller's pinned Gate A contract, package hashes and reference composition.
- [ ] Integrate and review one homepage and one complete company email.
- [ ] Complete remaining consumers and the repository/client/theme/mobile gates.
- [ ] Hand the verified landing branch to Starboard for publication, then verify the deployed artifact and conversion path.

Visual integration is dependency-blocked, not complete. This is input to Tiller's manifest, not a second package registry. No provisional values or generated files have been edited.

## Sources and ownership

M means measured by this session; R means relayed by the read-only inventory worker and not independently rerun by the integration owner. Source observations are not live acceptance.

| Evidence | Surface | Baseline and boundary |
|---|---|---|
| M | Landing | GitHub main and local origin/main: a77b3e9ffec74168b7f384fdc7e7547d58f3af90. Isolated branch keel/d14-cross-surface-20261101 starts there. Primary checkout local main is stale. |
| M | Conversion | Already in main through ce8267f486e44cd4cd85394f945954b45cc0e2fa (#21); demo confirmation correction e7c08904ca1e57d64816ba8b4a57184192f9422a (#22). Preserve both; do not replay the old conversion branch. |
| M | Other landing work | Open PRs #20 account naming, #19 preview lifecycle, #18 and #9 Seatrade phone work. Their paths and branches remain with their owners. |
| R | Platform | origin/main c9aee47bffa0cc2be1fbd0cfc37da7c6ce25e081. Tiller owns shared source, generated outputs and proof tooling. |
| R | Embark | origin/main 5773d8a40414720812d3c3e7560fab9fa2757b0d. Active claims live in Buzz/open PRs; Nautiqs retains merge and Tiller retains consumption closure. No Embark edit claimed. |

Landing publication belongs to Starboard under Keel's task-branch-only grant. Broader repo publishing prose does not widen it. The active GitHub guard required portlinkadmin for reads; current main and open PRs were read through that dedicated account.

## Subsystem and content structure

app/layout.tsx loads app/globals.css plus motion and tracking/consent integration. Global CSS loads generated local fonts, legacy token CSS and component CSS before Tailwind, then maps semantic and legacy aliases. All routes can be affected by these imports. Theme switching uses data-theme.

The accepted homepage sequence is Nav, FilmHero, PainSection, PlatformExplorer, EcosystemSection, TeamProofSection, AccessSection, Footer. Preserve the outcome hero, single demo CTA, shorter sequence, chapter registry, seven Wide/Narrow scene pairs, connected-call narrative, real films, team facts, access/pilot/roles fragments and tracking markers.

Neighbour routes: contact, team, privacy, Innovasjon Norge, leads, portlink+griegconnect and all Seatrade pages. Shared fonts and tokens reach them even without page edits.

Chose: one governed global adapter and existing email renderers. Over: per-component colour replacement or an independent page/module redesign. Because: the aliases are a bounded integration seam and the page already carries the accepted conversion changes. Revisit-if: Gate A requires a semantic role the adapter cannot represent.

Before adapter edits, map all legacy roles across authored CSS/TSX, including inactive components. Global CSS alone references wave, glass, inverted, categorical, focus, motion and geometry roles beyond brand colours. Tiller must classify compatibility roles and exceptions. Generated app/_ds and app/_fonts files are not hand-edited.

Measured authored role inventory: 78 distinct DS custom-property names across app, components and lib TS/TSX/CSS, excluding generated _ds and _fonts directories. Includes comments and inactive components. Families, with the common --ds- prefix omitted:

- accent, accent-strong, accent-subtle; border-1, border-2; canvas; surface-1, surface-2, surface-3.
- primary, primary-faint, primary-hover, primary-ink; inverted-bg, inverted-border, inverted-surface, inverted-text; nav-glass.
- danger, danger-bg, danger-text; info, info-bg, info-text; success, success-bg, success-text; warning, warning-bg, warning-text.
- text-1, text-2, text-3, text-body, text-disabled, text-invert, text-sm, text-xs; h3; font-display, font-mono, font-sans; track-caps, track-title.
- dur-1, dur-2, dur-3, dur-4, ease-standard; focus, focus-ring.
- gap-3, gap-4, gap-5, gap-6, gap-7, gap-8, gap-10, gap-12, gap-20.
- radius-xs, radius-sm, radius-md, radius-lg, radius-xl, radius-pill; shadow-xs, shadow-1, shadow-2, shadow-3, shadow-brand.
- wave-1, wave-2, wave-3, wave-4, wave-5, wave-bg-start, wave-bg-end.

The semantic mapping of these names remains Gate A-dependent. Existing legacy component CSS is an additional consumer layer to review with the adapter, not covered by this authored-source count.

## Email inventory

| Evidence | Consumer | Seam and preserved contract |
|---|---|---|
| M | Demo/build and admin | app/api/access/route.ts has two wrapper calls. Preserve #22 demo wording, role content, plain text, validation, recipients and refusal-before-send guards. First specimen: complete demo confirmation with realistic long copy and company name. |
| M | Seatrade | lib/seatrade/emails.ts has eight exported renderers: E1, verification reminder, referral credit, E2, E3, E4, admin, open answers. Signup, notes and verification routes consume them. Preserve text, unsubscribe headers/URLs, terms and scheduling. Scheduled HTML is frozen; no cancel/rebook. |
| M | Port questionnaire | app/api/havn/route.ts imports the wrapper and embeds body styles. Preserve Norwegian content and its fixed shared inbox destination. |
| M | Visitor intelligence | app/api/intel/cron/route.ts wraps hot-lead and daily-digest mail. Preserve access/consent controls. Synthetic fixtures only; never publish real digest content or secret-bearing login links. |
| R | Platform | src/lib/email/render.ts imports emailOutputProfile; 55 template entries counted. src/lib/email/send.ts renders after deep-link normalization. Profile changes reach existing templates. |
| R | Embark | AdminInvite, BookingConfirmation, Cancellation, GuideManifest, InquiryNotification, Refund, SignupConfirm, ThankYouReview. SignupConfirm explicitly represents company mail, consumed by web/src/app/api/signup/route.ts. Other templates need owner classification. |

lib/email/wrap.ts has four direct importing modules and thirteen static wrapper call sites, not only the two flows its header names. Body sources also contain literal colours, so changing only the shell leaves a mixed identity. Gate A should supply shell, heading/body/link, action, surface, status and footer roles. Flow content, preheaders and unsubscribe notes stay separate.

Embark web/src/lib/email-content.ts reads tenant site_settings.email_brand, tenant_theme.logo and workspace names. Its shared layout exposes logo text, tagline, footer and logo URL. These customer-brand boundaries are intentional. Required edits go through the existing owner/claim process.

## PDF inventory

| Evidence | Consumer | Source and boundary |
|---|---|---|
| R | Platform operations | src/modules/finance/departure-report-pdf.tsx, src/modules/finance/fda-bill-pdf.tsx and src/modules/fleet/pilot-card-pdf.tsx consume generated PDF profiles. Entry points include departure archive, PA bill route and public card PDF route. |
| R | Platform commercial pack | src/modules/tours/offer-pack-pdf.tsx and src/lib/tours/offer-pack-images.ts consume PDF profiles. DMC offer-pack route passes workspace, DMC and client logos; preserve them. |
| R | Embark documents | web/src/lib/manifest-pdf.tsx, report-pdf.tsx and review-qr-pdf.tsx accept brand names and default to Embark. Explicit customer brand remains authoritative. |
| M | Landing | Search for pdf/PDF under lib and app excluding generated CSS found no renderer. Scoped source coverage only. |

## Before measurements

| Evidence | Measurement | Result |
|---|---|---|
| M | Vendor release | v4.1.2, separate version line from Platform token package 1.0.0 |
| M | Email CTA | White on #3d7daf: 4.42:1, using sRGB luminance. Below 4.5:1 normal-text target. |
| M | Email footer | #94a3b8 on #f8fafc: 2.45:1, using sRGB luminance. |
| M | Literal-colour occurrences | Wrapper: 21; Seatrade bodies: 68. Includes comments; not a rendered failure count. |
| M | Public desktop | Native Vivaldi loaded https://portlink.app/. Screenshot and accessibility tree showed outcome H1, demo action, explorer, connected-call narrative and full form. No submission. Not a deploy-SHA or mobile pass. |

| Evidence | Source | SHA-256 |
|---|---|---|
| M | Landing app/_ds/manifest.json | cac5705a6d96cc84f19b323ee0f0d6fa114d8e82255fc2bb7f483c258d2426b0 |
| M | Landing app/_ds/portlink-tokens.dist.css | bfdf45b529d9f9d1cf68fc3ab60ca53ba20697cc7779d07bc899b29834b1014e |
| M | Landing lib/email/wrap.ts | b94b9dd4d99f1b7ac6e020e5716b3aa82395e5f22fb8709b3719d7cabae31bd9 |
| M | Landing app/globals.css | 703f31210017c571467679f68977f8043c1995ea312ba367c6a67170e6722e30 |
| R | Platform src/design-system/outputs/profiles.json | 931c9690c4d327aa5cdd7e25c2a882ed8fcba3715328129b0e7918170fc5d4f2 |
| R | Platform src/lib/email/render.ts | d5450f58a70c955e2c8cc4e8f61f6ea289439a550f134ede8ce4c500a66007c0 |
| R | Embark web/src/emails/_shared.tsx | 0db31ecb9857ae82df2373e1ddae3cb55c979be61314fa3c12407ac2c78567ab |

## Landmines, reversal and gates

- Token/font imports, Tailwind order, legacy aliases and dark selectors can override a new package. scripts/check-ds-version.mjs checks version syntax and optional sibling legacy release, not Platform byte parity. Consume Gate A's verifier.
- Attribute evidence to exact worktree HEAD, not local main or old completion notes.
- Wrapper changes affect internal alerts and campaign mail. Migrate body roles too; do not send or reschedule messages.
- Run full npm run verify and npm run build after implementation. Preserve mail refusal/route, consent, font-host, client-IP, anchor, scene-pair, motion, contact-intent and typography guards.
- Reverse only integration commits. No data migration or customer mutation. Production acceptance stays open through deployed-commit and conversion verification.
- Browser bridge was unavailable; native Vivaldi enabled desktop inspection. Responsive automation and real Gmail/Outlook/Apple Mail light/dark checks remain unverified. Browser emulation never counts as a real-client pass.

## What is still unmapped

Gate A immutable adapter API, release/hash and composition; semantic mapping of the measured legacy roles and generated component styles; current Embark claims and company/operator classification beyond SignupConfirm; real client availability; complete email/PDF render matrices; production deploy artifacts. These remain explicit gates.

Coordination update read from the parent plan: shared-output publication is serialized after Nautiqs' #2842; Starboard owns obtaining its landed commit/package boundary. Tiller continues independent contract, verifier and asset work, then supplies the accepted Gate A pin. This is relayed dependency state, not an independent PR verification. Resume implementation here when that pin arrives; no second goal or timer.
