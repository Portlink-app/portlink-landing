# One Harbour: umbrella page direction, scroll script and execution plan

18.11.2026. Authored by Fable 5.2 on David's brief (event 22707ce6, with additions dc0eae0c, 80aec9d7, 28423d13). Keel builds, Tiller owns the shared design pieces, Starboard accepts. This is a new page beside portlink.app. It edits nothing on the existing landing page.

## Positioning & Idea (1. Verdict)

**One Harbour.** One cruise call into one Greenland harbour, followed by scroll from the planner's desk to the guide's phone, where every room the camera enters ends on the real screen that person works in.

Idea sentence: on this page, the route line the planner draws becomes the camera path the visitor scrolls along. Competitor test: a port cost system or a booking tool cannot make this sentence true, because only Portlink has a real product screen at each stop.

The one live thing: the thread map. It is always on screen, shows where you are in the harbour, and jumps you to your own desk in one click.

## 2. Chose / Over / Because / Revisit-if

Scores are my judgement of visitor outcome (1 to 5), not measurements.

| Direction | Gets it in 10 s | Keeps context | Product legible | Phone | Credible | Reaches own role | Sum |
|---|---|---|---|---|---|---|---|
| (a) Full AI-video scrubbed film | 3 | 2 | 2 | 2 | 3 | 2 | 14 |
| (b) Real-time 3D fjord (three.js) | 3 | 5 | 3 | 2 | 2 | 5 | 20 |
| **(c) Hybrid: layered harbour plate, AI-video dives, real captures** | 4 | 5 | 5 | 4 | 4 | 5 | **27** |
| (d) Real drone footage of Ilulissat | 4 | 3 | 4 | 4 | 5 | 4 | 24 |

**Chose:** (c). The harbour is one generated still, cut into depth layers and moved in real time. Generated video is used only for seven short dives through a window or door. Every claim sits on a real capture.

**Over:** (a), (b) and (d).

**Because (the honest technical reason):**
- Generated video is a fixed strip of frames. It cannot reframe for a phone, cannot guarantee that two clips show the same harbour, cannot hold legible UI, and cannot jump to a role without a long seek. Scrubbing it needs every frame stored as an intra frame, so weight grows with every second.
- Real time can do all of that, but a photoreal Greenland in three.js at web budgets reads as a game demo.
- So each tool does only what the other cannot. The layered plate carries geography, continuity and role jumps. Video carries the moments parallax cannot fake. Each dive is conditioned on a frame exported from the plate, so its geometry matches.
- Each dive plays forward on the way in and reversed on the way out. That halves the clip count and makes "zoom in and out" literal.
- (d) is the most credible, but no footage exists and it cannot be shot now. It stays as the upgrade path, since plate and clips are swappable slots.

**Revisit-if:** the one-dive slice (gate G5) fails the continuity check twice, real Ilulissat footage becomes available, or the founders decline the spend.

### Resolving the locked 09.2026 direction

`docs/LANDING-DIRECTION.md` rejected "an immersive 3D ship spectacle, which demonstrates little about the software and replaces the real product evidence". This direction keeps that judgement and binds the spectacle to four testable rules:

1. Every pinned stop ends on a real capture covering at least 55 % of the viewport, held for at least 0,7 screens.
2. The Atlantic crossing runs on the product's own chart (a real capture), not on generated ocean.
3. Generated footage is never on screen for more than 1,4 screens without a real product surface.
4. The reduced-motion page (stills, captures, full copy) makes every claim on its own. It is the server markup. The film is only its camera.

## 3. The world

One place, lit by low summer sun. The page labels it as an illustrated West Greenland harbour (see Q2 on naming).

| Anchor | Place | Role | Product |
|---|---|---|---|
| HQ | Cruise line office, far away, off the map edge | Itinerary planner, port ops | Portlink platform |
| A1 | Cruise ship at anchor in the bay, two tenders | Vessel, nav team | Portlink platform |
| A2 | Grey two-storey office, east end of the quay | Port agent | Portlink platform |
| A3 | Yellow timber office, centre of the quay | DMC | Portlink platform |
| A4 | Red hut with a jetty, west shore | Tour operator | Embark |
| A5 | Open tour boat among icebergs at the fjord mouth | Guide | Embark field mode |

**How context is kept:**
- **The ship is the carried subject.** It is drawn as a route on the planner's screen, crosses on the chart, anchors in the bay, and leaves at the end. It is a separate sprite, so it is always where the story says.
- **The thread.** A 2 px Low sun line starts on the last waypoint of the route in the hero capture, leaves through the HQ window, becomes the route, then links ship, agent and DMC. It draws as you scroll and never resets.
- **The thread map.** A schematic of the same harbour, drawn in code from the plate, with HQ as a node on the left edge joined by a dashed route. Current stop pulses, visited stops are filled, and each node is a button.
- **Two threads, honestly.** The Portlink thread ends at the DMC. Embark has its own thread (hut, jetty, boat). The camera walks between them along the quay. No data link between the two products is drawn or claimed (Q6).
- **Lit windows.** A role active on the call has a lit window. At the final pull-back all windows are lit, with copy stating that each role sees only its part.

## Storyboard & Motion Spine (4. Scroll script; Lenis and GSAP wiring in section 7)

Ranges are in screens (1,0 = one viewport height). Total 23,2 screens on desktop, about 16 on phone. One sticky stage of 100svh sits inside a tall track. Nothing is pinned by spacer.

**Stop grammar, used by S6 to S10 (2,0 screens each):** travel along the thread on the plate (0,5), dive in with the clip forward (0,4), hold on the real capture (0,7), dive out with the clip reversed (0,4). During the hold the capture lifts off the monitor to at least 55 % of the viewport. Three short paragraphs step in beside it: Today, With Portlink, On screen.

**Fallback grammar, unless a shot says otherwise:**
- Reduced motion: a normal section in document flow, with the interior still on one side, the capture on the other, and the same three paragraphs. No sequence file is requested.
- Phone (390x844): the plate reframes in portrait, a dive becomes a three-still scrubbed zoom (outside, threshold, inside), and the capture is the 390x844 product capture at near full width.

Claim status tags used below:
- **[C]** documented in `docs/CONNECTED-PORT-CALL.md`.
- **[T-shown]** shown or stated as existing by a founder in the pilot session. Verify in the capture.
- **[T-ask]** requested by the port-ops voice. Pilot work only, never present tense.
- **[E]** Embark facts from the brief.

**S0. Hero: the planner's desk** · 0,0 to 1,0 · Itinerary planner · Portlink platform
- Camera: static. Still K6 (desk, planner from behind), with capture P1 composited on the monitor at 45 % of the viewport or more.
- Copy: H1 "One port call. Every desk." Line: "Follow one cruise call from the planner's screen to the guide's phone, on the real screens each role works in." Buttons: "Follow the call" and "Book a working session".
- Out: scroll lifts P1 off the monitor to full frame.
- Fallbacks: this frame is the reduced-motion hero. Phone: H1 above, P1 phone capture below, K6 as a dimmed field.

**S1. The plan the bridge can load** · 1,0 to 2,6 · Itinerary planner · Portlink platform
- Camera: none. P1 holds large, with crops P2 then P3 replacing the right third.
- Pain today:
  - Planners "still stuck in Google Earth" (T:8).
  - Separate weather research for every new region (T:62).
  - The voyage order arrives three weeks before, against an itinerary planned two years earlier, causing retrospective changes (T:23).
- Portlink changes:
  - Routes follow chart markings and are trained on AIS tracks of passenger ships [T-shown, T:2, T:62].
  - Typical wind, waves and sea temperature for the planned dates [T-shown, T:62].
  - RTZ, GPX and CSV in and out, so the plan loads into the ECDIS [T-shown, T:14 to T:23].
  - Stated limit, on the page: planning software, not navigation. The nav officer still audits the track (T:32, T:38).
- Proof: P1, P2, P3.
- Copy: H "The plan the bridge can load." Line: "Draw the route on charts made for planning, check typical conditions for your dates, export RTZ for the ECDIS."
- Out: P1 shrinks back onto the monitor. The thread lights on the route's last waypoint.

**S2. Out through the window** · 2,6 to 3,6 · transition
- Camera: clip C1, pulling back from the monitor past the planner and out through the glass facade. The thread holds its screen position.
- Copy: none.
- Out: the exterior fades to a navy field and chart P4 scales in from the window position.
- Fallbacks: reduced motion omits the shot. Phone: two-still crossfade.

**S3. The crossing** · 3,6 to 6,0 · Cruise line port ops and cost forecasting · Portlink platform
- Camera: slow pan along the real chart capture P4, following the route. The ship marker travels the line. A mono counter shows distance run, read from the demo voyage's own figures.
- Pain today:
  - Forecast against actual on fixed port costs is the number port ops cannot close (T:128).
  - Agent PDAs arrive late and are prepared under sheer volume (T:122 to T:128, T:140).
  - Ports publish tariffs after the budget deadline, so planners argue for an inflation caveat (T:134).
  - Weekend and overtime windows move mooring, pilotage and towage (T:122, T:197).
  - En-route pilotage and immigration get left out and explained later (T:307).
  - The incumbent named in the session is MXP: import errors, slow paid support, hard ticketing (T:164, T:170, T:235).
