# Whole landing page review

Updated: 22.09.2026. Active work entry point for the full homepage assessment and improvements requested by David. Design direction remains in ../docs/LANDING-DIRECTION.md; product truth remains in ../docs/CONNECTED-PORT-CALL.md.

## Progress

- [x] Map the homepage, conversion journeys, shared components and references.
- [x] Reproduce the initial defects in the public browser across desktop, tablet and phone viewports.
- [x] Implement the registered improvements.
- [x] Run the required build guards and repeat the complete browser matrix.
- [ ] Publish, verify consumption on the public domain and close the register. **In progress.**

## Register

Keep every row and column when updating this table. A source inspection is not a browser pass.

| ID | Priority | Finding and evidence | Root correction and affected surfaces | Status |
|---|---|---|---|---|
| NAV-01 | P1 | At 390 px, /contact/ renders Open menu at width 0. Homepage menu stays expanded after Escape. Source has two implementations and mismatched burger classes. | One shared header for homepage, contact, team, privacy and Innovasjon Norge; Escape, focus return, outside dismissal and a scrollable short-screen disclosure. | Implemented and browser verified |
| LINK-01 | P1 | All four product links in the contact footer resolve to /contact/#… with no target. Homepage nav also intercepts native hashes. | Root-relative homepage fragments throughout the shared shell; preserve native navigation and the access anchor. | Implemented and browser verified |
| FORM-01 | P1 | After Continue at 390 px, focus is BODY and Your operation is at top -113.08139038085938. | Focus and reveal the new step heading after its transition; focus invalid email and expose aria-invalid. Shared pilot/build form. Keep mail and validation contracts unchanged. | Implemented and browser verified |
| FILM-01 | P1 | At 844 × 390 the film is 204 × 115 inside a 1708 px hero. | Short viewports use naturally scrolling full-width stages and native playback controls. Keep pinned storytelling on taller screens and the existing poster-first motion guard. | Implemented and browser verified |
| TOUCH-01 | P2 | Theme button is 36 × 36; hamburger 32 × 32; role tabs 40 px tall; phone pause width 41. Hero action copy is 11 px. | Minimum 44 px controls and larger action text in their owning components. | Implemented and browser verified |
| ROLE-01 | P2 | Role tabs have neither panel relationships nor arrow-key handling. Bento grid makes responsive decisions after hydration in each card. | One labelled panel, roving focus and arrow/Home/End keys; CSS grid owns breakpoints before hydration. | Implemented; arrows, End, focus and all roles verified at 320 px; two-column tablet layout verified |
| RHYTHM-01 | P2 | At 390 px the homepage is 15215 px tall. Pain alone is 1349 px, team proof 1140 px. Repeated boxes and centred biographies delay the conversion paths. | Three focused problem-to-product disclosures, compact mobile team rows and paired footer link columns. Preserve actual team facts and equal-weight engagement paths. | Implemented and browser verified |
| MOTION-01 | P2 | Form and Bento transitions do not consult reduced motion; .reveal hides content without JavaScript. | Native Framer Motion preference handling at the page boundary and a no-script reveal fallback. Film retains its own stricter no-download contract. | Implemented; source/build guards pass. OS reduced-motion runtime remains unverified |
| FIT-01 | P2 | Voyage grid has a 300 px minimum inside a 288 px content area at width 320. | Intrinsic grid minimum bounded by the available width. Check every visible descendant, not only page scrollWidth. | Verified: at 320 px both figures span x=16 to x=304 |
| COPY-01 | P2 | Footer omits the vessel role and labels LinkedIn as Blog; contact lede claims two questions while asking more. | Accurate destination labels and concise existing-claim copy. Deterministic Norwegian numeric formatting in the authored role examples. | Implemented and browser verified |

| SKIP-01 | P2 | Built route check found the root skip link had no main target on the campaign pages. | One main landmark around children in SeatradeShell, shared by five routes. No form/data changes. | Fixed; static routes rendered and the build guard passes |
| HEADING-01 | P2 | /team/ rendered no h1. TeamSection has one consumer, the team route. | Promote its existing title to h1; require one h1 per rendered page in the build guard. | Verified on the final optimized preview: one h1 and one main, title The people building Portlink |

## Decision and reference lock

Chose: refine the existing maritime workbench, repair the shared interaction paths and compress repetitive supporting content. Over: spacing-only compression (retains repetition and harms readability); a new immersive visual identity (discards the approved diagram and real product films). Because: the existing product evidence and six-step connected-call sequence are strong; the measured failures concern navigation, progression, small screens and supporting rhythm. Revisit-if: user research changes the two main commercial journeys.

Refero styles retrieved again: Attio `9f0c028b-6b11-415e-ab92-f32e4597cbe2` owns hierarchy, framed evidence and visible chapter controls; Linear `554b801c-3b31-4086-a7e5-ae613cdd618b` contributes compact product composition only; Operate `a0f473eb-0310-4df5-b5f6-5bc124ad5954` contributes fine rules and a technical ledger rhythm. Retain Portlink's Mist + Navy tokens, Plus Jakarta Sans, real films and authored UI. Do not import reference palettes, fonts, neon buttons or decorative imagery. Magic MCP is unavailable in this session's complete tool inventory.

Storyboard: readable opening actions; pinned voyage on tall screens and unpinned media on short screens; three expandable operational problems with direct links to product chapters; existing explorer and connected-call sequence; keyboard-complete role panel; compact named team evidence; the existing pilot/build choices; form progression that keeps the new question in view. Motion follows visitor actions and preferences. No new autoplay sequence, fake customer proof or new commercial promises.

