'use client'

/** Introduces the explorer as a work sample. Its data is illustrative, not a live customer feed. */

import { useReveal } from '@/hooks/useReveal'

export default function BuiltSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="built"
      style={{
        background: 'var(--ds-canvas)',
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px) clamp(24px, 4vw, 40px)',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <span className="reveal section-eyebrow" style={{ display: 'inline-block' }}>
          What we built
        </span>
        <h2
          className="reveal"
          style={{
            fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
            fontWeight: 700,
            color: 'var(--ds-text-1)',
            letterSpacing: '-0.02em',
            lineHeight: 1.18,
            margin: '10px 0 0',
          }}
        >
          One platform. The whole operation.
        </h2>
        <p
          className="reveal"
          style={{
            fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
            color: 'var(--ds-text-2)',
            lineHeight: 1.6,
            margin: '12px 0 0',
          }}
        >
          Explore the interfaces we designed and built for Portlink, from the first port call to the
          final account. These previews use illustrative data. The attention to the work behind
          them is what we bring to everything we build.
        </p>
      </div>
    </section>
  )
}
