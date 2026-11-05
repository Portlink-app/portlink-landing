#!/usr/bin/env node
/**
 * check-provenance.mjs: nothing the site ships may be another company's font, stylesheet or bundle.
 *
 *   node scripts/check-provenance.mjs                 authored source of this checkout (verify)
 *   node scripts/check-provenance.mjs --root <dir>    another checkout, e.g. an old commit's worktree
 *
 * Exit 0 = pass, 1 = third-party material is in shipped source, 2 = could not measure.
 *
 * ⛔ THE TRAP THIS GUARDS. PR #26 (b25b2b2, 04.11.2026) put two unlisted pages under
 * public/product-family/ that served Butter's commercial fonts (Die Grotesk, ABC Diatype) and
 * Butter's compiled Next.js stylesheet from portlink.app. The fonts were byte-identical to
 * marketing.butter.video/_next/static/media/<same file names> (measured 05.11.2026). The stylesheet
 * was reformatted, its font URLs rewritten and its variables aliased, so a hash list alone would
 * not have caught it. They came from a website cloner that copies "the files the source actually
 * loads". Reference sites are observed, never shipped. So this check refuses, in app, components,
 * lib, hooks and public:
 *
 *   1. a font binary anywhere but app/_fonts/, or one there whose family is not ours;
 *   2. an @font-face whose font-family is not one of our three self-hosted families;
 *   3. styled-components output (`/*!sc*\/`, `data-styled`): this app has no styled-components,
 *      so any such text is another site's compiled CSS;
 *   4. a sourceMappingURL pointing at a hashed Next.js chunk (`<16 hex>.css.map`): authored files
 *      never carry one, a copied production bundle always does;
 *   5. any file whose sha256 matches a third-party asset captured from a reference site.
 *
 * Adding a family is a deliberate act: self-host it through scripts/sync-fonts.mjs (licence
 * checked) and add it to FAMILIES below in the same commit.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const rootArg = process.argv.indexOf('--root')
const ROOT = rootArg > -1 ? path.resolve(process.argv[rootArg + 1] ?? '') : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIRS = ['app', 'components', 'lib', 'hooks', 'public']

// Our self-hosted families: the file prefix scripts/sync-fonts.mjs writes, and the CSS name.
const FAMILIES = [
  { file: 'inter-', css: 'Inter' },
  { file: 'jetbrains-mono-', css: 'JetBrains Mono' },
  { file: 'plus-jakarta-sans-', css: 'Plus Jakarta Sans' },
]
const FONT_DIR = 'app/_fonts'
const FONT_FILE = /\.(woff2?|ttf|otf|eot)$/i
const TEXT_FILE = /\.(css|scss|html?|tsx?|jsx?|mjs|cjs|svg|json)$/i

// sha256 of third-party files captured from reference sites. Never ship a file with these bytes.
const FOREIGN = new Map([
  ['1afef766940a7d965729011372ae978937455394fd8844137fdac82494f5447e', 'Butter: Die Grotesk woff2 (marketing.butter.video 5fb8d156cdd6d753-s.p.woff2)'],
  ['8edc2bbd973287215b15c6c181d2763c84f4c5b13414f4d00ab8f5907892d7c8', 'Butter: ABC Diatype woff2 (marketing.butter.video da60608f2183158e-s.p.woff2)'],
  ['a30a47bd7d28bbaf906c417f71c2931ddc9d12550b7b519c213492e78f2afd69', 'Butter: compiled stylesheet (marketing.butter.video 2836d44e2fdcb041.css)'],
  ['b91f72f97073f8e14f48faec001fd3b80bdbf1753507d05deecec69846d542d0', 'Butter: compiled stylesheet as shipped in PR #26 (butter.css)'],
])

const OURS = new Set(FAMILIES.map((f) => f.css.toLowerCase()))
const FACE = /@font-face\s*\{[^}]*?font-family\s*:\s*(['"]?)([^;'"}]+)\1/gi
const STYLED = /\/\*!sc\*\/|data-styled(?:\.g\d+)?\[/
const CHUNK_MAP = /sourceMappingURL=[0-9a-f]{16}\.css\.map/

function fail(message, code = 1) {
  console.error(`check:provenance: ${message}`)
  process.exit(code)
}

/** Problems in one text file's content. Empty = clean. */
function textHits(text) {
  const out = []
  for (const m of text.matchAll(FACE)) {
    const family = m[2].trim()
    if (!OURS.has(family.toLowerCase())) out.push(`@font-face for "${family}", not one of our families`)
  }
  if (STYLED.test(text)) out.push('styled-components output (another site\'s compiled CSS)')
  if (CHUNK_MAP.test(text)) out.push('sourceMappingURL to a hashed Next.js chunk (a copied production bundle)')
  return out
}

