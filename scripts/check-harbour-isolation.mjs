#!/usr/bin/env node
/**
 * check-harbour-isolation: the One Harbour page (/harbour) touches nothing that already ships.
 *
 * Two passes, each blind where the other sees (DIRECTION.md section 7, "Guard"):
 *   source  `git diff <merge-base with origin/main> -- app/page.tsx components/sections
 *           components/scenes components/film app/_ds` is empty. The page may import from those
 *           places; it may not edit them. Working-tree changes count, so an uncommitted edit fails
 *           the same as a committed one.
 *   --built the prerendered /harbour HTML (.next/server/app/harbour.html) names no sequence file:
 *           nothing under /media/harbour-2026-11/ and no .webp frame. Sequences are fetched only
 *           behind `?bakeoff=` on the client, so the server markup must never mention them.
 *           Requires a build; refuses to report a zero it did not earn.
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
const SEQUENCE_REFS = [/\/media\/harbour-2026-11\//, /\.webp\b/i]
const STRICT = process.env.HARBOUR_ISOLATION_STRICT === '1'
const built = process.argv.includes('--built')

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
  const hits = SEQUENCE_REFS.filter((re) => re.test(html)).map(String)
  if (hits.length) {
    console.error(`check-harbour-isolation FAIL: built /harbour references sequence files (${hits.join(', ')}).`)
    process.exit(1)
  }
  console.log(`check-harbour-isolation: built /harbour (${html.length} bytes) references no sequence file.`)
}

sourcePass()
if (built) builtPass()
