#!/usr/bin/env node
/**
 * check-harbour-v4: enforces Gates G0 (hero visual proof receipt, procedural primitive-mesh
 * rejection, sub-22 KB frame detail rejection, single tablist & <=1 mobile pill row above y < 520
 * at 375x812), G1a/G4 (segment guard + frame/film byte caps), G5 (truth pack + Never-list +
 * unapproved customer/quote gate + English-only v1 capture provenance), and G6 (no <video>, route
 * JS <= 130 KB gz) on One Harbour v4 (/harbour-v4).
 *
 * --selftest proves each detector against both required controls:
 *   1. MUST FIRE on PR #44 949a77f257706c13fb81b83927bf40a8bae7436c (fixture + live git commit when present)
 *   2. MUST NOT FIRE on a clean English G0 hero
 */
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const DEFAULT_ROOT = path.join(fileURLToPath(new URL('.', import.meta.url)), '..')
const PR44_BAD_COMMIT = '949a77f257706c13fb81b83927bf40a8bae7436c'

export const ALLOWED_VESSEL_TYPES = new Set([
  'expedition_cruise',
  'ship_tender',
  'harbour_launch',
  'tour_boat',
])
export const ALLOWED_SEGMENTS = new Set(['cruise', 'port_agent', 'dmc', 'tour_operator'])
export const ALLOWED_PROPS = new Set(['iceberg'])
export const FORBIDDEN_TOKENS = /\b(cargo|container_ship|bulk_carrier|tanker|quay_crane|reach_stacker)\b/i

export const MIN_HERO_AVG_FRAME_KB = 22
export const PROCEDURAL_PRIMITIVE_RE =
  /\b(?:bpy\.ops\.mesh\.primitive_(?:cube|cylinder|uv_sphere|ico_sphere|cone|torus|monkey|plane|grid)_add|bmesh\.ops\.create_(?:cube|icosphere|uvsphere|cone|circle|grid))\b/g

export const NORWEGIAN_UI_TOKENS_RE =
  /\b(OPPRETT\s+NY|Eksporter|Søk\s+oppdrag|Avvik|Avganger|Anløp|Oversikt|Innboks|Mine\s+oppgaver|Generer\s+avganger|Fakturaer|Rapporter|Planlagt|Norwegian\s+UI)\b/gi

export const NEVER_CLAIMS = [
  { id: 'ship-notifies-arrival', re: /ship\s+notifies\s+everyone\s+when\s+it\s+arrives/i },
  { id: 'estimates-match-invoices', re: /estimates\s+match\s+invoices/i },
  { id: 'automatic-payment', re: /automatic\s+payment/i },
  { id: 'first-deployment-greenland', re: /first\s+deployment:\s*greenland/i },
  {
    id: 'unapproved-customer-or-ship',
    re: /\b(Windstar|Hurtigruten|Roald Amundsen|Fridtjof Nansen|Hugo Trumpy|Viking Octantis|Viking Polaris|SeaDream|Carnival|MSC Grandiosa|Costa Fortuna|Celebrity Edge|Trollfjord|Blue Water Greenland|Ilulissat Tours|Wild Greenland)\b/i,
  },
]

const RIG_SCRIPT_PATHS = [
  'spikes/s3-rig/beats.py',
  'spikes/s3-rig/expedition.py',
  'spikes/s3-rig/render_harbour.py',
  'scripts/harbour/render_beat.py',
  'scripts/generate-harbour-frames.py',
  'scripts/render_harbour_blender.py',
]

const G0_RECEIPT_PATHS = [
  'public/media/harbour-v4/g0-hero-proof.json',
  'docs/G0-HERO-PROOF.json',
]

const PROVENANCE_PATHS = [
  'docs/HARBOUR-CLAIMS.md',
  'components/harbour/v4/scriptV4.ts',
  'public/media/harbour-v4/manifest.json',
]

