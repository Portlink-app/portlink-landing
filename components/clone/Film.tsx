'use client'
/**
 * A muted, looping product recording for the product pages. A visitor who asked for reduced motion,
 * and the server, get the poster as a plain image; the <video> is created only once the browser has
 * said motion is fine (components/film/useFilm.ts, gate scripts/check-film-motion.mjs) and, for
 * below-the-fold stages, once the stage approaches the viewport.
 * `src` and `phoneSrc` are paths WITHOUT the .mp4 extension, added here: a film path passed as a prop
 * from a server component would be serialized into the prerendered HTML, which that gate refuses.
 */
import { useCallback, useEffect, useState } from 'react'
import { useMotionAllowed, useNarrow } from '@/components/film/useFilm'

export default function Film({
  src,
  phoneSrc,
  poster,
  className = 'size-full object-cover',
  alt = '',
  width,
  height,
  eager = false,
}: {
  src: string
  phoneSrc?: string
  poster: string
  className?: string
  alt?: string
  width?: number
  height?: number
  /** The first screen's film: its poster and playback start at once instead of waiting for scroll. */
  eager?: boolean
}) {
  const motionAllowed = useMotionAllowed()
  const narrow = useNarrow()
  const [target, setTarget] = useState<HTMLElement | null>(null)
  const [nearView, setNearView] = useState(eager)
  const [inView, setInView] = useState(eager)
  const attachRef = useCallback((node: HTMLElement | null) => {
    setTarget(node)
  }, [])

  useEffect(() => {
    if (eager || !motionAllowed || nearView || !target) return
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNearView(true)
          preloadObserver.disconnect()
        }
      },
      { rootMargin: '300px 0px' },
    )
    preloadObserver.observe(target)
    return () => preloadObserver.disconnect()
  }, [eager, motionAllowed, nearView, target])

  useEffect(() => {
    if (!motionAllowed || (!eager && !nearView) || !(target instanceof HTMLVideoElement)) return
    const playObserver = new IntersectionObserver(
      ([entry]) => {
        setInView(Boolean(entry?.isIntersecting))
      },
      { threshold: 0.05 },
    )
    playObserver.observe(target)
    return () => playObserver.disconnect()
  }, [eager, motionAllowed, nearView, target])

  useEffect(() => {
    if (!(target instanceof HTMLVideoElement)) return
    if (motionAllowed && inView) {
      target.play()?.catch(() => {})
    } else {
      target.pause()
    }
  }, [inView, motionAllowed, target])

  if (!motionAllowed) {
    return (
      <img
        className={className}
        src={poster}
        alt={alt}
        width={width}
        height={height}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
      />
    )
  }
  if (!eager && !nearView) {
    return (
      <img
        ref={attachRef}
        className={className}
        src={poster}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
      />
    )
  }
  return (
    <video
      ref={attachRef}
      key={src}
      className={className}
      src={`${narrow && phoneSrc ? phoneSrc : src}.mp4`}
      poster={poster}
      width={width}
      height={height}
      autoPlay
      muted
      loop
      playsInline
    />
  )
}
