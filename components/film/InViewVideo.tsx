'use client'

import { useMotionAllowed, useInViewPlayback } from './useFilm'

/**
 * One clip of the product, played only while on screen. Until the browser has
 * said motion is welcome — which includes the server render — the element is an
 * image: there is no media element to start and none to fetch, so "starts no
 * playback" and "downloads no film" are both true by construction rather than
 * by a paused flag.
 */
export default function InViewVideo({
  src,
  poster,
  label,
  aspect = '16 / 9',
}: {
  src: string
  poster: string
  label: string
  aspect?: string
}) {
  const motionAllowed = useMotionAllowed()
  const ref = useInViewPlayback(motionAllowed)

  const frame: React.CSSProperties = {
    width: '100%',
    aspectRatio: aspect,
    display: 'block',
    objectFit: 'cover',
    background: 'var(--ds-surface-2)',
  }

  if (!motionAllowed) {
    // Below the fold, single encode, so no <picture> to choose between and every reason to defer:
    // this still is two full sections past the hero.
    return <img src={poster} alt={label} loading="lazy" decoding="async" style={frame} />
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      aria-label={label}
      style={frame}
    />
  )
}
