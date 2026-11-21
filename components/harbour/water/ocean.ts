// Live water under the harbour plates, in raw WebGL2. A port of spikes/s3-beat1/ocean.js without
// three.js: same Gerstner swell, same wave-equation wake on half-float ping-pong targets, run in
// the ship's frame so scrubbing backwards never runs the wake in reverse.
//
// Chose raw WebGL2 over three.js. Because three.js alone measured 135 069 B gzipped, against
// G2's 140 KB chunk budget and G6's 130 KB route budget; this module needs two programs, two
// render targets and one grid. Revisit if a beat needs a scene graph, lights or loaders.
//
// Returns null where WebGL2 or float render targets are missing; the page then keeps its static
// plate (the JS-off page already carries every claim, G6).
import { SIM_VS, SIM_FS, OCEAN_VS, OCEAN_FS } from './shaders'
import { hexToLinear, rigViewProjection, type RigCamera, type Vec3 } from './camera'

export type OceanOptions = { sim?: number; dpr?: number; seg?: number }
export type Ocean = {
  resize(w: number, h: number): void
  setCamera(cam: RigCamera): void
  step(shipX: number): void
  dispose(): void
}

const SIM_SIZE = 640                       // metres covered by the wake grid
const SHIP: [number, number] = [0.78, 0.5] // hull centre in sim uv (bow toward +x)
const NAVY_HEX = '#0a2342'

function program(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram()!
  for (const [type, src] of [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]] as const) {
    const s = gl.createShader(type)!
    gl.shaderSource(s, src); gl.compileShader(s)
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`water shader: ${gl.getShaderInfoLog(s)}`)
    gl.attachShader(p, s); gl.deleteShader(s)
  }
  gl.bindAttribLocation(p, 0, 'aPos')
  gl.linkProgram(p)
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(`water link: ${gl.getProgramInfoLog(p)}`)
  return p
}

function uniforms(gl: WebGL2RenderingContext, p: WebGLProgram) {
  const cache = new Map<string, WebGLUniformLocation | null>()
  return (name: string) => {
    if (!cache.has(name)) cache.set(name, gl.getUniformLocation(p, name))
    return cache.get(name)!
  }
}

function target(gl: WebGL2RenderingContext, size: number) {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, size, size, 0, gl.RGBA, gl.HALF_FLOAT, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const fb = gl.createFramebuffer()!
  gl.bindFramebuffer(gl.FRAMEBUFFER, fb)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0)
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE
  gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  return ok ? { tex, fb } : null
}

/** A seg x seg grid over 3000 x 3000 m in the xy plane, like three's PlaneGeometry. */
export function oceanGrid(seg: number) {
  const n = seg + 1, pos = new Float32Array(n * n * 2), idx = new Uint32Array(seg * seg * 6)
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    pos[(j * n + i) * 2] = (i / seg - 0.5) * 3000
    pos[(j * n + i) * 2 + 1] = (0.5 - j / seg) * 3000
  }
  let k = 0
  for (let j = 0; j < seg; j++) for (let i = 0; i < seg; i++) {
    const a = j * n + i, b = a + n
    idx.set([a, b, a + 1, b, b + 1, a + 1], k); k += 6
  }
  return { pos, idx }
}

