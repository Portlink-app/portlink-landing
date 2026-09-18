#!/usr/bin/env node
/**
 * check-scene-layouts — the front page really does ship two authored layouts per product screen.
 *
 * What this is, plainly: every product screen on the front page is drawn twice, once for a wide
 * screen and once for a phone, rather than once and squeezed. That is true today because somebody
 * measured it once. Nothing else was keeping it true. A refactor that collapses one pair, or an
 * eighth screen added with only a wide layout, takes a phone visitor back to a desktop layout
 * shrunk to fit, and no test anywhere would have said a word.
 *
 * ⛔ WHY THIS GATE OUTLIVED THE SENTENCE IT WAS WRITTEN FOR. It was built on 17.09.2026 to hold a
 * public claim on /contact/ that invited a reader to check the two layouts in their own browser.
 * That block came off the page on 18.09.2026 — the claims were true, the audience was wrong: a
 * port agent deciding whether to trust us with software has no stake in our breakpoint authoring.
 * The PROPERTY is still worth keeping, and it is worth keeping for the visitor rather than for the
 * sentence, so the gate stayed and the claim half became conditional. The build fails the same way
 * it did when the copy was there; it just no longer needs a paragraph on a marketing page to
 * justify its existence. Removing a promise from the site must not quietly remove the behaviour
 * the promise described.
 *
 * So this gate counts the layouts and refuses the build when a screen is not authored twice. When
 * a public claim IS present anywhere in the authored pages, it additionally reads the NUMBERS
 * SPELLED OUT IN THE COPY, which is the half a code-only check cannot see: adding an eighth screen
 * correctly, with both layouts, still leaves a page saying "Seven screens, fourteen layouts", and
 * that is a false claim written by a correct change. With no claim on the site there is nothing to
 * disagree with, and the scope line below says so on every run rather than letting a clean verdict
 * imply a comparison that never happened.
 *
 * TWO PASSES, and they cover each other's blind spots:
 *   source  every scene component the front page renders contains exactly one <Wide> and one
 *           <Narrow>. This is the pass that names the file and the line when it breaks.
 *   built   the prerendered markup carries one of each class per screen, and every scene's id.
 *           This is the pass that catches a component that is authored correctly and never
 *           reaches the page — a verification that never reaches its artifact is worth nothing.
 *
 * The class names are READ FROM `components/scenes/ui.tsx`, never hard-coded here, so renaming
 * them is a safe change rather than a false denial from this script.
 *
 * SCOPE, stated so a clean verdict cannot be read as more than it is: this counts authored
 * layouts and their presence in the prerendered HTML of `/`. It does not judge whether the two
 * layouts are good, whether the CSS shows exactly one of them at a given width, or anything on a
 * route other than the front page. The CSS pairing is checked only for existence. The claim pass
 * covers authored `.tsx` under `app/` and `components/`, so a claim that moves to another page is
 * still held; a claim written anywhere else — a CMS, an image, a PDF — is outside this gate.
 *
 * Run with `--built` to REQUIRE the built-output pass. Without it, the built pass runs when a
 * build is present and is reported as skipped when it is not — and the scope line says which.
 *
 * EXITS: 0 clean · 1 a violation in the repository · 2 this script is broken, or the artifact it
 * needed was missing, and it judged nothing. The two failures are worded apart on purpose: a gate
 * that reports its own blindness as the repository's defect is one people learn to rerun past.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const PAGE = 'app/page.tsx'
const UI = 'components/scenes/ui.tsx'
const CSS = 'app/globals.css'
const CLAIM_ROOTS = ['app', 'components']
const CLAIM_EXCLUDED = ['app/_ds', 'node_modules', '.next']
const CLAIM_ANCHOR = 'ships two authored layouts'
const BUILT_HTML = '.next/server/app/index.html'

/**
 * Source with comments removed, so a `<Wide>` written in a doc block is not counted as a layout.
 *
 * Character walk rather than a regex, because `/* ... *\/` and `//` both appear inside the string
 * literals this repo is full of (every film path starts `/video/`). Strings, template literals and
 * escapes are tracked; a regex literal containing a comment opener is the known gap, and the
 * fixtures below pin the cases that matter.
 */
function stripComments(src) {
  let out = ''
  let i = 0
  let quote = null
  while (i < src.length) {
    const c = src[i]
    const d = src[i + 1]
    if (quote) {
      if (c === '\\') { out += c + (d ?? ''); i += 2; continue }
      if (c === quote) quote = null
      out += c; i++; continue
    }
    if (c === '"' || c === "'" || c === '`') { quote = c; out += c; i++; continue }
    if (c === '/' && d === '/') { while (i < src.length && src[i] !== '\n') i++; continue }
    if (c === '/' && d === '*') {
      i += 2
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) { if (src[i] === '\n') out += '\n'; i++ }
      i += 2
      continue
    }
    out += c; i++
  }
  return out
}

