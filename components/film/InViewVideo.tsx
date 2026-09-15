'use client'

import { usePrefersReducedMotion, useInViewPlayback } from './useFilm'

/**
 * One clip of the product, played only while on screen. Under reduced motion
 * the element is an image: there is no media element to start, so "starts no
 * playback" is true by construction rather than by a paused flag.
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
  const reduced = usePrefersReducedMotion()
  const ref = useInViewPlayback(!reduced)

  const frame: React.CSSProperties = {
    width: '100%',
    aspectRatio: aspect,
    display: 'block',
    objectFit: 'cover',
    background: 'var(--ds-surface-2)',
  }

  if (reduced) {
    return <img src={poster} alt={label} style={frame} />
  }

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      style={frame}
    />
  )
}
