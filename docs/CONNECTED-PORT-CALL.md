# Connected port call

Updated: 21.09.2026. Assessment and implementation entry point for the ecosystem section. The parent entry point is LANDING-DIRECTION.md.

## Progress

- [x] Map the actual platform roles, request handoffs, amendments and finance close-out.
- [x] Compare three interaction approaches and preserve the approved diagram direction.
- [x] Implement the lifecycle and align the adjacent role copy.
- [x] Verify the served desktop and phone experience, keyboard controls and build guards.
- [x] Commit the verified changes with the implementation and evidence together.
- [x] Verify the published journey and adjacent selectors on portlink.app in the browser.

## Evidence and boundaries

The source assessed is ../portlink-platform at `6f5d4dec9`. Graphify supplied navigation hints; the files below supplied the product facts. The platform checkout is read-only in this task. The live site at https://platform.portlink.app showed its sign-in page, including the four participants: cruise lines, port agents, DMCs and vessels. An authenticated operational session was unavailable. No production request, acceptance, notification or finance mutation was performed. This is a source-grounded illustration, not a recording of a live transaction.

| Handoff | Actual implementation | Marketing implication |
|---|---|---|
| Participants | docs/PRODUCT_MODEL.md; src/components/shell/nav.ts, WORKSPACE_TYPE_TO_PERSONA | CL, PA, DMC and vessel are the operational workspaces. Port authority maps to reserved admin, not a port/terminal operations console. |
| Booking | src/modules/inbox/create.actions.ts:createPbr; inbox/actions.ts:acceptPbr | CL requests an agent. Acceptance creates a call or staffs an existing call via target_port_call_id. Never suggest a duplicate record per participant. |
| Shore request | inbox/actions.ts:acceptShoreRequest | Requires the same port_call_id and a DMC. Acceptance creates tour intake with quote_requested, not a confirmed excursion. |
| Preparation | src/modules/finance/actions.ts:sendPda, approvePda, rejectPda | Agent sends the estimate; the cruise line reviews it. Do not imply every party approves or sees every cost. |
| Handover | src/modules/port-calls/actions.ts:advancePortCallState; src/lib/notifications/handover.ts | Entering handover resolves notification recipients from the call owner and agent workspaces. It does not separately resolve the vessel-operator workspace. The source explicitly says the automatic T-72 sweep is future work. Do not market automatic timed handover or a guaranteed vessel notification. |
| Change | amendments/actions.ts:proposeAmendment, masterGate; classify.ts; lifecycle.ts | Channel opens at voyage_active. Changed berth/cross-day schedule is material. Same-day time changes can auto-apply. Vessel-side acknowledgement and a CL-owner approve/cascade exception exist. Do not claim all edits need a Master signature. |
| Close-out | finance/actions.ts:signDeparture, generateFda | Departure sections must be filled/confirmed and both report signatures present. A complete report permits a draft FDA, using actual amounts where supplied and estimates otherwise. Never claim payment or fully actualised costs happen automatically. |
| Visibility | lib/queries/workspace.ts; lib/queries/finance.ts; finance/actions.ts:setLineVisibility | Workspace membership, call participation and role visibility shape access. Shared context does not mean unrestricted visibility. |

Pure app code was executed with Node's type stripping. Output: sameDay=low_impact, changedBerth=material, crossDay=material, handoverChannel=false, activeChannel=true. The database and authenticated action paths were not executed.

## Decision and storyboard

Chose: six visitor-controlled handoffs in the existing navy relationship diagram. Over: role popovers (repeat the existing role selector); an automatic live-feed simulation (implies unverified synchronisation); a long static process diagram (does not show how the record changes). Because: it preserves the section David likes and makes the ownership and approval boundaries legible. Revisit-if: platform actions or operational participants change.

The six beats are agent confirmation, shore intake, estimate preparation, vessel handover, a material amendment, and departure close-out. Each selection changes the narrative, the central record and the involved participants together. A short, finite connection trace marks the selected handoff. No autoplay, timer, scroll lock, or fabricated live activity. Buttons allow direct selection, previous/next and restart. Mobile retains the same relationship, with vertical separation between corner nodes and the central record.

Refero remains the locked reference set in LANDING-DIRECTION.md: Operate for diagram construction, Attio for clear progression, Linear for product framing. Operate's style was retrieved again this session; a fresh dark-workflow search did not justify changing the approved palette or layout. These are structural references. The new transition is authored here, not claimed to reproduce observed reference motion.

## Blast radius and reversal

Measured imports: app/page.tsx is the only consumer of EcosystemSection and BentoSection. EcosystemSection.module.css is local to the diagram. Both sections will consume a shared participant registry so they cannot disagree about names. Bento's role state remains local and is still the page's only role selector. Its shared BentoGrid primitives remain unchanged. No backend, form, navigation, generated design-system or film lifecycle change is needed.

