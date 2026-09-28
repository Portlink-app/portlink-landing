#!/usr/bin/env node
/**
 * check-ospry.mjs: the Ospry tag NEVER appears in rendered HTML. Entry doc: docs/OSPRY.md.
 *
 *   node scripts/check-ospry.mjs --built   every prerendered page in .next/server/app (postbuild)
 *   node scripts/check-ospry.mjs --live    the tag endpoint's state, plus the same rule on portlink.app
 *   node scripts/check-ospry.mjs --live https://deploy-preview-1--portlin-landing-2.netlify.app
 *
 * Exit 0 = pass, 1 = the tag is in a page, 2 = could not measure.
 *
 * ⛔ THE TRAP THIS GUARDS, SPRUNG 28.09.2026. The tag went into <head> as the vendor asked, on the
 * reading that its own consent banner gated it. It did not: the loader served for this account
 * has the banner switched off, and the pixel grants itself consent after 1.2 s when it finds no
 * consent platform. Every visitor was identified for eleven minutes until the revert. The tag is
 * now inserted only by lib/consent.ts, after a yes, so a <script> carrying its src in server HTML
 * is by definition a load without consent. That is what this refuses.
 *
 * The src is read out of lib/ospry.ts rather than restated, so an account change cannot leave
 * this check looking for the old id.
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
// Every optional tag the consent registry in lib/consent.ts loads: Ospry and Google Analytics.
const HOSTS = /https:\/\/(px|i|t|sec|popup)\.lspxl\.com|https:\/\/cdn\.lgncmp\.com|https:\/\/www\.googletagmanager\.com|google-analytics\.com/

/** Script or preload elements in one page that point at Ospry. Empty = clean. */
function offenders(html) {
  return [...html.matchAll(/<(script|link)\b[^>]*\b(src|href)="([^"]+)"[^>]*>/g)]
    .filter((m) => m[3] === SRC || HOSTS.test(m[3]))
    .map((m) => `<${m[1]} ${m[2]}="${m[3]}">`)
}

// Self-test first: a check that cannot see the tag must not report a clean page.
if (!offenders(`<head><script async="" src="${SRC}"></script></head>`).length) fail('self-test: the tag in <head> was not seen.', 2)
if (!offenders('<link rel="preload" as="script" href="https://cdn.lgncmp.com/cmp/v3/loader.js">').length) fail('self-test: a preload of the vendor CDN was not seen.', 2)
if (!offenders('<script async src="https://www.googletagmanager.com/gtag/js?id=G-X"></script>').length) fail('self-test: gtag.js in a page was not seen.', 2)
if (offenders('<head><script src="/_next/static/chunks/a.js"></script></head>').length) fail('self-test: a first-party script was refused.', 2)

if (process.argv.includes('--built')) {
  const builtRoot = path.join(ROOT, '.next/server/app')
  if (!fs.existsSync(builtRoot)) fail('build output is missing; run next build first.', 2)
  const bad = []
  let count = 0
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(full)
      else if (entry.name.endsWith('.html')) {
        count++
        const found = offenders(fs.readFileSync(full, 'utf8'))
        if (found.length) bad.push(`${path.relative(builtRoot, full)}: ${found.join(', ')}`)
      }
    }
  }
  walk(builtRoot)
  if (count === 0) fail('no prerendered HTML found under .next/server/app.', 2)
  if (bad.length) fail(`the Ospry tag is in server HTML, so it would load before consent:\n  ${bad.join('\n  ')}`)
  console.log(`check:ospry built: no Ospry or Google Analytics tag in any of ${count} prerendered pages, it loads only after consent; self-test passed.`)
} else if (process.argv.includes('--live')) {
  const arg = process.argv[process.argv.indexOf('--live') + 1] ?? ''
  const base = arg.startsWith('http') ? arg.replace(/\/$/, '') : 'https://portlink.app'
  const tag = await fetch(SRC, { headers: { Referer: `${base}/` } })
  const body = await tag.text()
  console.log(`tag endpoint: HTTP ${tag.status}, ${body.length} bytes`)
  const loader = body.match(/var wantLoader = (true|false)/)?.[1]
  if (loader) console.log(`  vendor banner in the loader: ${loader === 'true' ? 'ON' : 'off'} (ours gates the tag either way)`)
  let bad = 0
  for (const route of ['/', '/privacy/', '/contact/', '/team/']) {
    const res = await fetch(base + route)
    const found = res.ok ? offenders(await res.text()) : [`HTTP ${res.status}`]
    if (found.length) bad++
    console.log(`${base}${route}: ${found.length ? found.join(', ') : 'no tag before consent'}`)
  }
  if (bad) process.exit(1)
} else {
  fail('pass --built or --live.', 2)
}