const WORDS = {
  zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9,
  ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15, sixteen: 16,
  seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20, twentyone: 21, twentytwo: 22,
  thirty: 30, forty: 40, fifty: 50,
}

/** A number written as a word or as digits, or null when it is neither. */
function readNumber(token) {
  if (token == null) return null
  const t = String(token).toLowerCase().replace(/[^a-z0-9]/g, '')
  if (/^\d+$/.test(t)) return parseInt(t, 10)
  return t in WORDS ? WORDS[t] : null
}

/** The claim sentence, and the two counts it asserts. */
function readClaim(src) {
  const clean = stripComments(src)
  const idx = clean.indexOf(CLAIM_ANCHOR)
  if (idx === -1) return { found: false }
  // Whichever quote character actually opens the string, not an assumed one: a reworded claim in
  // double quotes would otherwise be sliced at the wrong place and read as a count mismatch.
  const opens = ["'", '"', '`'].map((q) => [q, clean.lastIndexOf(q, idx)]).filter(([, at]) => at !== -1)
  const [quote, open] = opens.length ? opens.reduce((a, b) => (b[1] > a[1] ? b : a)) : ["'", idx - 1]
  const close = clean.indexOf(quote, idx)
  const sentence = clean.slice(open + 1, close === -1 ? idx + 200 : close)
  return {
    found: true,
    sentence: sentence.trim(),
    screens: countBefore(sentence, 'screens'),
    layouts: countBefore(sentence, 'layouts'),
  }
}

/**
 * The number standing in front of a noun in the claim.
 *
 * Every match is considered, not the first: the anchor sentence itself contains the phrase
 * "two authored layouts", so a first-match reader reads the word "authored" and returns null —
 * which is how this gate's own fixtures caught it before it ever judged the repository.
 */
function countBefore(sentence, noun) {
  for (const m of sentence.matchAll(new RegExp(`([A-Za-z0-9-]+)\\s+${noun}`, 'gi'))) {
    const n = readNumber(m[1])
    if (n !== null) return n
  }
  return null
}

/** Every authored .tsx under the claim roots, so a claim that moves pages is still held. */
function walkClaimFiles(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const rel = relative(ROOT, full)
    if (CLAIM_EXCLUDED.some((x) => rel === x || rel.startsWith(x + '/'))) continue
    if (statSync(full).isDirectory()) walkClaimFiles(full, acc)
    else if (entry.endsWith('.tsx')) acc.push(rel)
  }
  return acc
}

/** The scene components the front page actually renders, in page order. */
function frontPageScenes(pageSrc) {
  const clean = stripComments(pageSrc)
  const imported = new Map()
  for (const m of clean.matchAll(/import\s+([A-Za-z_$][\w$]*)\s+from\s+'@\/components\/scenes\/([A-Za-z0-9_$]+)'/g)) {
    if (m[2] === 'SceneSection' || m[2] === 'ui') continue
    imported.set(m[1], `components/scenes/${m[2]}.tsx`)
  }
  const rendered = []
  for (const [name, file] of imported) {
    if (new RegExp(`<${name}\\s*/>`).test(clean)) rendered.push({ name, file })
  }
  return rendered
}

/** The section ids on the front page, which is what "on the front page" is measured against. */
function sceneIds(pageSrc) {
  const clean = stripComments(pageSrc)
  const ids = []
  for (const m of clean.matchAll(/<SceneSection\b[\s\S]{0,200}?\bid="([^"]+)"/g)) ids.push(m[1])
  return ids
}

/** The class name a wrapper in ui.tsx actually emits. Read, never assumed. */
function classOf(uiSrc, component) {
  const clean = stripComments(uiSrc)
  const m = clean.match(new RegExp(`export function ${component}\\b[\\s\\S]*?className="([^"]+)"`))
  return m ? m[1] : null
}

function countLayouts(sceneSrc) {
  const clean = stripComments(sceneSrc)
  return {
    wide: (clean.match(/<Wide[\s>]/g) || []).length,
    narrow: (clean.match(/<Narrow[\s>]/g) || []).length,
  }
}

// ── Calibration, against fixtures held in this file ──────────────────────────
// Deliberately NOT against the repository. A gate calibrated on the very thing it guards exits 2
// and blames its own pattern the day that thing is what changed.
const broken = []