## Baseline evidence

Public https://portlink.app was rendered from the same application sources as local `0f81fd037378d60a0293971493e93af99373e396`. The only local commit ahead of origin was this task's earlier documentation commit `0f81fd0`, not unpublished application work.

| Viewport | Document height | Horizontal document overflow | Film width × height |
|---|---:|---|---|
| 1440 × 1000 | 11870 | false | 1100 × 619 |
| 1024 × 768 | 10847 | false | 876 × 493 |
| 768 × 1024 | 12613 | false | 720 × 405 |
| 390 × 844 | 15215 | false | 358 × 477 |
| 320 × 740 | 16026 | false | 288 × 384 |
| 844 × 390 | 10570 | false | 204 × 115 |

Document overflow alone is insufficient: an inner grid or clipped media can still fail. Final checks also measure descendants, control geometry, focus and component state.

## Boundaries and reversal

Shared header and footer reach five marketing routes. TeamProofSection reaches homepage and contact. ContactForm reaches homepage pilot and contact build enquiry. BentoGrid is consumed only by BentoSection. FilmHero and its local styles reach the homepage only; useFilm is shared with InViewVideo. All existing chapter fragments and #access survive. Generated app/_ds files, mail sending, eligibility, API routes, campaign data and Innovasjon Norge content are outside the change. The rendered-link gate expanded the semantic correction to SeatradeShell (five routes); only its main landmark changed. TeamSection is used only by /team/ and now owns that route’s h1.

Use a local development server for interactive verification, then stop the optimized preview before rebuilding it. Revert this task's implementation commit to reverse the changes. No records, customer messages, secrets, DNS or hosting routes need mutation. No production form submission is part of verification.

## Verification limits

Screenshots and DOM measurements come from the supported CUA browser. Physical iOS, macOS Safari and remote device hardware are not yet exercised. No numerical accessibility certification or inflated overall design score is claimed. Runtime reduced-motion emulation was rejected in an earlier task; do not silently turn a source guard into a claimed browser result.


## Verified implementation evidence

The optimized private preview was rendered through https://nyxs-mac-studio.tail79b0ec.ts.net:4320/. Viewport assertions compare requested and actual document dimensions before accepting each result.

| Viewport | Before document height | After document height | Horizontal overflow | After film width × height |
|---|---:|---:|---|---|
| 1440 × 1000 | 11870 | 11793 | false | 1100 × 618.75 |
| 1024 × 768 | 10847 | 10756 | false | 876.453125 × 493 |
| 768 × 1024 | 12613 | 12049 | false | 720 × 405 |
| 390 × 844 | 15215 | 14222 | false | 358 × 477.328125 |
| 320 × 740 | 16026 | 14673 | false | 288 × 384 |
| 844 × 390 | 10570 | 10238 | false | 796 × 447.75 |

Measurements are captured browser CSS pixels, retained without rounding in the film comparison. Fonts had settled for the accepted matrix. At 390 px, the problem section is 857 px and the team strip is 901 px, against 1349 and 1140 before. At 320 px all seven explorer chapters, four roles and six connected-call handoffs were exercised. No visible chapter or role descendant crossed the viewport bounds. Each explorer selection leaves exactly one visible panel.

Keyboard: Escape closes the menu and returns focus to Open menu. Role ArrowRight selects and focuses role-tab-agent, End selects and focuses role-tab-vessel; exactly one role tab is in the Tab sequence and the panel label follows selection. The landscape menu spans y=63 to y=389 with overflow-y:auto and scrollHeight 368. Header remains at y=0 after section navigation. All measured header buttons, role tabs and film pause controls meet 44 px in both dimensions.

Forms: no final submission was sent. Pilot Continue focuses Your operation at y=88.421875. Build Continue focuses What do you need built? at y=88.09375. Back focuses What can we help with? at y=88.09375 and preserves the entered name/company. A free-email test focuses the email field, sets aria-invalid=true and presents the existing validation message. Leaving the route clears the temporary local test details.

Routes: /contact/, /team/, /privacy/, /innovasjon-norge/ and the static Seatrade routes render without horizontal overflow at 390 px. Shared marketing menu controls measure 44 px. Footer Roles on /contact/ navigates to /#roles. Browser error log inspection returned an empty list. All loaded images have non-zero intrinsic width. Campaign API data is not configured in the local Next runtime; its public data service remains outside this presentation test.

Build and verification: npm run verify passed with 0 errors and 8 existing image-element warnings. npm run build passed its scene, film and rendered-link checks. The new rendered gate checks 85 fragment links across 8 routes and rejects a fixture reproducing /contact/#access. It also requires exactly one h1 per prerendered page. The existing mail-boundary fixture confirms no message reaches the network.

Visual comparison: the revised problem section uses the Refero reference’s fine rules and clear hierarchy, with operational content and direct product destinations; the tablet role section keeps substantial product previews in two equal columns. Existing motion and the spatial shared-call diagram remain the signature sequence. Dark-mode phone team evidence is readable, compact and uses the original facts and photographs. No 3D, new illustration or sound was added because those would displace the actual product evidence in this scoped refinement.

## Remaining coverage, not claimed passes

Physical iOS/Safari and remote device browsers were not exercised. The runtime OS reduced-motion setting remains unverified; source gating, poster-only server output and MotionConfig preference handling are verified. Axe was not run through this browser interface, so there is no automated accessibility certification or numerical score. Screenshots at key compositions are in the task’s CUA outputs; no fabricated on-disk screenshot corpus is claimed. Broader device-lab certification is a separate revisit trigger, not an unimplemented registered correction.
