# Harbour tokens and component specs (WP4)

Scope: the unlisted `/harbour` page only (direction: `DIRECTION.md`, "One Harbour", section 6 and WP4).
Tokens live in `components/harbour/harbour-tokens.css`, scoped to `[data-surface="harbour"]`.
`app/_ds/` is untouched: no `_ds` bump, no change to any page outside `/harbour`.
Author: Tiller (Design), 18.11.2026, on `origin/main` 34237b0 (DS bundle v4.1.2).

## 1. Decisions

**Navy field**
- Chose: `--ds-stage-bg: #0f2340`, the existing `--pl-navy-925`, already shipped as `--ds-inverted-bg`.
- Over: adding the brief's `#0a2342` as a new primitive.
- Because: measured CIEDE2000 distance between the two is 0,91, under the 1,0 threshold a person can see. Their contrast against each other is 1,00:1, and Low sun contrast on them is 8,68:1 against 8,66:1. A new primitive would be a duplicate nobody can tell apart, and it would have to be promoted later as drift. `#0a2342` does exist in the DS, but only as a hard-coded heading colour in `app/_ds/ds-styles.css` lines 123 and 136, never as a token.
- Revisit if: a founder wants the exact brand hex `#0a2342` tokenised DS-wide. In that case it replaces `--pl-navy-925` upstream, it is not added beside it.

**Low sun** gets a new hue family, `--pl-sun-*`, with only 400 (base) and 300 (hover) defined. The DS has no warm accent today: `--pl-warning-*` is a status colour and `--pl-accent-copper` is data-viz only. Neither may carry brand meaning.

**H1 floor lowered from 72 px to 44 px.** The direction's `clamp(4.5rem, 8.4vw, 9.375rem)` breaks its own rule (32 characters, two lines at 390). Measured with the shipped Plus Jakarta Sans woff2 at weight 700 and -0,035em tracking: a 32-character headline is 13,4 to 14,2 em wide. At 72 px on a 358 px column that is about 5 em per line, so 3 lines. At 44 px it is 8,1 em per line, so 2 lines. Desktop is unchanged: 121 px at 1440 and 108 px at 1280 both fit two lines. `website-verify` at 390 is the binding check at the build gate. H2 floor lowered from 40 px to 32 px so it stays below H1 on a phone.

## 2. Tokens

| Token | Value | Primitive | Use |
|---|---|---|---|
| `--ds-stage-bg` | `#0f2340` | `--pl-navy-925` | Stage ground, hold backgrounds |
| `--ds-stage-surface` | `#162d4e` | as `--ds-inverted-surface` | ThreadMap panel |
| `--ds-stage-text` | `#f2f5f9` | `--pl-mist-75` | Running text on stage |
| `--ds-stage-text-2` | `#c3cddb` | `--pl-mist-300` | Secondary text, telemetry |
| `--ds-stage-line` | `#a0acbd` | `--pl-mist-400` | Coastline, upcoming nodes |
| `--ds-stage-border` | `rgba(242,245,249,.15)` | as `--ds-inverted-border` | Panel and capture edge |
| `--ds-stage-scrim` | `rgba(15,35,64,.70)` | | The one scrim under text on footage |
| `--ds-signal` | `#f5b53d` | `--pl-sun-400` (new) | Thread, current node, lit windows, button on stage |
| `--ds-signal-hover` | `#f7c45f` | `--pl-sun-300` (new) | Button hover |
| `--ds-signal-ink` | `#0f2340` | `--pl-navy-925` | Text on a signal button |
| `--ds-display-1` | `clamp(2.75rem, 8.4vw, 9.375rem)` | | H1. Leading 0,92, tracking -0,035em, 700 |
| `--ds-display-2` | `clamp(2rem, 4.6vw, 4.5rem)` | | H2. Leading 1,0, tracking -0,03em, 700 |
| `--ds-statement` | `clamp(1.5rem, 1.221rem + 1.143vw, 2.25rem)` | | 24 px at 390, 28 at 768, 36 at 1440. Leading 1,2 |
| `--ds-text-lead` | `1.125rem` | `--pl-text-18` | Body on this page. Leading 1,5 |
| `--ds-telemetry-*` | JetBrains Mono, `0.8125rem`, 1,3 | `--pl-font-mono`, `--pl-text-13` | Telemetry strip, map labels. Use `font-variant-numeric: tabular-nums` |

New primitive candidates (TIER 1): `--pl-sun-400`, `--pl-sun-300`, `--pl-leading-display` (0,92), `--pl-leading-none` (1), `--pl-leading-mono` (1,3), `--pl-track-display` (-0,035em).

## 3. Contrast, measured

WCAG 2.x relative luminance, computed from the sRGB values (flat fills, so the rendered pixel is the hex). Script and output: this commit's message.

| Pair | Ratio | Verdict |
|---|---|---|
| Low sun `#f5b53d` on Navy `#0a2342` (brief) | 8,68:1 | AAA text. The hand figure of 8,7:1 holds |
| Low sun on `--ds-stage-bg` `#0f2340` | 8,66:1 | AAA text |
| Navy ink on Low sun (button) | 8,66:1 | AAA |
| Low sun on `--ds-stage-surface` | 7,61:1 | AAA |
| Signal ink on Low sun hover | 9,75:1 | AAA |
| Mist text on stage-bg / surface | 14,42 / 12,64:1 | AAA |
| `--ds-stage-text-2` on stage-bg / surface | 9,80 / 8,61:1 | AAA |
| `--ds-stage-line` on surface | 6,01:1 | Passes 3:1 non-text |
| Mist text on scrim over pure white ice | 5,42:1 | AA. At the direction's lighter 0,55 it was 3,37:1 (fail) |
| Low sun on Mist / white | 1,66 / 1,82:1 | **Banned.** Never text, never a sole indicator on light |

