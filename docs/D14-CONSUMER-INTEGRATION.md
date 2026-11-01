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

## Independent review intake

Sextant's consolidated review is RESEARCH/SEXTANT_D14_CROSS_SURFACE_REVIEW_2026-11-01.md in the Buzz workspace, callback afc6b89903bf824b06e79eb6e3dc66646f476d2ff49a7db1d0a85db1f255bdd1. Findings R1 through R4 remain open until implementation and acceptance evidence exists.

| Evidence | Additional delivery path | Owner, target and verification |
|---|---|---|
| M | app/api/seatrade/export/route.ts | Keel: plain-text admin message with CSV attachment; intentional non-visual output. Preserve export schema, recipient and throttle. Never invoke its GET endpoint as a read check: it sends mail. Verify using synthetic intercepted transport only. |
| M | scripts/og/card.html | Keel: site social card; consumes legacy CSS/local fonts and public/portlink-logo.png plus the real hero poster. Regenerate through scripts/build-og-card.sh after Gate A, never edit the PNG. Update lib/metadata.ts to a new dated output path because OG files are immutable-cached. |
| M | scripts/og/havn-card.html | Keel: co-branded questionnaire card; preserve partner mark/content, apply only the governed company adapter. New dated output is referenced by app/portlink+griegconnect/page.tsx. |
| M | scripts/build-og-card.sh | Keel consumer build tool: currently requires Plus Jakarta Sans to load. Must validate the approved Gate A fonts instead when migrated; retain 1200 by 630 output and loaded-font assertions. |
| M | Landing email logo | Absolute URL https://portlink.app/portlink-logo.png in lib/email/wrap.ts. Pin the accepted asset, verify actual fetched bytes and images-off alt fallback at acceptance. No asset identity inferred from its URL. |
| R | Embark hosted reset-password email | Trigger: web/src/app/(admin)/admin/login/page.tsx calls Supabase resetPasswordForEmail. Existing Embark owner and Starboard must establish hosted template contents, branding owner, source/export pin and authorized publication route. Repository shared-layout changes cannot prove adoption. Hosted content remains uninspected and acceptance-blocked. |
| R | Embark staff invite | AdminInvite uses workspace brand from api/admin/invite-user, unlike company-owned SignupConfirm. Existing Embark owner preserves tenant identity. Acceptance covers two synthetic tenants plus unset brand, guest confirmation, operational mail, default/branded widget and editor chrome/preview. |
| R | Platform external PDF assets | Offer-pack renderer loads public/fonts/offer-pack TTFs directly. Tiller governs output-profile/font choice; Keel verifies delivered PDF glyphs, layout and logo preservation with synthetic inputs. Package parity alone is insufficient. |

Landing sends deploy through the landing Netlify application and its existing Resend transport; OG/logo assets deploy on the same public site. Platform and Embark runtime/deployment identities must be measured at their own release boundaries. All rows above are pending acceptance unless explicitly labelled an intentional plain-text exception.

Contrast calculation calibrated against black/white 21.000000 and white/white 1.000000. Landing CTA 4.420220 and footer 2.450636 reproduce the rounded baseline. R2 requires all rendered text/link/surface pairs, not just CTA. R3 requires trusted release anchoring and coordinated-checksum mutation controls; keep that shared-tooling change with Tiller, and consume the accepted verifier in the landing gate.

Executed source-baseline checks on this documentation-only branch: scripts/check-mail-routes.mjs passed, with 14 API route files and eight Resend-importing routes, calibrated against three positive imports and three near misses. The unsubscribe route cancels mail rather than rendering a new body. scripts/check-ds-version.mjs --strict passed for v4.1.2; this does not close R3's byte-integrity finding. Full product build/tests and post-change client proof are not claimed.

## Caller-family census supplement

All rows in this section are R: source findings from the inventory worker at the Platform and Embark pins above, not deployed or client evidence. Keel owns Platform integration verification; Embark changes retain its existing claim/owner process. Tiller owns shared identity/profile decisions. Each listed HTML/PDF/image output needs an accepted profile or owner-approved exception and runtime artifact pin before closure.