- Portlink changes:
  - Fuel sits on the voyage from distance and speed, with rates you can override [T-shown, T:77].
  - Port costs join when the agent's estimate lands on the same call [T-shown, T:83; C].
  - Pilot work, worded as such: timestamped quotations and the lag between a tariff's publication and its arrival in the system as a published measure [T-ask, T:208].
- Proof: P4, P5.
- Copy: H "The cost is already moving." Line: "Fuel is on the voyage from the first waypoint. Port costs join it when the agent's estimate lands on the same call."
- Out: the chart zooms to the ship marker at the satellite layer and matches still K12.
- Fallbacks: reduced motion shows static P4 with the route and P5 beside it. Phone: P4 cropped tall, counter under the headline.

**S4. Into the fjord** · 6,0 to 7,2 · transition
- Camera: clip C2. Top-down over the ship, descend and tilt up to reveal the fjord, ending on the plate's wide view with the ship at the bay entrance.
- Copy: none.
- Out: the last frame is the plate. Real time takes over invisibly.

**S5. Arrival** · 7,2 to 8,2 · all roles
- Camera: real-time drift on the plate. The ship sprite moves to anchor, tenders leave, the thread map docks bottom left, and three windows light in turn.
- Copy: H "Anchored. Now it gets busy." Line: "One ship in the bay, four teams ashore and on board, one call record between them."
- Out: the thread runs from the ship to A2.

**S6. Port agent** · 8,2 to 10,2 · Portlink platform
- Camera: stop grammar, clip C3 through a first-floor window to the agent's desk.
- Pain today:
  - The volume of PDA requests, often prepared at entry level and chased by automated reminders (T:128, T:140).
  - Fees re-supplied call after call (T:128).
  - The standing suspicion that agents mark up (T:152, T:155).
- Portlink changes:
  - The cruise line requests an agent. Accepting creates or staffs the one call, never a duplicate [C].
  - The agent sends the estimate on that record and the cruise line reviews it there [C].
  - Not every party sees every cost line [C].
- Proof: P6, then crop P7.
- Copy: H "One request. One estimate." Line: "Accept the call, send the PDA on the shared record, and see the cruise line's review there."
- Out: C3 reversed to the quay. The thread runs to A3.

**S7. DMC** · 10,2 to 12,2 · Portlink platform
- Camera: stop grammar, clip C4 into the yellow building.
- Pain today: every cruise client sends a different format (Excel, PDF, email), so the day goes to data entry, not review (T:289). This is the only DMC pain in the transcript. A DMC session is needed before final copy (T:161, T:194).
- Portlink changes: a shore request arrives on the call it belongs to as tour intake marked "Quote requested". It is not a confirmed excursion [C].
- Proof: P8, with the status visible.
- Copy: H "The request lands as intake." Line: "A shore request arrives on its call, marked quote requested. Nothing reads as confirmed until you confirm it."
- Out: C4 reversed. The Portlink thread ends here. The camera follows a tender west across the water with no thread drawn.

**S8. Tour operator's hut** · 12,2 to 14,4 · Embark
- Camera: 0,7 of travel across the harbour, then clip C5 through the hut door to a laptop on a wooden counter.
- Pain today: none sourced. The transcript has no tour operator voice. Do not write one. Source it from the Ilulissat Tours deployment before final copy.
- Embark changes: departures, guide assignment, bookings, payments and a booking widget in one back office for small operators [E].
- Proof: P9.
- Copy: H "Tomorrow's departures, staffed." Line: "Embark runs departures, guides, bookings and payments for small tour operators. First deployment: Greenland."
- Out: C5 reversed to the door, then a real-time pan to the jetty. The Embark thread starts.

**S9. On tour** · 14,4 to 16,2 · Guide · Embark field mode
- Camera: clip C6. Low flight from the jetty between icebergs, catching an open boat and settling over the guide's shoulder on the phone.
- Proof: P10 (390x844), composited on the phone, then lifted to full height.
- Copy: H "The tour, in the guide's hand." Line: "Embark field mode is the guide's phone view on tour. This is the real screen."
- Out: P10 shrinks back to the phone.
- Fallbacks: on phone, P10 fills the visitor's own screen at 1:1. That is the strongest frame on the page.

**S10. The bridge** · 16,2 to 18,0 · Vessel, nav team · Portlink platform
- Camera: clip C7. Lift from the phone, cross to the anchored ship, up the hull and through the bridge window to a console monitor.
- Pain today:
  - Late voyage orders against old plans (T:23).
  - Lessons from the last call at the same port are saved nowhere (T:274).
  - Routes are re-keyed on board (T:20).
- Portlink changes:
  - The call is handed over to the vessel [C].
  - Once the voyage is active, a changed berth or a cross-day change is a material amendment with vessel-side acknowledgement. A same-day time change can apply directly [C].
  - Never claimed: timed automatic handover, guaranteed vessel notification.
- Proof: P11, an amendment with a changed berth marked material.
- Copy: H "A berth change is never small." Line: "On the call record a changed berth is a material amendment. A same-day time shift is treated differently."
- Out: C7's last 30 % reversed, out of the bridge window, then a short dissolve to the plate at A1. This is the page's only dissolve.

**S11. Departure** · 18,0 to 19,2 · Port ops and port agent · Portlink platform
- Camera: real time. Tenders return, the ship weighs anchor and moves to the fjord mouth. P12 sits at 55 % on the right.
- Pain today:
  - Reconciling estimate against actual by hand (T:155).
  - Finding what drove a variance after berth changes (T:283).
- Portlink changes: with the departure report complete and signed by both sides, a draft FDA is generated, using actual amounts where supplied and estimates otherwise [C]. Never claimed: automatic payment, fully actualised costs.
- Proof: P12.
- Copy: H "Estimate and actual, one record." Line: "The agent's estimate and the draft FDA sit on the same call, not in two spreadsheets."

**S12. The whole harbour** · 19,2 to 20,4 · all roles
- Camera: real-time pull back to the wide plate. Both threads complete, all windows lit, thread map fully filled.
- Copy: H "One call. Each role, its part." Line: "Shared context is not shared everything. Each workspace sees what its role on the call allows."
- Out: the plate scales down into the top of a Mist field.

**S13. Three products** · 20,4 to 21,8 · normal flow on Mist
- Layout: the plate, small, with three regions named on it. It is not a card row.
  - Portlink: HQ, ship, agent, DMC. One sentence, crop of P1.
  - Embark: hut and boat. One sentence, crop of P9.
  - Wheelhouse: a named node with a link and no claims (Q5).
- Copy: H "Three products, one company."

**S14. Working session** · 21,8 to 23,2 · normal flow
- Left: the offer, worded per role (section 9). Right: the existing `ContactForm` with `intent="pilot"`, unedited.
- Copy: H "Bring one port to a session." Line: "We block the time, open your port on screen and work through it with you."
- The footer closes with the wordmark at full width.

## 5. Asset list

### Real captures

All from one seeded demo call: same vessel, port and dates in every workspace, labelled as demo data. Each at 1440x900 and 390x844, 2x, via `capture.mjs`.

Shipped set (20.11.2026): P1, P3, P4, P5, P6, P8, P12 recaptured from a production build of platform `main` at `b4e545cd` with the merged #3230 seed (`demo_harbour_ilulissat.sql`), render clock pinned to 18.11.2026 kl. 15.25 UTC. Desktop: P1, P3, P4, P5, P6, P8, P9, P12. Phone: P1, P5, P6, P8, P9, P12. P9 is Embark (separate database), not recaptured. P2, P7, P10, P11 have no clean capture and stay removed.

| ID | Screen | Used in |
|---|---|---|
| P1 | Voyage planning: map, route, waypoint list | S0, S1, S13 |
| P2 | Crop: typical conditions for the planned dates | S1 |
| P3 | Crop: import and export menu (RTZ, GPX, CSV) | S1 |
| P4 | Voyage map, satellite layer, whole route, stitched to 4320 px wide | S3 |
| P5 | Voyage costs: fuel and port cost | S3 |
| P6 | Agent workspace: accepted request, estimate sent | S6 |
| P7 | Crop: cruise line review of the estimate | S6 |
| P8 | DMC tour intake, "Quote requested" | S7 |
| P9 | Embark: departures with guide assignment | S8, S13 |
| P10 | Embark field mode, 390x844 only | S9 |
| P11 | Amendment with changed berth marked material | S10 |
| P12 | Departure close-out with draft FDA | S11 |

### Generated stills

| ID | Still |
|---|---|
| K0 | Master harbour plate, 21:9, upscaled to 8192 px, cut into six layers: sky, far ice and mountains, water, quay and buildings, foreground rock, plus sprites |
| K1 to K4 | Close tiles of agent office, DMC office, hut door, and hut jetty looking to sea. Each is img2img from the K0 crop at its camera anchor |
| K2s | Ship close tile at A1 |
| K5 | HQ exterior from outside the window |
| K6 to K9 | Interiors: HQ desk, agent desk, DMC desk, hut counter |
| K10 | Over the shoulder of a guide holding a phone in an open boat |
| K11 | Bridge console with a monitor |
| K12 | Top-down open sea with ship and wake |
| Sprites | Ship side-on, two tenders, tour boat, as isolated cut-outs |

