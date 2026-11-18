'use client'

import { useEffect, useRef } from 'react'
import type { MutableRefObject } from 'react'

/**
 * Canvas scrub player for a clip that is driven by scroll (DIRECTION.md section 5, "Making the
 * clips scrubbable"). Two interchangeable engines, so WP2's bake-off (gate G1) can measure both:
 *
 *   webp   A WebP image sequence. Frames are fetched in the order first, last, every 8th, every
 *          4th, then the rest, so scrubbing works at once and refines. Only the compressed blobs
 *          are kept for the whole clip; at most DECODE_WINDOW frames are decoded
 *          (createImageBitmap) around the playhead, because a whole clip decoded is hundreds of MB.
 *   intra  An all-intra H.264 file (every frame a keyframe, `-g 1`). The playhead sets
 *          `currentTime`, and the canvas is drawn on `seeked`. One seek in flight at a time.
 *
 * ⛔ THIS FILE IS NEVER IMPORTED STATICALLY. HarbourStage loads it with import() only behind
 * `?bakeoff=`, so no route chunk, preload or server markup names a sequence file. The isolation
 * guard (`npm run check:harbour-isolation -- --built`) holds that line on the built HTML.
 *
 * The `<video>` of the intra engine is created with document.createElement, not JSX: it is a
 * decode source that is never in server markup, and check-film-motion judges authored JSX.
 */

export type PlayerMode = 'webp' | 'intra'

export const DECODE_WINDOW = 12
const FETCH_CONCURRENCY = 4

export type PlayerStats = {
  mode: PlayerMode
  /** Cost of the drawImage call itself, ms. */
  draw: number[]
  /** Time from a new target frame being requested to it being on the canvas, ms. */
  settle: number[]
  /** Draws that had to show a neighbouring frame because the target was not decoded yet. */
  stale: number
  /** Frames (webp) or seek requests (intra) issued. */
  requests: number
  ready: boolean
  /** Compressed bytes held (webp) or file size (intra). */
  bytes: number
  decodedNow: number
  peakDecoded: number
}

declare global {
  interface Window {
    __harbour?: PlayerStats
  }
}

/** First, last, every 8th, every 4th, then the rest. Pure, exported for the harness and tests. */
export function loadOrder(n: number): number[] {
  const seen = new Set<number>()
  const out: number[] = []
  const add = (i: number) => {
    if (i >= 0 && i < n && !seen.has(i)) {
      seen.add(i)
      out.push(i)
    }
  }
  add(0)
  add(n - 1)
  for (let i = 0; i < n; i += 8) add(i)
  for (let i = 0; i < n; i += 4) add(i)
  for (let i = 0; i < n; i += 1) add(i)
  return out
}

type Props = {
  mode: PlayerMode
  /** webp: directory holding 001.webp ... NNN.webp. intra: URL of the mp4. */
  src: string
  /** webp only: number of frames in the directory. */
  frames?: number
  /** Playhead 0..1, written by the scroll engine, read once per animation frame. */
  progress: MutableRefObject<number>
  /** intra only: frame rate of the file, to quantise seeks. */
  fps?: number
}

