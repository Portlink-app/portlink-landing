'use client'

/**
 * The hero: one short film of the real product, in two stages.
 *
 * Stage one builds a voyage; stage two is the chart and the passage plan. The
 * current stage loops, and scrolling moves to the next one through a cross-fade
 * with a scale settle — not a hard cut, and not frame scrubbing, which was
 * measured at 6,5 MB for the first segment against 606 036 byte for the same
 * footage played normally.
 *
 * Desktop and phone are separate encodes rendered as a CSS-hidden pair. The
 * phone encode is a 2× zoom into the working region: on a phone the film is
 * atmosphere, and the seven scenes below it carry the information.
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useMotionAllowed, useInViewPlayback } from './useFilm'

type Stage = {
  label: string
  caption: string
  desktop: string
  desktopPoster: string
  mobile: string
  mobilePoster: string
}

const stages: Stage[] = [
  {
    label: 'Building the voyage',
    caption: 'Ports go in, and the distances, times and route come out.',
    desktop: '/video/landing-2026-09-15/hero-A.mp4',
    desktopPoster: '/video/landing-2026-09-15/hero-A.jpg',
    mobile: '/video/landing-2026-09-15/m-A.mp4',
    mobilePoster: '/video/landing-2026-09-15/m-A.jpg',
  },
  {
    label: 'The passage plan',
    caption: 'The same voyage on the chart, routed through charted water.',
    desktop: '/video/landing-2026-09-15/hero-B.mp4',
    desktopPoster: '/video/landing-2026-09-15/hero-B.jpg',
    mobile: '/video/landing-2026-09-15/m-B.mp4',
    mobilePoster: '/video/landing-2026-09-15/m-B.jpg',
  },
]

/** One stage's video, stacked and cross-faded against its sibling. */
function StageVideo({
  src,
  poster,
  label,
  visible,
  motionAllowed,
}: {
  src: string
  poster: string
  label: string
  visible: boolean
  motionAllowed: boolean
}) {
  const ref = useInViewPlayback(visible && motionAllowed)

  const layer: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: visible ? 1 : 0,
    transform: visible ? 'scale(1)' : 'scale(1.015)',
    transition: 'opacity 700ms var(--ds-ease-standard), transform 900ms var(--ds-ease-standard)',
    willChange: 'opacity, transform',
  }

  if (!motionAllowed) {
    return <img src={poster} alt={label} style={{ ...layer, transition: 'opacity 200ms linear', transform: 'none' }} />
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
      style={layer}
    />
  )
}

function StageStack({ variant, stage, motionAllowed }: { variant: 'desktop' | 'mobile'; stage: number; motionAllowed: boolean }) {
  return (
    <div className="film-frame">
      {stages.map((s, i) => (
        <StageVideo
          key={s.label}
          src={variant === 'desktop' ? s.desktop : s.mobile}
          poster={variant === 'desktop' ? s.desktopPoster : s.mobilePoster}
          label={`Portlink — ${s.label}`}
          visible={i === stage}
          motionAllowed={motionAllowed}
        />
      ))}
    </div>
  )
}

export default function FilmHero() {
  const [stage, setStage] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const motionAllowed = useMotionAllowed()

  // Scroll advances the film. Hysteresis, so a reader resting on the boundary
  // does not sit in a cross-fade that keeps re-triggering.
  useEffect(() => {
    let frame = 0
    const read = () => {
      frame = 0
      const el = sectionRef.current
      if (!el) return
      const height = el.offsetHeight || window.innerHeight
      const progress = window.scrollY / height
      setStage((current) => {
        if (current === 0 && progress > 0.38) return 1
        if (current === 1 && progress < 0.26) return 0
        return current
      })
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(read)
    }
    read()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      id="hero"
      style={{
        position: 'relative',
        paddingTop: 'clamp(96px, 14vh, 150px)',
        paddingBottom: 'clamp(48px, 8vh, 88px)',
        paddingLeft: 'clamp(16px, 4vw, 24px)',
        paddingRight: 'clamp(16px, 4vw, 24px)',
        overflow: 'hidden',
        background:
          'radial-gradient(120% 90% at 50% -10%, var(--ds-primary-faint) 0%, transparent 60%), var(--ds-canvas)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: 820, margin: '0 auto clamp(28px, 5vw, 44px)' }}
        >
          <span
            style={{
              display: 'inline-block',
              background: 'var(--ds-surface-1)',
              color: 'var(--ds-text-2)',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              borderRadius: 'var(--ds-radius-pill)',
              padding: '4px 14px',
              fontWeight: 600,
              border: '1px solid var(--ds-border-1)',
            }}
          >
            Port call coordination
          </span>

          <h1
            style={{
              fontSize: 'clamp(2.25rem, 5.6vw, 4.25rem)',
              fontWeight: 700,
              color: 'var(--ds-text-1)',
              lineHeight: 1.06,
              letterSpacing: '-0.03em',
              margin: '20px 0 0',
            }}
          >
            Port calls run on emails, spreadsheets, and phone calls. They shouldn&rsquo;t have to.
          </h1>

          <p
            style={{
              fontSize: 'clamp(1rem, 1.6vw, 1.1875rem)',
              color: 'var(--ds-text-2)',
              lineHeight: 1.6,
              maxWidth: 620,
              margin: '18px auto 0',
            }}
          >
            Portlink connects cruise lines, port agents, and tour operators on a single port call record.
            Everyone sees the same status. Nobody re-enters the same data.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 26 }}>
            <a
              href="#access"
              style={{
                background: 'var(--ds-primary)',
                color: 'var(--ds-primary-ink)',
                padding: '12px 28px',
                borderRadius: 'var(--ds-radius-pill)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
              }}
            >
              Request Pilot Access
            </a>
            <a
              href="#calls"
              style={{
                border: '1px solid var(--ds-border-2)',
                color: 'var(--ds-text-1)',
                padding: '12px 28px',
                borderRadius: 'var(--ds-radius-pill)',
                fontWeight: 600,
                fontSize: 15,
                textDecoration: 'none',
                background: 'transparent',
              }}
            >
              See the platform
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="scene-wide">
            <StageStack variant="desktop" stage={stage} motionAllowed={motionAllowed} />
          </div>
          <div className="scene-narrow">
            <StageStack variant="mobile" stage={stage} motionAllowed={motionAllowed} />
          </div>

          {/* Stage marker — says the film has two acts and that scrolling advances it. */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 14,
              marginTop: 18,
              flexWrap: 'wrap',
            }}
          >
            {stages.map((s, i) => (
              <span key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: i === stage ? 22 : 7,
                    height: 7,
                    borderRadius: 'var(--ds-radius-pill)',
                    background: i === stage ? 'var(--ds-primary)' : 'var(--ds-border-2)',
                    transition: 'width 400ms var(--ds-ease-standard), background 400ms var(--ds-ease-standard)',
                    display: 'inline-block',
                  }}
                />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: i === stage ? 600 : 500,
                    color: i === stage ? 'var(--ds-text-1)' : 'var(--ds-text-3)',
                    transition: 'color 400ms var(--ds-ease-standard)',
                  }}
                >
                  {s.label}
                </span>
              </span>
            ))}
          </div>

          <p
            key={stage}
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--ds-text-3)',
              margin: '8px 0 0',
              minHeight: 20,
            }}
          >
            {stages[stage].caption}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