const CLEAN = [
  ['a line comment', 'const a = 1 // <Wide> in a comment\n<Wide>x</Wide>', 1],
  ['a block comment', '/* <Wide>\n   <Wide> */\n<Wide>x</Wide>', 1],
  ['a path that looks like a comment', "const p = '/video/a.mp4'\n<Wide>x</Wide>", 1],
  ['a url inside a string', "const u = 'https://portlink.app'\n<Wide>x</Wide>", 1],
  ['a template literal', '`a // b`\n<Wide>x</Wide>', 1],
  ['nothing to count', '/* <Wide> */', 0],
]
for (const [name, src, want] of CLEAN) {
  const got = countLayouts(src).wide
  if (got !== want) broken.push(`stripper: ${name} should count ${want} wide, counted ${got}`)
}

const PAIRS = [
  ['a complete pair', '<Wide>a</Wide>\n<Narrow>b</Narrow>', 1, 1],
  ['a missing narrow', '<Wide>a</Wide>', 1, 0],
  ['a doubled wide', '<Wide>a</Wide>\n<Wide>b</Wide>\n<Narrow>c</Narrow>', 2, 1],
  ['self-closing', '<Wide />\n<Narrow />', 1, 1],
]
for (const [name, src, w, n] of PAIRS) {
  const got = countLayouts(src)
  if (got.wide !== w || got.narrow !== n) broken.push(`pair counter: ${name} should be ${w}/${n}, got ${got.wide}/${got.narrow}`)
}

const NUMBERS = [['seven', 7], ['Fourteen', 14], ['7', 7], ['sixteen', 16], ['banana', null]]
for (const [token, want] of NUMBERS) {
  if (readNumber(token) !== want) broken.push(`number reader: ${token} should read ${want}, read ${readNumber(token)}`)
}

const CLAIMS = [
  ['the shipped wording', "'Every product screen on the front page ships two authored layouts, one wide and one narrow, instead of one design squeezed to fit. Seven screens, fourteen layouts, all of them in the page source.',", 7, 14],
  ['a rewritten count', "'x ships two authored layouts. Eight screens, sixteen layouts.',", 8, 16],
  ['digits instead of words', "'x ships two authored layouts. 9 screens, 18 layouts.',", 9, 18],
  ['a double-quoted rewrite', '"x ships two authored layouts. Six screens, twelve layouts.",', 6, 12],
]
for (const [name, src, s, l] of CLAIMS) {
  const c = readClaim(src)
  if (!c.found || c.screens !== s || c.layouts !== l) broken.push(`claim reader: ${name} should read ${s}/${l}, read ${c.screens}/${c.layouts}`)
}
if (readClaim("'a page that makes no such promise'").found) broken.push('claim reader: found an anchor that is not there')

const CLASSES = [
  ['the shipped shape', 'export function Wide({ children }: P) {\n  return <div className="scene-wide">{children}</div>\n}', 'scene-wide'],
  ['a renamed class', 'export function Wide({ children }: P) {\n  return <div className="layout-wide">{children}</div>\n}', 'layout-wide'],
]
for (const [name, src, want] of CLASSES) {
  if (classOf(src, 'Wide') !== want) broken.push(`class reader: ${name} should read ${want}, read ${classOf(src, 'Wide')}`)
}

if (broken.length) {
  console.error('check-scene-layouts: THIS SCRIPT IS BROKEN and judged nothing about the repository.')
  for (const b of broken) console.error(`  - ${b}`)
  console.error('\nThe fixtures above live inside this file. Fix the reader, then rerun.')
  process.exit(2)
}

// ── The run ──────────────────────────────────────────────────────────────────
const requireBuilt = process.argv.includes('--built')
const read = (rel) => readFileSync(join(ROOT, rel), 'utf8')

/* THE CLAIM PASS IS CONDITIONAL, AND THIS IS THE ONLY PLACE THAT IS TRUE.
   The layout counting below is not: a screen authored once still fails whether or not any page
   talks about it, because the property protects a phone visitor and not a sentence. What the
   absence of a claim removes is the count comparison, which has nothing to compare against — and
   the scope line prints which of the two happened, so a clean verdict never implies a check that
   did not run. See the header for why the sentence went and the gate stayed. */
let claimFiles = []
for (const r of CLAIM_ROOTS) {
  try { claimFiles = claimFiles.concat(walkClaimFiles(join(ROOT, r))) } catch { /* a root may not exist */ }
}
if (claimFiles.length === 0) {
  console.error(`check-scene-layouts: scanned 0 files under ${CLAIM_ROOTS.join(', ')}. The scanner saw nothing, so it could not tell a site with no claim from a site it failed to read.`)
  process.exit(2)
}
/* EVERY file carrying the anchor, not the first one found. Two pages asserting different counts
   is exactly the drift this gate exists to catch, and a first-match reader would hold one of them
   and be blind to the other — a clean verdict earned by stopping early. */
const claims = []
for (const f of claimFiles) {
  const c = readClaim(read(f))
  if (c.found) claims.push({ ...c, file: f })
}

