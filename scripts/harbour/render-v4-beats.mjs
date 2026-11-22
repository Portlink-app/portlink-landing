// Render and encode beats b00..b06 for One Harbour v4 (Step 7, Gate G4).
// Writes raw PNGs to /Users/nyx/Projects/portlink/marketing/one-harbour-v4/s3/v4-beats/<beat>/<tier>/
// and AVIF frames + camera.json + manifest.json to public/media/harbour-v4/.
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const { default: sharp } = await import('sharp').catch(
  () => import('/Users/nyx/Projects/_workspaces/portlink-platform/keel-harbour-captures-20261118/node_modules/sharp/lib/index.js'),
)

const BLENDER = '/Applications/Blender.app/Contents/MacOS/Blender'
const RIG = path.resolve('spikes/s3-rig/beats.py')
const RAW_ROOT = '/Users/nyx/Projects/portlink/marketing/one-harbour-v4/s3/v4-beats'
const OUT_ROOT = path.resolve('public/media/harbour-v4')

const BEATS = [
  { id: 'b00', dFrames: 1, pFrames: 1, samples: 96 },
  { id: 'b01', dFrames: 24, pFrames: 24, samples: 24 },
  { id: 'b02', dFrames: 24, pFrames: 24, samples: 24 },
  { id: 'b03', dFrames: 24, pFrames: 24, samples: 24 },
  { id: 'b04', dFrames: 24, pFrames: 24, samples: 24 },
  { id: 'b05', dFrames: 24, pFrames: 24, samples: 24 },
  { id: 'b06', dFrames: 24, pFrames: 24, samples: 24 },
]

const TIERS = [
  { id: 'd', renderW: 1920, renderH: 1080, delivW: 1440, delivH: 810, capKB: 60, maxFrames: 96 },
  { id: 'p', renderW: 780, renderH: 1688, delivW: 585, delivH: 1266, capKB: 24, maxFrames: 48 },
]

const only = process.argv.slice(2)
const manifestOnly = only.includes('--manifest-only')
const manifestPath = path.join(OUT_ROOT, 'manifest.json')
const existing = fs.existsSync(manifestPath)
  ? JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  : {}
const manifest = { version: 4, beats: existing.beats || {}, totals: existing.totals || {} }

