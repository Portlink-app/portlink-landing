# S3 beat 1: measured evidence (20.11.2026, frozen at 769cc5c)

Status: stopped on David's order before G1 was judged. The hull is a cargo placeholder and is withdrawn
(the hero is a cruise ship). The figures below describe the pipeline (Cycles plates over live three.js water)
and carry over to any hull.

| Measure | Desktop (v=d) | Portrait (v=p) |
|---|---|---|
| Cycles render size | 2560x1440 | 780x1688 |
| Seconds per frame, plate pass | 8,5 s | 3,0 s |
| Seconds per frame, shadow pass (50 %) | 3,29 s | 2,42 s |
| AVIF plate, average / max | 31,4 / 32,9 KB (1440x810, q55) | 10,7 / 11,1 KB (585x1266) |
| AVIF shadow, average | 1,2 KB | 0,8 KB |
| Beat total, 96 frames | 3,05 MB | 1,08 MB |
| Scroll scrub, Chrome | 60 fps, 9/9 one-second samples, 4 misses (1440x900, dpr 1) | 60 fps, 9/9 samples, 4 misses (390x844, dpr 3, 4x CPU throttle) |

Not measured: a real mid-range phone (the 4x CPU throttle does not slow the GPU).

Sources: `camera.json` `secs` per render dir; `encode.mjs` output; `window.__beat.samples` on an 8 s full-range
scroll. Comparison sheet (UC sheet-d beside frames 1, 48, 96):
`/Users/nyx/Projects/portlink/marketing/one-harbour-v4/s3/g1/g1-sheet.jpg`.
Renders: `/Users/nyx/Projects/portlink/marketing/one-harbour-v4/s3/beat1/{d,p}`.

## G1 (expedition, 21.11.2026): replaces the void cargo sheet

- Sheet: `/Users/nyx/Projects/portlink/marketing/one-harbour-v4/s3/g1/g1-expedition-sheet.jpg` (capture of `index.html?v=e&f=0` at 1440x900 beside UC `sheet-d.png`).
- Rig: `spikes/s3-rig/expedition.py`, 150 m LOA, 24,5 m beam, L/B 6,12 (G1a 5,8 to 6,4), no cranes, containers or hatches, no name or livery.
- Plate 2560x1440 at 128 samples: render 19,26 s, shadow 8,21 s; AVIF plate 14,7 KB, shadow 1,6 KB (G4 cap 60 KB).
- Fix: single-frame clips divided by `cam.frames - 1 = 0`, seeking NaN; guarded with `Math.max(1, ...)`.
- Open: fjord backdrop out of frame (flat sky), detached white foam slab around hull, amber sun-glint blotch, quay edge reads flat grey.

### G1 expedition, revision 2 (21.11.2026)
- Sheet: `/Users/nyx/Projects/portlink/marketing/one-harbour-v4/s3/g1/g1-expedition-sheet-2.jpg` (capture `?v=e&f=0`, 1440x900, beside UC `sheet-d.png`).
- Fixed: fjord now in frame (camera target z 0.62, view dir z 0.06, near ridge darkened to `#3a4a4c`, far ridge `#71869a`, snow line per ridge); foam slab removed (moored one-frame clip disables bow/stern injection and foam, footprint from the rig's hull block); glint cut to 0,35.
- Plate AVIF 19,4 KB, shadow 1,6 KB (cap 60 KB). Page at 38 fps in headless capture.
- Open: quay is a flat slab; near ridge reads smooth and toy-like (needs terrain noise or a forest material); a soft amber smear remains in the water reflection; sky is flat navy.