The fourth Bento role currently advertises a port/terminal console that the actual product does not provide. Align it with the vessel role as part of the same correction. General company copy may still name ports as customers for commissioned software, and the contact form may accept them; neither claims a built port-authority console.

Landmines: inherited inverted tokens swap in dark theme; source-only checks cannot prove node spacing; step content must fit at 320 px; the optimized server must stop before rebuilding to avoid stale chunks. Publication is complete, as recorded in LANDING-DIRECTION.md. Browser reduced-motion verification remains outstanding. Revert this task's commit to reverse the presentation change.

## Verification

Development browser pass: all six states at widths 1440, 900, 390 and 320. No page overflow and an 11 px text floor throughout. The 900 px two-column layout overlapped all four nodes with the centre record. Root correction: stack at 1000 px and apply the taller compact diagram through 600 px, covering the geometry between phone and desktop. All section paragraphs explicitly inherit the inverted section ink because the global paragraph rule otherwise overrides inheritance. Final optimized verification is recorded below.


Final optimized verification on 20.09.2026:

- `npm run build` and `npm run verify` exited 0. ESLint reported 0 errors and 10 existing warnings in unchanged files. The source dash guard includes the new `.ts` content registry. The scene and film built-output guards passed.
- The build initially stopped because the sandbox denied the tsx IPC pipe. The same required command succeeded with the approved external execution permission. Use that permission for this project's build/verify tools; do not skip the guards. The old preview process was stopped with the approved permission before the final build.
- Production preview restarted on loopback port 4320, exec session 78751. The existing private Tailscale URL served the final handover text and interactive component.
- Served all six steps at widths 1440, 900, 390 and 320. Each returned exactly one current step, matching narrative, `overlap: false`, and `overflow: false`. Intermediate breakpoint checks at 1001, 1000, 900, 601, 600 and 481 also returned no overlap or overflow after the correction.
- Restart, next and previous activated with Enter. Restart returned `01 Confirm`; previous was disabled at the beginning. Selecting any of the four Bento roles left the ecosystem on `01Confirm`, with no mobile overflow.
- Light-theme paragraph ink: `rgb(242, 245, 249)`. In dark theme the inverted section becomes light, with both section and paragraph ink `rgb(13, 20, 32)` on `rgb(242, 245, 249)`. Both themes were visually inspected.
- Desktop and phone compositions were visually reviewed. The phone diagram is 600 px tall to retain clear gaps around the centre record. The inherited typography guard passed; the development browser measured an 11 px minimum in this section.
- No new dependencies, network requests, timers or autoplay. Connection traces finish after 900 ms. Source CSS removes those animations under reduced motion. The previously rejected browser preference emulation was not retried; runtime reduced-motion verification remains outside this proof.
- The platform checkout remained clean. No customer records or messages were changed. Publication was blocked at this verification date; the subsequent publication and live verification are recorded below.

## Published verification, 21.09.2026

The later Innovasjon Norge task published the redesign with its own changes. This continuation found the checkout clean at `6091890`, matching `origin/main`, and verified the actual public page at https://portlink.app/#ecosystem. No second application deployment was needed.

- All six handoffs were exercised at widths 1440, 390 and 320. Every state returned `selected: 1`, `overlap: false` and `overflow: false`; the desktop narrative and central record matched each selected handoff.
- Enter on `Follow it again` returned `01 Confirm`, with the previous button disabled.
- All four role tabs worked at width 390, without changing the ecosystem's selected step or producing horizontal overflow.
- All seven product explorer tabs displayed their corresponding panels at width 390, with `overflow: false` throughout. The browser error log returned `[]`.
- Desktop and phone compositions were visually inspected. These were browser viewport checks on the Mac Studio, not physical remote-device tests. Runtime reduced-motion and authenticated platform transactions remain outside this verification.

Private review links, always presented separately:

- Mac Studio: https://nyxs-mac-studio.tail79b0ec.ts.net:4320/#ecosystem
- MacBook Pro: https://nyxs-mac-studio.tail79b0ec.ts.net:4320/#ecosystem
- iPhone 15: https://nyxs-mac-studio.tail79b0ec.ts.net:4320/#ecosystem
- iPhone 15 Pro Max: https://nyxs-mac-studio.tail79b0ec.ts.net:4320/#ecosystem

Tailscale status on 21.09.2026 reported the Mac Studio, MacBook Pro and iPhone 15 online; iPhone 15 Pro Max was offline. The Tailscale endpoint was exercised from the Mac Studio browser. Remote device hardware was not used.