export default function SequencePlayer({ mode, src, frames = 72, progress, fps = 24 }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = canvas.current
    const box = host.current
    if (!cv || !box) return
    const ctx = cv.getContext('2d', { alpha: false })
    if (!ctx) return

    const stats: PlayerStats = {
      mode, draw: [], settle: [], stale: 0, requests: 0, ready: false, bytes: 0, decodedNow: 0, peakDecoded: 0,
    }
    window.__harbour = stats
    let alive = true
    let raf = 0

    const paint = (src_: CanvasImageSource, w: number, h: number): number => {
      if (cv.width !== w || cv.height !== h) {
        cv.width = w
        cv.height = h
      }
      const t0 = performance.now()
      ctx.drawImage(src_, 0, 0, w, h)
      const dt = performance.now() - t0
      stats.draw.push(dt)
      return dt
    }

    let cleanup: () => void

    if (mode === 'webp') {
      const blobs: (Blob | undefined)[] = new Array(frames)
      const decoded = new Map<number, ImageBitmap>()
      const inflight = new Set<number>()
      let drawn = -1
      let target = -1
      let targetAt = 0
      const url = (i: number) => `${src}/${String(i + 1).padStart(3, '0')}.webp`

      const order = loadOrder(frames)
      let next = 0
      let fetched = 0
      const pump = async () => {
        while (alive && next < order.length) {
          const i = order[next++]
          try {
            const res = await fetch(url(i))
            if (!res.ok) continue
            const b = await res.blob()
            blobs[i] = b
            stats.bytes += b.size
          } catch {
            /* a missing frame is drawn from its neighbour */
          }
          fetched += 1
          if (fetched === frames) stats.ready = true
        }
      }
      for (let k = 0; k < FETCH_CONCURRENCY; k++) void pump()

      const want = (centre: number) => {
        const lo = Math.max(0, centre - DECODE_WINDOW / 2)
        const hi = Math.min(frames - 1, lo + DECODE_WINDOW - 1)
        for (const [i, bmp] of decoded) {
          if (i < lo || i > hi) {
            bmp.close()
            decoded.delete(i)
          }
        }
        for (let i = lo; i <= hi; i++) {
          const b = blobs[i]
          if (!b || decoded.has(i) || inflight.has(i)) continue
          inflight.add(i)
          stats.requests += 1
          createImageBitmap(b)
            .then((bmp) => {
              inflight.delete(i)
              const c = Math.round(progress.current * (frames - 1))
              const lo = Math.max(0, c - DECODE_WINDOW / 2)
              if (!alive || i < lo || i > lo + DECODE_WINDOW - 1) {
                bmp.close()
                return
              }
              decoded.set(i, bmp)
              stats.decodedNow = decoded.size
              stats.peakDecoded = Math.max(stats.peakDecoded, decoded.size)
            })
            .catch(() => inflight.delete(i))
        }
        stats.decodedNow = decoded.size
      }

      const tick = () => {
        if (!alive) return
        const idx = Math.min(frames - 1, Math.max(0, Math.round(progress.current * (frames - 1))))
        if (idx !== target) {
          target = idx
          targetAt = performance.now()
        }
        want(idx)
        if (drawn !== idx) {
          let best = -1
          if (decoded.has(idx)) best = idx
          else {
            for (let d = 1; d < DECODE_WINDOW && best < 0; d++) {
              if (decoded.has(idx - d)) best = idx - d
              else if (decoded.has(idx + d)) best = idx + d
            }
          }
          const bmp = best >= 0 ? decoded.get(best) : undefined
          if (bmp && best !== drawn) {
            paint(bmp, bmp.width, bmp.height)
            drawn = best
            if (best === idx) stats.settle.push(performance.now() - targetAt)
            else stats.stale += 1
          }
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        for (const bmp of decoded.values()) bmp.close()
        decoded.clear()
      }
    } else {
      const video = document.createElement('video')
      video.muted = true
      video.playsInline = true
      video.preload = 'auto'
      video.setAttribute('aria-hidden', 'true')
      video.style.cssText = 'position:absolute;width:2px;height:2px;opacity:0;pointer-events:none'
      box.appendChild(video)
      video.src = src
      let seeking = false
      let lastReq = -1
      let reqAt = 0
      let loaded = false

      void fetch(src, { method: 'HEAD' })
        .then((r) => {
          stats.bytes = Number(r.headers.get('content-length') ?? 0)
        })
        .catch(() => undefined)

      video.addEventListener('loadeddata', () => {
        loaded = true
        stats.ready = true
      })
      video.addEventListener('seeked', () => {
        seeking = false
        paint(video, video.videoWidth, video.videoHeight)
        stats.settle.push(performance.now() - reqAt)
      })

      const tick = () => {
        if (!alive) return
        if (loaded && !seeking && video.duration > 0) {
          const frame = Math.round(progress.current * (video.duration * fps - 1))
          if (frame !== lastReq) {
            lastReq = frame
            seeking = true
            reqAt = performance.now()
            stats.requests += 1
            // Aim at the middle of the frame so the seek lands on it, not on its neighbour.
            video.currentTime = Math.min(video.duration - 0.001, (frame + 0.5) / fps)
          }
        }
        raf = requestAnimationFrame(tick)
      }
      raf = requestAnimationFrame(tick)

      cleanup = () => {
        video.removeAttribute('src')
        video.load()
        video.remove()
      }
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      cleanup()
    }
  }, [mode, src, frames, progress, fps])

  return (
    <div ref={host} style={{ position: 'absolute', inset: 0 }} data-harbour-player={mode}>
      <canvas
        ref={canvas}
        aria-hidden="true"
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', background: '#0a2342' }}
      />
    </div>
  )
}
