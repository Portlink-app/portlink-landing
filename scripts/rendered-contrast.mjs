#!/usr/bin/env node
/**
 * rendered-contrast.mjs: the contrast a reader actually gets, sampled from rendered pixels.
 *
 *   node scripts/rendered-contrast.mjs <png> [--bg-percentile 50] [--fg-percentile 2]
 *
 * ## WHY THE COMPUTED VALUE IS NOT THE ANSWER
 *
 * A contrast checker compares two token values and answers about two flat fields. A reader looks
 * at glyphs, and a small thin glyph is mostly antialiasing: the pixels are a blend of the ink and
 * the paper, and only the stem centres ever reach the nominal colour. Measured on this site
 * 16.09.2026, the stage labels at 12px weight 500 computed to 6,22:1 and rendered at 3,50:1, and
 * the control (the active label, computed 17,62:1) rendered at 8,95:1. Roughly half, both times.
 *
 * So this samples the crop's luminance distribution: the mode-ish percentile is the paper, the
 * extreme percentile toward the ink is the glyph core, and the ratio between those two is what a
 * reader is looking at. It answers about the image it is given, and nothing else.
 *
 * ⛔ IT REPORTS THE PIXEL COUNT AND THE TWO SAMPLED COLOURS, ALWAYS. A crop that missed the text
 * returns a confident 1,00:1 that looks like a catastrophic failure, and a crop that is all text
 * returns a confident pass. Neither is detectable from the ratio alone, so the inputs are printed
 * next to it and the caller checks that the sampled foreground is plausibly the ink.
 */

import { execFileSync } from 'node:child_process'

const [, , file, ...rest] = process.argv
if (!file) { console.error('usage: rendered-contrast.mjs <png> [--bg-percentile N] [--fg-percentile N]'); process.exit(2) }
const arg = (name, dflt) => { const i = rest.indexOf(`--${name}`); return i === -1 ? dflt : Number(rest[i + 1]) }
const BG_P = arg('bg-percentile', 50)
const FG_P = arg('fg-percentile', 2)

/** WCAG 2.x relative luminance. */
function lum([r, g, b]) {
  const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4 }
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const ratio = (a, b) => { const [hi, lo] = lum(a) > lum(b) ? [lum(a), lum(b)] : [lum(b), lum(a)]; return (hi + 0.05) / (lo + 0.05) }

// One pixel per line, as RGB. `txt:-` is ImageMagick's own enumeration, so no decoder is written here.
const raw = execFileSync('magick', [file, '-depth', '8', 'txt:-'], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 })
const px = []
for (const line of raw.split('\n')) {
  const m = line.match(/^\d+,\d+: \((\d+),(\d+),(\d+)/)
  if (m) px.push([Number(m[1]), Number(m[2]), Number(m[3])])
}
if (px.length === 0) { console.error('rendered-contrast: no pixels read'); process.exit(2) }

const sorted = [...px].sort((a, b) => lum(a) - lum(b))
const at = (p) => sorted[Math.min(sorted.length - 1, Math.max(0, Math.round((p / 100) * (sorted.length - 1))))]

// The paper is whichever end holds the bulk; the ink is the opposite extreme.
const median = at(50)
const dark = at(FG_P)
const light = at(100 - FG_P)
const bg = at(BG_P)
const fg = lum(median) > 0.5 ? dark : light

const hex = (c) => '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('')
console.log(JSON.stringify({
  file,
  pixels: px.length,
  background: hex(bg),
  glyph_core: hex(fg),
  rendered_ratio: Number(ratio(fg, bg).toFixed(2)),
}))
