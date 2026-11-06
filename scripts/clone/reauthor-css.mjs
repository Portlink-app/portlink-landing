#!/usr/bin/env node
// Turns the two product-page clones' reference stylesheets into our own stylesheets, once.
// Ran on 06.11.2026 (docs/PRODUCT-PAGES.md "The swap"); kept as the record of exactly what the
// transformation did. It reads the reference inputs from commit 6c178db, the last one that had them
// (public/clone/ is gone after it), so it can be re-run to audit the result; the stylesheets it wrote
// are ordinary authored source and have been edited since (re-running overwrites those edits: run it
// into a scratch copy and diff, never over the committed files).
//
//   node scripts/clone/reauthor-css.mjs [--faces reference|open]
//
// What it does, per page:
//  1. Drops every rule whose selector names a class that no source file of the page uses (purge).
//     Waabi's sheet keeps 444 of 1547 rules, Butter's 318 of 772 (measured 06.11.2026).
//  2. Renames the reference's own identifiers to ours, in the CSS and in the markup:
//     Butter's styled-components classes (`index-style__HeaderMain-sc-d968d94e-3 iCiCep`) become
//     `em-header-main` plus `em-header-main--1`; its next/font classes become `em-face-grotesk` and
//     `em-face-mono`; `--butter-*` becomes `--em-*`. Waabi's type utilities `type-z-*`/`type-s-*`
//     become `type-display-*`/`type-text-*`, `--font-zagma`/`--font-neue` become
//     `--font-display`/`--font-text`.
//  3. Removes the reference faces (@font-face, fallback faces) and points every stack at our open
//     faces (--faces open) or leaves the reference faces in place (--faces reference, used only to
//     prove step 1 and 2 moved no pixel before the faces change).
//  4. Strips build residue: styled-components markers, source maps, generator comments.
//  5. Writes one stylesheet per page (reference rules, then the page's own overrides) to
//     public/product-pages/, formatted one declaration per line.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import postcss from 'postcss'
import { execFileSync } from 'node:child_process'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const faces = process.argv.includes('--faces') ? process.argv[process.argv.indexOf('--faces') + 1] : 'open'
if (!['open', 'reference'].includes(faces)) throw new Error('--faces open|reference')
const r = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8')
// The reference inputs as they stood before the swap: read from that commit, so the run is repeatable.
const FROM = '6c178db'
const before = (p) => execFileSync('git', ['show', `${FROM}:${p}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 1 << 26 })
// Corrections to the reference, applied to the output so a re-run reproduces them. Each must match
// exactly once, or the run stops: a silent miss would ship the reference's defect again.
const correct = (css, fixes) => fixes.reduce((out, [from, to]) => {
  const n = out.split(from).length - 1
  if (n !== 1) throw new Error(`correction matched ${n} times: ${from.slice(0, 60)}`)
  return out.replace(from, to)
}, css)
const w = (p, s) => { fs.mkdirSync(path.dirname(path.join(ROOT, p)), { recursive: true }); fs.writeFileSync(path.join(ROOT, p), s) }
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase()
const unesc = (s) => s.replace(/\\([0-9a-fA-F]{1,6}\s?)/g, (_, h) => String.fromCodePoint(parseInt(h, 16))).replace(/\\(.)/g, '$1')
// Attribute selectors first: `p[color="rgba(15,15,15,0.3)"]` names no class `.3`. Escaped brackets
// (`.md\:left-\[calc(16.667%)\]`) are part of a class name and stay.
const classesOf = (sel) => [...sel.replace(/(?<!\\)\[[^\]]*(?<!\\)\]/g, '').matchAll(/\.((?:\\.|[A-Za-z0-9_-])+)/g)].map((m) => unesc(m[1]))

function tokensOf(files) { return tokensOfText(files.map(r).join('\n')) }
function tokensOfText(text) {
  return new Set(text.split(/[\s"'`<>={}]+|\\"/).flatMap((t) => [t, ...t.split(/[,;]/)]))
}