const scenes = frontPageScenes(read(PAGE))
if (scenes.length === 0) {
  console.error(`check-scene-layouts: found 0 scene components rendered by ${PAGE}. The scanner saw nothing, so it proved nothing.`)
  process.exit(2)
}

const wideClass = classOf(read(UI), 'Wide')
const narrowClass = classOf(read(UI), 'Narrow')
if (!wideClass || !narrowClass) {
  console.error(`check-scene-layouts: could not read the class names out of ${UI} (Wide=${wideClass}, Narrow=${narrowClass}).`)
  console.error('This script reads them rather than assuming them, so it cannot judge the built markup without them.')
  process.exit(2)
}

const problems = []
let layouts = 0
for (const s of scenes) {
  const { wide, narrow } = countLayouts(read(s.file))
  layouts += wide + narrow
  if (wide !== 1 || narrow !== 1) {
    problems.push(`${s.file}  ${wide} <Wide> and ${narrow} <Narrow> — every product screen is authored exactly twice, once wide and once narrow`)
  }
}

const css = read(CSS)
for (const cls of [wideClass, narrowClass]) {
  if (!css.includes(`.${cls}`)) problems.push(`${CSS}  no rule for .${cls} — the pair is authored but nothing decides which one shows`)
}

for (const c of claims) {
  if (c.screens !== scenes.length) {
    problems.push(`${c.file}  the page says ${c.screens} screens, the front page renders ${scenes.length}`)
  }
  if (c.layouts !== layouts) {
    problems.push(`${c.file}  the page says ${c.layouts} layouts, the scene components author ${layouts}`)
  }
}

// ── The built-output pass ────────────────────────────────────────────────────
const builtPath = join(ROOT, BUILT_HTML)
let builtScope = 'built output: SKIPPED, no build present (run `npm run build`, or pass --built to require it)'
if (existsSync(builtPath)) {
  const html = readFileSync(builtPath, 'utf8')
  const ids = sceneIds(read(PAGE))
  const idsPresent = ids.filter((id) => html.includes(`id="${id}"`))
  if (ids.length === 0 || idsPresent.length === 0) {
    console.error(`check-scene-layouts: ${BUILT_HTML} carries none of the ${ids.length} scene ids. The instrument is not reading the page that owns the claim, so its zeros mean nothing.`)
    process.exit(2)
  }
  const wideCount = html.split(wideClass).length - 1
  const narrowCount = html.split(narrowClass).length - 1
  if (wideCount !== scenes.length) problems.push(`${BUILT_HTML}  ${wideCount} .${wideClass} in the served markup, ${scenes.length} expected`)
  if (narrowCount !== scenes.length) problems.push(`${BUILT_HTML}  ${narrowCount} .${narrowClass} in the served markup, ${scenes.length} expected`)
  if (idsPresent.length !== ids.length) {
    const missing = ids.filter((id) => !idsPresent.includes(id))
    problems.push(`${BUILT_HTML}  scene id(s) authored but not served: ${missing.join(', ')}`)
  }
  builtScope = `built output: ${BUILT_HTML} · ${wideCount} .${wideClass} · ${narrowCount} .${narrowClass} · ${idsPresent.length}/${ids.length} scene ids present`
} else if (requireBuilt) {
  console.error(`check-scene-layouts: --built was passed and ${BUILT_HTML} does not exist. This script judged the source only, which is not what was asked of it.`)
  process.exit(2)
}

const claimScope = claims.length
  ? `${claims.length} public claim(s): ${claims.map((c) => `${c.file} says ${c.screens}/${c.layouts}`).join(' · ')}`
  : `claim pass: NO PUBLIC CLAIM on the site (searched ${claimFiles.length} .tsx under ${CLAIM_ROOTS.join(', ')} for "${CLAIM_ANCHOR}") — layouts counted, counts not compared`
console.log(`check-scene-layouts: ${scenes.length} product screens on the front page · ${layouts} authored layouts · ${claimScope} · classes .${wideClass}/.${narrowClass} read from ${UI}`)
console.log(`check-scene-layouts: ${builtScope}`)
if (problems.length) {
  console.error(`\ncheck-scene-layouts: ${problems.length} problem(s) with the two-layout property${claims.length ? ' or a claim about it' : ''}.`)
  for (const p of problems) console.error(`  - ${p}`)
  if (claims.length) {
    for (const c of claims) console.error(`\nThe sentence being held, in ${c.file}: "${c.sentence}"`)
    console.error('Either author the missing layout, or change the sentence. Both are fine; leaving them apart is not.')
  } else {
    console.error('\nNo page claims this any more; the property is held for the phone visitor, not for a sentence. Author the missing layout.')
  }
  process.exit(1)
}
console.log(`check-scene-layouts: ok — every product screen on the front page ships both layouts${claims.length ? ', and every page that says so says it correctly' : ''}.`)
