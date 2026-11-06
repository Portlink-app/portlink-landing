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
 *   6. anything under public/clone/: where the product-page clones kept their reference
 *      stylesheets and faces until the swap (06.11.2026);
 *   7. a reference build's own identifiers in authored text: CSS-module hashes
 *      (`zagma_f56dd2b7-module__v7H3wa__className`), styled-components component ids
 *      (`index-style__HeaderMain-sc-d968d94e-3`) and next/font classes (`__className_8d5843`).
 *      Our source never writes them; a copied page or stylesheet always carries them.
 *
 * WHEN IT REFUSES. Every build, preview and production alike (exit 1). From 05.11 to 06.11.2026 it
 * only warned on previews, so the product-page clones could be reviewed with their reference files
 * (David, 05.11.2026 kl. 11.42); the swap replaced those files with our own stylesheets and open
 * faces (docs/PRODUCT-PAGES.md "The swap"), which was this rule's revisit trigger. Chose: refuse
 * everywhere again. Over: keeping the preview exemption. Because: nothing needs it now, and a preview
 * exemption is how reference files would come back unnoticed. Revisit-if: David asks for another
 * clone preview; then scope the exemption to that branch, never to every preview.
 *
 * Adding a family is a deliberate act: self-host it through scripts/sync-fonts.mjs (licence
 * checked), or copy it from our own @portlink/tokens package with its licence, and add it to
 * FAMILIES below in the same commit.
 */
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const CLONE_DIR = 'public/clone/'
const rootArg = process.argv.indexOf('--root')
const ROOT = rootArg > -1 ? path.resolve(process.argv[rootArg + 1] ?? '') : path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIRS = ['app', 'components', 'lib', 'hooks', 'public']

// Our self-hosted families: the file prefix scripts/sync-fonts.mjs writes, and the CSS name.
const FAMILIES = [
  { file: 'inter-', css: 'Inter' },
  { file: 'jetbrains-mono-', css: 'JetBrains Mono' },
  { file: 'plus-jakarta-sans-', css: 'Plus Jakarta Sans' },
  // D14 product faces, copied from our own @portlink/tokens 1.3.0 with their OFL licences; the clone pages' swap target.
  { file: 'schibsted-grotesk-', css: 'Schibsted Grotesk' },
  { file: 'manrope-', css: 'Manrope' },
  // The product pages' faces (06.11.2026), self-hosted through scripts/sync-fonts.mjs with their OFL
  // licences: the open faces closest in metrics to the reference faces (docs/PRODUCT-PAGES.md "Faces").
  { file: 'source-serif-4-', css: 'Source Serif 4' },
  { file: 'archivo-', css: 'Archivo' },
  { file: 'red-hat-mono-', css: 'Red Hat Mono' },
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
  // The product-page clones' reference files on PR #29 until the swap (6c178db, measured 06.11.2026).
  ['908a059be9b1bb9dfa0f3b58ede1141be2d7261aad413b4814d60ae1c0479f49', 'Waabi: F37 Zagma Serif Book woff2 (public/clone/waabi/fonts/zagma-book.woff2)'],
  ['50a14a2d9b21a48121181d1f2133b486000ec72bdd17cfbd125398173d20756f', 'Waabi: Neue Haas Grotesk Text 65 woff2 (public/clone/waabi/fonts/neuehaas-65.woff2)'],
  ['3dd8589998150c97c9d2db11ccc3d8b287f3b4a4195353491cfbaf3c46911937', 'Waabi: compiled stylesheet, scoped (public/clone/waabi/waabi.css)'],
  ['ff1c11107da03ce7c32a59fc80fb640cebca1222163c548d7fc151f399e1254c', 'Butter: compiled stylesheet, scoped (public/clone/butter/butter.css)'],
])

const OURS = new Set(FAMILIES.map((f) => f.css.toLowerCase()))
const FACE = /@font-face\s*\{[^}]*?font-family\s*:\s*(['"]?)([^;'"}]+)\1/gi
const STYLED = /\/\*!sc\*\/|data-styled(?:\.g\d+)?\[/
const CHUNK_MAP = /sourceMappingURL=[0-9a-f]{16}\.css\.map/
const BUILD_IDS = /[A-Za-z0-9]_[0-9a-f]{8}-module__[A-Za-z0-9_-]{6}__|[A-Za-z]__[A-Za-z0-9]+-sc-[0-9a-f]{6,8}-\d|__className_[0-9a-f]{6}\b/

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
  const id = BUILD_IDS.exec(text)
  if (id) out.push(`another site's build identifier "${id[0]}" (a copied page or stylesheet)`)
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
if (!textHits('<div class="index-style__HeaderMain-sc-d968d94e-3 iCiCep">').length) fail('self-test: a styled-components id was not seen.', 2)
if (!textHits('.wb .zagma_f56dd2b7-module__v7H3wa__className{}').length) fail('self-test: a CSS-module hash was not seen.', 2)
if (!textHits('.bt .__className_8d5843{}').length) fail('self-test: a next/font class was not seen.', 2)
if (textHits('<div class="em-header-main em-header-main--1">').length) fail('self-test: our own renamed classes were refused.', 2)
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
  if (rel.startsWith(CLONE_DIR)) found.push('reference clone material (replace before production)')
  if (FONT_FILE.test(rel)) { fonts++; found.push(...fontHits(rel)) }
  else if (TEXT_FILE.test(rel)) found.push(...textHits(bytes.toString('utf8')))
  if (found.length) bad.push(`${rel}: ${found.join('; ')}`)
}
// Known positive: our own fonts must be visible, or the font rules above measured nothing.
if (!fonts) fail(`no font files found under ${FONT_DIR}/; the scan cannot see fonts.`, 2)
if (bad.length) fail(`third-party material in shipped source:\n  ${bad.join('\n  ')}\nObserve reference sites; never ship their files. See the header of this script.`)
console.log(`check:provenance: ${files.length} files clean (${fonts} fonts, all ours in ${FONT_DIR}/); self-test passed.`)