export function validateBeatMeta(id, meta) {
  const errs = []
  if (!meta || typeof meta !== 'object') return [`${id}: missing beat metadata`]
  if (!meta.vessel_type || !ALLOWED_VESSEL_TYPES.has(meta.vessel_type)) {
    errs.push(`${id}: invalid or missing vessel_type "${meta.vessel_type ?? ''}"`)
  }
  if (!meta.segment || !ALLOWED_SEGMENTS.has(meta.segment)) {
    errs.push(`${id}: invalid or missing segment "${meta.segment ?? ''}"`)
  }
  if (FORBIDDEN_TOKENS.test(JSON.stringify(meta))) {
    errs.push(`${id}: forbidden cargo/crane token in metadata`)
  }
  for (const p of meta.props ?? []) {
    if (!ALLOWED_PROPS.has(p)) errs.push(`${id}: disallowed prop "${p}"`)
  }
  if (meta.vessel_type === 'expedition_cruise') {
    const lb = meta.hull?.l_over_b
    if (typeof lb !== 'number' || lb < 5.8 || lb > 6.4) {
      errs.push(`${id}: expedition_cruise L/B ${lb} outside G1a window [5.8, 6.4]`)
    }
  }
  return errs
}

export function validateG4Manifest(manifest) {
  const errs = []
  const beats = manifest?.beats ?? {}
  const keys = Object.keys(beats)
  if (keys.length < 7) errs.push(`manifest has ${keys.length} beats, expected 7 (b00..b06)`)
  let dSum = 0
  let pSum = 0
  for (const [id, b] of Object.entries(beats)) {
    errs.push(...validateBeatMeta(id, b))
    const d = b.tiers?.d
    const p = b.tiers?.p
    if (!d) errs.push(`${id}: missing desktop tier`)
    else {
      if (d.frames < 1 || d.frames > 96) errs.push(`${id} d: frames ${d.frames} outside 1..96`)
      if (d.maxFrameKB > 60) errs.push(`${id} d: maxFrameKB ${d.maxFrameKB} > 60 KB cap`)
      dSum += d.totalBytes ?? 0
    }
    if (!p) errs.push(`${id}: missing phone tier`)
    else {
      if (p.frames < 1 || p.frames > 48) errs.push(`${id} p: frames ${p.frames} outside 1..48`)
      if (p.maxFrameKB > 24) errs.push(`${id} p: maxFrameKB ${p.maxFrameKB} > 24 KB cap`)
      pSum += p.totalBytes ?? 0
    }
  }
  if (dSum / 1048576 > 36) errs.push(`desktop film ${(dSum / 1048576).toFixed(2)} MB > 36 MB cap`)
  if (pSum / 1048576 > 7) errs.push(`phone film ${(pSum / 1048576).toFixed(2)} MB > 7 MB cap`)
  return errs
}

export function validateCopyText(text) {
  const errs = []
  for (const rule of NEVER_CLAIMS) {
    const m = text.match(rule.re)
    if (m) errs.push(`Never-list hit (${rule.id}): "${m[0]}"`)
  }
  return errs
}

export function validateG0HeroReceipt(receipt) {
  const errs = []
  if (!receipt || typeof receipt !== 'object') {
    return ['missing G0 hero visual proof receipt (public/media/harbour-v4/g0-hero-proof.json)']
  }
  if (receipt.gate !== 'G0') errs.push(`receipt gate must be "G0" (got "${receipt.gate ?? ''}")`)
  if (receipt.approved !== true) errs.push('receipt approved must be true')
  if (typeof receipt.approver !== 'string' || receipt.approver.trim().length < 2) {
    errs.push('receipt missing non-empty approver')
  }
  if (typeof receipt.commit !== 'string' || !/^[0-9a-f]{7,40}$/i.test(receipt.commit.trim())) {
    errs.push('receipt missing valid git commit SHA')
  }
  if (typeof receipt.asset_sha256 !== 'string' || !/^[0-9a-f]{64}$/i.test(receipt.asset_sha256.trim())) {
    errs.push('receipt missing valid 64-char hex asset_sha256')
  }
  return errs
}