/** Problems with one font binary's location and name. Empty = clean. */
function fontHits(rel) {
  if (path.dirname(rel) !== FONT_DIR) return [`font file outside ${FONT_DIR}/`]
  const name = path.basename(rel).toLowerCase()
  return FAMILIES.some((f) => name.startsWith(f.file)) ? [] : ['font file of a family that is not ours']
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full, out)
    else out.push(full)
  }
  return out
}

// Self-test first: a check that cannot see the defect must not report a clean site.
if (!textHits('@font-face{font-family:DieGrotesk;src:url(/a.woff2) format("woff2")}').length) fail('self-test: a foreign @font-face was not seen.', 2)
if (!textHits("@font-face { font-family: 'ABC Diatype'; src: url(x.woff2) }").length) fail('self-test: a quoted foreign @font-face was not seen.', 2)
if (textHits("@font-face {\n  font-family: 'Plus Jakarta Sans';\n  src: url(./a.woff2);\n}").length) fail('self-test: our own @font-face was refused.', 2)
if (!textHits('body{color:red}/*!sc*/').length) fail('self-test: styled-components output was not seen.', 2)
if (!textHits('/*# sourceMappingURL=2836d44e2fdcb041.css.map*/').length) fail('self-test: a chunk source map was not seen.', 2)
if (textHits('font-family: var(--font-display); /* never ship a reference site\'s bundle */').length) fail('self-test: plain authored CSS was refused.', 2)
if (!fontHits('public/x/5fb8d156cdd6d753-s.p.woff2').length) fail('self-test: a font outside app/_fonts was not seen.', 2)
if (fontHits('app/_fonts/inter-v20-latin.woff2').length) fail('self-test: our own font was refused.', 2)

if (!fs.existsSync(path.join(ROOT, 'package.json'))) fail(`${ROOT} is not a checkout of this site.`, 2)
const files = DIRS.flatMap((d) => walk(path.join(ROOT, d)))
if (files.length < 20) fail(`only ${files.length} files found under ${ROOT}; the scan is not looking where the site lives.`, 2)

const bad = []
let fonts = 0
for (const file of files) {
  const rel = path.relative(ROOT, file).split(path.sep).join('/')
  const bytes = fs.readFileSync(file)
  const sha = crypto.createHash('sha256').update(bytes).digest('hex')
  const found = FOREIGN.has(sha) ? [FOREIGN.get(sha)] : []
  if (FONT_FILE.test(rel)) { fonts++; found.push(...fontHits(rel)) }
  else if (TEXT_FILE.test(rel)) found.push(...textHits(bytes.toString('utf8')))
  if (found.length) bad.push(`${rel}: ${found.join('; ')}`)
}
// Known positive: our own fonts must be visible, or the font rules above measured nothing.
if (!fonts) fail(`no font files found under ${FONT_DIR}/; the scan cannot see fonts.`, 2)
if (bad.length) fail(`third-party material in shipped source:\n  ${bad.join('\n  ')}\nObserve reference sites; never ship their files. See the header of this script.`)
console.log(`check:provenance: ${files.length} files clean (${fonts} fonts, all ours in ${FONT_DIR}/); self-test passed.`)
