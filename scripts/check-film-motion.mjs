#!/usr/bin/env node
/**
 * check-film-motion — a visitor who asked for reduced motion is still sent no film.
 *
 * What this is, plainly: if your computer is set to reduce motion, this site sends you no video at
 * all — not a paused one, not a still standing in for one — and the film files are never even
 * requested. That is true today by construction: the hook that answers the motion question starts
 * out saying "no", so the markup the server sends carries a poster image, and the <video> element
 * that would fetch the film is never created. It was true once before too, and then it was not: a
 * <video preload="metadata"> in the server HTML made a reduced-motion visitor pay 776 217 byte of
 * film before React could replace it.
 *
 * Nothing was keeping the fix in place. This gate does.
 *
 * ⛔ WHY THIS GATE OUTLIVED THE SENTENCE IT WAS WRITTEN FOR. It was built on 17.09.2026 to hold a
 * public claim on /contact/ that invited a reader to verify this in their own browser. That block
 * came off the page on 18.09.2026 — the claims were true, the audience was wrong: a port agent
 * deciding whether to trust us with software has no stake in how we author video requests. The
 * BEHAVIOUR is owed to a visitor who asked for less motion, and that visitor did not stop existing
 * when the paragraph did. So the gate stayed and the claim half became conditional: the build
 * fails for exactly the same regressions it failed for yesterday. A promise removed from the site
 * must not quietly remove the thing the promise described — and of the two, the accessibility
 * behaviour is the part that was never really about marketing.
 *
 * TWO PASSES, and the pairing is the point, because each one is blind where the other sees:
 *   source  every <video> element this repo authors sits behind an early return on the reduced-
 *           motion answer. This catches a guard that is deleted, and a new component that never
 *           had one. It cannot see a change inside the hook itself.
 *   built   no prerendered page carries a <video>, and none references a film file. This catches
 *           the hook being flipped to start at "yes", a preload link, a <source>, and anything
 *           else that puts film in the bytes the server sends. It cannot name the line.
 *
 * The built pass refuses to report a zero it has not earned: it requires at least one prerendered
 * page to reference the film directory at all. Otherwise "no film shipped" is indistinguishable
 * from "read the wrong artifact", which is the failure this whole file is a reaction to.
 *
 * SCOPE, stated so a clean verdict cannot be read as more than it is: this judges authored .tsx
 * under `app/` and `components/`, and the prerendered HTML under `.next/server/app/`. Routes that
 * are server-rendered on demand have no prerendered artifact and are not covered here; neither is
 * anything a third-party script might inject at runtime. The optional claim pass searches the same
 * authored files, so a claim that moves to another page is still found. The identifier the guard tests is read
 * from wherever this repo binds `useMotionAllowed()`, so renaming the hook's result is a change
 * this gate follows rather than one it refuses.
 *
 * Run with `--built` to REQUIRE the built-output pass; `postbuild` does. Without it the built pass
 * runs when a build is present, and the scope line says which happened.
 *
 * EXITS: 0 clean · 1 a violation in the repository · 2 this script is broken, or the artifact it
 * needed was missing, and it judged nothing.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const ROOTS = ['app', 'components']
const EXCLUDED = ['app/_ds', 'node_modules', '.next']
const BUILT_DIR = '.next/server/app'
const HOOK = 'useMotionAllowed'
const FILM_EXT = /\.(mp4|webm|mov|m4v|ogv)\b/i
const CLAIM_ANCHOR = 'we send you no video at all'

/** Source with comments removed. This file is full of the word `<video>` in prose; none of it is markup. */
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

const lineOf = (src, index) => src.slice(0, index).split('\n').length

/** Identifiers this file binds to the reduced-motion answer. */
function motionNames(clean) {
  const names = new Set()
  for (const m of clean.matchAll(new RegExp(`const\\s+([A-Za-z_$][\\w$]*)\\s*=\\s*${HOOK}\\s*\\(`, 'g'))) names.add(m[1])
  return names
}

