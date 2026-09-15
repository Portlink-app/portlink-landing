'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * True only once the browser has been asked and has answered that motion is welcome.
 *
 * False during SSR and the first client render, and false is the *still* branch —
 * so the markup the server sends carries a poster image, never a <video>. That
 * ordering is the whole point. A <video preload="metadata"> in the server HTML is
 * fetched by the browser before React can replace it, so a visitor who had asked
 * for reduced motion still paid 776 217 byte of film across six encodes (measured
 * on deploy preview 2, 15.09.2026, Chrome --force-prefers-reduced-motion).
 *
 * Rendering the still first costs the motion visitor nothing: the poster is the
 * same file the <video> would have shown while it buffered.
 */
export function useMotionAllowed(): boolean {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setAllowed(!mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return allowed
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