export function validateProceduralAndG0({ rigSources = [], manifest = null, g0Receipt = null }) {
  const errs = []
  const receiptErrs = validateG0HeroReceipt(g0Receipt)
  const hasSignedG0 = receiptErrs.length === 0

  for (const { file, content } of rigSources) {
    if (!content) continue
    const hits = [...new Set([...content.matchAll(PROCEDURAL_PRIMITIVE_RE)].map((m) => m[0]))]
    if (hits.length > 0 && (!hasSignedG0 || g0Receipt?.allow_procedural_primitives !== true)) {
      errs.push(
        `${file}: procedural primitive-mesh generation (${hits.join(', ')}) rejected without a signed G0 hero visual proof receipt`,
      )
    }
  }

  const beats = manifest?.beats ?? {}
  for (const [id, b] of Object.entries(beats)) {
    const d = b?.tiers?.d
    if (!d) continue
    const avgFrameKB =
      typeof d.avgFrameKB === 'number'
        ? d.avgFrameKB
        : typeof d.totalBytes === 'number' && typeof d.frames === 'number' && d.frames > 0
          ? Number((d.totalBytes / d.frames / 1024).toFixed(1))
          : null
    if (avgFrameKB !== null && avgFrameKB < MIN_HERO_AVG_FRAME_KB && !hasSignedG0) {
      errs.push(
        `${id} d: sub-threshold frame detail avgFrameKB ${avgFrameKB} < ${MIN_HERO_AVG_FRAME_KB} KB/frame rejected without a signed G0 hero visual proof receipt`,
      )
    }
  }

  if (!hasSignedG0) {
    errs.push(`G0: ${receiptErrs.join('; ')}`)
  }
  return errs
}