/** The braced block that follows an `if (...)`, or null when the branch is not braced. */
function blockAfter(clean, from) {
  let i = clean.indexOf(')', from)
  if (i === -1) return null
  i++
  while (i < clean.length && /\s/.test(clean[i])) i++
  if (clean[i] !== '{') return null
  let depth = 0
  for (let j = i; j < clean.length; j++) {
    if (clean[j] === '{') depth++
    else if (clean[j] === '}') {
      depth--
      if (depth === 0) return { start: i, end: j }
    }
  }
  return null
}

/**
 * Every <video> in one file, and whether an early return on reduced motion stands in front of it.
 *
 * A guard counts only when its branch is a braced block that RETURNS and that renders no film
 * itself — otherwise `if (!motionAllowed) { return <video /> }` would read as its own guard, which
 * is the shape the fixtures below exist to reject. The branch has to be braced; an unbraced arm is
 * reported as no guard at all rather than guessed at, because a gate that guesses is one whose
 * clean verdict cannot be trusted.
 */
function judgeVideos(clean, names) {
  const videos = [...clean.matchAll(/<video[\s/>]/g)].map((m) => m.index)
  const guards = []
  for (const name of names) {
    for (const m of clean.matchAll(new RegExp(`if\\s*\\(\\s*!\\s*${name}\\s*\\)`, 'g'))) {
      const block = blockAfter(clean, m.index)
      if (!block) continue
      const body = clean.slice(block.start, block.end)
      if (!/\breturn\b/.test(body)) continue
      if (/<video[\s/>]/.test(body)) continue
      guards.push({ name, at: m.index, end: block.end })
    }
  }
  return videos.map((at) => {
    const scope = componentStart(clean, at)
    return { at, guarded: guards.some((g) => g.end < at && g.at >= scope) }
  })
}

/**
 * Where the component holding this <video> begins.
 *
 * Without it, a guard in the component ABOVE would count as a guard for an unguarded <video>
 * below it — a file-wide `some()` cannot tell the two apart, and "the file has a guard somewhere"
 * is not the claim being held. Boundaries are function declarations and capitalised const
 * bindings, which is how every component in this repo is written; a lowercase const is deliberately
 * not a boundary, so an ordinary local variable between the guard and the element does not read as
 * a new component and produce a denial the author cannot act on.
 */
function componentStart(clean, at) {
  let start = 0
  for (const m of clean.matchAll(/\bfunction\b|\bconst\s+[A-Z][\w$]*\s*=/g)) {
    if (m.index < at) start = m.index
    else break
  }
  return start
}

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const rel = relative(ROOT, full)
    if (EXCLUDED.some((x) => rel === x || rel.startsWith(x + '/'))) continue
    if (statSync(full).isDirectory()) walk(full, acc)
    else if (entry.endsWith('.tsx') || entry.endsWith('.ts')) acc.push(full)
  }
  return acc
}

// ── Calibration, against fixtures held in this file ──────────────────────────
const broken = []
const judge = (src) => {
  const clean = stripComments(src)
  return judgeVideos(clean, motionNames(clean).size ? motionNames(clean) : new Set(['motionAllowed']))
}

const MUST_FLAG = [
  ['a bare video', 'const motionAllowed = useMotionAllowed()\nreturn <video src={s} />'],
  ['a guard that comes after', 'const motionAllowed = useMotionAllowed()\nreturn <video src={s} />\nif (!motionAllowed) { return <img /> }'],
  ['a guard whose own branch renders film', 'const motionAllowed = useMotionAllowed()\nif (!motionAllowed) { return <video muted /> }\nreturn <img />'],
  ['a guard on the wrong sense', 'const motionAllowed = useMotionAllowed()\nif (motionAllowed) { }\nreturn <video src={s} />'],
  ['a guarded component followed by an unguarded one', 'function A() {\n  const motionAllowed = useMotionAllowed()\n  if (!motionAllowed) { return <img /> }\n  return <video a />\n}\nfunction B() {\n  return <video b />\n}'],
  ['an unguarded arrow component after a guarded one', 'function A() {\n  const motionAllowed = useMotionAllowed()\n  if (!motionAllowed) { return <img /> }\n  return <video a />\n}\nconst B = () => <video b />'],
]
for (const [name, src] of MUST_FLAG) {
  const found = judge(src).filter((v) => !v.guarded)
  if (found.length !== 1) broken.push(`should have flagged ${name}, flagged ${found.length}`)
}

