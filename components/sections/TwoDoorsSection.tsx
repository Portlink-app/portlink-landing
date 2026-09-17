'use client'

/**
 * Two ways to work with us, given equal weight, replacing the old single pilot funnel.
 *
 * WHY IT REPLACES `PilotSection`. That section assumed the only thing a reader could want was the
 * pilot, so the page had one door and everyone who wanted something built bounced off it. The
 * company claim in the hero is only true if the page actually offers the second door, and offers it
 * at the same size.
 *
 * ⛔ IT KEEPS `id="pilot"`. The homepage nav, the footer and `PageNav` all link to `#pilot`, and a
 * link that lands nowhere is worse than a section with a slightly stale id. `scripts/check-anchors.mjs`
 * fails the build if it disappears.
 *
 * THE THREE PILOT TERMS RENDER HERE, AND ONLY HERE. They used to render TWICE on one page, as cards
 * in `PilotSection` and again as cards in `AccessSection`, with the titles identical and two of the
 * three bodies subtly different from each other, which is the shape of copy nobody owns. They are
 * one list now, inside door A, and `AccessSection` carries none.
 *
 * Chose: two symmetric cards, with door A carrying a compact three-item list and door B carrying
 *   its paragraph alone, both stretched to one height with the call to action pinned to the bottom.
 * Over: three full perk cards inside door A, which is the literal reading of the brief.
 * Because: three cards inside one door makes that door roughly twice the height of the other, and
 *   "equal visual weight" is the constraint the brief states in the same sentence. Equal width,
 *   equal card treatment, equal heading scale, equal height and an aligned call to action carry
 *   that; an asymmetric body length is honest, because the pilot has published terms and a bespoke
 *   build has none yet.
 * Revisit-if: door B gains terms of its own, at which point both sides take a list.
 */

import { CheckCircle2 } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

/** The pilot's terms. One copy, on one page, in one place. */
const pilotTerms = [
  {
    title: 'Shape what gets built',
    body: 'Pilot participants work directly with our team. Your operational reality drives the roadmap, not a feature backlog written by people who have never done a port call.',
  },
  {
    title: 'Founding pricing, permanent',
    body: 'Pilot participants lock in pricing that will not be available at public launch. No promotional asterisk.',
  },
  {
    title: 'Onboarding that actually works',
    body: 'We set you up, migrate your existing data, and stay until your team is running. Not a help article.',
  },
]

const cardStyle: React.CSSProperties = {
  background: 'var(--ds-surface-1)',
  border: '1px solid var(--ds-border-1)',
  borderRadius: 'var(--ds-radius-lg)',
  padding: 'clamp(24px, 3vw, 32px)',
  display: 'flex',
  flexDirection: 'column',
  gap: 14,
}

const doorHeading: React.CSSProperties = {
  fontSize: 'clamp(1.125rem, 2vw, 1.375rem)',
  fontWeight: 700,
  color: 'var(--ds-text-1)',
  letterSpacing: '-0.015em',
  margin: 0,
}

const doorBody: React.CSSProperties = {
  fontSize: 'clamp(0.9375rem, 1.3vw, 1rem)',
  color: 'var(--ds-text-2)',
  lineHeight: 1.6,
  margin: 0,
}

/** Pinned to the bottom of its card by the auto margin, so the two doors line up. */
const ctaStyle: React.CSSProperties = {
  marginTop: 'auto',
  alignSelf: 'flex-start',
  background: 'var(--ds-primary)',
  color: 'var(--ds-primary-ink)',
  padding: '12px 26px',
  borderRadius: 'var(--ds-radius-pill)',
  fontWeight: 600,
  fontSize: 15,
  textDecoration: 'none',
}

export default function TwoDoorsSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="pilot"
      style={{
        background: 'var(--ds-surface-2)',
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ maxWidth: 680, marginBottom: 'clamp(24px, 4vw, 40px)' }}>
          <span className="reveal section-eyebrow" style={{ display: 'inline-block' }}>
            Working with us
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
            Two ways to work with us
          </h2>
        </div>

        <div className="two-doors-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(14px, 2vw, 24px)', alignItems: 'stretch' }}>
          {/* Door A: the product */}
          <div className="reveal" style={cardStyle}>
            <h3 style={doorHeading}>Use Portlink.</h3>
            <p style={doorBody}>
              The platform is in pilot with a small number of operators. Founding pricing that we do
              not withdraw later, onboarding we do ourselves including your existing data, and direct
              influence on what gets built next.
            </p>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 12 }}>
              {pilotTerms.map((term) => (
                <li key={term.title} style={{ display: 'flex', gap: 10 }}>
                  <CheckCircle2
                    size={16}
                    color="var(--ds-primary)"
                    style={{ flexShrink: 0, marginTop: 3 }}
                    aria-hidden="true"
                  />
                  <span>
                    <span style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--ds-text-1)' }}>
                      {term.title}
                    </span>
                    <span style={{ fontSize: 13.5, color: 'var(--ds-text-2)', lineHeight: 1.55 }}>
                      {term.body}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <a
              href="#access"
              style={ctaStyle}
            >
              Request pilot access
            </a>
          </div>

          {/* Door B: the company */}
          <div className="reveal" style={cardStyle}>
            <h3 style={doorHeading}>Have us build it.</h3>
            <p style={doorBody}>
              Tell us what your operation actually needs. If we can build it, we say how and roughly
              when. If we cannot, we say that in the first reply.
            </p>
            <a href="/contact/" style={ctaStyle}>
              Tell us what you need
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