**Style block, prepend to every prompt:**

> Photoreal documentary look, West Greenland coastal town in summer, low golden sun from camera left, clear cold air, long shadows, deep navy water with drifting icebergs, painted timber buildings, natural colour grade. No text, no lettering, no logos, no watermark, no lens flare. People only from behind or over the shoulder, never facing camera. Any monitor, laptop or phone shows a flat, evenly lit light-grey panel with no content.

**K0:**

> Wide establishing still from a hillside about 60 m up, looking north-west across a small Arctic harbour. A stone quay runs left to right in the midground. A grey two-storey office stands at its east end, a yellow timber office at its centre. A small red hut with a jetty sits on the west shore. A mid-size white cruise ship lies at anchor centre-right, with two orange tenders between ship and quay. Icebergs at the fjord mouth, an ice-filled fjord beyond, bare rock foreground. 35 mm, deep focus, horizon on the upper third, 21:9.

**Interior template (K6 to K9, K11):**

> Interior of [room], a desk with one large monitor centred in frame and square to camera, filling one third of the frame width. One person seated at left, seen from behind. A window at right shows [the harbour or a city]. 28 mm, eye level, soft daylight plus low sun through the window, 16:9.

### Generated clips

Seven clips, eight if C7 has to split. All are image-to-video with first-frame and last-frame conditioning, 16:9, 1080p, 24 fps, subject in the centre third. Every prompt ends: "One continuous move, no cuts. Camera comes to a complete stop for the final second. First frame equals the start image, last frame equals the end image."

| ID | Shot | Start, end | Length | Prompt body |
|---|---|---|---|---|
| C1 | S2 | K6, K5 | 6 s | Slow dolly backward from the monitor, past the seated planner's shoulder, across an open office floor and out through the glass facade, ending outside looking back at the building. 24 mm. |
| C2 | S4 | K12, K0 crop with ship at bay entrance | 8 s | Aerial. Begin looking straight down on a white cruise ship and its wake from 300 m. Descend and tilt up to the horizon while moving forward, revealing an ice-filled fjord and a small harbour. The ship stays in frame. 24 mm. |
| C3 | S6 | K1, K7 | 5 s | Push in toward a first-floor window of the grey office, pass through the glass, glide across the room and settle square on the desk monitor. 28 mm. |
| C4 | S7 | K2, K8 | 5 s | Push in toward the yellow timber office, through its window, past a wall map without lettering, and settle square on the desk monitor. 28 mm. |
| C5 | S8 | K3, K9 | 5 s | Push through the open door of the small red hut, past hanging drysuits, and settle square on a laptop on a wooden counter. 28 mm. |
| C6 | S9 | K4, K10 | 6 s | Low flight from the jetty out across calm water between icebergs. Catch up with a small open tour boat and come over the guide's shoulder to settle on the phone held upright in a gloved hand. 35 mm. |
| C7 | S10 | K10, K11 | 8 s | Lift from the phone, rise above the boat, fly to the anchored cruise ship, climb the hull and pass through a bridge window to settle square on the console monitor. 24 mm. |

**Chaining rules:**
- Start images are exported from the live plate at the exact camera anchor, so frame 0 equals what the visitor already sees.
- At encode, frame 0 is replaced by that export and blended over the next four frames.
- Models honour the end frame only loosely. So the clip's own last frame becomes the interior still, and the monitor quad is measured on it.
- The capture appears only once the camera has stopped. There is no per-frame screen tracking in v1.
- Grade every clip to the plate at encode.

### Making the clips scrubbable

Default is a WebP image sequence drawn to a 2D canvas, desktop only:

```
ffmpeg -i C3.mp4 -vf "fps=12,scale=1440:-2:flags=lanczos" -c:v libwebp -quality 68 seq/c3/%03d.webp
```

- 60 frames for a 5 s clip, at most 72 for the long ones.
- Load order: first, last, every eighth, every fourth, then the rest. Scrubbing works at once and refines.
- Keep compressed blobs in memory and decode a window of 12 frames around the playhead. Never hold a whole clip decoded: at 1440x810 that is roughly 280 MB per clip.
- Fetch a sequence only when its stop is within 1,5 screens.

Alternative for the bake-off in WP2 is all-intra H.264 with seek-on-seeked:

```
ffmpeg -i C3.mp4 -vf "scale=1440:-2" -c:v libx264 -crf 24 -g 1 -pix_fmt yuv420p -movflags +faststart -an c3-intra.mp4
```

Ordinary long-GOP video is ruled out, because the dives play reversed.

### Clip count and cost, for the founders

- Kept: 7 to 8 clips, about 14 stills, 4 sprites.
- Expected takes: 5 to 8 per kept clip (35 to 64 generations of 5 to 8 s), and 150 to 300 still generations plus upscales.
- **Estimate, not a quote: USD 60 to 250, roughly 700 to 2 800 kr. Recommended ceiling to approve: 5 000 kr, one-off.**
- This is from list prices I knew up to mid 2026. Live prices and the FX rate were not measured, because web access was denied in this session. WP0 measures both before anyone pays.
- Higgsfield is David's named tool. The technical requirement is any model with first and last frame conditioning at 1080p.
- No spend is at risk before gate G1. The scrub engine is proven first on an existing landing clip.

## Visual System (6)

**Palette** (existing tokens, plus one accent):

| Role | Value | Use |
|---|---|---|
| Navy field | `#0a2342` | Stage ground, hold backgrounds |
| Mist | `#f2f5f9` (`--ds-canvas`) | Editorial sections S13, S14 |
| Ink | `#0d1420` on Mist, `#f2f5f9` on Navy | All running text |
| Primary | `#1e3a5f` (`--ds-primary`) | Buttons on Mist |
| **Low sun** | `#f5b53d` | The thread, lit windows, current map node, primary button on Navy with Navy ink |

Low sun is taken from the footage itself: the sun line on ice and the lit windows. Hand-computed contrast on Navy is about 8,7:1, to be re-measured by `inspect.mjs`. It is never used as text on Mist. No gradients: flat fields, plus one neutral scrim under text on footage.

**Type:** Plus Jakarta Sans throughout, sentence case, one weight for display (700).

| Step | Size | Leading, tracking |
|---|---|---|
| Display (H1) | `clamp(4.5rem, 8.4vw, 9.375rem)` | 0,92, -0,035em |
| Heading (H2) | `clamp(2.5rem, 4.6vw, 4.5rem)` | 1,0, -0,03em |
| Statement | 28 to 36 px (24 on phone) | 1,2 |
| Body | 18 px | 1,5 |
| Telemetry | JetBrains Mono 13 px | 1,3 |

Every heading is 32 characters or fewer and two lines at most at 1440, 1280, 768 and 390.

**Labels and persistent UI:**
- No eyebrows, no index numbers. Order is shown by position on the thread map.
- **Telemetry strip** (bottom right, mono): echoes the record status visible in the current capture, for example "Intake: quote requested" or "FDA: draft", plus distance run in S3. It only shows values present in the captures.
- **Thread map:** bottom left on desktop, 232x132, solid Navy surface one tone up, no blur. On phone it is a 44 px thread bar under the nav with six tappable nodes.
- **Role switch** in the nav: "I work at a cruise line, port agent, DMC, tour operator, on board". It scrolls to that stop and sets the CTA wording.
- **Nav:** wordmark, Portlink, Embark, Wheelhouse, one rectangular button (6 px radius).
- **Captures** sit frameless with a 10 px radius: no browser chrome, no window dots.

**Waivers:**
- `signature-ok: mono https://unitedcarriers.com real voyage telemetry (record status, distance run) in the brand mono`
- `signature-ok: hairline https://unitedcarriers.com the thread and map strokes encode the route and coastline, not decoration`

**The bar:**
- unitedcarriers.com (measured by the brief, 18.11.2026).
- Apple product pages for canvas sequence scrubbing, and seasats.com for maritime telemetry. Both are still to be torn down in WP1. I did not inspect them.
- Three axes moved away from the reference: the subject lands on real software (not a cut-out object), the type is brand sentence case (not condensed capitals), and persistent wayfinding is added.

## 7. Build and execution plan

**Where it lives:**
- Branch `feat/umbrella-harbour` in `portlink-landing`, worktree under `_workspaces/portlink-landing/`.
- Route `app/harbour/page.tsx` with `robots: { index: false }`, absent from `sitemap.ts`.
- Components in `components/harbour/`, media in `public/media/harbour-2026-11/`.
- One additive `netlify.toml` header block for `/media/*` (immutable). No `/media` folder exists today.
- Shown through the PR's deploy preview and Tailscale. Nothing reaches `main` before the founders decide (Q7).
- This document is committed as `DIRECTION.md` at the repo root. `docs/LANDING-DIRECTION.md` stays untouched.

