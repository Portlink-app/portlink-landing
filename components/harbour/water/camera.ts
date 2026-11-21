// Pure camera math for the live water: the Blender rig's camera.json becomes a y-up view and
// projection, column-major like WebGL expects. No DOM, no GL, so it is unit-tested
// (camera.test.ts) against the numbers three.js produced for the same rig in spikes/s3-beat1.

export type RigCamera = {
  position: [number, number, number]
  target: [number, number, number]
  lens_mm: number
  sensor_mm: number
  sensor_fit: 'HORIZONTAL' | 'VERTICAL' | 'AUTO'
  width: number
  height: number
  frames: number
  ship_x: number[]
  hull?: { loa_m: number; beam_m: number }
}

export type Vec3 = [number, number, number]

/** Blender is z-up; the water is y-up: (x, y, z) becomes (x, z, -y). */
export const blenderToYUp = (v: readonly number[]): Vec3 => [v[0], v[2], -v[1]]

/** Vertical field of view in radians, honouring the rig's sensor fit. */
export function verticalFov(cam: RigCamera): number {
  const half = Math.atan(cam.sensor_mm / 2 / cam.lens_mm)
  const aspect = cam.width / cam.height
  return cam.sensor_fit === 'VERTICAL' ? 2 * half : 2 * Math.atan(Math.tan(half) / aspect)
}

export function perspective(fovY: number, aspect: number, near: number, far: number): Float32Array {
  const f = 1 / Math.tan(fovY / 2), nf = 1 / (near - far)
  return new Float32Array([
    f / aspect, 0, 0, 0,
    0, f, 0, 0,
    0, 0, (far + near) * nf, -1,
    0, 0, 2 * far * near * nf, 0,
  ])
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: Vec3): Vec3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l] }
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]

/** View matrix (world to camera) for an eye looking at a target with +y up. */
export function lookAt(eye: Vec3, target: Vec3, up: Vec3 = [0, 1, 0]): Float32Array {
  const z = norm(sub(eye, target)), x = norm(cross(up, z)), y = cross(z, x)
  return new Float32Array([
    x[0], y[0], z[0], 0,
    x[1], y[1], z[1], 0,
    x[2], y[2], z[2], 0,
    -dot(x, eye), -dot(y, eye), -dot(z, eye), 1,
  ])
}

export function multiply(a: Float32Array, b: Float32Array): Float32Array {
  const o = new Float32Array(16)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    let s = 0
    for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]
    o[c * 4 + r] = s
  }
  return o
}

/** The rig's camera as the water draws it: eye in world space and one view-projection matrix. */
export function rigViewProjection(cam: RigCamera, near = 1, far = 6000) {
  const eye = blenderToYUp(cam.position), target = blenderToYUp(cam.target)
  const proj = perspective(verticalFov(cam), cam.width / cam.height, near, far)
  return { eye, viewProj: multiply(proj, lookAt(eye, target)) }
}

/** sRGB hex to linear RGB, matching three.js ColorManagement for `new Color('#rrggbb')`. */
export function hexToLinear(hex: string): Vec3 {
  const n = parseInt(hex.replace('#', ''), 16)
  const ch = (c: number) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4) }
  return [ch((n >> 16) & 255), ch((n >> 8) & 255), ch(n & 255)]
}
