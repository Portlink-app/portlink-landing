#!/usr/bin/env node
/**
 * check-consent-gate.mjs: no consent-gated third-party tag ever appears in rendered HTML.
 * Entry doc: docs/CONSENT.md.
 *
 *   node scripts/check-consent-gate.mjs --built   every prerendered page in .next/server/app (postbuild)
 *   node scripts/check-consent-gate.mjs --live    the same rule on portlink.app (npm run check:consent-gate)
 *   node scripts/check-consent-gate.mjs --live https://deploy-preview-1--portlin-landing-2.netlify.app
 *
 * Exit 0 = pass, 1 = a gated tag is in a page, 2 = could not measure.
 *
 * ⛔ THE TRAP THIS GUARDS, SPRUNG 28.09.2026. The Ospry tag went into <head> as its vendor asked, on
 * the reading that its own banner gated it. It did not: the vendor pixel grants itself consent after
 * 1.2 s when it finds no consent platform, and every visitor was identified for eleven minutes until
 * the revert. Since then every optional tag is inserted only by lib/consent.ts after a yes, so a
 * <script> or preload for one of these hosts in server HTML is by definition a load without consent.
 * Ospry was retired on 29.09.2026; its hosts stay on the list so it can never come back unnoticed.
 *
 * First-party visitor intelligence (/api/intel/v) is not on the list on purpose: it sets no cookie
 * and is not consent-gated (docs/VISITOR-INTELLIGENCE.md).
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const GATED = [
  { name: 'Google Analytics', re: /https:\/\/www\.googletagmanager\.com|google-analytics\.com/ },
  { name: 'Ospry (retired)', re: /https:\/\/(px|i|t|sec|popup)\.lspxl\.com|https:\/\/(cdn\.)?lgncmp\.com/ },
]

function fail(message, code = 1) {
  console.error(`check:consent-gate: ${message}`)
  process.exit(code)
}

/** Script or preload elements in one page that point at a gated host. Empty = clean. */
function offenders(html) {
  return [...html.matchAll(/<(script|link)\b[^>]*\b(src|href)="([^"]+)"[^>]*>/g)]
    .filter((m) => GATED.some((g) => g.re.test(m[3])))
    .map((m) => `<${m[1]} ${m[2]}="${m[3]}">`)
}

// Self-test first: a check that cannot see a tag must not report a clean page.
if (!offenders('<head><script async src="https://www.googletagmanager.com/gtag/js?id=G-X"></script></head>').length) fail('self-test: gtag.js was not seen.', 2)
if (!offenders('<script async src="https://px.lspxl.com/c/x"></script>').length) fail('self-test: the Ospry tag was not seen.', 2)
if (!offenders('<link rel="preload" as="script" href="https://cdn.lgncmp.com/cmp/v3/loader.js">').length) fail('self-test: a vendor preload was not seen.', 2)
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
  if (bad.length) fail(`a consent-gated tag is in server HTML, so it would load before consent:\n  ${bad.join('\n  ')}`)
  console.log(`check:consent-gate built: no ${GATED.map((g) => g.name).join(' or ')} tag in any of ${count} prerendered pages; self-test passed.`)
} else if (process.argv.includes('--live')) {
  const arg = process.argv[process.argv.indexOf('--live') + 1] ?? ''
  const base = arg.startsWith('http') ? arg.replace(/\/$/, '') : 'https://portlink.app'
  let bad = 0
  for (const route of ['/', '/privacy/', '/contact/', '/team/']) {
    const res = await fetch(base + route)
    const found = res.ok ? offenders(await res.text()) : [`HTTP ${res.status}`]
    if (found.length) bad++
    console.log(`${base}${route}: ${found.length ? found.join(', ') : 'no gated tag before consent'}`)
  }
  if (bad) process.exit(1)
} else {
  fail('pass --built or --live.', 2)
}
