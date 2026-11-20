#!/usr/bin/env node
/**
 * check-harbour-isolation: the One Harbour page (/harbour) touches nothing that already ships.
 *
 * Two passes, each blind where the other sees (DIRECTION.md section 7, "Guard"):
 *   source  `git diff <merge-base with origin/main> -- app/page.tsx components/sections
 *           components/scenes components/film app/_ds` is empty. The page may import from those
 *           places; it may not edit them. Working-tree changes count, so an uncommitted edit fails
 *           the same as a committed one.
 *   --built the prerendered /harbour HTML (.next/server/app/harbour.html) names no sequence file.
 *           v2 (DIRECTION.md 12.8 WP2) removed the video: no SequencePlayer, no clips, no
 *           `?bakeoff=` arm, so the markup may name no video at all (.mp4, .webm, .mov, <video>). The rule is an allowlist, not a sequence path list: every
 *           /media/harbour-2026-11/ reference and every .webp in the markup must be a product
 *           capture (`/media/harbour-2026-11/captures/P<nn>-desktop|phone.webp`, which the page
 *           serves as stills). Anything else fails, so a sequence frame moved outside `bakeoff/`
 *           is still caught. Requires a build; refuses to report a zero it did not earn.
 *   --selftest proves the classifier on fixed cases (a capture passes; bakeoff frames, a
 *           sequence frame outside its path and a capture-lookalike fail) before anything relies
 *           on it.
 *
 * WHEN THE SOURCE PASS CANNOT MEASURE it says so and exits 0 (never a false fail, never a silent
 * pass): no git, no origin/main ref, or no merge-base (a shallow clone). `.github/workflows/ci.yml`
 * runs `actions/checkout@v4` with the default depth of 1, so CI has neither; there the verdict is
 * "NOT MEASURED" and the built pass plus the review diff carry the guard. Set
 * HARBOUR_ISOLATION_STRICT=1 to turn NOT MEASURED into a failure.
 *
 * EXITS: 0 clean or not measured (printed) · 1 a violation · 2 this script is broken or an
 * artifact it needed was missing.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const GUARDED = ['app/page.tsx', 'components/sections', 'components/scenes', 'components/film', 'app/_ds']
const BUILT_PAGE = '.next/server/app/harbour.html'
// A reference is any harbour media path or any .webp file name the markup carries. A backslash
// ends a reference: the RSC payload inlined in the HTML escapes its quotes (`...webp\"`), so
// without it every capture in the payload reads as `P01-desktop.webp\` and fails the allowlist.
const MEDIA_REF = /\/media\/harbour-2026-11\/[^"'\\\s)<>?#]*|[^"'\\\s()<>=,]*\.webp\b/gi
// The only harbour media the server markup may name: a product capture still.
const CAPTURE = /^\/media\/harbour-2026-11\/captures\/P\d{2}-(desktop|phone)\.webp$/
const STRICT = process.env.HARBOUR_ISOLATION_STRICT === '1'
const built = process.argv.includes('--built')
const selftest = process.argv.includes('--selftest')

/** Every harbour media or .webp reference in `html` that is not a product capture. */
/** Any video at all: a file by extension, or a <video> element. /harbour carries none (WP2). */
const VIDEO_REF = /[^"'\\\s()<>=,]*\.(?:mp4|webm|mov|m4v)\b|<video\b/gi

export function sequenceRefs(html) {
  const refs = [...(html.match(MEDIA_REF) ?? []), ...(html.match(VIDEO_REF) ?? [])]
  return [...new Set(refs)].filter((r) => !CAPTURE.test(r))
}

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

function notMeasured(why) {
  console.log(`check-harbour-isolation: source pass NOT MEASURED (${why}). Scope: ${GUARDED.join(' ')}.`)
  if (STRICT) {
    console.error('HARBOUR_ISOLATION_STRICT=1: a pass that cannot measure is a failure.')
    process.exit(1)
  }
}

function sourcePass() {
  let base
  try {
    git('rev-parse', '--git-dir')
  } catch {
    return notMeasured('git is unavailable or this is not a work tree')
  }
  try {
    git('rev-parse', '--verify', '--quiet', 'refs/remotes/origin/main')
  } catch {
    return notMeasured('no origin/main ref, as in a fresh or shallow CI checkout')
  }
  try {
    base = git('merge-base', 'origin/main', 'HEAD')
  } catch {
    return notMeasured('no merge-base with origin/main, as in a shallow clone')
  }
  let names
  try {
    // Compares the merge-base with the working tree: committed and uncommitted edits both count.
    names = git('diff', '--name-only', base, '--', ...GUARDED)
  } catch (e) {
    console.error(`check-harbour-isolation: git diff failed, nothing judged: ${e.message}`)
    process.exit(2)
  }
  if (names) {
    console.error('check-harbour-isolation FAIL: /harbour must not edit shipped surfaces. Changed:')
    for (const n of names.split('\n')) console.error(`  ${n}`)
    process.exit(1)
  }
  console.log(`check-harbour-isolation: source clean against merge-base ${base.slice(0, 7)} (${GUARDED.join(' ')}).`)
}

function builtPass() {
  const file = join(ROOT, BUILT_PAGE)
  if (!existsSync(file) || !statSync(file).isFile()) {
    console.error(`check-harbour-isolation: ${BUILT_PAGE} is missing. Run next build first; nothing judged.`)
    process.exit(2)
  }
  const html = readFileSync(file, 'utf8')
  if (!/One Harbour|harbour-s0/.test(html)) {
    console.error('check-harbour-isolation: built /harbour has no harbour markup; read the wrong artifact. Nothing judged.')
    process.exit(2)
  }
  const hits = sequenceRefs(html)
  if (hits.length) {
    console.error('check-harbour-isolation FAIL: built /harbour references sequence files:')
    for (const h of hits.slice(0, 20)) console.error(`  ${h}`)
    process.exit(1)
  }
  const captures = new Set((html.match(MEDIA_REF) ?? []).filter((r) => CAPTURE.test(r))).size
  console.log(`check-harbour-isolation: built /harbour (${html.length} bytes) references no video or sequence file (${captures} capture stills allowed).`)
}

function selftestPass() {
  // Each case states its verdict first. Pairs differ by one thing, so a classifier that refuses
  // everything, or nothing, fails here.
  const cases = [
    ['capture still (known negative)', '<img src="/media/harbour-2026-11/captures/P06-desktop.webp">', 0],
    ['capture still, phone, in srcset', 'srcSet="/media/harbour-2026-11/captures/P12-phone.webp 390w"', 0],
    ['bakeoff frame (known positive)', '<link href="/media/harbour-2026-11/bakeoff/hero-A-webp/001.webp">', 1],
    ['bakeoff directory only', '"/media/harbour-2026-11/bakeoff/hero-A-webp"', 1],
    ['bakeoff intra video', '"/media/harbour-2026-11/bakeoff/hero-A-intra.mp4"', 1],
    ['sequence frame outside its path', '<img src="/media/harbour-2026-11/captures/frames/001.webp">', 1],
    ['sequence frame outside harbour media', '<img src="/video/seq/014.webp">', 1],
    ['capture lookalike with a suffix', '"/media/harbour-2026-11/captures/P06-desktop-2.webp"', 1],
    ['video element, no harbour path (known positive)', '<video src="x.mp4"></video>', 1],
    ['webm clip anywhere', '"/media/other/clip.webm"', 1],
    ['bare video tag without a source', '<video autoplay muted>', 1],
    ['the word video in copy (known negative)', '<p>No video on this page.</p>', 0],
    ['no harbour media at all', '<main>One Harbour</main>', 0],
    ['capture still in the escaped RSC payload', 'self.__next_f.push([1,"{\\"src\\":\\"/media/harbour-2026-11/captures/P06-desktop.webp\\"}"])', 0],
    ['bakeoff frame in the escaped RSC payload', 'self.__next_f.push([1,"{\\"src\\":\\"/media/harbour-2026-11/bakeoff/hero-A-webp/001.webp\\"}"])', 1],
  ]
  let bad = 0
  for (const [name, html, want] of cases) {
    const got = sequenceRefs(html).length
    const ok = (got > 0) === (want > 0)
    if (!ok) bad++
    console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${name}: expected ${want ? 'refused' : 'allowed'}, got ${got ? 'refused' : 'allowed'}`)
  }
  if (bad) {
    console.error(`check-harbour-isolation --selftest: ${bad} case(s) wrong; the built pass cannot be trusted.`)
    process.exit(2)
  }
  console.log(`check-harbour-isolation --selftest: ${cases.length} cases matched.`)
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]
if (isMain) {
  if (selftest) selftestPass()
  else {
    sourcePass()
    if (built) builtPass()
  }
}