const MUST_PASS = [
  ['the shipped shape', 'const motionAllowed = useMotionAllowed()\nif (!motionAllowed) {\n  return <img src={p} />\n}\nreturn <video src={s} />'],
  ['a guard on a prop, bound elsewhere in the file', 'function Inner({ motionAllowed }) {\n  if (!motionAllowed) { return <picture><img /></picture> }\n  return <video src={s} />\n}\nfunction Outer() { const motionAllowed = useMotionAllowed() }'],
  ['two videos behind one guard', 'const motionAllowed = useMotionAllowed()\nif (!motionAllowed) { return <img /> }\nreturn <><video a /><video b /></>'],
  ['a lowercase local between the guard and the element', 'function A({ motionAllowed }) {\n  if (!motionAllowed) { return <img /> }\n  const frame = { width: 1 }\n  return <video style={frame} />\n}'],
]
for (const [name, src] of MUST_PASS) {
  const found = judge(src).filter((v) => !v.guarded)
  if (found.length !== 0) broken.push(`should have passed ${name}, flagged ${found.length}`)
}

const MUST_SEE_NOTHING = [
  ['a video named only in a doc block', '/**\n * A <video preload="metadata"> in the server HTML is fetched early.\n */\nconst x = 1'],
  ['a video named in a line comment', '// <video> is what this used to render\nconst x = 1'],
  ['a film path in a string', "const s = '/video/landing/hero-A.mp4'"],
]
for (const [name, src] of MUST_SEE_NOTHING) {
  const found = judge(src)
  if (found.length !== 0) broken.push(`should have seen no markup in ${name}, saw ${found.length}`)
}

if (motionNames(stripComments('const allowed = useMotionAllowed()')).has('allowed') === false) {
  broken.push('name reader: did not bind a renamed motion identifier')
}
for (const [name, src, want] of [
  ['a film file', '/video/a.mp4', true],
  ['a poster next to it', '/video/a.jpg', false],
  ['a webm', '/video/a.webm', true],
]) {
  if (FILM_EXT.test(src) !== want) broken.push(`film extension: ${name} should be ${want}`)
}

if (broken.length) {
  console.error('check-film-motion: THIS SCRIPT IS BROKEN and judged nothing about the repository.')
  for (const b of broken) console.error(`  - ${b}`)
  console.error('\nThe fixtures above live inside this file. Fix the reader, then rerun.')
  process.exit(2)
}

// ── The run ──────────────────────────────────────────────────────────────────
const requireBuilt = process.argv.includes('--built')

let files = []
for (const r of ROOTS) {
  try { files = files.concat(walk(join(ROOT, r))) } catch { /* a root may not exist */ }
}
if (files.length === 0) {
  console.error(`check-film-motion: scanned 0 files under ${ROOTS.join(', ')}. The scanner saw nothing, so it proved nothing.`)
  process.exit(2)
}

const allNames = new Set()
const parsed = files.map((f) => {
  const clean = stripComments(readFileSync(f, 'utf8'))
  for (const n of motionNames(clean)) allNames.add(n)
  return { file: relative(ROOT, f), clean }
})
if (allNames.size === 0) {
  console.error(`check-film-motion: nothing in this repository binds ${HOOK}(). The guard this script looks for does not exist here, so a clean verdict would be an accident.`)
  process.exit(2)
}

/* THE CLAIM PASS IS CONDITIONAL, AND NOTHING ELSE HERE IS.
   Every check below runs whether or not a page says a word about reduced motion, because the
   behaviour is owed to the visitor and not to the sentence. Finding a claim only adds a line to
   the verdict naming what is now also a public promise; not finding one removes nothing. The
   scope line prints which happened, so a clean verdict always carries its own coverage. */