## 4. `CaptureFrame` spec

**Job.** A real product capture that starts registered on the monitor inside the footage, lifts to a full-frame hold, and returns. It carries the proof at every stop. A stop without a real capture is removed, never mocked.

**Props** (all from `script.ts`, nothing hard-coded in the component):
- `capture`: `{ desktop, mobile }` image sources, 2x, AVIF with WebP fallback, no browser chrome.
- `alt`: required. Names the record and its state, for example "Port call record, FDA in draft".
- `quad`: the monitor's four corners in the clip's last frame, normalised 0 to 1 in stage space, desktop and mobile sets.
- `progress`: 0 to 1, from the master timeline (no own timers).
- `status`: the record status shown in the capture. Telemetry reads it from here, so the two cannot disagree.

**Geometry.**
- Docked (p = 0): `matrix3d` homography mapping the image rect onto `quad`, `transform-origin: 0 0`.
- Lift: interpolate the four corners linearly from `quad` to the hold rect and recompute the homography each frame. Transform and opacity only, `will-change: transform` only inside the active range.
- Held (p = 1): identity transform. Desktop: at least `--ds-capture-hold-min` (55vw) wide, vertically centred, left of the StopCopy column. Phone: full width minus 2 x 16 px, top edge under the 44 px thread bar.
- The first 8 % of the range crossfades from the monitor pixels in the clip to the capture, so the swap is invisible.

**Look.** Frameless, `--ds-capture-radius` (10 px), 1 px `--ds-stage-border` edge to separate it from footage. No shadow (flat fields), no window dots, no browser bar.

**States.** Docked, lifting, held (StopCopy steps in), returning. Reduced motion or no JS: the held layout as a static figure in the stills page, no transforms.

**Performance.** One decoded image per stop, `decoding="async"`, next stop preloaded during the current hold, source no wider than 2 x the hold rect (cap 2 560 px).

**Acceptance.**
- Corner registration error at p = 0 is at most 2 px against the clip's monitor, at 1440 and 390.
- No layout shift (CLS 0 from this component).
- Transform-only frames, no paint in the performance trace during scrub.
- `alt` present on every instance. The telemetry value equals `status`.

## 5. `ThreadMap` spec

**Job.** Persistent wayfinding: where you are on the harbour, where you have been, and a way to jump. It replaces eyebrows and index numbers.

**Data.** Nodes, positions, thread paths and stop ranges come from `script.ts`. The coastline is drawn in code from the plate. No coordinates live in the component.

**Desktop.**
- Fixed bottom left, `--ds-threadmap-w` x `--ds-threadmap-h` (232 x 132), inset `--ds-threadmap-inset` (24 px).
- Panel: `--ds-stage-surface`, 1 px `--ds-stage-border`, radius 10 px, solid, no blur.
- SVG `viewBox="0 0 232 132"`: coastline as a 1 px `--ds-stage-line` hairline (waiver in DIRECTION.md), HQ node on the left edge joined by a dashed route (`4 3`).

**Threads.**
- Portlink thread: HQ, ship, agent, DMC. Drawn in `--ds-signal`, 2 px, by `stroke-dashoffset` from master progress. It never resets.
- Embark thread: hut, jetty, boat, its own path in the same style.
- The quay walk between the two threads is a 1 px dashed `--ds-stage-line`, never signal: no data link between the products is drawn (Q6).

**Node states.**

| State | Look |
|---|---|
| Upcoming | r 4, `--ds-stage-bg` fill, 1,5 px `--ds-stage-line` ring |
| Visited | r 4, `--ds-stage-text` fill |
| Current | r 5, `--ds-signal` fill, plus a pulse ring growing from r 5 to r 12 while fading from 0,6 to 0, over 1,6 s. No pulse under reduced motion |
| Focus | 2 px `--ds-signal` ring, 2 px offset |

**Interaction and semantics.**
- `<nav aria-label="Harbour stops">` holding an `<ol>` of `<button>`s. `aria-current="step"` on the current node. Each name is its role, for example "Port agent".
- Hit area at least 24 x 24 px per node (WCAG 2.5.8) through a transparent r 12 circle. Where two nodes sit closer than 24 px, the hit areas are offset, never shrunk.
- Click or Enter: Lenis `scrollTo` the stop's hold start, update `#stop-<id>`. The role switch in the nav uses the same call.
- Hover or focus shows the role name in telemetry type above the node.

**Phone.** A 44 px thread bar under the nav, full width, `--ds-stage-surface`. One horizontal line with six evenly spaced nodes, each a 44 x 44 tap target, same states. The current role name is shown at the right in telemetry type, so a sighted user knows what the dots mean.

**No JS or reduced motion.** The map is not rendered. The stills page uses ordinary in-page links.

**Acceptance.**
- Node count and order equal `script.ts`.
- Every node is reachable by Tab and works with Enter and Space.
- The thread is never drawn in Low sun on a light surface.
- No backdrop filter anywhere in the component.

## 6. Promotion path

When `/harbour` graduates: move the TIER 1 candidates into `portlink-design-system` `tokens.css`, the TIER 2 colour tokens into a stage or "inverted" group (both themes take the same values, the stage is always dark), rebuild the dist bundle, then bump `app/_ds/` (David approves a `_ds` bump, per `CLAUDE.md`), and delete `components/harbour/harbour-tokens.css`.
