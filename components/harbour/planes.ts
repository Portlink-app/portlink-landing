import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import world from '@/public/media/harbour-v2/world.json'

/**
 * The One Harbour planes, read on the server so the stage mounts them inline (DIRECTION.md 12.8
 * WP1): the lights (WP5) and the route (WP3) need their DOM, which an <img> would hide.
 *
 * Each file is one <svg> whose viewBox is the world (or the ship sprite). We keep the viewBox and
 * hand the stage only the inner markup, so it can draw the plane at world size under one camera
 * transform. The files are our own, committed artwork (public/media/harbour-v2), never user input.
 */
export type Plane = { id: string; viewBox: string; inner: string }

const DIR = join(process.cwd(), 'public/media/harbour-v2')
/** Total inline SVG budget in bytes (DIRECTION.md 12.7: at most 120 KB). */
export const PLANES_BUDGET = 120 * 1024

function readPlane(id: string): Plane {
  const svg = readFileSync(join(DIR, `${id}.svg`), 'utf8')
  const open = svg.match(/<svg\b[^>]*>/)
  const close = svg.lastIndexOf('</svg>')
  const viewBox = open?.[0].match(/viewBox="([^"]+)"/)?.[1]
  if (!open || close < 0 || !viewBox) throw new Error(`harbour plane ${id}: not a single <svg> with a viewBox`)
  const inner = svg
    .slice(open.index! + open[0].length, close)
    .replace(/<title>[\s\S]*?<\/title>|<desc>[\s\S]*?<\/desc>/g, '')
    .trim()
  return { id, viewBox, inner }
}

/** Every plane in draw order (world.json `layers`), then the route, which the ship follows. */
export function loadPlanes(): Plane[] {
  const planes = [...world.layers.map((l) => readPlane(l.id)), readPlane(world.route.id)]
  const bytes = planes.reduce((n, p) => n + Buffer.byteLength(p.inner), 0)
  if (bytes > PLANES_BUDGET) throw new Error(`harbour planes: ${bytes} B inline, budget ${PLANES_BUDGET} B`)
  return planes
}