/** Purge, rename, re-face, strip. `rename(selector)` and `value(prop, value)` are per page. */
function transform(css, { scope, tokens, rename, value }) {
  const root = postcss.parse(css)
  root.walkComments((c) => c.remove())
  root.walkAtRules('font-face', (a) => { if (faces === 'open') a.remove() })
  root.walkRules((rule) => {
    if (rule.parent.type === 'atrule' && /keyframes/.test(rule.parent.name)) return
    const sels = rule.selectors.map(rename).filter((s) => classesOf(s).every((c) => c === scope || tokens.has(c)))
    if (!sels.length) rule.remove()
    else rule.selectors = [...new Set(sels)]
  })
  root.walkDecls((d) => {
    const v = value(d.prop, d.value, d)
    if (v === null) d.remove()
    else { d.value = v.value ?? v; if (v.prop) d.prop = v.prop; if (v.after) d.after(v.after) }
  })
  let changed = true
  while (changed) { changed = false; root.walk((n) => { if ((n.type === 'rule' || n.type === 'atrule') && n.nodes && !n.nodes.length) { n.remove(); changed = true } }) }
  // One declaration per line, two-space indent per nesting level.
  root.walk((n) => {
    let depth = 0; for (let p = n.parent; p && p.type !== 'root'; p = p.parent) depth++
    const ind = '  '.repeat(depth)
    n.raws.before = (n.type === 'decl' ? '\n' : depth ? '\n' : '\n\n') + ind
    if (n.type === 'decl') { n.raws.between = ': '; return }
    n.raws.between = ' '; n.raws.after = '\n' + ind; n.raws.semicolon = true
    if (n.type === 'atrule') n.raws.afterName = ' '
  })
  return root.toString().trim() + '\n'
}

const header = (page, ref) => `/* ${page}: Portlink's stylesheet for this page. Layout, motion and type scale follow ${ref}
   by David's direction (05.11.2026); every name, face and token here is ours. Written from the
   page's earlier reference stylesheet by scripts/clone/reauthor-css.mjs on 06.11.2026, then edited
   as ordinary source. Map and decisions: docs/PRODUCT-PAGES.md. */\n`

