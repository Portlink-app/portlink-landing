import world from '@/public/media/harbour-v2/world.json'

/**
 * The One Harbour camera (DIRECTION.md 12.2 and 12.6), pure so a check can run it without a browser.
 *
 * World: 4800 x 2400 units, origin top left, y down. A camera is the world point at the viewport
 * centre (cx, cy) and a scale s (screen px per world unit). A layer with horizontal parallax fx is
 * drawn at
 *
 *   translate((-X0 - (cx - X0) * fx) * s + vw / 2, -cy * s + vh / 2) scale(s)
 *
 * with X0 = referenceX (2400), transform-origin 0 0. Vertical parallax is 1 for every layer.
 *
 * The keyframes are wishes. `clampCamera` is the law: it raises s until every full-bleed layer and
 * the world's height cover the viewport, so no camera the timeline asks for can show an edge.
 */

export type Cam = { cx: number; cy: number; s: number }
/** One camera keyframe at a scroll position in screens from the track top; t is the ship's route position. */
export type CamRow = Cam & { at: number; t: number }

type Layer = { id: string; fx: number; extent?: number[]; bleed: boolean }

export const WORLD_W = world.world.width
export const WORLD_H = world.world.height
export const X0 = world.world.referenceX
export const LAYERS = world.layers as Layer[]
const BLEED = LAYERS.filter((l) => l.bleed && l.extent) as (Layer & { extent: [number, number] })[]

/** Smallest gap, in px, that counts as a visible edge. */
export const GAP_PX = 0.5

export function layerTransform(cam: Cam, fx: number, vw: number, vh: number) {
  return {
    tx: (-X0 - (cam.cx - X0) * fx) * cam.s + vw / 2,
    ty: -cam.cy * cam.s + vh / 2,
    s: cam.s,
  }
}

/** The smallest s at which the world's height and every full-bleed layer cover a vw x vh viewport. */
export function minScale(cx: number, cy: number, vw: number, vh: number): number {
  let s = Math.max(vh / 2 / cy, vh / 2 / (WORLD_H - cy))
  for (const l of BLEED) {
    const [xl, xr] = l.extent
    const centre = X0 + (cx - X0) * l.fx // the layer-local x under the viewport centre
    s = Math.max(s, vw / 2 / (centre - xl), vw / 2 / (xr - centre))
  }
  return s
}

/** The camera the stage may use: centre kept inside the world, then s raised to the coverage floor. */
export function clampCamera(cam: Cam, vw: number, vh: number): Cam {
  const cx = Math.min(WORLD_W, Math.max(0, cam.cx))
  const cy = Math.min(WORLD_H - 1, Math.max(1, cam.cy))
  return { cx, cy, s: Math.max(cam.s, minScale(cx, cy, vw, vh)) }
}

/** Edges of the viewport left uncovered by a camera, each with its gap in px. Empty means covered. */
export function coverageGaps(cam: Cam, vw: number, vh: number): { edge: string; px: number }[] {
  const gaps: { edge: string; px: number }[] = []
  const top = layerTransform(cam, 1, vw, vh).ty
  const bottom = top + WORLD_H * cam.s
  if (top > GAP_PX) gaps.push({ edge: 'world:top', px: top })
  if (vh - bottom > GAP_PX) gaps.push({ edge: 'world:bottom', px: vh - bottom })
  for (const l of BLEED) {
    const { tx } = layerTransform(cam, l.fx, vw, vh)
    const left = tx + l.extent[0] * cam.s
    const right = tx + l.extent[1] * cam.s
    if (left > GAP_PX) gaps.push({ edge: `${l.id}:left`, px: left })
    if (vw - right > GAP_PX) gaps.push({ edge: `${l.id}:right`, px: vw - right })
  }
  return gaps
}

/**
 * Desktop keyframes (1440 x 900 proof frames d1 to d4), in screens of the track (script.ts shots).
 * The opening is the whole harbour at the coverage floor; each stop pushes in on its station.
 */
export const DESKTOP: CamRow[] = [
  { at: 0, cx: 2400, cy: 1420, s: 0.46, t: 0.29 }, // d1: the whole harbour
  { at: 2.6, cx: 2400, cy: 1420, s: 0.46, t: 0.29 },
  { at: 3.6, cx: 1500, cy: 1440, s: 1, t: 0.29 }, // d2: A1, the call
  { at: 6, cx: 1500, cy: 1440, s: 1, t: 0.29 },
  { at: 7.2, cx: 1900, cy: 1440, s: 0.8, t: 0.4 },
  { at: 8.2, cx: 2240, cy: 1440, s: 1, t: 0.4462 }, // A2
  { at: 10.2, cx: 2720, cy: 1450, s: 1, t: 0.546 }, // A3
  { at: 12.2, cx: 3180, cy: 1470, s: 1, t: 0.6422 }, // A4
  { at: 13.3, cx: 3620, cy: 1480, s: 1, t: 0.7338 }, // A5
  { at: 14.4, cx: 3300, cy: 1460, s: 0.9, t: 0.72 }, // d4
  { at: 16.8, cx: 2400, cy: 1440, s: 0.9, t: 0.72 }, // d3
]

/** Phone keyframes (390 x 844 proof frames p1 to p3): tight from the first frame, then a pan. */
export const PHONE: CamRow[] = [
  { at: 0, cx: 1500, cy: 1500, s: 0.47, t: 0.29 }, // p1
  { at: 2.6, cx: 1500, cy: 1500, s: 0.47, t: 0.29 },
  { at: 3.6, cx: 1420, cy: 1500, s: 0.55, t: 0.29 }, // p2: A1
  { at: 8.2, cx: 2140, cy: 1500, s: 0.55, t: 0.4462 },
  { at: 10.2, cx: 2620, cy: 1500, s: 0.55, t: 0.546 }, // p3: A3
  { at: 12.2, cx: 3080, cy: 1500, s: 0.55, t: 0.6422 },
  { at: 13.3, cx: 3520, cy: 1500, s: 0.55, t: 0.7338 },
  { at: 16.8, cx: 2620, cy: 1500, s: 0.47, t: 0.72 },
]

const ease = (u: number) => u * u * (3 - 2 * u)

/** The keyframed (unclamped) camera at a scroll position in screens. Scale eases in log space. */
export function cameraAt(screens: number, rows: CamRow[]): CamRow {
  if (screens <= rows[0].at) return { ...rows[0], at: screens }
  for (let i = 1; i < rows.length; i++) {
    const a = rows[i - 1]
    const b = rows[i]
    if (screens <= b.at) {
      const u = ease((screens - a.at) / (b.at - a.at || 1))
      const lerp = (p: number, q: number) => p + (q - p) * u
      return {
        at: screens,
        cx: lerp(a.cx, b.cx),
        cy: lerp(a.cy, b.cy),
        s: Math.exp(lerp(Math.log(a.s), Math.log(b.s))),
        t: lerp(a.t, b.t),
      }
    }
  }
  return { ...rows[rows.length - 1], at: screens }
}