const claimSource = parsed.find(({ clean }) => clean.includes(CLAIM_ANCHOR))?.file ?? null

const problems = []
let videoCount = 0
const filmDirs = new Set()
for (const { file, clean } of parsed) {
  for (const v of judgeVideos(clean, allNames)) {
    videoCount++
    if (!v.guarded) {
      problems.push(`${file}:${lineOf(clean, v.at)}  a <video> with no reduced-motion guard in front of it. Return the still first: \`if (!${[...allNames][0]}) { return <img .../> }\`.`)
    }
  }
  for (const m of clean.matchAll(/'(\/[^']*\/)[^'/]*\.(?:mp4|webm|mov|m4v|ogv)'/gi)) filmDirs.add(m[1])
}

// ── The built-output pass ────────────────────────────────────────────────────
const builtDir = join(ROOT, BUILT_DIR)
let builtScope = `built output: SKIPPED, no ${BUILT_DIR} present (run \`npm run build\`, or pass --built to require it)`
if (existsSync(builtDir)) {
  const pages = readdirSync(builtDir).filter((f) => f.endsWith('.html'))
  if (pages.length === 0) {
    console.error(`check-film-motion: ${BUILT_DIR} exists and holds no prerendered page. The instrument read nothing.`)
    process.exit(2)
  }
  let filmDirRefs = 0
  const offences = []
  const dirs = [...filmDirs]
  for (const p of pages) {
    const html = readFileSync(join(builtDir, p), 'utf8')
    for (const d of dirs) filmDirRefs += html.split(d).length - 1
    const videos = (html.match(/<video[\s/>]/g) || []).length
    const films = (html.match(/[^"'\s]+\.(?:mp4|webm|mov|m4v|ogv)\b/gi) || [])
    if (videos) offences.push(`${BUILT_DIR}/${p}  ${videos} <video> element(s) in the markup the server sends`)
    if (films.length) offences.push(`${BUILT_DIR}/${p}  references a film file before the browser has answered: ${[...new Set(films)].join(', ')}`)
  }
  if (dirs.length && filmDirRefs === 0) {
    console.error(`check-film-motion: no prerendered page references ${dirs.join(', ')} at all. A zero from a page that carries no film either way proves nothing, so this run is void rather than clean.`)
    console.error('If the film moved, this script reads its directory out of the source literals — check that the film still ships.')
    process.exit(2)
  }
  problems.push(...offences)
  builtScope = `built output: ${pages.length} prerendered page(s) · ${filmDirRefs} reference(s) to ${dirs.join(', ') || 'the film directory'} (posters, the known-positive) · ${offences.length} film byte(s) in server markup`
} else if (requireBuilt) {
  console.error(`check-film-motion: --built was passed and ${BUILT_DIR} does not exist. This script judged the source only, which is not what was asked of it.`)
  process.exit(2)
}

const claimScope = claimSource
  ? `also a public claim, in ${claimSource}`
  : `claim pass: NO PUBLIC CLAIM on the site (searched ${files.length} authored file(s) for "${CLAIM_ANCHOR}") — the behaviour is held for the visitor, not for a sentence`
console.log(`check-film-motion: ${files.length} files · ${videoCount} <video> element(s) authored · guard identifier(s) ${[...allNames].join(', ')} read from ${HOOK}() · ${claimScope}`)
console.log(`check-film-motion: ${builtScope}`)
if (problems.length) {
  console.error(`\ncheck-film-motion: ${problems.length} way(s) film can reach a visitor who asked for none.`)
  for (const p of problems) console.error(`  - ${p}`)
  if (claimSource) console.error(`\nThe sentence being held, on ${claimSource}: "${CLAIM_ANCHOR}..."`)
  process.exit(1)
}
console.log('check-film-motion: ok — every authored <video> is behind the reduced-motion guard, and no prerendered page carries film.')
