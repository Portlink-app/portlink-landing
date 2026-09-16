'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RefObject } from 'react'

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
 * True when the viewport is at or below the phone breakpoint.
 *
 * 767px is `.scene-wide` / `.scene-narrow` in globals.css, character for character. It is written
 * twice because a media query cannot be read from CSS and a <video> cannot choose its own source:
 * the `media` attribute on <source> works inside <picture> and does nothing inside <video>, which
 * is why the still is declarative and the film is not.
 *
 * Client-only, and that costs nothing here. This decides which mp4 to fetch, and by the time any
 * mp4 is fetched the browser has already answered the reduced-motion question, so the still is
 * on screen either way. Defaulting to false before the answer arrives is therefore not a desktop
 * bias: nothing is rendered from it until useMotionAllowed has also turned true.
 */
export function useNarrow(): boolean {
  const [narrow, setNarrow] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => setNarrow(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  return narrow
}

/**
 * Plays the element only while it is actually on screen.
 *
 * The element arrives by callback ref rather than useRef, because it does not
 * exist on the first render: the still is rendered until motion is known to be
 * welcome, so an effect that reads a ref once on mount would find null and never
 * observe anything. Measured on preview 2 — the hero cross-faded correctly and
 * both stages stayed paused at currentTime 0.
 *
 * This also does the desktop/phone selection for free: the two encodes are
 * rendered as a CSS-hidden pair, and a `display: none` element never reports
 * an intersection — so the encode the visitor cannot see never decodes.
 */
export function useInViewPlayback(active: boolean) {
  const [el, setEl] = useState<HTMLVideoElement | null>(null)
  const ref = useCallback((node: HTMLVideoElement | null) => setEl(node), [])
  const [inView, setInView] = useState(false)

  useEffect(() => {
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [el])

  useEffect(() => {
    if (!el) return

    if (active && inView) {
      const p = el.play()
      // A rejected play() is a browser policy decision, not an error worth
      // throwing: the poster stays, which is an acceptable resting state.
      if (p && typeof p.catch === 'function') p.catch(() => {})
    } else {
      el.pause()
    }
  }, [el, active, inView])

  return ref
}

/**
 * Which stage the reader is on, from their scroll position inside the track.
 *
 * The track is taller than the viewport and the pane inside it is sticky, so
 * while the pane is pinned the scroll has nowhere to go but through the film.
 * Progress is that travel, 0 to 1, cut into one band per stage.
 *
 * Hysteresis, so a reader resting exactly on a boundary does not sit in a
 * cross-fade that keeps re-triggering: advancing happens at the band edge,
 * retreating only after falling back through it.
 *
 * `active` is false for a reduced-motion visitor, who has no track to read —
 * the media query removes the pin, every stage is on screen at once, and a
 * scroll listener would be measuring a layout that is not there.
 */
export function useTrackStage(
  trackRef: RefObject<HTMLElement | null>,
  paneRef: RefObject<HTMLElement | null>,
  stageCount: number,
  active: boolean,
): number {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    if (!active) return

    const HYSTERESIS = 0.06
    let frame = 0

    const read = () => {
      frame = 0
      const track = trackRef.current
      const pane = paneRef.current
      if (!track || !pane) return

      const travel = track.offsetHeight - pane.offsetHeight
      if (travel <= 0) return

      const trackTop = track.getBoundingClientRect().top + window.scrollY
      const progress = Math.min(1, Math.max(0, (window.scrollY - trackTop) / travel))
      const band = 1 / stageCount

      setStage((current) => {
        let next = current
        while (next < stageCount - 1 && progress >= (next + 1) * band) next++
        while (next > 0 && progress < next * band - HYSTERESIS) next--
        return next
      })
    }

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(read)
    }

    read()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [trackRef, paneRef, stageCount, active])

  // Derived, not reset in an effect: without a track there is no stage to be
  // on, and a stale index left over from a preference change would be a lie.
  return active ? stage : 0
}
