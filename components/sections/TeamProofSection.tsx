'use client'

import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'
import { everyone } from './team-members'
import styles from './TeamProofSection.module.css'

export default function TeamProofSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="team-proof"
      style={{ background: 'var(--ds-canvas)', padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ marginBottom: 'clamp(28px, 4vw, 44px)' }}>
          <h2
            className="reveal"
            style={{
              marginTop: 0,
              fontSize: 'clamp(26px, 3.4vw, 42px)',
              lineHeight: 1.04,
              letterSpacing: '-0.03em',
              fontWeight: 700,
              color: 'var(--ds-text-1)',
            }}
          >
            Built by people who run calls.
          </h2>
        </div>

        <ul className={`${styles.grid} reveal`}>
          {everyone.map((m) => (
            <li key={m.name} className={styles.person}>
              <img
                src={m.photo}
                alt=""
                width={132}
                height={132}
                loading="lazy"
                decoding="async"
                className={styles.photo}
              />
              <div className={styles.bio}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--ds-text-1)' }}>{m.name}</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ds-accent-strong)', marginTop: '3px' }}>
                  {m.role}
                </div>
                <p
                  style={{
                    margin: '9px auto 0',
                    maxWidth: '240px',
                    fontSize: '14.5px',
                    lineHeight: 1.55,
                    color: 'var(--ds-text-2)',
                  }}
                >
                  {m.short}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <div id="mission" style={{ maxWidth: '720px', margin: 'clamp(28px, 4vw, 40px) 0 0' }}>
          <p
            className="reveal"
            style={{
              margin: '0 0 16px',
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'var(--ds-text-2)',
            }}
          >
            <strong style={{ color: 'var(--ds-text-1)' }}>Our mission &amp; ethos:</strong> give every organisation in a port call and shore operation one shared, accountable record, where software prepares the facts and operators own every commitment.
          </p>
          <Link
            href="/team/#mission"
            className="reveal"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              minHeight: 44,
              fontSize: '16px',
              fontWeight: 600,
              color: 'var(--ds-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '4px',
            }}
          >
            Read more about the team and our ethos
          </Link>
        </div>
      </div>
    </section>
  )
}
