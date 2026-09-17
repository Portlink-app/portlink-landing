'use client'

/**
 * The hinge: it converts the seven scenes below from a sales pitch into a work sample.
 *
 * Nothing about those scenes changes. Their JOB changes. Before this paragraph they read as "buy
 * this"; after it they read as "this is the standard of work that leaves this building", which is
 * the argument a software company makes and a single-product site does not. That is the whole
 * reason the section exists, and it is why it sits immediately before S1 rather than anywhere that
 * would read better in isolation.
 *
 * ⛔ IT CLAIMS ONLY WHAT THE PAGE BELOW IT DEMONSTRATES. "Rebuilt as markup" is checkable by anyone
 * with a browser inspector, and it is true: `components/scenes/` is markup, authored twice per
 * scene, wide and narrow. Do not add a figure, a customer, an uptime number or a certification
 * here. The credibility of every scene under it rests on this paragraph being verifiable.
 */

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
          Seven surfaces we designed, built and shipped ourselves
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
          What follows is the platform, not a mockup of it. Every screen below is the real interface,
          rebuilt as markup for this page so it stays readable on a phone instead of being a
          screenshot you pinch at. It is also the standard we hold anything we build for you to.
        </p>
      </div>
    </section>
  )
}
