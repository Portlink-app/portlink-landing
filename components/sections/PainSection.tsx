'use client'

import { useReveal } from '@/hooks/useReveal'

const painCards = [
  {
    title: "It's buried in email",
    body: 'The confirmation you need is somewhere in a thread from three weeks ago. Between three cruise lines, six agents, and a time zone gap.',
  },
  {
    title: 'Final_v3_REAL.xlsx is the source of truth',
    body: 'Multiple people are editing different versions. Nobody knows which is current until someone finds the error.',
  },
  {
    title: 'Last-minute changes by phone',
    body: "No paper trail, no confirmation, no accountability. The change happened, but nobody can prove what was agreed.",
  },
  {
    title: 'Waiting hours for a yes or no',
    body: 'Confirmation that should take five minutes takes a day when your agent is in Genoa and your operations team is in Miami.',
  },
  {
    title: "Nobody sees what everyone else is doing",
    body: "The ship operator doesn't see port prep. The agent doesn't see schedule changes. The tour operator books capacity nobody told them was cancelled.",
  },
  {
    title: 'Mistakes found at the quay',
    body: 'Wrong passenger count for the helicopter. Wrong departure time on the briefing sheet. Right there, in front of the guests.',
  },
]

export default function PainSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="pain"
      /* The scenes' rhythm, character for character. `section-pad` is gone with it: that class is a
         `!important` override at 768 px and below, so it and a clamp cannot both be in charge. */
      style={{
        background: 'var(--surface)',
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 48px)' }}>
          <span
            className="reveal"
            style={{
              display: 'inline-block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            The current state
          </span>
          {/* The scene type scale. At clamp(2rem, 4vw, 3rem) this preamble was set at 48 px while
              the seven screens it introduces are headed at 36 px, so the setup shouted over the
              evidence. Same scale as SceneSection now, character for character. */}
          <h2
            className="reveal"
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              margin: '12px 0 16px',
            }}
          >
            Nobody designed it this way. It just ended up like this.
          </h2>
        </div>

        <div
          className="pain-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {painCards.map((card) => (
            <div
              key={card.title}
              className="reveal"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '28px 24px',
                transition: 'border-color var(--ds-dur-3) var(--ds-ease-standard)',
                cursor: 'default',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--text-muted)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)'
              }}
            >
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                {card.title}
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
