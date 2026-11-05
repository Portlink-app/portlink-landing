'use client'
/**
 * A muted, looping product recording for the clone pages. A visitor who asked for reduced motion,
 * and the server, get the poster as a plain image; the <video> is created only once the browser has
 * said motion is fine (components/film/useFilm.ts, gate scripts/check-film-motion.mjs).
 * `src` and `phoneSrc` are paths WITHOUT the .mp4 extension, added here: a film path passed as a prop
 * from a server component would be serialized into the prerendered HTML, which that gate refuses.
 */
import { useMotionAllowed, useNarrow } from '@/components/film/useFilm'

export default function Film({ src, phoneSrc, poster, className = 'size-full object-cover', alt = '', eager = false }: {
  src: string
  phoneSrc?: string
  poster: string
  className?: string
  alt?: string
  /** The first screen's film: its poster loads at once instead of lazily. */
  eager?: boolean
}) {
  const motionAllowed = useMotionAllowed()
  const narrow = useNarrow()
  if (!motionAllowed) {
    return <img className={className} src={poster} alt={alt} loading={eager ? 'eager' : 'lazy'} />
  }
  return <video key={src} className={className} src={`${narrow && phoneSrc ? phoneSrc : src}.mp4`} poster={poster} autoPlay muted loop playsInline />
}
