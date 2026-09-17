'use client'

/**
 * The pilot request, at the bottom of the homepage. One mount of the shared contact form.
 *
 * ⛔ `id="access"` IS LOAD-BEARING OUTSIDE THIS REPOSITORY AND CANNOT BE RENAMED. `lib/seatrade/config.ts`
 * builds `PILOT_URL` as `${SITE_URL}/#access`, and that link is in Seatrade mail already delivered
 * to real inboxes. Those messages cannot be edited. The homepage nav, the footer and `PageNav` link
 * to it too. Restructure this section freely; the anchor survives, and `scripts/check-anchors.mjs`
 * fails the build if it does not.
 *
 * WHAT CHANGED 17.09.2026. This section used to carry its own three-card copy of the pilot terms,
 * which `PilotSection` also rendered on the same page, with identical titles and two of three
 * bodies subtly different. The terms now live once, in `TwoDoorsSection`. And the wizard that used
 * to be implemented here is `components/contact/ContactForm.tsx`, mounted with the intent already
 * answered, so `/contact/` and this section can never ask different questions or validate an
 * address two different ways.
 */

import { useReveal } from '@/hooks/useReveal'
import ContactForm from '@/components/contact/ContactForm'

export default function AccessSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="access"
      style={{
        background: 'var(--ds-canvas)',
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <span className="reveal section-eyebrow" style={{ display: 'inline-block' }}>
          Request access
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
          Founding cohort, onboarding now.
        </h2>
        <p
          className="reveal"
          style={{
            fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
            color: 'var(--ds-text-2)',
            lineHeight: 1.6,
            maxWidth: 560,
            margin: '12px auto 0',
          }}
        >
          The first group will shape what Portlink becomes, so we work with a small number of teams
          at a time. Best fit: complex operations, a low tolerance for manual work, and strong
          opinions about what is broken.
        </p>
      </div>

      <div className="reveal" style={{ marginTop: 'clamp(32px, 5vw, 56px)', textAlign: 'left' }}>
        <ContactForm intent="pilot" lockIntent />
      </div>
    </section>
  )
}