for (const b of BEATS) {
  if (manifestOnly || (only.length && !only.includes(b.id))) continue
  manifest.beats[b.id] = manifest.beats[b.id] || { tiers: {} }
  for (const t of TIERS) {
    const frames = t.id === 'd' ? b.dFrames : b.pFrames
    const rawDir = path.join(RAW_ROOT, b.id, t.id)
    const outDir = path.join(OUT_ROOT, t.id, b.id)
    fs.mkdirSync(rawDir, { recursive: true })
    fs.mkdirSync(outDir, { recursive: true })
    console.log(`[render] ${b.id} ${t.id} (${t.renderW}x${t.renderH}, ${frames}f, ${b.samples}spp)...`)
    execFileSync(
      BLENDER,
      ['-b', '--python-exit-code', '1', '-P', RIG, '--', rawDir, b.id, String(t.renderW), String(t.renderH), String(b.samples), String(frames)],
      { stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const cam = JSON.parse(fs.readFileSync(path.join(rawDir, 'camera.json'), 'utf8'))
    const plateSizes = []
    const shadowSizes = []
    for (let i = 1; i <= frames; i++) {
      const idx = String(i).padStart(4, '0')
      const pOut = path.join(outDir, `plate_${idx}.avif`)
      const sOut = path.join(outDir, `shadow_${idx}.avif`)
      await sharp(path.join(rawDir, `plate_${idx}.png`))
        .resize(t.delivW, t.delivH)
        .avif({ quality: 52, effort: 5, chromaSubsampling: '4:2:0' })
        .toFile(pOut)
      await sharp(path.join(rawDir, `shadow_${idx}.png`))
        .resize(Math.round(t.delivW / 2), Math.round(t.delivH / 2))
        .avif({ quality: 38, effort: 5, chromaSubsampling: '4:2:0' })
        .toFile(sOut)
      plateSizes.push(fs.statSync(pOut).size)
      shadowSizes.push(fs.statSync(sOut).size)
    }
    const frameTotals = plateSizes.map((p, k) => p + shadowSizes[k])
    const maxFrameKB = +(Math.max(...frameTotals) / 1024).toFixed(1)
    const avgFrameKB = +(frameTotals.reduce((x, y) => x + y, 0) / frameTotals.length / 1024).toFixed(1)
    const totalBytes = frameTotals.reduce((x, y) => x + y, 0)
    cam.width = t.delivW
    cam.height = t.delivH
    fs.writeFileSync(path.join(outDir, 'camera.json'), JSON.stringify(cam, null, 2) + '\n')
    manifest.beats[b.id].vessel_type = cam.vessel_type
    manifest.beats[b.id].segment = cam.segment
    manifest.beats[b.id].props = cam.props ?? []
    manifest.beats[b.id].hull = cam.hull
    manifest.beats[b.id].tiers[t.id] = {
      frames,
      width: t.delivW,
      height: t.delivH,
      avgFrameKB,
      maxFrameKB,
      capKB: t.capKB,
      totalBytes,
      secsPerFrame: cam.secs,
      path: `/media/harbour-v4/${t.id}/${b.id}/`,
    }
    console.log(`[done] ${b.id} ${t.id}: ${frames}f, avg ${avgFrameKB} KB, max ${maxFrameKB} KB (cap ${t.capKB} KB), render ${JSON.stringify(cam.secs)}s`)
  }
}

manifest.beats = {}
let dBytes = 0
let pBytes = 0
for (const b of BEATS) {
  const dCamFile = path.join(OUT_ROOT, 'd', b.id, 'camera.json')
  if (!fs.existsSync(dCamFile)) continue
  const dCam = JSON.parse(fs.readFileSync(dCamFile, 'utf8'))
  const entry = {
    vessel_type: dCam.vessel_type,
    segment: dCam.segment,
    props: dCam.props ?? [],
    hull: dCam.hull,
    tiers: {},
  }
  for (const t of TIERS) {
    const dir = path.join(OUT_ROOT, t.id, b.id)
    const camFile = path.join(dir, 'camera.json')
    if (!fs.existsSync(camFile)) continue
    const cam = JSON.parse(fs.readFileSync(camFile, 'utf8'))
    const frames = cam.frames
    const totals = []
    for (let i = 1; i <= frames; i++) {
      const idx = String(i).padStart(4, '0')
      const ps = fs.statSync(path.join(dir, `plate_${idx}.avif`)).size
      const ss = fs.statSync(path.join(dir, `shadow_${idx}.avif`)).size
      totals.push(ps + ss)
    }
    const totalBytes = totals.reduce((x, y) => x + y, 0)
    entry.tiers[t.id] = {
      frames,
      width: t.delivW,
      height: t.delivH,
      avgFrameKB: +(totalBytes / frames / 1024).toFixed(1),
      maxFrameKB: +(Math.max(...totals) / 1024).toFixed(1),
      capKB: t.capKB,
      totalBytes,
      secsPerFrame: cam.secs,
      path: `/media/harbour-v4/${t.id}/${b.id}/`,
    }
    if (t.id === 'd') dBytes += totalBytes
    else pBytes += totalBytes
  }
  manifest.beats[b.id] = entry
}
manifest.totals = {
  desktopMB: +(dBytes / 1048576).toFixed(2),
  desktopCapMB: 36,
  phoneMB: +(pBytes / 1048576).toFixed(2),
  phoneCapMB: 7,
}
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
console.log('[manifest]', JSON.stringify(manifest.totals))
