'use client'

/**
 * The proof strip: who is actually building this, one line each, just before the page asks.
 *
 * It is the replacement for the press-logo row a funded consumer app would put here (Flighty's is
 * the reference). We have no press logos and inventing social proof is worse than having none, so
 * the proof on offer is the only kind that is true: the people, and what they did before this. It
 * sits directly above the access form because that is where a reader decides whether to hand over
 * an email address, and "who are these people" is the question they are asking at that moment.
 *
 * ⛔ IT PRINTS NO FIGURE THAT IS NOT ALREADY ON /team. Both numbers here, sixteen years and a
 * decade, come from the people's own CVs through `team-members.ts`, which is the single source the
 * full team page also renders. A strip with its own copy of the facts is a strip that will
 * eventually disagree with the page it links to.
 */

import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import { everyone } from './team-members'

export default function TeamProofSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="team-proof"
      className="section-pad"
      style={{ background: 'var(--ds-canvas)', padding: 'clamp(64px, 9vw, 104px) 24px' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <span
            className="reveal"
            style={{
              display: 'inline-block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--ds-text-3)',
              fontWeight: 600,
            }}
          >
            Who is building it
          </span>
          <h2
            className="reveal"
            style={{
              marginTop: '14px',
              fontSize: 'clamp(1.5rem, 3.2vw, 2.125rem)',
              lineHeight: 1.15,
              letterSpacing: '-0.02em',
              color: 'var(--ds-text-1)',
            }}
          >
            People who have run port calls, and people who have run a logistics business
          </h2>
        </div>

        <ul
          className="team-proof-grid reveal"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 'clamp(24px, 3vw, 36px)',
          }}
        >
          {everyone.map((m) => (
            <li key={m.name} style={{ textAlign: 'center' }}>
              <img
                src={m.photo}
                alt=""
                width={132}
                height={132}
                loading="lazy"
                decoding="async"
                style={{
                  width: '66px',
                  height: '66px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  border: '1px solid var(--ds-border-1)',
                  background: 'var(--ds-surface-3)',
                  display: 'block',
                  margin: '0 auto 14px',
                }}
              />
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ds-text-1)' }}>{m.name}</div>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--ds-accent-strong)', marginTop: '3px' }}>
                {m.role}
              </div>
              <p
                style={{
                  margin: '9px auto 0',
                  maxWidth: '230px',
                  fontSize: '13px',
                  lineHeight: 1.55,
                  color: 'var(--ds-text-3)',
                }}
              >
                {m.short}
              </p>
            </li>
          ))}
        </ul>

        <div style={{ textAlign: 'center', marginTop: 'clamp(28px, 4vw, 40px)' }}>
          <Link
            href="/team"
            className="reveal"
            style={{
              display: 'inline-block',
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--ds-primary)',
              textDecoration: 'none',
              borderBottom: '1px solid var(--ds-border-2)',
              paddingBottom: '2px',
            }}
          >
            Read more about the team
          </Link>
        </div>
      </div>
    </section>
  )
}