export function createOcean(canvas: HTMLCanvasElement, cam: RigCamera, { sim = 256, dpr = 1.5, seg = 256 }: OceanOptions = {}): Ocean | null {
  const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, depth: false, powerPreference: 'high-performance' })
  if (!gl || !gl.getExtension('EXT_color_buffer_float')) return null
  const moving = cam.frames > 1 ? 1 : 0   // a one-frame clip is a moored ship: no bow wave, softer glint
  const hull = cam.hull

  let a = target(gl, sim), b = target(gl, sim)
  if (!a || !b) return null
  const simP = program(gl, SIM_VS, SIM_FS), oceanP = program(gl, OCEAN_VS, OCEAN_FS)
  const su = uniforms(gl, simP), ou = uniforms(gl, oceanP)

  const quad = gl.createVertexArray()!
  gl.bindVertexArray(quad)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)

  const grid = oceanGrid(seg)
  const mesh = gl.createVertexArray()!
  gl.bindVertexArray(mesh)
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ARRAY_BUFFER, grid.pos, gl.STATIC_DRAW)
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gl.createBuffer())
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, grid.idx, gl.STATIC_DRAW)
  gl.bindVertexArray(null)

  gl.useProgram(simP)
  gl.uniform1i(su('uPrev'), 0)
  gl.uniform2f(su('uTexel'), 1 / sim, 1 / sim)
  gl.uniform2f(su('uShip'), SHIP[0], SHIP[1])
  // footprint from the rig's hull block when present; 170 x 26 fits the 180 m cargo hull
  gl.uniform2f(su('uShipSize'), (hull ? hull.loa_m * 0.95 : 170) / SIM_SIZE, (hull ? hull.beam_m * 1.06 : 26) / SIM_SIZE)
  gl.uniform1f(su('uMove'), moving)
  gl.uniform1f(su('uAdv'), 0.06 / sim)   // water moves aft 0.06 texel per substep
  gl.uniform1f(su('uC2'), 0.0004); gl.uniform1f(su('uInject'), 0.05); gl.uniform1f(su('uFoamGain'), 40)

  const sun: Vec3 = (() => { const l = Math.hypot(-1, 0.16, -1); return [-1 / l, 0.16 / l, -1 / l] })()
  const applyCamera = (c: RigCamera) => {
    const mov = c.frames > 1 ? 1 : 0
    const h = c.hull
    gl.useProgram(simP)
    gl.uniform2f(su('uShipSize'), (h ? h.loa_m * 0.95 : 170) / SIM_SIZE, (h ? h.beam_m * 1.06 : 26) / SIM_SIZE)
    gl.uniform1f(su('uMove'), mov)
    const { eye, viewProj } = rigViewProjection(c)
    gl.useProgram(oceanP)
    gl.uniformMatrix4fv(ou('uViewProj'), false, viewProj)
    gl.uniform3fv(ou('uSun'), hexToLinear(mov ? '#f5b53d' : '#dfe6ec'))
    gl.uniform1f(ou('uGlint'), mov ? 1 : 0.12)
    gl.uniform3fv(ou('uCam'), eye)
  }
  gl.useProgram(oceanP)
  gl.uniform1i(ou('uWake'), 0)
  gl.uniform1f(ou('uSimSize'), SIM_SIZE); gl.uniform1f(ou('uTexel'), 1 / sim)
  gl.uniform2f(ou('uShipUv'), SHIP[0], SHIP[1])
  gl.uniform3fv(ou('uNavy'), hexToLinear(NAVY_HEX))
  gl.uniform3fv(ou('uCold'), hexToLinear('#4f7db8'))
  gl.uniform3fv(ou('uSunDir'), sun)
  applyCamera(cam)

  const navy = parseInt(NAVY_HEX.slice(1), 16)
  const t0 = performance.now()
  return {
    resize(w, h) { canvas.width = Math.floor(w * dpr); canvas.height = Math.floor(h * dpr) },
    setCamera(c) { applyCamera(c) },
    step(shipX) {
      gl.useProgram(simP); gl.bindVertexArray(quad); gl.viewport(0, 0, sim, sim)
      gl.activeTexture(gl.TEXTURE0)
      for (let i = 0; i < 3; i++) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, b!.fb); gl.bindTexture(gl.TEXTURE_2D, a!.tex)
        gl.drawArrays(gl.TRIANGLES, 0, 3); [a, b] = [b, a]
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.clearColor(((navy >> 16) & 255) / 255, ((navy >> 8) & 255) / 255, (navy & 255) / 255, 1)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(oceanP); gl.bindVertexArray(mesh); gl.bindTexture(gl.TEXTURE_2D, a!.tex)
      gl.uniform2f(ou('uShipPos'), shipX, 0)
      gl.uniform1f(ou('uTime'), (performance.now() - t0) / 1000)
      gl.drawElements(gl.TRIANGLES, grid.idx.length, gl.UNSIGNED_INT, 0)
    },
    dispose() { gl.getExtension('WEBGL_lose_context')?.loseContext() },
  }
}
