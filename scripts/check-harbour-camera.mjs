// The One Harbour coverage clamp (DIRECTION.md 12.6): no camera the stage can use shows a world
// edge. Samples every keyframe and the path between them at both proof viewports, densely, and
// asserts zero gaps after clampCamera. --selftest proves the instrument sees a gap: unclamped
// frames known to expose edges must be reported, and the clamp must close them.
import assert from 'node:assert/strict'
import { DESKTOP, PHONE, cameraAt, clampCamera, coverageGaps } from '../components/harbour/camera.ts'

const VIEWPORTS = [
  { name: 'desktop', vw: 1440, vh: 900, rows: DESKTOP },
  { name: 'phone', vw: 390, vh: 844, rows: PHONE },
  // Either keyframe set may meet the other's viewport during a resize; cover the cross pairs too.
  { name: 'desktop-rows@phone', vw: 390, vh: 844, rows: DESKTOP },
  { name: 'phone-rows@desktop', vw: 1440, vh: 900, rows: PHONE },
  { name: 'desktop-wide', vw: 2560, vh: 1080, rows: DESKTOP },
  { name: 'desktop-small', vw: 1280, vh: 720, rows: DESKTOP },
]

if (process.argv.includes('--selftest')) {
  // Known positives: frames that expose edges at 1440 x 900 before the clamp.
  for (const cam of [
    { cx: 2400, cy: 1420, s: 0.3 },
    { cx: 2400, cy: 1420, s: 0.13 },
    { cx: 0, cy: 2300, s: 0.5 },
  ]) {
    assert.ok(coverageGaps(cam, 1440, 900).length > 0, `selftest: gap not seen at ${JSON.stringify(cam)}`)
    assert.deepEqual(coverageGaps(clampCamera(cam, 1440, 900), 1440, 900), [], `selftest: clamp left a gap at ${JSON.stringify(cam)}`)
  }
  // Known negative: a frame well inside the world is covered without help and the clamp keeps it.
  const inside = { cx: 2400, cy: 1420, s: 1 }
  assert.deepEqual(coverageGaps(inside, 1440, 900), [])
  assert.deepEqual(clampCamera(inside, 1440, 900), inside)
  console.log('check-harbour-camera selftest: ok (3 known gaps seen and closed, 1 covered frame untouched)')
  process.exit(0)
}

let samples = 0
const floors = []
for (const { name, vw, vh, rows } of VIEWPORTS) {
  const end = rows[rows.length - 1].at
  for (let i = 0; i <= 4000; i++) {
    const at = (end * i) / 4000
    const cam = clampCamera(cameraAt(at, rows), vw, vh)
    const gaps = coverageGaps(cam, vw, vh)
    assert.deepEqual(gaps, [], `${name} at ${at.toFixed(3)} screens: ${JSON.stringify(gaps)} for ${JSON.stringify(cam)}`)
    samples++
  }
  for (const row of rows) {
    const c = clampCamera(row, vw, vh)
    assert.deepEqual(coverageGaps(c, vw, vh), [], `${name} keyframe at ${row.at}`)
    if (c.s > row.s + 1e-9) floors.push(`${name}@${row.at}: s ${row.s} -> ${c.s.toFixed(3)}`)
  }
}
console.log(`check-harbour-camera: ok (${samples} clamped cameras, 0 gaps)`)
if (floors.length) console.log(`  clamp raised s on ${floors.length} keyframe(s):\n  ${floors.join('\n  ')}`)