export function validateHeroLayout({ stageSources = [], cssSources = [], layoutMetrics = null }) {
  const errs = []
  const combinedMarkup = stageSources.map((s) => s.content ?? '').join('\n')
  const combinedCss = cssSources.map((s) => s.content ?? '').join('\n')

  const tablistMatches = [...combinedMarkup.matchAll(/\brole\s*=\s*["']tablist["']/g)]
  if (tablistMatches.length > 1) {
    errs.push(
      `hero layout: duplicate role="tablist" controls (${tablistMatches.length} found in /harbour-v4; max 1 allowed)`,
    )
  }

  let mobilePillRows = layoutMetrics?.mobilePillRowsAboveFold ?? null
  if (mobilePillRows === null && combinedMarkup.length > 0) {
    let rows = 0
    const hasThreadNav = /\bthreadNav\b/.test(combinedMarkup)
    const threadNavWraps =
      /\.threadNav\s*\{[^}]*flex-wrap\s*:\s*wrap/s.test(combinedCss) &&
      !/\.threadNav\s*\{[^}]*flex-wrap\s*:\s*nowrap/s.test(combinedCss)
    const multiThreadPills = /THREADS\.map/.test(combinedMarkup) || [...combinedMarkup.matchAll(/threadPill\b/g)].length > 1
    if (hasThreadNav) {
      rows += threadNavWraps && multiThreadPills ? 2 : 1
    }
    if (/\bstepCaptureTabs\b/.test(combinedMarkup)) rows += 1
    if (/\bdockTabs\b/.test(combinedMarkup)) rows += 1
    mobilePillRows = rows
  }

  if (typeof mobilePillRows === 'number' && mobilePillRows > 1) {
    errs.push(
      `hero layout: ${mobilePillRows} mobile pill rows above the hero fold (y < 520 at 375x812; max 1 allowed)`,
    )
  }
  return errs
}

export function validateCaptureProvenance({ provenanceSources = [] }) {
  const errs = []
  for (const { file, content } of provenanceSources) {
    if (!content) continue
    const hits = [...new Set([...content.matchAll(NORWEGIAN_UI_TOKENS_RE)].map((m) => m[0].replace(/\s+/g, ' ')))]
    if (hits.length > 0) {
      errs.push(
        `${file}: forbidden Norwegian UI string(s) in capture provenance (${hits.join(', ')}); Portlink v1 requires English-only UI captures`,
      )
    }
  }
  return errs
}

function makeFsReader(rootDir) {
  return {
    label: rootDir,
    isFs: true,
    rootDir,
    exists(rel) {
      return fs.existsSync(path.join(rootDir, rel))
    },
    readText(rel) {
      const p = path.join(rootDir, rel)
      return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : null
    },
    readBuffer(rel) {
      const p = path.join(rootDir, rel)
      return fs.existsSync(p) ? fs.readFileSync(p) : null
    },
  }
}

function gitRefExists(repoDir, ref) {
  try {
    execFileSync('git', ['-C', repoDir, 'cat-file', '-e', `${ref}^{commit}`], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function makeGitReader(repoDir, ref) {
  const files = new Set(
    execFileSync('git', ['-C', repoDir, 'ls-tree', '-r', '--name-only', ref], { encoding: 'utf8' })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean),
  )
  return {
    label: `git:${ref}`,
    isFs: false,
    rootDir: repoDir,
    exists(rel) {
      return files.has(rel)
    },
    readText(rel) {
      if (!files.has(rel)) return null
      return execFileSync('git', ['-C', repoDir, 'show', `${ref}:${rel}`], { encoding: 'utf8' })
    },
    readBuffer(rel) {
      if (!files.has(rel)) return null
      return execFileSync('git', ['-C', repoDir, 'show', `${ref}:${rel}`])
    },
  }
}

export function inspectHarbourTree(reader) {
  const errs = []
  const manifestRaw = reader.readText('public/media/harbour-v4/manifest.json')
  if (!manifestRaw) {
    return { present: false, errs: ['public/media/harbour-v4/manifest.json missing'], manifest: null, routeJsKB: null }
  }
  const manifest = JSON.parse(manifestRaw)
  errs.push(...validateG4Manifest(manifest))

  if (reader.isFs) {
    for (const [id, b] of Object.entries(manifest.beats ?? {})) {
      for (const tier of ['d', 'p']) {
        const t = b.tiers?.[tier]
        if (!t) continue
        const relDir = path.posix.join('public/media/harbour-v4', tier, id)
        const camRel = path.posix.join(relDir, 'camera.json')
        const camRaw = reader.readText(camRel)
        if (!camRaw) {
          errs.push(`${id} ${tier}: missing camera.json`)
          continue
        }
        const cam = JSON.parse(camRaw)
        errs.push(...validateBeatMeta(`${id}/${tier}/camera.json`, cam))
        for (let i = 1; i <= t.frames; i++) {
          const idx = String(i).padStart(4, '0')
          for (const layer of ['plate', 'shadow']) {
            const fRel = path.posix.join(relDir, `${layer}_${idx}.avif`)
            if (!reader.exists(fRel)) errs.push(`missing frame ${fRel}`)
          }
        }
      }
    }
  }

  const rigSources = RIG_SCRIPT_PATHS.map((rel) => ({ file: rel, content: reader.readText(rel) })).filter(
    (s) => s.content !== null,
  )
  let g0Receipt = null
  for (const rel of G0_RECEIPT_PATHS) {
    const raw = reader.readText(rel)
    if (raw) {
      try {
        g0Receipt = JSON.parse(raw)
      } catch {
        errs.push(`${rel}: invalid JSON in G0 hero visual proof receipt`)
      }
      break
    }
  }
  errs.push(...validateProceduralAndG0({ rigSources, manifest, g0Receipt }))

  const stageSources = ['components/harbour/v4/HarbourV4Stage.tsx', 'app/harbour-v4/page.tsx']
    .map((rel) => ({ file: rel, content: reader.readText(rel) }))
    .filter((s) => s.content !== null)
  const cssSources = ['components/harbour/v4/harbour-v4.module.css']
    .map((rel) => ({ file: rel, content: reader.readText(rel) }))
    .filter((s) => s.content !== null)
  errs.push(...validateHeroLayout({ stageSources, cssSources }))

  const provenanceSources = PROVENANCE_PATHS.map((rel) => ({ file: rel, content: reader.readText(rel) })).filter(
    (s) => s.content !== null,
  )
  errs.push(...validateCaptureProvenance({ provenanceSources }))

  const v4Files = [
    'components/harbour/v4/scriptV4.ts',
    'components/harbour/v4/HarbourV4Stage.tsx',
    'app/harbour-v4/page.tsx',
  ]
  for (const rel of v4Files) {
    const src = reader.readText(rel)
    if (src === null) {
      errs.push(`missing source file ${rel}`)
      continue
    }
    for (const e of validateCopyText(src)) errs.push(`${rel}: ${e}`)
    if (rel.endsWith('scriptV4.ts')) {
      if (/VELA_QUOTE_APPROVED\s*=\s*true/.test(src)) {
        errs.push('scriptV4.ts: VELA_QUOTE_APPROVED must stay false until written approval is on file (G5)')
      }
      if (/ADVISORS_APPROVED\s*=\s*true/.test(src)) {
        errs.push('scriptV4.ts: ADVISORS_APPROVED must stay false until advisor consent is on file (G5)')
      }
      const capRefs = [...src.matchAll(/\/media\/harbour-v4\/captures\/[A-Za-z0-9_-]+\.webp/g)].map((m) => m[0])
      for (const ref of capRefs) {
        const pubRel = path.posix.join('public', ref.replace(/^\//, ''))
        if (!reader.exists(pubRel)) {
          errs.push(`scriptV4.ts: missing capture file ${pubRel}`)
        }
      }
    }
  }

  let routeJsKB = null
  if (reader.isFs) {
    const html = reader.readText('.next/server/app/harbour-v4.html')
    const baseHtml = reader.readText('.next/server/app/privacy.html')
    if (html && baseHtml) {
      if (/<video\b/i.test(html)) {
        errs.push('.next/server/app/harbour-v4.html contains a <video> element (forbidden by G6)')
      }
      const getChunks = (txt) => [...new Set([...txt.matchAll(/\/_next\/static\/chunks\/([^"]+\.js)/g)].map((m) => m[1]))]
      const baseChunks = new Set(getChunks(baseHtml))
      const routeChunks = getChunks(html).filter((c) => !baseChunks.has(c))
      let gzBytes = 0
      for (const c of routeChunks) {
        const buf = reader.readBuffer(path.posix.join('.next/static/chunks', c))
        if (buf) gzBytes += zlib.gzipSync(buf).length
      }
      routeJsKB = Number((gzBytes / 1024).toFixed(1))
      if (routeJsKB > 130) {
        errs.push(`G6 route JS gzipped ${routeJsKB} KB > 130 KB ceiling`)
      }
    }
  }

  return { present: true, errs, manifest, routeJsKB }
}

function makeCleanManifest() {
  return {
    version: '4.1.0',
    totals: { desktopMB: 5.2, phoneMB: 1.9 },
    beats: Object.fromEntries(
      ['b00', 'b01', 'b02', 'b03', 'b04', 'b05', 'b06'].map((id) => [
        id,
        {
          vessel_type: 'expedition_cruise',
          segment: 'cruise',
          hull: { loa_m: 151, beam_m: 24.5, l_over_b: 6.16 },
          tiers: {
            d: { frames: 24, avgFrameKB: 31.2, maxFrameKB: 48.0, totalBytes: 766771 },
            p: { frames: 12, avgFrameKB: 12.4, maxFrameKB: 18.0, totalBytes: 152371 },
          },
        },
      ]),
    ),
  }
}

export function selftest() {
  // 1. Existing G1a / G4 / G5 unit checks
  assert.deepEqual(
    validateBeatMeta('b00', {
      vessel_type: 'expedition_cruise',
      segment: 'cruise',
      hull: { loa_m: 150, beam_m: 24.5, l_over_b: 6.16 },
    }),
    [],
  )
  assert.ok(validateBeatMeta('b00', { vessel_type: 'cargo_ship', segment: 'cruise' }).length > 0)
  assert.ok(
    validateBeatMeta('b00', {
      vessel_type: 'expedition_cruise',
      segment: 'cruise',
      hull: { loa_m: 300, beam_m: 32, l_over_b: 9.37 },
    }).length > 0,
  )
  const badCapManifest = {
    beats: Object.fromEntries(
      ['b00', 'b01', 'b02', 'b03', 'b04', 'b05', 'b06'].map((id) => [
        id,
        {
          vessel_type: 'expedition_cruise',
          segment: 'cruise',
          hull: { l_over_b: 6.16 },
          tiers: {
            d: { frames: 16, maxFrameKB: 75, totalBytes: 500000 },
            p: { frames: 12, maxFrameKB: 10, totalBytes: 100000 },
          },
        },
      ]),
    ),
  }
  assert.ok(validateG4Manifest(badCapManifest).some((e) => e.includes('> 60 KB cap')))
  assert.deepEqual(validateCopyText('Vela Nordic uses Portlink DMC.'), [])
  assert.ok(validateCopyText('The ship notifies everyone when it arrives.').length > 0)
  assert.ok(validateCopyText('First deployment: Greenland.').length > 0)
  assert.ok(validateCopyText('Trusted by Windstar and Hugo Trumpy.').length > 0)

  // 2. Control 1 (MUST FIRE): PR #44 949a77f257706c13fb81b83927bf40a8bae7436c defect profile
  const pr44Manifest = {
    beats: Object.fromEntries(
      ['b00', 'b01', 'b02', 'b03', 'b04', 'b05', 'b06'].map((id) => [
        id,
        {
          vessel_type: 'expedition_cruise',
          segment: 'cruise',
          hull: { loa_m: 151, beam_m: 24.5, l_over_b: 6.16 },
          tiers: {
            d: { frames: 16, avgFrameKB: 15.8, maxFrameKB: 16.5, totalBytes: 259272 },
            p: { frames: 12, avgFrameKB: 5.5, maxFrameKB: 5.8, totalBytes: 67895 },
          },
        },
      ]),
    ),
  }
  const pr44G0Errs = validateProceduralAndG0({
    rigSources: [
      {
        file: 'spikes/s3-rig/beats.py',
        content: 'bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=1.0)\nbpy.ops.mesh.primitive_cube_add(size=1.0)',
      },
      {
        file: 'spikes/s3-rig/expedition.py',
        content: 'bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)',
      },
    ],
    manifest: pr44Manifest,
    g0Receipt: null,
  })
  assert.ok(
    pr44G0Errs.some((e) => e.includes('procedural primitive-mesh generation')),
    'MUST FIRE on procedural primitive-mesh generation without G0 receipt',
  )
  assert.ok(
    pr44G0Errs.some((e) => e.includes('sub-threshold frame detail avgFrameKB 15.8 < 22 KB/frame')),
    'MUST FIRE on sub-22 KB/frame detail without G0 receipt',
  )

  const pr44LayoutErrs = validateHeroLayout({
    stageSources: [
      {
        file: 'components/harbour/v4/HarbourV4Stage.tsx',
        content: `
          <nav className={styles.threadNav} role="tablist" aria-label="One Harbour v4 buyer threads">
            {THREADS.map((t) => <button key={t.id} role="tab" className={styles.threadPill}>{t.label}</button>)}
          </nav>
          <div className={styles.stepCaptureTabs} role="tablist" aria-label="Capture views">
            <button role="tab">1</button>
          </div>
        `,
      },
    ],
    cssSources: [
      {
        file: 'components/harbour/v4/harbour-v4.module.css',
        content: '.threadNav { display: flex; flex-wrap: wrap; gap: 0.4rem; }',
      },
    ],
  })
  assert.ok(
    pr44LayoutErrs.some((e) => e.includes('duplicate role="tablist" controls (2 found')),
    'MUST FIRE on duplicate role="tablist" controls in /harbour-v4',
  )
  assert.ok(
    pr44LayoutErrs.some((e) => e.includes('mobile pill rows above the hero fold (y < 520 at 375x812; max 1 allowed)')),
    'MUST FIRE on >1 mobile pill row above y < 520 at 375x812',
  )

  const pr44LocaleErrs = validateCaptureProvenance({
    provenanceSources: [
      {
        file: 'docs/HARBOUR-CLAIMS.md',
        content:
          'P09 /media/harbour-v4/captures/P09-desktop.webp captured from Embark UI showing OPPRETT NY, Eksporter, Søk oppdrag, Avvik, Avganger, Anløp.',
      },
    ],
  })
  assert.ok(
    pr44LocaleErrs.some(
      (e) =>
        e.includes('forbidden Norwegian UI string(s)') &&
        e.includes('OPPRETT NY') &&
        e.includes('Eksporter') &&
        e.includes('Avvik'),
    ),
    'MUST FIRE on Norwegian UI strings in capture provenance',
  )

  // Live git commit verification when PR #44 commit 949a77f257706c13fb81b83927bf40a8bae7436c is present in git
  let live949Verified = false
  if (gitRefExists(DEFAULT_ROOT, PR44_BAD_COMMIT)) {
    const liveRes = inspectHarbourTree(makeGitReader(DEFAULT_ROOT, PR44_BAD_COMMIT))
    assert.ok(liveRes.present, '949a77f257706c13fb81b83927bf40a8bae7436c must have /harbour-v4 manifest')
    assert.ok(
      liveRes.errs.some((e) => e.includes('procedural primitive-mesh generation')),
      'MUST FIRE on live git commit 949a77f procedural primitive-mesh generation',
    )
    assert.ok(
      liveRes.errs.some((e) => e.includes('sub-threshold frame detail')),
      'MUST FIRE on live git commit 949a77f sub-threshold (<22 KB) frame detail',
    )
    assert.ok(
      liveRes.errs.some((e) => e.includes('duplicate role="tablist" controls')),
      'MUST FIRE on live git commit 949a77f duplicate role="tablist"',
    )
    assert.ok(
      liveRes.errs.some((e) => e.includes('mobile pill rows above the hero fold')),
      'MUST FIRE on live git commit 949a77f >1 mobile pill row above hero fold',
    )
    assert.ok(
      liveRes.errs.some((e) => e.includes('forbidden Norwegian UI string(s)')),
      'MUST FIRE on live git commit 949a77f Norwegian capture provenance',
    )
    live949Verified = true
  }

  // 3. Control 2 (MUST NOT FIRE): Clean English G0 hero
  const cleanG0Receipt = {
    gate: 'G0',
    approved: true,
    approver: 'David Bakke',
    approved_at: '2026-11-23T01:00:00Z',
    commit: '573c4c834f9f1a0a24b3a9b2d3c4e5f6a7b8c9d0',
    asset_sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  }
  const cleanManifest = makeCleanManifest()
  assert.deepEqual(validateG4Manifest(cleanManifest), [])
  assert.deepEqual(
    validateProceduralAndG0({
      rigSources: [
        {
          file: 'scripts/harbour/load_authored_hull.py',
          content: 'bpy.ops.wm.alembic_import(filepath="assets/expedition_cruise_v4.abc")',
        },
      ],
      manifest: cleanManifest,
      g0Receipt: cleanG0Receipt,
    }),
    [],
    'MUST NOT FIRE on clean G0 hero with authored asset and signed G0 receipt',
  )
  assert.deepEqual(
    validateHeroLayout({
      stageSources: [
        {
          file: 'components/harbour/v4/HarbourV4Stage.tsx',
          content: `
            <nav className={styles.threadNav} role="tablist" aria-label="One Harbour v4 buyer threads">
              {THREADS.map((t) => <button key={t.id} role="tab" className={styles.threadPill}>{t.label}</button>)}
            </nav>
          `,
        },
      ],
      cssSources: [
        {
          file: 'components/harbour/v4/harbour-v4.module.css',
          content: '.threadNav { display: flex; flex-wrap: nowrap; overflow-x: auto; }',
        },
      ],
    }),
    [],
    'MUST NOT FIRE on clean G0 hero with 1 role="tablist" and 1 non-wrapping mobile pill row above y < 520',
  )
  assert.deepEqual(
    validateCaptureProvenance({
      provenanceSources: [
        {
          file: 'docs/HARBOUR-CLAIMS.md',
          content:
            'All product captures (P01..P12) taken from English (en-GB) staging seed: Port calls, Departures, Create new, Export, Search assignments.',
        },
      ],
    }),
    [],
    'MUST NOT FIRE on clean English-only capture provenance',
  )

  console.log(
    `check-harbour-v4 --selftest: PASS (MUST FIRE verified on PR #44 949a77f fixture${live949Verified ? ' + live git commit 949a77f257706c13fb81b83927bf40a8bae7436c' : ''}; MUST NOT FIRE verified on clean English G0 hero).`,
  )
}

function run() {
  const args = process.argv.slice(2)
  const rootIdx = args.indexOf('--root')
  const gitRefIdx = args.indexOf('--git-ref')

  let reader
  if (gitRefIdx !== -1 && args[gitRefIdx + 1]) {
    reader = makeGitReader(DEFAULT_ROOT, args[gitRefIdx + 1])
  } else {
    const targetRoot = rootIdx !== -1 && args[rootIdx + 1] ? path.resolve(args[rootIdx + 1]) : DEFAULT_ROOT
    reader = makeFsReader(targetRoot)
  }

  const hasHarbourV4 =
    reader.exists('public/media/harbour-v4/manifest.json') ||
    reader.exists('app/harbour-v4/page.tsx') ||
    reader.exists('components/harbour/v4/HarbourV4Stage.tsx')

  if (!hasHarbourV4 && gitRefIdx === -1 && rootIdx === -1) {
    selftest()
    console.log('check-harbour-v4 PASS: /harbour-v4 route not present on this branch; detector selftests verified.')
    return
  }

  const { errs, manifest, routeJsKB } = inspectHarbourTree(reader)
  if (errs.length) {
    console.error(`check-harbour-v4 FAIL (${reader.label}):`)
    for (const e of errs) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log(
    `check-harbour-v4 PASS (${reader.label}): ${Object.keys(manifest.beats).length} beats verified (desktop ${manifest.totals?.desktopMB} MB <= 36 MB, phone ${manifest.totals?.phoneMB} MB <= 7 MB${routeJsKB !== null ? `, route JS ${routeJsKB} KB gz <= 130 KB` : ''}), G0 hero receipt, layout fold guard, English-only provenance, segment guard & G5 Never-list clean.`,
  )
}

if (process.argv.includes('--selftest')) selftest()
else run()
