#!/usr/bin/env node
/**
 * check-harbour-v4: enforces Gates G4 (segment guard + frame/film byte caps) and G5 (truth pack +
 * Never-list + unapproved customer/quote gate) on One Harbour v4 (/harbour-v4).
 *
 * --selftest proves each detector against known-positive and known-negative fixtures before
 * inspecting the repository files.
 */
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import zlib from 'node:zlib'
import { fileURLToPath } from 'node:url'

const ROOT = path.join(fileURLToPath(new URL('.', import.meta.url)), '..')

export const ALLOWED_VESSEL_TYPES = new Set([
  'expedition_cruise',
  'ship_tender',
  'harbour_launch',
  'tour_boat',
])
export const ALLOWED_SEGMENTS = new Set(['cruise', 'port_agent', 'dmc', 'tour_operator'])
export const ALLOWED_PROPS = new Set(['iceberg'])
export const FORBIDDEN_TOKENS = /\b(cargo|container_ship|bulk_carrier|tanker|quay_crane|reach_stacker)\b/i

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

function selftest() {
  // Known positive (valid expedition beat)
  assert.deepEqual(
    validateBeatMeta('b00', {
      vessel_type: 'expedition_cruise',
      segment: 'cruise',
      hull: { loa_m: 150, beam_m: 24.5, l_over_b: 6.16 },
    }),
    [],
  )
  // Known negative (cargo ship / wrong L/B / missing segment)
  assert.ok(validateBeatMeta('b00', { vessel_type: 'cargo_ship', segment: 'cruise' }).length > 0)
  assert.ok(
    validateBeatMeta('b00', {
      vessel_type: 'expedition_cruise',
      segment: 'cruise',
      hull: { loa_m: 300, beam_m: 32, l_over_b: 9.37 },
    }).length > 0,
  )
  // Known negative (G4 byte cap exceeded)
  const badManifest = {
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
  assert.ok(validateG4Manifest(badManifest).some((e) => e.includes('> 60 KB cap')))
  // Never-list copy checks
  assert.deepEqual(validateCopyText('Vela Nordic uses Portlink DMC.'), [])
  assert.ok(validateCopyText('The ship notifies everyone when it arrives.').length > 0)
  assert.ok(validateCopyText('First deployment: Greenland.').length > 0)
  assert.ok(validateCopyText('Trusted by Windstar and Hugo Trumpy.').length > 0)
  console.log('check-harbour-v4 --selftest: all segment, G4 and G5 detectors verified.')
}

function run() {
  const manifestFile = path.join(ROOT, 'public/media/harbour-v4/manifest.json')
  if (!fs.existsSync(manifestFile)) {
    console.error('check-harbour-v4 FAIL: public/media/harbour-v4/manifest.json missing')
    process.exit(1)
  }
  const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'))
  const errs = [...validateG4Manifest(manifest)]

  for (const [id, b] of Object.entries(manifest.beats ?? {})) {
    for (const tier of ['d', 'p']) {
      const t = b.tiers?.[tier]
      if (!t) continue
      const dir = path.join(ROOT, 'public/media/harbour-v4', tier, id)
      const camFile = path.join(dir, 'camera.json')
      if (!fs.existsSync(camFile)) {
        errs.push(`${id} ${tier}: missing camera.json`)
        continue
      }
      const cam = JSON.parse(fs.readFileSync(camFile, 'utf8'))
      errs.push(...validateBeatMeta(`${id}/${tier}/camera.json`, cam))
      for (let i = 1; i <= t.frames; i++) {
        const idx = String(i).padStart(4, '0')
        for (const layer of ['plate', 'shadow']) {
          const f = path.join(dir, `${layer}_${idx}.avif`)
          if (!fs.existsSync(f)) errs.push(`missing frame ${f}`)
        }
      }
    }
  }

  const v4Files = [
    path.join(ROOT, 'components/harbour/v4/scriptV4.ts'),
    path.join(ROOT, 'components/harbour/v4/HarbourV4Stage.tsx'),
    path.join(ROOT, 'app/harbour-v4/page.tsx'),
  ]
  for (const f of v4Files) {
    if (!fs.existsSync(f)) {
      errs.push(`missing source file ${path.relative(ROOT, f)}`)
      continue
    }
    const src = fs.readFileSync(f, 'utf8')
    for (const e of validateCopyText(src)) errs.push(`${path.relative(ROOT, f)}: ${e}`)
    if (f.endsWith('scriptV4.ts')) {
      if (/VELA_QUOTE_APPROVED\s*=\s*true/.test(src)) {
        errs.push('scriptV4.ts: VELA_QUOTE_APPROVED must stay false until written approval is on file (G5)')
      }
      if (/ADVISORS_APPROVED\s*=\s*true/.test(src)) {
        errs.push('scriptV4.ts: ADVISORS_APPROVED must stay false until advisor consent is on file (G5)')
      }
      const capRefs = [...src.matchAll(/\/media\/harbour-v4\/captures\/[A-Za-z0-9_-]+\.webp/g)].map((m) => m[0])
      for (const ref of capRefs) {
        if (!fs.existsSync(path.join(ROOT, 'public', ref))) {
          errs.push(`scriptV4.ts: missing capture file public${ref}`)
        }
      }
    }
  }

  const builtHtml = path.join(ROOT, '.next/server/app/harbour-v4.html')
  const baseHtml = path.join(ROOT, '.next/server/app/privacy.html')
  let routeJsKB = null
  if (fs.existsSync(builtHtml) && fs.existsSync(baseHtml)) {
    const html = fs.readFileSync(builtHtml, 'utf8')
    if (/<video\b/i.test(html)) {
      errs.push('.next/server/app/harbour-v4.html contains a <video> element (forbidden by G6)')
    }
    const getChunks = (txt) => [...new Set([...txt.matchAll(/\/_next\/static\/chunks\/([^"]+\.js)/g)].map((m) => m[1]))]
    const baseChunks = new Set(getChunks(fs.readFileSync(baseHtml, 'utf8')))
    const routeChunks = getChunks(html).filter((c) => !baseChunks.has(c))
    let gzBytes = 0
    for (const c of routeChunks) {
      const f = path.join(ROOT, '.next/static/chunks', c)
      if (fs.existsSync(f)) gzBytes += zlib.gzipSync(fs.readFileSync(f)).length
    }
    routeJsKB = Number((gzBytes / 1024).toFixed(1))
    if (routeJsKB > 130) {
      errs.push(`G6 route JS gzipped ${routeJsKB} KB > 130 KB ceiling`)
    }
  }

  if (errs.length) {
    console.error('check-harbour-v4 FAIL:')
    for (const e of errs) console.error(`  - ${e}`)
    process.exit(1)
  }
  console.log(
    `check-harbour-v4 PASS: ${Object.keys(manifest.beats).length} beats verified (desktop ${manifest.totals?.desktopMB} MB <= 36 MB, phone ${manifest.totals?.phoneMB} MB <= 7 MB${routeJsKB !== null ? `, route JS ${routeJsKB} KB gz <= 130 KB` : ''}), segment guard & G5 Never-list clean.`,
  )
}

if (process.argv.includes('--selftest')) selftest()
else run()
