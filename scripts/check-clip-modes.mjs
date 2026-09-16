#!/usr/bin/env node
/**
 * check-clip-modes.mjs: refuse a clip that changes light/dark mode part-way through.
 *
 *   node scripts/check-clip-modes.mjs               (npm run check:clips, and prebuild)
 *   Exit 0 = every clip is single-mode; 1 = at least one flips; 2 = could not measure.
 *
 * ## THE DEFECT THIS EXISTS FOR
 *
 * The master recording is light 0 to 63,433 s, dark to 73,100 s, then light again. Every shipped
 * clip is captioned as one mode, so a clip that crosses a seam contradicts its own caption, and
 * because the clips loop it does so every few seconds forever.
 *
 * Two of them did. Measured 16.09.2026: hero-C.mp4 opened on 10 light frames (0 to 0,42 s) before
 * 206 dark ones, and hero-D.mp4 on 2 dark frames before 228 light ones. The cause is the part
 * worth keeping: the seams were originally found by sampling the master at ONE FRAME PER SECOND
 * and cutting on whole seconds. A 0,42 s error is invisible to a 1 s instrument. The numbers were
 * published as though the instrument could have seen it, which is the failure this file replaces
 * with a measurement that reads every frame.
 *
 * ## --if-available, AND WHY THIS ONE GATE GETS THAT AND THE DASH GATE DOES NOT
 *
 * This needs ffprobe. The dash gate needs nothing, which is why it is unconditional in `prebuild`
 * and a missing measurement there would be a real hole: source code changes in the same commit
 * that builds it. The clips do not. They are committed bytes, measured on the machine that cut
 * them, and a Netlify build cannot alter them. So `--if-available` says NOT MEASURED out loud and
 * exits 0 when ffprobe is absent, rather than failing a deploy over a tool the build image may not
 * carry; without the flag a missing ffprobe is ERROR (2), because "could not measure" is not a
 * verdict anywhere a human is asking the question.
 *
 * ## HOW IT DECIDES
 *
 * ffmpeg's signalstats gives a mean luma per frame. A dark product UI and a light one are far
 * apart on that scale and nothing in this footage sits between them, which the report prints so
 * the separation is visible rather than asserted: any frame landing in the band between the two
 * thresholds is reported as UNDECIDED and fails, because a clip that drifts into the middle is
 * exactly the case a single threshold would silently round to one side.
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIR = path.join(ROOT, 'public/video/landing-2026-09-15')

/** Measured separation on this footage: dark clips sit near 50, light ones near 180. */
const DARK_MAX = 90
const LIGHT_MIN = 140

function yavg(file) {
  const out = execFileSync(
    'ffprobe',
    ['-v', 'error', '-f', 'lavfi', '-i', `movie=${file},signalstats`,
     '-show_entries', 'frame_tags=lavfi.signalstats.YAVG', '-of', 'csv=p=0'],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 },
  )
  return out.split('\n').map((l) => parseFloat(l)).filter((n) => Number.isFinite(n))
}

const IF_AVAILABLE = process.argv.includes('--if-available')
try {
  execFileSync('ffprobe', ['-version'], { stdio: 'ignore' })
} catch {
  const msg = 'check-clip-modes: ffprobe not found, so no clip was measured.'
  if (IF_AVAILABLE) { console.log(`${msg} NOT MEASURED (clips are committed bytes; this build cannot change them).`); process.exit(0) }
  console.error(`${msg} Install ffmpeg, or pass --if-available to skip.`)
  process.exit(2)
}

const clips = fs.existsSync(DIR) ? fs.readdirSync(DIR).filter((f) => f.endsWith('.mp4')).sort() : []
if (clips.length === 0) { console.error(`check-clip-modes: ERROR, no clips under ${path.relative(ROOT, DIR)}`); process.exit(2) }

let failed = 0
for (const name of clips) {
  let v
  try { v = yavg(path.join(DIR, name)) } catch (e) {
    console.error(`check-clip-modes: ERROR, ffprobe failed on ${name}: ${e.message}`); process.exit(2)
  }
  if (v.length === 0) { console.error(`check-clip-modes: ERROR, no frames read from ${name}`); process.exit(2) }

  const dark = v.filter((x) => x <= DARK_MAX).length
  const light = v.filter((x) => x >= LIGHT_MIN).length
  const undecided = v.length - dark - light
  const single = undecided === 0 && (dark === v.length || light === v.length)
  const mode = dark === v.length ? 'dark' : light === v.length ? 'light' : 'MIXED'

  const line = `  ${name.padEnd(22)} ${String(v.length).padStart(4)} frames  ${mode.padEnd(6)}` +
    `  dark=${dark} light=${light} undecided=${undecided}` +
    `  luma ${Math.min(...v).toFixed(1)} to ${Math.max(...v).toFixed(1)}`
  if (single) console.log(line)
  else { console.error(line + '   <- FAILS: one clip, one mode'); failed++ }
}

if (failed) {
  console.error('')
  console.error(`check-clip-modes: ${failed} clip(s) change mode mid-play. Each loops, so a reader sees it repeat.`)
  console.error('Fix: re-cut inside one side of the master seams at 63,433 s and 73,100 s, measured at 60 fps.')
  process.exit(1)
}
console.log(`check-clip-modes: OK. ${clips.length} clip(s), every frame on one side of the light/dark threshold.`)
