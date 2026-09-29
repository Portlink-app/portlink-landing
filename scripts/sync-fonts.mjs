#!/usr/bin/env node
/**
 * sync-fonts.mjs: rebuild app/_fonts/ (fonts.css + the woff2 files) from Google Fonts.
 * Run by hand, never by the build: `node scripts/sync-fonts.mjs`, then commit what it wrote.
 *
 * The site serves its three families from its own origin. A visitor's browser never talks to
 * fonts.googleapis.com or fonts.gstatic.com, because that request hands the visitor's IP to Google
 * before any consent (LG München I, 20.01.2022, 3 O 17493/20), and /privacy/ says nothing but the
 * listed features collects anything. scripts/check-font-hosts.mjs fails the build if a Google font
 * URL comes back.
 *
 * What this does: asks Google's css2 API for exactly the three stylesheets the site used to
 * @import (same families, weights and font-display), as a current desktop Chrome, downloads every
 * woff2 it names, and writes the @font-face rules back VERBATIM with only the url() changed to a
 * relative path. The families keep their real names ("Plus Jakarta Sans", "Inter", "JetBrains
 * Mono"), so the design-system stacks in app/_ds/portlink-tokens.dist.css resolve unchanged and no
 * DS token is redefined here (../portlink-design-system/CONSUMERS.md: no local token overrides).
 *
 * Chose local woff2 + verbatim @font-face, over next/font/google, because next/font renames each
 * family to a hashed name (`__Plus_Jakarta_Sans_…`), so every DS font token would need a local
 * override, and it adds size-adjusted fallback faces that change the swap-period rendering. Revisit
 * if the DS itself ships its font files or its stacks start reading a CSS variable.
 *
 * Idempotent: running it twice with no upstream change produces no diff. Files are named by family,
 * Google's version segment and subset; a static (non-variable) family would get one file per
 * weight, which the name handles by appending the weight when the URL differs.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const OUT = path.join(ROOT, 'app/_fonts')

// The exact stylesheets app/globals.css imported from Google until 29.09.2026.
const SHEETS = [
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=optional',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
  'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap',
]
// css2 answers per user agent; a current Chrome gets woff2 split by unicode-range, which is what
// every modern browser was being served.
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36'

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

async function get(url, as) {
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return as === 'buffer' ? Buffer.from(await res.arrayBuffer()) : res.text()
}

const files = new Map() // google url -> local file name
const taken = new Map() // local file name -> google url
const blocks = []

for (const sheet of SHEETS) {
  const css = await get(sheet)
  const faces = [...css.matchAll(/\/\* ([\w-]+) \*\/\s*@font-face\s*\{([^}]+)\}/g)]
  if (!faces.length) throw new Error(`no @font-face blocks parsed from ${sheet}`)
  const family = /family=([^:&]+)/.exec(sheet)[1].replace(/\+/g, ' ')
  blocks.push(`/* ${family}: ${sheet.replace('https://fonts.googleapis.com/', '')} */`)
  for (const [, subset, body] of faces) {
    const src = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/.exec(body)?.[1]
    if (!src) throw new Error(`no woff2 url in the ${subset} block of ${sheet}`)
    const weight = /font-weight:\s*(\d+)/.exec(body)?.[1] ?? '400'
    const version = /\/(v\d+)\//.exec(src)?.[1] ?? 'v0'
    if (!files.has(src)) {
      let name = `${slug(family)}-${version}-${subset}.woff2`
      if (taken.has(name) && taken.get(name) !== src) name = name.replace('.woff2', `-${weight}.woff2`)
      files.set(src, name)
      taken.set(name, src)
    }
    blocks.push(`/* ${subset} */\n@font-face {${body.replace(src, `./${files.get(src)}`)}}`)
  }
}

fs.mkdirSync(OUT, { recursive: true })
const keep = new Set(files.values())
for (const f of fs.readdirSync(OUT)) if (f.endsWith('.woff2') && !keep.has(f)) fs.unlinkSync(path.join(OUT, f))
for (const [src, name] of files) {
  const dest = path.join(OUT, name)
  const buf = await get(src, 'buffer')
  if (buf.subarray(0, 4).toString() !== 'wOF2') throw new Error(`${src} is not a woff2 file`)
  if (!fs.existsSync(dest) || !fs.readFileSync(dest).equals(buf)) fs.writeFileSync(dest, buf)
}

// SIL Open Font License 1.1, clause 2: every redistributed copy carries the copyright notice and
// the licence. The woff2 files keep the copyright (name ID 0) but Google's subsetting drops the
// licence text (name ID 13), so the licence ships next to them, taken from google/fonts.
for (const sheet of SHEETS) {
  const family = /family=([^:&]+)/.exec(sheet)[1].replace(/\+/g, ' ')
  const text = await get(`https://raw.githubusercontent.com/google/fonts/main/ofl/${family.toLowerCase().replace(/ /g, '')}/OFL.txt`)
  if (!text.includes('SIL Open Font License')) throw new Error(`the OFL text for ${family} does not look like the licence`)
  fs.writeFileSync(path.join(OUT, `OFL-${slug(family)}.txt`), text)
}

const header = `/* GENERATED by scripts/sync-fonts.mjs. Do not hand-edit; re-run the script.
   Self-hosted copies of the Google Fonts stylesheets the site used to load from Google, with the
   @font-face rules kept verbatim and only url() pointed at the files next to this one. Why, and
   why not next/font: see the header of scripts/sync-fonts.mjs. */\n\n`
fs.writeFileSync(path.join(OUT, 'fonts.css'), header + blocks.join('\n') + '\n')
const bytes = [...keep].reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0)
console.log(`sync-fonts: ${blocks.length - SHEETS.length} @font-face rules, ${keep.size} woff2 files (${bytes} bytes) in app/_fonts/`)