| Platform caller family | Audience and branding boundary |
|---|---|
| src/lib/invites/issue.ts | invite_workspace to supplied invitee email; includes workspace logo_url alongside company shell. |
| src/modules/admin/invite.actions.ts | account_welcome to invitee email, operator replyTo. |
| src/lib/cron/feedback-replies.ts | feedback_reply to submitter account email. |
| src/lib/billing/lifecycle.ts | Workspace admins, billing-signup fallback, buyer, deletion subject or agreement recipients. Winback is marketing; account deletion final; other billing templates service. Preserve unsubscribe for marketing. |
| src/modules/inbox/create.actions.ts, actions.ts, magic-link.ts | Booking and shore-request received/pending/accepted/rejected messages to assigned user, requesting/fulfilling workspace or external invite email. |
| src/modules/finance/actions.ts, departure-report-on-board.actions.ts | PDA and departure-report state messages to counterparty workspaces. |
| src/modules/amendments/actions.ts | Requests to vessel-owning workspace members; decisions to requester. |
| src/modules/voyages/review-flow.actions.ts, booking.actions.ts | Stage owners/role members and booking operational roles. |
| src/lib/notifications/handover.ts, port-call-lifecycle.ts | Vessel/cruise-line and shoreside/port-agent workspace recipients. |
| src/lib/cron/cutoff.ts, certificates.ts, digest.ts, ais-alerts.ts | DMC workspace, vessel workspace, individual digest user and target workspace respectively. AIS target provenance still needs deeper tracing if modified. |
| src/modules/finance/money.actions.ts | supplier_invoice_requested to supplier email, agent replyTo; agency identity remains in content. |
| src/modules/operators/actions.ts | operator_refresh_submitted to workspace recipients; deeper wsId provenance remains untraced. |
| src/modules/tours/actions.ts | Quote, call and exception messages to DMC, cruise-line or requesting workspace. |
| src/modules/voyages/release.actions.ts | Internal recipients and subscribed external emails. |
| src/modules/fleet/claim.actions.ts | Superadmins and claimant profiles. |
| src/modules/wheelhouse/card-actions.ts | Assigned/mentioned/commented messages filtered to active workspace members. |
| src/lib/fb/notify.ts, called by api/v1/feedback | Independent direct Resend plain-text notice to FEEDBACK_NOTIFY_TO. Intentional non-visual exception; do not wrap it merely to enforce D14. |
| src/lib/auth/magic-link.ts | Hosted Supabase signInWithOtp, reached by login, billing provision/start and onboarding invite flows. Versioned source supabase/templates/magic_link.html; supabase/config.toml declares the local content path and hosted mailer_templates_magic_link_content setting. Live hosted equality is unverified. This is separate from the similarly named renderer catalogue entry. |

Platform shell logo is https://platform.portlink.app/portlink-logo.png. Verify hosted bytes at release. No operational literal call was found for magic_link_sign_in or supplier_confirmation_requested outside renderer/types/catalogue/generated declarations in the worker's searched src and supabase scope; retain them in renderer coverage and do not claim absence of runtime use.

| Embark template | Caller and audience | Brand policy |
|---|---|---|
| SignupConfirm | api/signup to signup email | Company-owned; no operator brand. |
| AdminInvite | api/admin/invite-user and grant-login to invited admin/guide | Tenant brand, including staff mail. |
| BookingConfirmation | admin/create-booking, public/start-booking and payments webhook to booking contact | Tenant brand, company reply/BCC. |
| Cancellation | admin/cancel-departure to booking contact | Tenant brand, company reply/BCC. |
| Refund | admin/refund-booking to booking contact | Tenant brand, company reply/BCC. |
| ThankYouReview | admin/cron/email-review-requests to booking contact | Tenant brand. |
| GuideManifest | admin/cron/email-guide-manifests to guide email | Tenant brand and manifest PDF attachment. |
| InquiryNotification | public/contact action to company email, visitor replyTo | Tenant brand. |
| Test path | admin/send-test-email to authenticated gate email | Uses existing tenant context; do not invoke as verification without send authority. |
| Hosted recovery | Admin login resetPasswordForEmail | Hosted template not inspected; classify with existing owner before publication. |

Embark generated signup/invite links feed the custom React Email paths; generateLink itself does not establish hosted email rendering. Workspace-scoped brand loading remains unchanged.

| Additional output | Caller / consumption | Required boundary |
|---|---|---|
| Platform departure archive | departure-report-archive renders then uploads PDF | Existing historical exports are not regenerated by this task; new-output profile pin and archived artifact version must be distinguishable. |
| Platform offer-pack fonts | public/fonts/offer-pack/Newsreader16pt-Regular.ttf, Newsreader16pt-Italic.ttf, Newsreader72pt-Regular.ttf, InstrumentSans-Regular.ttf, InstrumentSans-Medium.ttf, InstrumentSans-SemiBold.ttf | Independent physical assets; explicit output-profile decision and rendered glyph/layout proof. |
| Platform social image | src/app/layout.tsx references public/opengraph-image.png | Static company asset, 1200 by 630; source and release ownership need confirmation before replacement. |
| Embark manifest PDF | api/admin/departure/[id]/manifest and email-guide-manifests cron | Workspace name, locale, time zone and house format; preserve departure-owner check. |
| Embark report PDF | api/admin/departure/[id]/report | Workspace brandName; preserve departure-owner check. |
| Embark QR PDF | api/admin/tour-review-qr | Brand logo/name from loadEmailBrand and workspace display settings. |
| Embark home/tour OG | public/opengraph-image.tsx and public/tours/[slug]/opengraph-image.tsx | Tenant identity and tour data; independent ImageResponse styling. Existing owner classifies family styling versus tenant presentation. |
| Embark supplied OG images | web/src/lib/metadata.ts | User-supplied storage images transformed to 1200 by 630; preserve customer content. |
| Embark admin icons | web/src/app/admin-icon/[variant]/route.tsx | Independent ImageResponse and uploaded-logo rendering; retain tenant asset. |

This is source caller-family coverage, not exhaustive branch execution. Live hosted configuration, tenant settings, asset bytes, historical exports and deployment destinations are still unmeasured. No product changes, messages, campaigns or hosted-template writes were performed.
