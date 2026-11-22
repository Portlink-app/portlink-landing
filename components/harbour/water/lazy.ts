// Loads the water chunk after the largest contentful paint, never before it (G2): the plate is
// the LCP element and the water is decoration over it. The dynamic import keeps the chunk out of
// the route bundle (G6). Resolves null when the browser cannot run it, so the caller keeps the
// static plate.
import type { RigCamera } from './camera'
import type { Ocean, OceanOptions } from './ocean'

export function afterLcp(timeoutMs = 2500): Promise<void> {
  return new Promise((resolve) => {
    let done = false
    const go = () => {
      if (done) return
      done = true
      const idle = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }).requestIdleCallback
      if (idle) idle(() => resolve(), { timeout: 500 }); else setTimeout(resolve, 0)
    }
    try {
      const po = new PerformanceObserver((list) => { if (list.getEntries().length) { po.disconnect(); go() } })
      po.observe({ type: 'largest-contentful-paint', buffered: true })
    } catch { /* no LCP entries (Safari): fall back to the timer */ }
    addEventListener('pointerdown', go, { once: true, passive: true })
    addEventListener('scroll', go, { once: true, passive: true })
    setTimeout(go, timeoutMs)
  })
}

export async function loadOcean(canvas: HTMLCanvasElement, cam: RigCamera, opts?: OceanOptions): Promise<Ocean | null> {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return null
  await afterLcp()
  const { createOcean } = await import('./ocean')
  return createOcean(canvas, cam, opts)
}
