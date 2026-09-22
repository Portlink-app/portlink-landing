'use client'

/**
 * AnimatedBeam: a line between two boxes with a pulse travelling along it.
 *
 * Started as MagicUI's animated-beam (magicui.design/r/animated-beam.json, MIT) and kept its one
 * idea, measure two DOM boxes inside a container and draw a path between them. Two things were
 * replaced after the first render on 22.09.2026 read as "buggy" (Kris):
 *
 *   1. ANCHORS ARE BOX EDGES, NOT CENTRES. Centre-to-centre paths run underneath the boxes, so the
 *      visible beam was a 30 px stub between two cards and the pulse spent most of its cycle hidden.
 *      The path now leaves the facing edge of one box and arrives at the facing edge of the other,
 *      horizontally when the boxes sit side by side, vertically when they are stacked (phone).
 *   2. THE PULSE IS A DASH ALONG THE PATH, NOT A GRADIENT SWEPT ACROSS THE SVG. The source animates
 *      a linearGradient in userSpaceOnUse percentages, which are percentages of the whole SVG, so on a
 *      wide container the glow crossed 1400 px of viewport to light 30 px of line, and read as a
 *      flicker. `pathLength="1"` plus a CSS `stroke-dashoffset` keyframe moves a fixed-length dash
 *      along the curve itself, whatever its length or bend, and honours reduced motion by stopping.
 *
 * Measurement re-runs on container, endpoint and window resize, and after web fonts settle, because
 * the boxes change size when the display face arrives and a stale path then points at nothing.
 */
import { useEffect, useState, type RefObject } from 'react'
import styles from './havn.module.css'

export interface AnimatedBeamProps {
  containerRef: RefObject<HTMLElement | null>
  fromRef: RefObject<HTMLElement | null>
  toRef: RefObject<HTMLElement | null>
  /** Run the pulse from `to` back to `from`. */
  reverse?: boolean
  /** Seconds per pulse. */
  duration?: number
  delay?: number
  /** Nudge both anchors along the box edge, in px. Lets two beams share a pair of boxes. */
  offset?: number
}

type Anchor = { x: number; y: number }

function edgeAnchors(a: DOMRect, b: DOMRect, c: DOMRect, offset: number): { from: Anchor; to: Anchor; horizontal: boolean } {
  const ax = a.left - c.left, ay = a.top - c.top
  const bx = b.left - c.left, by = b.top - c.top
  const acx = ax + a.width / 2, acy = ay + a.height / 2
  const bcx = bx + b.width / 2, bcy = by + b.height / 2
  const horizontal = Math.abs(bcx - acx) >= Math.abs(bcy - acy)
  if (horizontal) {
    const leftToRight = bcx >= acx
    return {
      horizontal,
      from: { x: leftToRight ? ax + a.width : ax, y: acy + offset },
      to: { x: leftToRight ? bx : bx + b.width, y: bcy + offset },
    }
  }
  const topToBottom = bcy >= acy
  return {
    horizontal,
    from: { x: acx + offset, y: topToBottom ? ay + a.height : ay },
    to: { x: bcx + offset, y: topToBottom ? by : by + b.height },
  }
}

export default function AnimatedBeam({ containerRef, fromRef, toRef, reverse = false, duration = 3.2, delay = 0, offset = 0 }: AnimatedBeamProps) {
  const [d, setD] = useState('')
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => {
      const c = containerRef.current, a = fromRef.current, b = toRef.current
      if (!c || !a || !b) return
      const cr = c.getBoundingClientRect()
      setSize({ width: cr.width, height: cr.height })
      const { from, to, horizontal } = edgeAnchors(a.getBoundingClientRect(), b.getBoundingClientRect(), cr, offset)
      const path = horizontal
        ? `M ${from.x},${from.y} C ${(from.x + to.x) / 2},${from.y} ${(from.x + to.x) / 2},${to.y} ${to.x},${to.y}`
        : `M ${from.x},${from.y} C ${from.x},${(from.y + to.y) / 2} ${to.x},${(from.y + to.y) / 2} ${to.x},${to.y}`
      setD(path)
    }
    const ro = new ResizeObserver(update)
    for (const r of [containerRef, fromRef, toRef]) if (r.current) ro.observe(r.current)
    window.addEventListener('resize', update)
    update()
    if (typeof document !== 'undefined' && 'fonts' in document) document.fonts.ready.then(update).catch(() => {})
    return () => { ro.disconnect(); window.removeEventListener('resize', update) }
  }, [containerRef, fromRef, toRef, offset])

  return (
    <svg
      fill="none"
      width={size.width}
      height={size.height}
      viewBox={`0 0 ${size.width} ${size.height}`}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={styles.beam}
    >
      <path d={d} className={styles.beamBase} />
      <path
        d={d}
        pathLength={1}
        className={styles.beamGlow}
        data-reverse={reverse}
        style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      />
      <path
        d={d}
        pathLength={1}
        className={styles.beamPulse}
        data-reverse={reverse}
        style={{ animationDuration: `${duration}s`, animationDelay: `${delay}s` }}
      />
    </svg>
  )
}
