#!/usr/bin/env node
/**
 * check-viz-type — nothing this site composes itself renders text below the floor.
 *
 * What this is, plainly: the marketing site draws miniature mock-ups of the product inside its
 * role cards, and the text inside those mock-ups was written one number at a time — a 9 here, a 10
 * there. On a phone that is text nobody can read, and it sat on the page for months because the
 * default role tab happens to contain none of it, so every sweep that did not press a tab reported
 * zero. This gate reads the source instead, so the next person to add a visual inherits the floor
 * rather than having to know about it.
 *
 * Measured on the built page at 94992469, pressing the section's own tabs: Port agent 6 strings
 * below 11 px, Tour operator 11, Port or terminal 12, identical at 390 px and 1440 px.
 *
 * SCOPE, stated so a zero from this script cannot be read as more than it is: inline `fontSize`
 * literals in the .tsx we author. The vendored design system in `app/_ds/` is excluded — it is
 * Tiller's, it ships its own scale, and this gate has no opinion on it. Sizes expressed through
 * `clamp()`, `var()` or `calc()` are not decidable statically; they are counted and printed on
 * every run, so the coverage of a clean verdict is always visible next to the verdict.
 *
 * EXITS: 0 clean · 1 a violation in the repository · 2 this script is broken and judged nothing.
 * The two failures are worded apart on purpose. A gate that reports its own defect as the
 * repository's defect is one people learn to rerun past.
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const FLOOR = 11
const ROOTS = ['components', 'app']
const EXCLUDED = ['app/_ds', 'node_modules', '.next']

/**
 * Pull every inline `fontSize:` out of one file and decide what it resolves to.
 *
 * `fontSize: NAME` is resolved against `const NAME = <number>` in the same file, because the whole
 * point of this change was to route the visuals through one named constant — and a floor that
 * cannot see the constant's value would pass a file that set it to 9.
 */
function scan(source) {
  const consts = new Map()
  for (const m of source.matchAll(/\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*(\d+(?:\.\d+)?)\s*$/gm)) {
    consts.set(m[1], parseFloat(m[2]))
  }
  const hits = []
  for (const m of source.matchAll(/\bfontSize:\s*([^,\n}]+)/g)) {
    const raw = m[1].trim().replace(/,$/, '')
    const line = source.slice(0, m.index).split('\n').length
    let px = null
    let dynamic = false
    if (/^\d+(\.\d+)?$/.test(raw)) px = parseFloat(raw)
    else if (/^'(\d+(\.\d+)?)px'$/.test(raw)) px = parseFloat(raw.match(/^'(\d+(\.\d+)?)px'$/)[1])
    else if (/^'(\d+(\.\d+)?)rem'$/.test(raw)) px = parseFloat(raw.match(/^'(\d+(\.\d+)?)rem'$/)[1]) * 16
    else if (consts.has(raw)) px = consts.get(raw)
    else dynamic = true
    hits.push({ line, raw, px, dynamic })
  }
  return hits
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const rel = relative(ROOT, full)
    if (EXCLUDED.some(x => rel === x || rel.startsWith(x + '/'))) continue
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) acc.push(full)
  }
  return acc
}

// ── Calibration, against fixtures held in this file ──────────────────────────
// Deliberately NOT against the repository. The predecessor gate in this repo calibrated on a real
// id, so renaming the very id it existed to protect made it exit 2 blaming its own pattern. A gate
// must keep working when the thing it guards is exactly what changed.
const MUST_FLAG = [
  ['a bare 9', 'style={{ fontSize: 9 }}'],
  ['a 10px string', "style={{ fontSize: '10px' }}"],
  ['0.625rem, which is 10px', "style={{ fontSize: '0.625rem' }}"],
  ['a named constant set below the floor', 'const VIZ_TEXT = 8\nstyle={{ fontSize: VIZ_TEXT }}'],
]
const MUST_PASS = [
  ['the floor itself', 'style={{ fontSize: 11 }}'],
  ['the floor as a string', "style={{ fontSize: '11px' }}"],
  ['0.6875rem, which is 11px', "style={{ fontSize: '0.6875rem' }}"],
  ['a named constant at the floor', 'const VIZ_TEXT = 11\nstyle={{ fontSize: VIZ_TEXT }}'],
  ['ordinary body text', "style={{ fontSize: '14px' }}"],
]
const MUST_COUNT_AS_DYNAMIC = [
  ['a clamp', "style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)' }}"],
  ['a token', "style={{ fontSize: 'var(--ds-h1)' }}"],
]

const calibrationFailures = []
for (const [name, src] of MUST_FLAG) {
  const found = scan(src).filter(h => h.px !== null && h.px < FLOOR)
  if (found.length !== 1) calibrationFailures.push(`should have flagged ${name}, flagged ${found.length}`)
}
for (const [name, src] of MUST_PASS) {
  const found = scan(src).filter(h => h.px !== null && h.px < FLOOR)
  if (found.length !== 0) calibrationFailures.push(`should have passed ${name}, flagged ${found.length}`)
}
for (const [name, src] of MUST_COUNT_AS_DYNAMIC) {
  const hits = scan(src)
  if (hits.length !== 1 || !hits[0].dynamic) calibrationFailures.push(`should have counted ${name} as dynamic, got ${JSON.stringify(hits)}`)
}
if (calibrationFailures.length) {
  console.error('check-viz-type: THIS SCRIPT IS BROKEN and judged nothing about the repository.')
  for (const f of calibrationFailures) console.error(`  - ${f}`)
  console.error('\nThe fixtures above live inside this file. Fix the scanner, then rerun.')
  process.exit(2)
}

// ── The run ──────────────────────────────────────────────────────────────────
let files = []
for (const r of ROOTS) {
  try { files = files.concat(walk(join(ROOT, r))) } catch { /* a root may not exist */ }
}
if (files.length === 0) {
  console.error(`check-viz-type: scanned 0 files under ${ROOTS.join(', ')}. The scanner saw nothing, so it proved nothing.`)
  process.exit(2)
}

const violations = []
let parsed = 0
const dynamic = []
for (const f of files) {
  const rel = relative(ROOT, f)
  for (const h of scan(readFileSync(f, 'utf8'))) {
    if (h.dynamic) { dynamic.push(`${rel}:${h.line}  ${h.raw}`); continue }
    parsed++
    if (h.px < FLOOR) violations.push(`${rel}:${h.line}  fontSize: ${h.raw}  resolves to ${h.px}px, below the ${FLOOR}px floor`)
  }
}

console.log(`check-viz-type: ${files.length} files · ${parsed} font sizes resolved · ${dynamic.length} expressed through clamp/var/calc and not decidable here · floor ${FLOOR}px`)
if (violations.length) {
  console.error(`\ncheck-viz-type: ${violations.length} declaration(s) below the floor.`)
  for (const v of violations) console.error(`  - ${v}`)
  console.error(`\nUse the named constant the file already exports, or raise the literal to ${FLOOR}.`)
  console.error('This floor covers the .tsx this repo authors. The vendored design system in app/_ds/ is excluded and unjudged.')
  process.exit(1)
}
console.log('check-viz-type: ok — no authored inline font size below the floor.')