**Components:**
- `script.ts`: the shot table (ranges, anchors, clip, capture, copy, role). It is the single source for timeline, thread map, deep links and `?role=`.
- `HarbourStage`: sticky stage with layered plate images under CSS 3D transforms. No WebGL and no three.js.
- `SequencePlayer`: canvas, loader, decode window.
- `CaptureFrame`: quad to full-frame lift.
- `ThreadMap`, `Telemetry`, `StopCopy`, `ProductsPlate`.
- `SessionSection`: mounts the existing `ContactForm`, unedited.

**Scroll engine:**
- `lenis` and `gsap` are in `package.json` and imported nowhere today (measured). This page is their first consumer.
- Wiring: `lenis.on('scroll', ScrollTrigger.update)`, `gsap.ticker.add(t => lenis.raf(t * 1000))`, `gsap.ticker.lagSmoothing(0)`, `ScrollTrigger.config({ ignoreMobileResize: true })`.
- One master timeline scrubbed by track progress, built with `useGSAP`.
- Native scroll on touch. Stage sized in `svh`.
- Motion is progressive enhancement behind the existing `useMotionAllowed()` (`components/film/useFilm.ts`), which starts at "no". The server markup is therefore the stills page.

**Performance budget (targets, measured at G6):**

| Measure | Desktop | Phone |
|---|---|---|
| LCP (element: hero capture P1) | 2,0 s or less | 2,5 s or less on throttled 4G |
| Transfer before first scroll | 900 KB or less | 600 KB or less |
| Route JS beyond framework | 130 KB gzipped or less | same |
| Plate layers | 2,5 MB or less | 0,9 MB or less |
| Per dive | 4 MB or less (sequence) | 250 KB or less (three stills) |
| Whole page scrolled to the end | 32 MB or less | 6 MB or less |
| Scrub frame time, p95 | 20 ms or less | not applicable |

CLS is 0. `saveData` or a slow connection gets the stills path.

**Work packages:**

| WP | Work | Owner | Gate |
|---|---|---|---|
| 0 | Decision row for section 8; measure live generation prices; open the register row and the Development start post | Starboard; founders decide | G0: spend and Q1 to Q7 answered or defaulted |
| 1 | Tear down the two unmeasured references at 1440x900 and 390x844; commit `DIRECTION.md`; `draw.mjs --keep palette,type` for S13 and S14 only | Keel | Direction committed |
| 2 | Route skeleton, shot table, Lenis and GSAP, sticky stage; sequence bake-off using existing `public/video/landing-2026-09-15/hero-A.mp4`. Zero spend | Keel | G1: frame budget met in Chrome, Safari and Firefox, forward and reversed |
| 3 | Idempotent demo seed for one call across the four workspaces plus an Embark demo departure; all captures; claim register (every on-page claim mapped to C, T or E and visible in a capture) | Keel (platform change by PR only) | G2: P1 to P12 exist, register has no open row |
| 4 | Harbour-scoped tokens (display scale, Low sun, telemetry) in DS naming so they can be promoted later; specs for `CaptureFrame` and `ThreadMap`. No `_ds` bump | Tiller | Reviewed against the design system |
| 5 | Hero only: K6 plus P1 | Keel | G3: `website-verify --hero-only` passes at 1440, 1280, 390 |
| 6 | Plate K0, layers, sprites, close tiles, interiors; real-time harbour; thread map; every stop with stills only | Keel | G4: page complete without any clip. This is the reduced-motion and phone experience |
| 7 | One dive end to end (C3, agent) | Keel | G5: Starboard checks continuity and the composite before the other clips are bought |
| 8 | Remaining clips and stops | Keel | All shots present |
| 9 | Copy pass through `copy` and `humanize`; dash lint; claim register re-check | Keel | No claim outside the register |
| 10 | `npm run verify`, `npm run build`, `scenes.mjs`, `website-verify` to 0 FAIL at `HEAD`, budget table measured, reduced-motion run | Keel | G6: receipt written |
| 11 | Deploy preview plus Tailscale Serve per device; acceptance against this document; completion report via `work-report portlink` | Starboard (verifier, never the builder) | G7: accepted |
| 12 | Where it goes live | Founders | Q7 |

**Guard:** a `check-harbour-isolation` script joins `verify`. It fails if `git diff main -- app/page.tsx components/sections components/scenes components/film app/_ds` is not empty, or if the built `/harbour` HTML references any sequence file.

**Estimate in AI-time:**
- Code against these patterns: hours per package.
- What does not collapse: the spend approval, generation takes (one to two days elapsed), the demo seed across four personas, device checks, and the founders' answers.

**Risks and how each is retired:**

| Risk | Retired by |
|---|---|
| Clips do not match the plate | Start frames exported from the plate, frame-0 swap, slice gate G5. Fallback is the three-still zoom already built at G4 |
| Scrub jank or memory | Bake-off at G1 before spend, decode window, phones on stills |
| Footage reads as generated | No faces, short clips, low sun throughout, captures dominate. Reject any take with warped text, hands or horizon |
| Copy claims more than the product does | Claim register at G2 and WP9, [T-ask] items worded as pilot work, the [C] limits listed per shot |
| No authenticated demo for all personas (the September mapping never had one) | Seed PR in WP3. A stop without a real capture is removed, never mocked |
| Vessel workspace status conflicts between sources (see section 10) | Verified on the live build in WP3. If it cannot be demoed, S10 shows the amendment from the cruise line side and says the vessel workspace is in pilot |
| Existing page regresses | Route isolation, the isolation guard, existing prebuild guards |
| Pilot participants exposed | No names, employers or quotes from the transcript on the page (Q3) |
| Repo weight (about 30 MB of frames) | Dated media folder, one asset commit per cut. Revisit if a second cut is needed |

## 8. Open questions for the founders

