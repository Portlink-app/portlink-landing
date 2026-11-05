'use client'
/**
 * Mounts Embark's product film into the server-rendered poster slot `[data-embark-film]` (written by
 * scripts/clone/port-embark-26.mjs), only for visitors who have not asked for reduced motion
 * (check-film-motion). products.js scrubs it with the scroll once it hears `embark-film`.
 */
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useMotionAllowed } from '@/components/film/useFilm'

const M = '/clone/butter/media'

export default function EmbarkFilm() {
  const motionAllowed = useMotionAllowed()
  const ref = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (ref.current) dispatchEvent(new CustomEvent('embark-film', { detail: ref.current }))
  }, [motionAllowed])
  if (!motionAllowed) {
    return null
  }
  // Read only on the client: motionAllowed starts false on the server and in the hydration render.
  const host = document.querySelector<HTMLElement>('[data-embark-film]')
  if (!host) return null
  return createPortal(
    <video
      ref={ref}
      playsInline
      muted
      controls
      preload="metadata"
      poster={`${M}/embark-tour.jpg?v=5fc4b539d587e1ba`}
      data-portrait-poster={`${M}/embark-tour-portrait.jpg?v=1ad9058c51deb87e`}
      aria-label="Embark sample-data product tour"
    >
      <source media="(max-width: 700px)" src={`${M}/embark-tour-portrait.mp4?v=460e0fdfe0c96dd7`} type="video/mp4" />
      <source src={`${M}/embark-tour.mp4?v=565be70f59a725e2`} type="video/mp4" />
    </video>,
    host,
  )
}
