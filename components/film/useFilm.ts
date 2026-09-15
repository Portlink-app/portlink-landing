'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * True once the visitor has asked for reduced motion.
 *
 * Deliberately false during SSR and the first client render. Nothing in this
 * file starts playback on its own: no `autoPlay` attribute is ever set, and
 * play() is only ever called from an effect that reads this value. So the
 * pre-hydration frame cannot play a video it should not.
 */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return reduced
}

/**
 * Plays the element only while it is actually on screen.
 *
 * This also does the desktop/phone selection for free: the two encodes are
 * rendered as a CSS-hidden pair, and a `display: none` element never reports
 * an intersection — so the encode the visitor cannot see never decodes.
 */
export function useInViewPlayback(active: boolean) {
  const ref = useRef<HTMLVideoElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (active && inView) {
      const p = el.play()
      // A rejected play() is a browser policy decision, not an error worth
      // throwing: the poster stays, which is an acceptable resting state.
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } else {
      el.pause()
    }
  }, [active, inView])

  return ref
}