// ---------- /embark (butter.video structure) ----------
{
  const BODY = 'components/clone/butter/embark-body.ts'
  const ref = before('public/clone/butter/butter.css')
  // Butter's styled-components hash classes: the class names its own compiled sheet defines, read
  // from that sheet as PR #26 shipped it (b25b2b2), so our own short names (`record`) are never taken.
  const shipped = execFileSync('git', ['show', 'b25b2b2:public/product-family/assets/butter.css'], { cwd: ROOT, encoding: 'utf8' })
  const refClasses = new Set([...shipped.matchAll(/\.([A-Za-z]{5,6})(?=[{:.\s,>\[])/g)].map((m) => m[1]))
  const body = before(BODY)
  if (!body.includes('-sc-')) throw new Error('embark: the body has no styled-components classes; this already ran (see the header)')
  const comp = (t) => /^[A-Za-z-]+__([A-Za-z0-9]+)-sc-[0-9a-f]+-\d+$/.exec(t)?.[1]
  const map = new Map([['__className_8d5843', 'em-face-grotesk'], ['__className_210739', 'em-face-mono']])
  const count = new Map()
  const nextName = (base) => { const n = (count.get(base) ?? 0) + 1; count.set(base, n); return `${base}--${n}` }
  for (const [, cls] of body.matchAll(/class=\\"([^"\\]*)\\"/g)) {
    const toks = cls.split(/\s+/).filter(Boolean)
    const comps = toks.map(comp).filter(Boolean)
    for (const t of toks) {
      if (comp(t)) map.set(t, `em-${kebab(comp(t))}`)
      else if (refClasses.has(t) && !map.has(t)) map.set(t, nextName(comps.length ? `em-${kebab(comps[comps.length - 1])}` : 'em-text'))
    }
  }
  const byComp = new Map([...map].filter(([k]) => comp(k)).map(([k, v]) => [comp(k), v]))
  const renameMarkup = (s) => s.replace(/class=\\"([^"\\]*)\\"/g, (_, cls) => `class=\\"${[...new Set(cls.split(/\s+/).filter(Boolean).map((t) => map.get(t) ?? t))].join(' ')}\\"`)
  const newBody = renameMarkup(body).replace(/^\/\*.*\*\/\n/, `/* The /embark page body: butter.video's structure with Embark's content (landing PR #26), renamed
   to our classes by scripts/clone/reauthor-css.mjs on 06.11.2026. Ordinary authored source now. */\n`)
  const leftover = [...newBody.matchAll(/class=\\"([^"\\]*)\\"/g)].flatMap((m) => m[1].split(/\s+/)).filter((t) => comp(t) || refClasses.has(t) || t.startsWith('__className'))
  if (leftover.length) throw new Error(`embark: unrenamed reference classes in markup: ${[...new Set(leftover)].join(' ')}`)

  const rename = (sel) => sel
    .replace(/\.((?:\\.|[A-Za-z0-9_-])+)/g, (m, c) => (map.has(unesc(c)) ? `.${map.get(unesc(c))}` : m))
    .replace(/\[class\*="__([A-Za-z0-9]+)-"\]/g, (m, name) => `.${byComp.get(name) ?? 'unrendered-reference-component'}`)
  const STACK = { grotesk: 'Archivo, "Helvetica Neue", Arial, sans-serif', mono: '"Red Hat Mono", ui-monospace, monospace' }
  const value = (prop, v, decl) => {
    let out = v.replace(/--butter-/g, '--em-')
    // `ch` is the width of the face's zero. The reference grotesque's zero is 0.6253em, Archivo's at
    // 90% is 0.524em (measured in Chrome, 06.11.2026), so a ch-sized column would shrink 16% and
    // rebreak every heading. Grotesque columns keep the reference measure in em; mono columns keep
    // ch (both monos' zero is 0.6em).
    const mono = decl?.parent?.nodes?.some((n) => (n.prop === 'font' || n.prop === 'font-family') && /ABCDiatype|Red Hat Mono/.test(n.value))
    if (faces === 'open' && !mono) out = out.replace(/(\d*\.?\d+)ch\b/g, 'calc($1 * var(--em-ch))')
    // Only the family names change: a `font:` shorthand keeps its weight, size and line height.
    if (faces === 'open') out = out
      .replace(/(['"]?)DieGrotesk\1(\s*,\s*(['"]?)DieGrotesk Fallback\3)?(\s*,\s*sans-serif)?/g, STACK.grotesk)
      .replace(/(['"]?)ABCDiatype\1(\s*,\s*(['"]?)ABCDiatype Fallback\3)?(\s*,\s*sans-serif)?/g, STACK.mono)
    // A `font:` shorthand resets font-stretch to normal; restore the 90% width after it.
    if (faces === 'open' && prop === 'font' && out.includes('Archivo')) return { value: out, after: { prop: 'font-stretch', value: '90%' } }
    return prop.startsWith('--butter-') ? { prop: prop.replace('--butter-', '--em-'), value: out } : out
  }
  const SOURCES = [BODY, 'app/(product)/embark/page.tsx', 'app/(product)/embark/EmbarkFilm.tsx', 'components/clone/Film.tsx', 'public/product-pages/embark/products.js', 'public/product-pages/embark/keyring.js']
  const tokens = new Set([...tokensOf(SOURCES.slice(1)), ...tokensOfText(newBody)])
  const base = transform(ref, { scope: 'bt', tokens, rename, value })
  const ovr = transform(before('public/clone/butter/overrides.css'), { scope: 'bt', tokens: new Set([...tokens, ...map.values()]), rename, value })
  const leftCss = (base + ovr).match(/__[A-Za-z]+-|-sc-[0-9a-f]{6,}|__className_|\/\*!sc\*\/|sourceMappingURL/g)
  if (leftCss) throw new Error(`embark: reference residue in CSS: ${[...new Set(leftCss)].join(' ')}`)
  w(BODY, newBody.replaceAll('/clone/butter/media/', '/product-pages/embark/media/'))
  const facesCss = faces === 'open'
    ? `.bt {\n  /* Archivo at 90% width sets the reference grotesque's line lengths and breaks (docs/PRODUCT-PAGES.md\n     "Faces"). Red Hat Mono has no width axis and is unaffected. */\n  font-stretch: 90%;\n  /* The reference grotesque's zero width: what its ch-sized columns measured. */\n  --em-ch: 0.6253em;\n}\n`
    : ''
  // The film's stage is sticky inside #overview, which the reference clips with overflow:hidden. That
  // makes the section the sticky element's scroll container, so the stage scrolled away with the
  // page (measured 06.11.2026 on deploy-preview-29). clip keeps the clipping without that.
  const film = '\n.bt #overview {\n  overflow: clip;\n}\n'
  w('public/product-pages/embark.css', header('/embark', "butter.video's homepage") + '\n' + facesCss + base + '\n/* Page additions */\n' + ovr + film)
  console.log(`embark: ${map.size} classes renamed, ${base.split('\n').length + ovr.split('\n').length} lines`)
}

// ---------- /portlink (waabi.ai structure) ----------
{
  const MARKUP = ['app/(product)/portlink/page.tsx', 'components/clone/waabi/SeatLens.tsx', 'components/clone/waabi/SplitTabs.tsx', 'components/clone/waabi/WaabiMotion.tsx', 'components/clone/waabi/content.ts', 'components/clone/Film.tsx']
  const renameName = (s) => s.replace(/\btype-z-(\d)/g, 'type-display-$1').replace(/\btype-s-(\d)/g, 'type-text-$1').replace(/\bfont-neue\b/g, 'font-text').replace(/\bfont-zagma\b/g, 'font-display')
  for (const f of MARKUP) w(f, renameName(r(f)))
  const rename = (sel) => renameName(sel)
  const DISPLAY = '"Source Serif 4", Georgia, serif'
  const TEXT = 'Inter, "Helvetica Neue", Arial, sans-serif'
  const value = (prop, v) => {
    const out = v.replace(/--font-zagma\b/g, '--font-display').replace(/--font-neue\b/g, '--font-text')
    const p = prop.replace(/^--font-zagma$/, '--font-display').replace(/^--font-neue$/, '--font-text')
    if (faces === 'open' && p === '--font-display') return { prop: p, value: DISPLAY }
    if (faces === 'open' && p === '--font-text') return { prop: p, value: TEXT }
    // Waabi's text face file is Neue Haas Grotesk Text 65 (Medium) declared at 400, so `400` rendered
    // Medium. Inter carries real weights: ask for the 500 that was on screen.
    if (faces === 'open' && prop === 'font' && /var\(--font-text\)/.test(out)) return out.replace(/^400 /, '500 ')
    return p !== prop ? { prop: p, value: out } : out
  }
  const tokens = tokensOf(MARKUP)
  const base = transform(before('public/clone/waabi/waabi.css'), { scope: 'wb', tokens, rename, value })
  const ovr = transform(before('public/clone/waabi/overrides.css'), { scope: 'wb', tokens, rename, value })
  // The faces: our open faces, or the reference faces for the no-pixel-moved proof.
  const facesCss = faces === 'open'
    ? `.wb {\n  --font-display: ${DISPLAY};\n  --font-text: ${TEXT};\n  /* Source Serif 4 at its text optical size: the low-contrast cut is the one closest to the\n     reference display face at every size (docs/PRODUCT-PAGES.md "Faces"). Inter has no opsz axis.\n     Through the preflight variable, because the preflight sets font-variation-settings on .wb. */\n  --default-font-variation-settings: "opsz" 12;\n}\n`
    : `.wb {\n  --font-display: "Zagma", "Zagma Fallback", serif;\n  --font-text: "NeueHaas", "NeueHaas Fallback", sans-serif;\n}\n`
  const leftCss = (base + ovr).match(/Zagma|NeueHaas|zagma|neuehaas|-module__|type-[zs]-\d/g)
  if (leftCss && faces === 'open') throw new Error(`portlink: reference residue in CSS: ${[...new Set(leftCss)].join(' ')}`)
  const ovrFixed = correct(ovr, [[
    '  .wb .wbx-herolede {\n    opacity: 1;\n  }\n',
    '  /* The lede shares the hero\'s sticky screen with the headline. Fully shown from the top it sat on\n     the headline for anyone who reduces motion (measured 06.11.2026); with the script it keeps the\n     scroll-linked opacity, which moves nothing. Without the script it is shown as before. */\n  .wb:not(.wbx-js) .wbx-herolede {\n    opacity: 1;\n  }\n',
  ]])
  w('public/product-pages/portlink.css', header('/portlink', "waabi.ai's homepage") + '\n' + facesCss + base + '\n/* Page additions */\n' + ovrFixed)
  console.log(`portlink: ${base.split('\n').length + ovr.split('\n').length} lines`)
}