| # | Question | Recommendation | Safe default if unanswered |
|---|---|---|---|
| Q1 | Approve generation spend and create a Portlink-owned account (Bakke's may not be used)? | Approve a 5 000 kr ceiling, account credential into the Portlink vault | No spend. WP1 to WP4 proceed. The world waits |
| Q2 | May the page name Ilulissat and Ilulissat Tours? | Name Ilulissat Tours as Embark's first deployment once they agree in writing. Label the harbour as illustrated | Unnamed: "an illustrated West Greenland harbour", "first deployment: Greenland" |
| Q3 | Name MXP or quote pilot participants on a public page? | Describe the frustration without the brand. Name it only in conversation. Quotes only with consent | No brand, no quotes, paraphrase only |
| Q4 | Is "back-test one port against your actuals" (T:277) an offer you can deliver now? Same for the tariff-lag measure (T:208) | Lead with the working session, offer the back-test inside it, and call the lag measure pilot work | Working session only |
| Q5 | One sentence and a link for Wheelhouse? | One line from the founders | Name and "Ask us" link, no claims |
| Q6 | Is there a product link between DMC tour intake and Embark? | Claim it only if it exists in a capture | Two separate threads, no link drawn |
| Q7 | Where does it live once accepted? | Unlisted, noindexed `/harbour` on portlink.app until you choose to swap | Deploy preview and Tailscale only |

## 9. Conversion

**Principles, all from the session:**
- Triage by role, with the fewest clicks to your own material (T:214 to T:220).
- A blocked working session converts where "log in and play around" does not (T:164).
- Lead with the visitor's worst pains in their current software and how each is addressed (T:277).
- Start with small fleets on spreadsheets (T:295).

| Visitor | Clicks | Proof that earns it | CTA wording | Goes to |
|---|---|---|---|---|
| Itinerary planner | Role switch or thread map node | P1 to P3: route, conditions, RTZ export | "Plan one itinerary with us" | S14 |
| Port ops, cost forecasting | Thread map node "crossing" | P5 and P12: cost on the voyage, estimate and draft FDA on one call | "Bring one port to a session" | S14 |
| Port agent | Node A2 | P6, P7: one estimate, reviewed on the record | "See the agent workspace" | S14 |
| DMC | Node A3 | P8: intake marked quote requested | "Walk through a shore request" | S14 |
| Tour operator | Node A4 | P9, P10: departures and field mode | "See Embark" | Embark's own page (URL from the founders) |
| Vessel, nav team | Node A1 | P11: material amendment | "See a handover" | S14 |

**The pilot visitor:**
- A founder sends a link such as `/harbour?role=port-ops#crossing`. The page opens at that desk with the nav button already reading "Bring one port to a session".
- S14 then leads, for cruise roles: "Running port costs in spreadsheets? Start with one ship."
- The form is the existing pilot form and mail route. No new backend.
- A personalised "your worst pains and how we address them" sheet (T:277) is a follow-up document the founders send themselves. It never goes on a public URL.

## 10. Evidence and limits of this document

**Read this session:**
- `docs/LANDING-DIRECTION.md` and `docs/CONNECTED-PORT-CALL.md`.
- Design tokens, `package.json`, `netlify.toml`, `sitemap.ts`, the film motion guard.
- The inlined transcript.

**Not done, stated plainly:**
- `embark/README.md` could not be read (permission denied). Embark facts are the brief's. Keel reads the file before S8 and S9 copy is final.
- Generation prices and FX were not measured (web access denied).
- The unitedcarriers.com measurements are the brief's. I ran no browser teardown and did not run `draw.mjs`. Both sit in WP1.
- The platform facts tagged [C] were source-mapped at commit `6f5d4dec9` on 20.09.2026. They are re-verified in WP3.

**Source conflict:** the September mapping lists the vessel as an operational workspace, while T:26 (12.11.2026) says vessels on the platform are being worked on. The newer source wins until WP3 measures the live build.

## 11. WP1 measurements (Keel, 18.11.2026)

Measured on https://www.apple.com/airpods-pro/ and https://seasats.com with Playwright Chromium 1.60 at 1440x900 and 390x844, screenshots at 0, 25, 50, 75 and 100 % scroll. Raw data and screenshots: `design-review/harbour-2026-11/teardown/<site>/teardown.json`.

| Measure | apple.com/airpods-pro (desktop, phone) | seasats.com (desktop, phone) |
|---|---|---|
| Page length | 32,2 and 30,9 screens | 37,9 and 33,2 screens |
| Transfer after five scroll stops | 18,8 MB and 12,2 MB | 41,7 MB and 28,4 MB |
| Scrubbed media | video elements only (`large.mp4`, `large.webm`; `small.*` on phone), no canvas | `AnimateFrames` canvases fed by numbered frame files (1 029 image requests desktop, 720 phone; phone frames are AVIF, `frames/intro-25-mobile/frame_0001.avif`) |
| Smooth scroll | none detected | Lenis (`html.lenis`) |
| GSAP global | not detected | not detected |
| Display type | SF Pro Display 28 px, weight 600 | seasonMix 124 px (63,5 px phone), line height 0,9, weight 400 |
| Telemetry type | none | supplyMono |
| Sticky stage | `sticky-element`, 900 px (one viewport) | fixed theme background and header |

What this changes in the plan:
- The canvas frame-sequence default (section 5) has a working maritime precedent: seasats runs canvas sequences on desktop and phone, with AVIF frames on phone. Its 41,7 MB desktop weight is above our 32 MB cap, so the decode window and the "fetch within 1,5 screens" rule stay.
- Apple's current page scrubs video, not image sequences. The all-intra H.264 arm of the WP2 bake-off is therefore a real contender, not a formality.
- Both pages use one sticky viewport-height stage inside a long track, which matches section 4.

### draw.mjs for S13 and S14

`draw.mjs --sector saas --tone technical --keep palette,type --sections about,contact` (output in `design-review/harbour-2026-11/draw/direction.json`) dealt:
- S13 (about): "side facts, wide paragraph". One vertical line at 34 % of the width; three label and value pairs on the left, a statement paragraph to the right. Applied as: the small plate on the left with the three named regions, the three product sentences as the paragraph column. No card row.
- S14 (contact): "sentence and links band". Applied to the left half only: the role-worded offer as a statement of 36 px or less on three lines, the reply line beneath. The right half stays the existing `ContactForm` with `intent="pilot"`, as section 4 requires.
- Its motion line (masked headline reveal) is used for S13 and S14 headings only; the stage carries the rest.

## 12. v2: programmed harbour, no video (Surgeon (Portlink), 20.11.2026)

David's ruling (events 5a123a6a and 9ec043be): the harbour is programmed graphics driven by scroll, never scrubbed video. Fable authors the graphics and decides the architecture, Keel builds. "Top quality or not at all." This section **supersedes** every v1 part that depends on generated video: direction (c)'s AI-video dives in section 2, the clip rows of section 5, `SequencePlayer` and the decode window in section 7, gate G5 and the `?bakeoff=` arms. Everything else in sections 1 to 11 still binds: the idea sentence, the real-capture rules, the thread map, conversion, and the reduced-motion page as server markup.

### 12.1 Rendering: Chose / Over / Because / Revisit-if

| Direction | Fidelity to the authored art | Phone cost | Text and captures stay DOM | Addressable lights and anchors | Pipeline to build | Sum |
|---|---|---|---|---|---|---|
| **(a) Inline SVG layers under CSS transforms** | 5 | 4 | 5 | 5 | 5 | **24** |
| (b) Canvas2D, layers drawn per frame | 4 | 3 | 3 | 2 | 3 | 15 |
| (c) WebGL, layers as textured quads | 4 | 4 | 3 | 2 | 2 | 15 |

Scores are judgement of visitor outcome (1 to 5), not measurements.

**Chose:** (a). Six inline SVG planes (`00-sky` to `05-foreground`) plus the `ship` sprite, each moved only by a CSS `transform` on its wrapper, driven by one GSAP ScrollTrigger timeline on the existing Lenis wiring (section 7).

**Over:** (b) Canvas2D and (c) WebGL.

**Because:**
- The source art is already vector SVG (41 KB for all eight files, measured). (a) ships it as authored; (b) and (c) need a raster or tessellation step that loses the flat-field crispness at DPR 2 and 3.
- Each plane only translates and scales, so the browser composites it on the GPU as one layer. Nothing repaints per frame; the per-frame work is seven transform writes.
- Lights and stations are addressable by id (`lights-A2` to `lights-A5`, `ship-wake`, `ship-chain`, `ship-lights`). Turning a light on is an `opacity` tween on a named group, not a redraw.
- Copy, telemetry, the thread map and real captures stay ordinary DOM above the stage: legible, selectable, accessible and indexable. That keeps v1's rule 4 (the stills page is the server markup).
- No new dependency. `gsap`, `@gsap/react` and `lenis` are already in `package.json`; three.js stays out, as in v1.

**Revisit-if:** p95 frame time exceeds 20 ms on the mid-range phone trace (WP8), or a plane shows rasterisation shimmer while it scales. Then rasterise that plane alone to a bitmap at two scales (or draw it into one canvas) and keep the rest as SVG. A whole-scene WebGL move needs a new decision, not a fallback.

### 12.2 World, camera and the coverage clamp

- **World:** 4800 x 2400 units, origin top left, y down. Every layer shares fy = 1.
- **Layers and parallax** (from each file's `<desc>`):

| Layer | fx | Notes |
|---|---|---|
| `00-sky` | 0,08 | bleeds x -2400 to 7200 |
| `01-far-coast` | 0,45 | horizon y 1200 |
| `02-mid-harbour` | 0,82 | town; land base runs to y 1440 |
| `03-quay` | 1 | reference plane; quay waterline y 1420 |
| `04-water` | 1 | near water, A1 buoy and A5 tour boat |
| `ship` | 1 | drawn after water, never rotated, scale 1 |
| `05-foreground` | 1,22 | tops below y 1750; bleeds 480 past the world edge |

- **Camera:** centre `(cx, cy)` in world units and scale `s` (screen px per world unit). Each layer wrapper gets

  `transform: translate((-2400 - (cx - 2400) * fx) * s + vw / 2, -cy * s + vh / 2) scale(s)`

  with `transform-origin: 0 0`. The reference camera x of 2400 (world centre) is **an assumption** of this section, inferred from the sky and foreground bleed widths; Fable's art states the bleeds, not the reference. If a plane shows an edge, change the reference here and in `world.json`, nowhere else.
- **Ship:** translate the sprite pivot `(300, 160)` onto `route.getPointAtLength(t * 4810)` on the fx 1 plane. The bridge dock point `(398, 38)` is where capture lifts originate at A1.
- **Coverage clamp (new gate):** the viewport may never show past a plane's drawn edge. Because fy = 1 everywhere, the vertical part reduces to

  `s >= max((vh / 2) / (2400 - cy), (vh / 2) / cy)`

  and the horizontal part is checked per layer against its drawn extent. At the shipped camera rows: desktop at cy 1420 needs s >= 0,46; phone at cy 1500 needs s >= 0,47. Consequence: **the phone never gets a full-world overview**. It opens on a tight crop and pans. The rejected proof frames (s 0,3 and 0,13) showed a flat cut under the foreground and empty bands; they are kept as the negative control.

### 12.3 Stations and `world.json`

`route.svg` names `world.json` as the home of station fractions, but Fable never wrote it. It is now written beside the SVGs (`public/media/harbour-v2/world.json`, 416 SVG elements across the stage art for the 12.6 budget) with these values, measured by sampling `#route` (length 4810; miss is the distance in units from the anchor named in the art):

| Station | Anchor in the art | t | x | y | miss | Stop (script.ts) |
|---|---|---|---|---|---|---|
| A1 | anchorage buoy, `04-water` | 0,288 | 1379,4 | 1610 | 0,6 | S3 port ops and cost forecasting |
| A2 | port agent's office, `03-quay` | 0,4462 | 2140,5 | 1620 | 0,5 | S6 port agent |
| A3 | DMC house, `03-quay` | 0,546 | 2620,1 | 1632 | 0,1 | S7 DMC |
| A4 | Embark guide hut, `03-quay` | 0,6422 | 3080,5 | 1680 | 0,5 | S8 tour operator, first beat |
| A5 | Embark tour boat, `04-water` | 0,7338 | 3520,4 | 1690 | | S8 tour operator, second beat |

The stop mapping is this section's proposal; `script.ts` stays the single source for it (section 7), so Keel records the final mapping there and in `world.json` together.

### 12.4 Stop grammar without clips

Every station stop runs the same five beats, replacing v1's video dive in and out:

1. **Travel:** the ship moves along the route (wake on, chain off) while the camera follows at the travel scale.
2. **Push in:** the camera eases onto the station's anchor; that station's `lights-*` groups fade to signal colour. The ship stops (wake off; at A1 the chain shows).
3. **Lift:** the real capture rises from the anchor point to at least 55 % of the viewport (v1 rule 1).
4. **Hold:** at least 0,7 screens of scroll on the capture, with the stop's copy.
5. **Pull back:** the capture returns to its anchor, the lights stay on (the harbour remembers who has worked), and travel resumes.

Signal colour appears only inside `lights-*` and `ship-lights` groups; everything else stays in the stage-line greys the art was drawn in. Amended by 12.9: a hero group (`ship*`, `quay-crane-*`) may also carry the Low sun rim edge, as a stroke of at most 2 units and never as a fill (`check:harbour-lights`).

### 12.5 Phone and reduced-motion arms

- **Phone (`useNarrow`):** same timeline and same SVG, different camera rows: open at s 0,47 on the anchorage crop (proof frame `p1-open`), pan at s 0,55 between stations, never below the clamp. Native scroll on touch, as v1. No separate asset set.
- **Reduced motion (`useMotionAllowed` false, the server default):** one static composite of the six planes at the d1 camera, followed by each stop's capture and copy in order. No timeline is created. This is the server markup, so the page makes every claim before any script runs.

### 12.6 Budgets and gates

Carried from v1 unchanged: LCP 2,0 s desktop and 2,5 s phone, CLS 0, route JS 130 KB gzipped, `check-harbour-isolation`, captures >= 55 % for >= 0,7 screens, `capture.mjs` at 1440x900 and 390x844, `website-verify` 0 FAIL at HEAD.

New for v2:
- **SVG weight:** all stage SVG <= 120 KB raw (41 KB today), so the art can gain detail without becoming the LCP bottleneck.
- **DOM weight:** <= 2 500 SVG elements across the stage.
- **Frame time:** p95 <= 16,7 ms desktop and <= 20 ms on the mid-range phone trace across a full scroll (the Revisit-if trigger above).
- **Coverage clamp:** a unit test samples every camera keyframe at 1440x900 and 390x844 and fails when any plane's edge enters the viewport.
- **No video on the route:** the isolation guard also fails on any `<video>`, `.mp4` or `.webm` under `/harbour`.

### 12.7 Proof frames

Rendered from the committed SVGs with the camera formula above at DPR 2 (composer: `~/.buzz/RESEARCH/one-harbour-v2/compose.mjs`, camera rows in `shots.json`, output and manifest in `frames/`):

| Frame | Viewport | cx | cy | s | Ship t | State |
|---|---|---|---|---|---|---|
| `d1-wide` | 1440x900 | 2400 | 1420 | 0,46 | 0,29 | at anchor |
| `d2-anchorage-A1` | 1440x900 | 1500 | 1440 | 1,0 | 0,29 | at anchor |
| `d3-quay-A2-A3` | 1440x900 | 2400 | 1440 | 0,9 | 0,5 | under way |
| `d4-embark-A4-A5` | 1440x900 | 3300 | 1460 | 0,9 | 0,72 | under way |
| `p1-open` | 390x844 | 1500 | 1500 | 0,47 | 0,29 | at anchor |
| `p2-anchorage-A1` | 390x844 | 1420 | 1500 | 0,55 | 0,29 | at anchor |
| `p3-quay-A3` | 390x844 | 2620 | 1500 | 0,55 | 0,55 | under way |

These prove the art and the camera maths. They are not product captures and do not replace WP9.

### 12.8 Ordered build list for Keel (PR #38, branch `feat/umbrella-harbour`)

Each work package lands as its own commit on the branch, green before the next starts.

- [ ] **WP0, assets and record.** Commit `public/media/harbour-v2/` (eight SVGs plus `world.json` from 12.3) and this section. Push to `feat/umbrella-harbour`.
- [ ] **WP1, stage engine.** Rewrite `HarbourStage` to mount the six planes inline, apply the camera transform from 12.2, and enforce the coverage clamp in code (clamp `s`, never trust the keyframe). Gate: the clamp unit test from 12.6 passes.
- [ ] **WP2, remove v1 video.** Delete `SequencePlayer`, the dive clips and the `?bakeoff=` arms; drop `public/media/harbour-2026-11/` clip references. Gate: the isolation guard finds no video under `/harbour`.
- [ ] **WP3, ship.** Place the sprite on `#route` by `t`; toggle `ship-wake` under way and `ship-chain` at anchor. Gate: the ship sits on the route at all five stations within 1 unit.
- [ ] **WP4, stop grammar.** Build the five beats of 12.4 into the master timeline from `script.ts`; capture lift with `CaptureFigure`. Gate: every capture reaches >= 55 % and holds >= 0,7 screens.
- [ ] **WP5, lights.** Fade each station's `lights-*` groups at push in and keep them on. Gate: no signal colour outside lights groups (computed-style check).
- [ ] **WP6, phone arm.** Phone camera rows from 12.5 behind `useNarrow`. Gate: the clamp test at 390x844 and a real-device scroll.
- [ ] **WP7, reduced-motion arm.** Static composite plus captures as the server markup; no timeline when motion is not allowed. Gate: the page with JS disabled carries every claim.
- [ ] **WP8, performance.** Frame-time trace (desktop and mid-range phone throttle), LCP, CLS, JS and SVG weight against 12.6. Gate: every budget met, trace attached to the PR.
- [ ] **WP9, proof.** `capture.mjs` at 1440x900 and 390x844 on the preview, then `website-verify` 0 FAIL receipt at HEAD.

### 12.9 Art bar: unitedcarriers.com teardown (Surgeon (Portlink), 20.11.2026)

Measured live at 1440x900 with wheel-driven scroll (the site runs Lenis, so `scrollTo` does not move it), 16 positions, 900 px apart. Evidence: `~/.buzz/RESEARCH/one-harbour-v2/uc-teardown/` (`teardown.json`, `w/d-00..15.png`, `sheet-d.png`). Stack: Webflow, Lenis, Barba, GSAP; the scroll scenes are AVIF frame sequences, the hero a 900x900 canvas.

**What makes their fidelity (five measured traits):**

1. **One hero object, rendered at product detail, on an empty field.** A reach-stacker lifting a 40 ft box, then a truck: corrugation ribs, door bars, lock rods, hazard chevrons, stencilled codes, tyre tread, cab glazing. Nothing else is in frame: no scenery, no sky, a flat white or black field and one black road strip. The detail budget goes to the object, never to the backdrop.
2. **Two fields and one signal.** Black `#000`/`#0b0b0b`, white `#fff`/`#f4f4f4`, one orange `#ff5500`; a cold electric blue appears only as atmosphere behind the globe. Colour on the object is local colour (teal machine, navy and orange boxes), never decoration.
3. **Rim light, two-tone.** The hero globe is lit warm on one limb and cold blue on the other; the machinery has a hard key from upper left with crisp specular edges on steel. Light separates the object from the field; there are no gradients on the field itself.
4. **Two line weights.** Silhouettes are solid fills with no outline; interior detail is hairline (ribs, seams, lane dashes at roughly 1 px on screen). The top-down road map is the same idea flattened: solid black carriageway, thin grey dashes, hatched gore areas.
5. **Scroll drives the object's action, not just the camera.** The stacker lifts, the box lands on the truck, the truck drives off and turns on the map. The camera barely moves; the subject performs. Huge capitals and stat numerals ride over it, set in BT Steinhart.

**Translated to One Harbour (binding for the v3 layers):**

| Trait | One Harbour rule | Gate |
|---|---|---|
| Hero object | The ship and the A1 quay crane carry the detail: hull plating seams, portholes in rows, bridge glazing, lifeboats in davits, funnel bands, mooring lines; crane girders as lattice, trolley, spreader, rails. | Ship and crane together hold >= 40 % of all SVG elements |
| Empty field | Sky and far coast become near-flat fields: at most 3 tones each, no texture. Mid harbour drops to silhouette mass plus lit windows. | Sky + far coast <= 6 % of elements |
| Palette | Navy field `#0a2342` and night `#06152b` replace their black; Mist `#f2f5f9` their white; Low sun `#f5b53d` is the only signal (their orange). Steel greys `#8a97ab` to `#d6dde7` for local colour. | No hue outside these families (computed-style check, WP5) |
| Rim light | Key from the low sun at upper left: every hero surface gets a 1 to 2 unit Low sun edge on its sun side and a `#4f7db8` cold edge on the shadow side. Field stays flat. | Visual review on `d2`/`p2` |
| Line weight | Silhouettes are fills without stroke; detail strokes 1,5 world units (about 0,7 px at s 0,46, 1,5 px at s 1,0), silhouettes and rails 3 to 4. | Lint: no stroke above 4 outside `#route` |
| Scroll action | The ship moves along `#route` and the crane lifts at A2: the subject performs while the camera holds (WP3, WP4). | Unchanged from 12.4 |

Unchanged: world 4800x2400, layer ids, `fx`, extents, the camera and the clamp (12.2), the budgets in 12.6 (all stage SVG <= 120 KB raw, <= 2 500 elements).

Chose / Over / Because / Revisit-if: Chose vector detail concentrated on the hero objects with flat fields, Over a photoreal frame sequence like theirs, Because 12.1 already rejected video for weight and the clamp, and their fidelity comes from where the detail goes rather than from photographs; Revisit-if the v3 frames still read as clip art beside `sheet-d.png` at `d2`.

## 13. v4: rendered frames on a canvas, still no video (supersedes the rendering choice in 12)

**Source.** David's v4 brief (events `34c38c99`, `9e6b3a9b`, relayed by Starboard in goal `portlink-one-harbour-v4-2026-11-20`; brief thread `dac896f5`). Binding direction: `~/.buzz/RESEARCH/one-harbour-v2/v4/ONE_HARBOUR_V4_REALISTIC_POV.md` (option B, documentary photorealism; option C, an AI photo pass, is the upgrade path). Plan: `v4/ONE_HARBOUR_V4_ARCHITECTURE.md` sections 1 to 5.

**What changes.** The harbour is no longer drawn as SVG planes. Each beat is a short sequence of frames rendered offline in Blender (Cycles, Metal GPU, AgX), encoded to AVIF with a WebP fallback, and drawn by scroll onto one `<canvas>` by `components/harbour/FramePlayer.ts`. Scroll picks the frame; nothing plays on a clock.

**What does not change.** Still no `<video>`, no `.mp4`, `.webm`, `.mov` or `.m4v` anywhere on the route (12.6 stands; `check-harbour-isolation` keeps the ban). Screens are never generated UI: every `screen_*` surface in a render is an alpha hole, and a real product capture sits under the canvas in a DOM `<img>` placed by a homography from the exported slot corners (`public/media/harbour-v4/slots/<seq>.json`). People are seen from behind only. Palette families from 12.9 hold: navy `#0a2342`, Mist `#f2f5f9`, Low sun `#f5b53d` as the only signal.

**Look.** Documentary photorealism: no glow, no lens flare, no bloom. Beat 7 is overcast midday at quay level (`SC_overcast`, a CC0 Poly Haven overcast sky, no sun lamp). Assets are CC0 or modelled by script; spend is 0 kr.

**Budgets (from the plan, section 1.5 and 1.6).**

| Tier | Render | Delivered | Per frame |
|---|---|---|---|
| Desktop sequence | 1920x1200 | 1440x900 AVIF | 72 KB average, 110 KB max |
| Desktop hold still | 2560x1600 | 2560x1600 AVIF | 350 KB |
| Phone sequence | 780x1688 | 585x1266 AVIF | 36 KB average, 55 KB max |
| Phone still | 780x1688 | 780x1688 AVIF | 80 KB |

Render time at most 90 s per frame. Before first scroll at most 900 KB desktop, 600 KB phone. Whole film at most 36 MB desktop, 7 MB phone; stills path at most 2,5 MB and 1,2 MB. Scrub p95 at most 16,7 ms desktop, 20 ms phone. LCP 2,0 s desktop, 2,5 s phone, CLS 0, route JS at most 130 KB gzipped, no three.js.

**Fallbacks.** Reduced motion and `saveData` get baked stills (capture composited into the slot). The hero is an `<img fetchpriority="high">` pixel-identical to frame 0 of the first sequence.

**Toolchain, measured 20.11.2026.** Blender 5.2.2 LTS at `/Applications/Blender.app/Contents/MacOS/Blender`; Cycles Metal device `Apple M3 Ultra (GPU - 60 cores)`; 96 GB RAM. The v2 engine commits (WP1 to WP5) are on `feat/umbrella-harbour` at `6968167`; v4 builds on `feat/harbour-v4` from that commit.

Chose / Over / Because / Revisit-if: Chose offline rendered frames drawn by scroll on a canvas, Over the v3 vector planes and over scrubbed video, Because David's v4 brief asks for a realistic point of view that vector planes cannot reach, while a frame sequence keeps scroll control, real captures in the screens and the no video rule; Revisit-if the beat 7 spike misses the 90 s render cap, the per frame byte targets or the scrub p95, or G1 judges the spike still below `../v3/d-06.png`.

### 13.1 Spike S2: one hero object on a flat field (20.11.2026)

G1 on spike S: the pipeline passed, the art failed (David: "childish"). S2 drops the modelled harbour and renders one product-grade ship on a flat field.

- **Field.** Flat navy `#0a2342`, composited behind a transparent film. No sky, no scenery.
- **Hero.** "Cargo ship" by hungry_drifter, CC-BY, https://sketchfab.com/3d-models/cargo-ship-b7c97df584824ca682d26daabf401f87, fetched from the Objaverse mirror, 0 kr. Credit line on the page: `Cargo ship by hungry_drifter (Sketchfab), CC BY 4.0`. About 73k faces, 9 textures at 1024 px.
- **Hull detail.** Plating seams as a brick bump masked below the sheer line. The model has no hull portholes (its windows sit on the superstructure); mooring lines and lifeboats are not added.
- **Water.** One narrow Ocean-modifier band (900 x 140 m), alpha faded at both edges, dithered; ocean time and ship travel advance with the frame, so wake and reflection move on scroll.
- **Light.** Hard key from upper left (0,5 degrees), rim `#f5b53d` with specular off (it read as flare), cold edge `#4f7db8`. No bloom, no flare.
- **Type and UI.** Not in the render; DOM and SVG layers on top, as in section 13.
- **Beat 1.** 24 frames at 1440x900 and 390x844, Eevee, 64 samples, AgX. Measured 0,65 to 0,94 s per frame desktop (about 0,75 s), 0,50 to 0,70 s mobile (about 0,57 s), far under the 90 s cap.
- **Sources.** Scripts, frames and the side-by-side with the UC sheet live in `/Users/nyx/Projects/portlink/marketing/one-harbour-v4/s2/` (`py/scene.py`, `r/d/`, `r/p/`, `r/S2_side_by_side.jpg`).

Chose / Over / Because / Revisit-if: Chose one free CC-BY hero ship on a flat navy field with a narrow ocean band and the three-light rig, Over the modelled harbour of spike S and over a paid model, Because G1 judged the scene art childish while the pipeline passed, and a single detailed object carries the realism a whole low-detail harbour could not, at 0 kr; Revisit-if G1 fails S2, or the missing hull details (portholes, lines, lifeboats, a visible wake) are judged blocking, in which case a priced list of 3 paid or custom candidates goes to Starboard before any spend.

### 13.2 S3: live water in three.js, the only real-time layer (20.11.2026)

Amends the "no three.js" line of section 13 for the water layer only. Hero objects stay pre-rendered AVIF frames on a 2D canvas; type and UI stay DOM and SVG. Method from `RESEARCH/one-harbour-v2/v4/ONE_HARBOUR_V4_PRIOR_ART.md` (unitedcarriers.com ships `OceanScene` and `WakeSimulation` chunks; OceanX drives its wave field from the ship position).

- **Spike.** `spikes/s3-water/` (`water.js`, three 0.187.0). Four Gerstner waves on a centre-dense 256 x 256 grid, plus a wave-equation wake sim on 256 x 256 half-float ping-pong targets covering 80 m, driven by a ship-position uniform. Slow wave speed against hull speed (about Mach 3) gives the Kelvin V; foam decays per substep and is broken by value noise. Navy `#0a2342`, amber sun specular, cold fill, horizon fade.
- **Measured (Chrome, 10 s window after 3 s warm-up).** Desktop 1440x900 at DPR 1,5: 60 fps, p95 17,6 ms. Phone emulation 390x844, DPR cap 1,5, CPU throttled 4x: 60 fps, p95 17,6 ms. Emulation throttles the CPU only, not the GPU, so a real mid-range phone measurement is still owed before launch.
- **Weight.** The bundled, minified water chunk (three plus `water.js`) is 135 438 bytes gzipped. It cannot sit inside the 130 KB route budget: it loads as a lazy chunk after LCP, the static navy field holds until the first frame, and reduced motion never loads it.

Chose / Over / Because / Revisit-if: Chose a real-time three.js ocean with a position-driven wake sim, lazy-loaded after LCP, Over the baked Ocean-modifier band of 13.1 and over a fully real-time scene, Because the reference ships exactly this split, a baked band has no hull interaction and costs frames, and the spike holds 60 fps in both measured setups; Revisit-if a real mid-range phone drops below 30 fps at sim 256 (first fallback: sim 128 and seg 160, then a looping video strip for that beat), or the lazy chunk delays interaction past the LCP budget.

### 13.3 Production water: raw WebGL2 port of S3 (Keel, 21.11.2026)

`components/harbour/water/` ports `spikes/s3-beat1/ocean.js` line for line to raw WebGL2 (GLSL ES 3.00, RGBA16F ping-pong via `EXT_color_buffer_float`, linear-to-sRGB in the shader). `lazy.ts` loads it only after LCP (or first input, 2,5 s cap, then idle), never under reduced motion; `createOcean` returns `null` without WebGL2 or float targets, so the static navy field stays.

- **Weight.** 3 853 bytes gzipped (9 586 minified), against 135 069 for three.js plus the spike.
- **Parity, Chrome 1440x900, time frozen.** Moored hero clip `e`: byte-identical to the three.js render. Moving clip `d`: mean abs 0,075, 0,27 % of channels off by more than 8; three.js against itself gives the same figures (wake-sim step timing), so the port sits at three.js's own noise floor.
- **Tests.** `camera.test.ts`: view-projection matches three.js r187 within 1e-3, axis swap, colour conversion, grid layout.
- **Still owed for G2.** fps on desktop and a real phone on the assembled page, and the after-LCP check there.

Chose / Over / Because / Revisit-if: Chose raw WebGL2, Over shipping three.js as the lazy chunk, Because three.js alone exceeds G2's 140 KB and G6's 130 KB while the port renders the same pixels at 3 % of the weight; Revisit-if the water needs a scene graph, lights or loaders.

### 13.4 Production FramePlayer (Keel, 21.11.2026)

`components/harbour/frames/FramePlayer.ts` ports `spikes/s3-beat1/frameplayer.js` (1 372 bytes gzipped). Additions over the spike: prefetch ordered in the direction of travel, loads that leave the window are aborted (an abort spends no retry), the playhead's own frame pre-empts the farthest prefetch when every slot is busy, two attempts per frame, `dispose()`, and an injected loader and canvas so `FramePlayer.test.ts` (14 tests, `npm run test:harbour-v4`, in `verify`) covers windowing, eviction, aborts, layer order, never-blank draws and the byte budget at the G4 frame caps.

G3 run on the spike's beat 1 frames with the TS water underneath, Chrome GPU, 6 full-length scrubs at about 96 frames per second:

| Arm | Before first scroll | rAF p95 / max | Blank frames | Playhead lag p95 / max |
|---|---|---|---|---|
| Desktop 1440x900, DPR 1,5, radius 6 | 211 KB frames (7 frames), 15 KB JS | 16,8 / 16,8 ms | 0 | 7 / 12 frames |
| Phone emulation 390x844, DPR 2, CPU 4x, radius 4 | 56 KB frames (5 frames), 15 KB JS | 16,7 / 16,8 ms | 0 | 1 / 3 frames |

Not one dropped frame in either arm (p95 is the 60 Hz vsync interval; 16,8 against the 16,7 gate is timer quantisation). Desktop lag at this scrub speed means the nearest decoded frame stands in for up to 12 frames; a real scroll is slower. Emulation throttles the CPU, not the GPU or decoder: a real mid-range phone is still owed for G2 and G3.

## 14. Correction 20.11.2026: cruise segment, expedition hero, supersessions

Source of truth for v4 from here: `~/.buzz/RESEARCH/one-harbour-v2/v5/ONE_HARBOUR_PLAN_FABLE.md` (Fable 5.2, 20.11.2026, read against the Portlink iCloud corpus, `portlink-platform`, `embark` and this worktree). Where this section and an earlier section disagree, this section wins.

- **Audience.** Expedition and luxury cruise lines first (pricing v2: Phase 1 market, 40 to 60 brands, 1 to 10 vessels), then their port agents and DMCs, then small tour operators (Embark). Not cargo, not mass-market cruise, not port authorities. No customer has signed: name no line, agent or operator.
- **Hero vessel.** Unnamed, unbranded expedition cruise ship, 140 x 23 m (reference HX Roald Amundsen class), navy hull, white superstructure, one funnel, ice-class bow, two tenders in davits. Modelled by us. `rig.py` `LEN_M` becomes 140.
- **Withdrawn.** 13.1 hero "Cargo ship" (hungry_drifter); the A1 quay crane (12.9); containers, offices, hut; the G1 sheet in `marketing/one-harbour-v4/s3/g1` (pipeline evidence only, void as art).
- **Objects allowed.** Expedition ship, ship's tender, harbour launch, small open tour boat, one iceberg. Each brief and frame manifest carries `vessel_type` and `segment`; a check fails the build when either is missing or off-list.
- **Spend.** Cap 40 USD (David, 20.11.2026), planned 0 USD. Supersedes 5 000 kr (5), 0 kr (13) and 500 USD (prior art).
- **Live 3D.** Live three.js water (13.2) supersedes "no three.js / no WebGL" in 7, 12 and 13, and the baked band in 13.1. Renders are Cycles, not Eevee.
- **Fallbacks.** A static still, never video (13 no-video rule wins over 13.2's video strip).
- **Resolution.** Render 2560x1440, deliver 1920x1080 desktop (supersedes 1920x1200 / 1440x900 in 13). Revisit if G4 byte budgets fail.
- **Product claims.** Wheelhouse is live and a product: one line and one capture. Embark: third product, already public at portlink.app/embark; no prices; "First deployment: Greenland" is deleted. The Portlink to Embark trade link is built (Trade API v1, 02.11.2026): a DMC request answered in Embark is a true claim. The agent beat claims only the shared call unless an agent can create a PDA at the capture commit.
- **Not yet built.** `components/harbour/FramePlayer.ts` (spike only); `verify` still runs v2 SVG guards that must go.

Chose / Over / Because / Revisit-if: Chose an expedition cruise hero at 140 m, Over the cargo model and a 300 m mass-market hull, Because Portlink's Phase 1 market and every prospect that has seen the product run ships of this class; Revisit-if David or Kris name another vessel type or a mass-market line signs.

- **Open (David, 20.11.2026):** setting (Norway berth like `/portlink` and `/embark`, or Greenland anchorage like the platform seed) and ship size (one ship across the site). Addendum F of the Fable plan.

### 14.1 Execution completion: Bergen truth pack, G4 beats and `/harbour-v4` (Keel, 21.11.2026 & 22.11.2026)

- **Step 2 (G5) truth pack:** Seeded `demo_harbour_bergen.sql` + `demo_consumption.sql` (`Norwegian Coast 2026-N4`, `MS Aster Brisa (demo)`, 150 m LOA, Bergen `Skolten 3`, fictional `Portlink Agency Norway (demo)` and `Portlink Shore Norway (demo)`). Captured 16 screens at `1440x900` and `390x844` (2x DPR, clock pinned to `2026-11-18T15:25:00Z`) from `portlink-platform` `407c6d383` into `public/media/harbour-v4/captures/` (`P01`, `P03`, `P04`, `P05`, `P06`, `P08`, `P08b` Embark Trade API v1 agreement, `P09`, `P10` Wheelhouse task list, `P12`). Verified `buildPdaFromTariffs` and `startBlankPda` in `src/modules/finance/tariff.actions.ts:234,339` so Beat 3 carries "One request. One estimate." Updated `docs/HARBOUR-CLAIMS.md`.
- **Step 7 (G4) 3D models & 24-frame sequences:** Modelled `harbour_launch` (13,8 x 4,2 m Nordic pilot launch with continuous tubular D-fender, flush mullioned pilothouse glazing, handrails and tripod radar mast), `ship_tender` (9,8 x 3,4 m streamlined expedition tender with flush panoramic glazing and boarding handrails), `tour_boat` (10,6 x 3,5 m offshore RIB with cylindrical hypalon collar tube, contoured marine saddle seats, twin outboard engines and tubular stainless A-frame radar arch; zero pawn figures) and `iceberg` (flat-faceted calved glacial iceberg with planar fracture cliffs and snow ledges) beside the G1-approved `expedition_cruise` (150 x 24,5 m, L/B 6,16, razor-sharp horizontal boot-top, zero lower-hull studs) in `spikes/s3-rig/beats.py`. Rooted fjord mountains at `z = -6 m` below the `z = 0` water plane with level camera elevation so zero horizon seam appears above the live WebGL2 water. Rendered and AVIF-encoded beats `b00` (`1` frame) and `b01` to `b06` (`24` desktop frames and `24` phone frames each) into `public/media/harbour-v4/`, guarded by `scripts/check-harbour-v4.mjs`.
- **Step 8 (G5, G6) `/harbour-v4` unified sticky stage:** Built `app/harbour-v4/page.tsx` (`noindex`), `components/harbour/v4/HarbourV4Stage.tsx`, `scriptV4.ts` and `harbour-v4.module.css` around ONE sticky live-water + `FramePlayer` + real product capture stage (`>= 55 %` viewport width on desktop, ref-driven imperative `FramePlayer.seek()` + `ocean.step()` in `ScrollTrigger.onUpdate` with zero per-pixel React state churn), leaving `/harbour` (v2/v3) and `/` untouched.

Chose / Over / Because / Revisit-if: Chose a dedicated `/harbour-v4` route with one unified sticky live-water + `FramePlayer` + real capture stage and 24-frame Cycles sequences while keeping `/harbour` (v2/v3) untouched, Over overwriting `/harbour` in place or duplicating static waterless beat cards, Because `ONE_HARBOUR_PLAN_FABLE.md` §G item 10 requires keeping earlier `/harbour` and `/` side by side while the scroll story runs on one live water stage; Revisit-if David or Kris promote `/harbour-v4` to replace `/harbour` after G7 review.
