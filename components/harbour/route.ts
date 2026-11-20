import world from '@/public/media/harbour-v2/world.json'

/**
 * The ship's route (DIRECTION.md 12.3, 12.8 WP3), pure so a check can measure it without a browser.
 *
 * `route.svg` holds one path, `#route`, drawn as absolute M / C / S / L segments. We parse that path
 * and walk it by arc length, so the stage and the gate read the same geometry: the ship at route
 * fraction t sits at the point `t * world.route.length` units along `#route`, the same point
 * `SVGPathElement.getPointAtLength` returns. No DOM is needed, so the ship can be placed before the
 * hidden route plane is laid out, and the check runs in node.
 */

type Pt = [number, number]
type Cubic = [Pt, Pt, Pt, Pt]

export const ROUTE_LENGTH = world.route.length

/** The `d` of `#route` in a route plane's inner markup (planes.ts) or a whole route.svg. */
export function routeD(markup: string): string {
  const tag = markup.match(new RegExp(`<path\\b[^>]*\\bid="${world.route.id}"[^>]*>`))?.[0]
  const d = tag?.match(/\sd="([^"]+)"/)?.[1]
  if (!d) throw new Error(`harbour route: no <path id="${world.route.id}" d="..."> in the route plane`)
  return d
}

/** Absolute M, C, S and L only: what route.svg uses. Anything else throws rather than guessing. */
function cubics(d: string): Cubic[] {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) ?? []
  const out: Cubic[] = []
  let i = 0
  let cmd = ''
  let cur: Pt = [0, 0]
  let lastCtrl: Pt | null = null
  const num = () => Number(tokens[i++])
  const pt = (): Pt => [num(), num()]
  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) cmd = tokens[i++]
    if (cmd === 'M') {
      cur = pt()
      lastCtrl = null
      cmd = 'L' // implicit lineto after the first pair
    } else if (cmd === 'C') {
      const c1 = pt()
      const c2 = pt()
      const p = pt()
      out.push([cur, c1, c2, p])
      lastCtrl = c2
      cur = p
    } else if (cmd === 'S') {
      const c1: Pt = lastCtrl ? [2 * cur[0] - lastCtrl[0], 2 * cur[1] - lastCtrl[1]] : cur
      const c2 = pt()
      const p = pt()
      out.push([cur, c1, c2, p])
      lastCtrl = c2
      cur = p
    } else if (cmd === 'L') {
      const p = pt()
      out.push([cur, cur, p, p])
      lastCtrl = null
      cur = p
    } else {
      throw new Error(`harbour route: unsupported path command "${cmd}"`)
    }
  }
  return out
}

function bez([a, b, c, e]: Cubic, u: number): Pt {
  const v = 1 - u
  const k0 = v * v * v
  const k1 = 3 * v * v * u
  const k2 = 3 * v * u * u
  const k3 = u * u * u
  return [k0 * a[0] + k1 * b[0] + k2 * c[0] + k3 * e[0], k0 * a[1] + k1 * b[1] + k2 * c[1] + k3 * e[1]]
}

export type Route = {
  /** Total arc length in world units. */
  length: number
  /** World point and heading (degrees, y down) at route fraction t of ROUTE_LENGTH. */
  at: (t: number) => { x: number; y: number; deg: number }
}

/** Steps per cubic. At 400 the polyline lies within 0,01 unit of the curve on route.svg. */
const STEPS = 400

export function buildRoute(d: string): Route {
  const pts: Pt[] = []
  for (const c of cubics(d)) {
    for (let k = pts.length ? 1 : 0; k <= STEPS; k++) pts.push(bez(c, k / STEPS))
  }
  const cum = [0]
  for (let k = 1; k < pts.length; k++) {
    cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]))
  }
  const length = cum[cum.length - 1]
  const at = (t: number) => {
    const L = Math.min(length, Math.max(0, t * ROUTE_LENGTH))
    let lo = 0
    let hi = cum.length - 1
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1
      if (cum[mid] <= L) lo = mid
      else hi = mid
    }
    const seg = cum[hi] - cum[lo] || 1
    const u = (L - cum[lo]) / seg
    const [x0, y0] = pts[lo]
    const [x1, y1] = pts[hi]
    return { x: x0 + (x1 - x0) * u, y: y0 + (y1 - y0) * u, deg: (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI }
  }
  return { length, at }
}

/** Route fractions closer than this (in units along the route) count as the same place. */
const AT_REST_UNITS = 0.5

/**
 * The ship's state at a scroll position (DIRECTION.md 12.4): under way while the route fraction is
 * changing (wake on), at rest at a stop (wake off), and at anchor only when resting at A1, the
 * anchorage buoy (chain on). Quay stations A2 to A5 berth without the chain.
 */
export function shipState(t: number, tAhead: number) {
  const underWay = Math.abs(tAhead - t) * ROUTE_LENGTH > AT_REST_UNITS
  const atAnchor = !underWay && Math.abs(t - world.stations.A1.t) * ROUTE_LENGTH < 1
  return { underWay, atAnchor }
}
