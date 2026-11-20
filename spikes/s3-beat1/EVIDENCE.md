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
