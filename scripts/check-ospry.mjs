#!/usr/bin/env node
/**
 * check-ospry.mjs: the Ospry tag is in <head>, exactly once, on every page. Entry doc: docs/OSPRY.md.
 *
 *   node scripts/check-ospry.mjs --built   every prerendered route in .next/server/app (postbuild)
 *   node scripts/check-ospry.mjs --live    the tag endpoint itself, plus the tag on portlink.app
 *   node scripts/check-ospry.mjs --live https://deploy-preview-1--portlin-landing-2.netlify.app
 *
 * Exit 0 = pass, 1 = a page is missing the tag or carries it twice, 2 = could not measure.
 *
 * WHY --live REPORTS THE ENDPOINT. On 28.09.2026 the tag URL answered 404 "Not found", so the site
 * shipped a tag that loads nothing until Ospry activates the account. That state is invisible from
 * the page source, and the day it flips is the day the consent banner has to be checked from a
 * European visitor's browser. `--live` prints which of the two states the tag is in, so nobody has
 * to remember it was ever inert.
 *
 * The src is read out of lib/ospry.ts rather than restated here, so an account change cannot leave
 * this check asserting the old id.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function fail(message, code = 1) {
  console.error(`check:ospry: ${message}`)
  process.exit(code)
}

const source = fs.readFileSync(path.join(ROOT, 'lib/ospry.ts'), 'utf8')
const id = source.match(/OSPRY_ACCOUNT_ID = '([0-9a-f-]{36})'/)?.[1]
const tpl = source.match(/OSPRY_TAG_SRC = `([^`]+)`/)?.[1]
if (!id || !tpl) fail('could not read OSPRY_ACCOUNT_ID / OSPRY_TAG_SRC out of lib/ospry.ts.', 2)
const SRC = tpl.replace('${OSPRY_ACCOUNT_ID}', id)

/** Problems with one page's HTML, or an empty list. */
function inspect(html) {
  const tags = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].filter((m) => m[1] === SRC)
  if (tags.length === 0) return ['tag missing']
  const problems = []
  if (tags.length > 1) problems.push(`tag present ${tags.length} times`)
  const headEnd = html.indexOf('</head>')
  if (headEnd === -1 || tags[0].index > headEnd) problems.push('tag outside <head>')
  if (!/\basync\b/.test(tags[0][0])) problems.push('tag is not async')
  return problems
}

// The self-test runs first on every mode: a check that cannot see the tag must not report a pass.
const fixture = `<html><head><script async="" src="${SRC}"></script></head><body></body></html>`
if (inspect(fixture).length) fail('self-test: a correct page was refused.', 2)
if (!inspect('<html><head></head><body></body></html>').includes('tag missing')) fail('self-test: a page without the tag passed.', 2)
if (!inspect(fixture.replace('</head>', `</head><script async src="${SRC}"></script>`)).length) fail('self-test: a duplicate tag passed.', 2)

if (process.argv.includes('--built')) {
  const builtRoot = path.join(ROOT, '.next/server/app')
  if (!fs.existsSync(builtRoot)) fail('build output is missing; run next build first.', 2)
  const bad = []
  let count = 0
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      // Next's own crash page renders without the root layout, by design: it replaces the layout
      // when the layout itself throws. A page that exists because the site broke is no place for a tag.
      else if (entry.name.endsWith('.html') && entry.name !== '_global-error.html') {
        count++
        const problems = inspect(fs.readFileSync(full, 'utf8'))
        if (problems.length) bad.push(`${path.relative(builtRoot, full)}: ${problems.join(', ')}`)
      }
    }
  }
  walk(builtRoot)
  if (count === 0) fail('no prerendered HTML found under .next/server/app.', 2)
  if (bad.length) fail(`${bad.length} of ${count} rendered pages are wrong:\n  ${bad.join('\n  ')}`)
  console.log(`check:ospry built: the tag is in <head>, once and async, on all ${count} prerendered pages; self-test passed.`)
} else if (process.argv.includes('--live')) {
  const base = (process.argv[process.argv.indexOf('--live') + 1] ?? '').startsWith('http')
    ? process.argv[process.argv.indexOf('--live') + 1].replace(/\/$/, '')
    : 'https://portlink.app'
  const tag = await fetch(SRC, { headers: { Referer: `${base}/` } })
  const body = await tag.text()
  console.log(`tag endpoint ${SRC}: HTTP ${tag.status}, ${body.length} bytes${tag.ok ? '' : `, "${body.slice(0, 40)}"`}`)
  console.log(tag.ok
    ? '  ACTIVE: the tag now runs. Verify the consent banner from a European browser (docs/OSPRY.md).'
    : '  INERT: Ospry serves nothing for this account yet, so the tag loads nothing.')
  let bad = 0
  for (const route of ['/', '/privacy/', '/contact/', '/team/', '/seatrade/']) {
    const res = await fetch(base + route)
    const problems = res.ok ? inspect(await res.text()) : [`HTTP ${res.status}`]
    if (problems.length) bad++
    console.log(`${base}${route}: ${problems.length ? problems.join(', ') : 'tag in <head>, once, async'}`)
  }
  if (bad) process.exit(1)
} else {
  fail('pass --built or --live.', 2)
}
