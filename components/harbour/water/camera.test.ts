// Run: npx tsx --test components/harbour/water/camera.test.ts
// Reference numbers are what three.js r187 produced for the expedition rig:
// PerspectiveCamera + lookAt, projection x view.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { blenderToYUp, hexToLinear, rigViewProjection, type RigCamera } from './camera'
import { oceanGrid } from './ocean'

const cam: RigCamera = {
  position: [127.66075134277344, -201.6694793701172, 31.267459869384766],
  target: [10.411052703857422, 0, 16.024999618530273],
  lens_mm: 50,
  sensor_mm: 36,
  sensor_fit: 'HORIZONTAL',
  width: 1440,
  height: 810,
  frames: 1,
  ship_x: [0],
  hull: { loa_m: 150.82, beam_m: 24.5, l_over_b: 6.16 },
}

const THREE_VP = [2.401408845015319, -0.16183539887216875, -0.5017181523139058, -0.5015509407983871, 0, 4.92776350828174,
  -0.06522335735231165, -0.06520161985611025, -1.396167948994046, -0.2783568829009593, -0.8629552121859335, -0.8626676083825056,
  -25.00119404896378, -77.28253147341435, 238.12047996762928, 240.04078642323083]

test('view-projection matches three.js for the expedition rig', () => {
  const { viewProj } = rigViewProjection(cam)
  THREE_VP.forEach((v, i) => assert.ok(Math.abs(viewProj[i] - v) < 1e-3 * Math.max(1, Math.abs(v)), `element ${i}: ${viewProj[i]} vs ${v}`))
})

test('blender z-up becomes y-up', () => {
  assert.deepEqual(blenderToYUp([1, 2, 3]), [1, 3, -2])
})

test('hex to linear matches three.js ColorManagement', () => {
  const [r, g, b] = hexToLinear('#0a2342')
  assert.ok(Math.abs(r - 0.0030352698352941175) < 1e-9 && Math.abs(g - 0.01680737574872402) < 1e-9 && Math.abs(b - 0.054480276435339814) < 1e-9)
})

test('grid matches three PlaneGeometry layout', () => {
  const { pos, idx } = oceanGrid(2)
  assert.deepEqual([...pos.slice(0, 6)], [-1500, 1500, 0, 1500, 1500, 1500])
  assert.deepEqual([...idx.slice(0, 6)], [0, 3, 1, 3, 4, 1])
  assert.equal(idx.length, 24)
  assert.ok(Math.max(...idx) === 8)
})
