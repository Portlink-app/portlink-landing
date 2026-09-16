'use client'

import { useReveal } from '@/hooks/useReveal'

const valueCards = [
  {
    title: 'One record per port call',
    body: 'Every stakeholder works from the same live object. No conflicting threads, no version confusion. Full history, always accessible.',
  },
  {
    title: 'Deadlines that hold',
    body: 'Booking cutoffs trigger automatic locks. The ship files a change request. You approve or deny. No more overbookings discovered at embarkation.',
  },
  {
    title: 'Edit approval, not silent drift',
    body: 'When a cruise line updates your tour data, you get a notification and sign-off. Not a silent override you discover months later.',
  },
  {
    title: 'Role-based access',
    body: 'The expedition guide sees the day programme. The itinerary planner sees the full booking chain. Finance sees the PDA trail. Everyone sees what they need.',
  },
  {
    title: 'Mobile access anywhere',
    body: 'The quay, the bridge, the office. Whatever you\'re doing when something changes.',
  },
]

export default function ValueSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="how"
      className="section-pad"
      style={{
        background: 'var(--bg)',
        padding: '120px 24px',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
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
            What changes
          </span>
          <h2
            className="reveal"
            style={{
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '12px 0 16px',
            }}
          >
            The same team, the same ship, the same port, but next season you don&rsquo;t start from scratch.
          </h2>
        </div>

        <div
          className="value-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
          }}
        >
          {valueCards.map((card) => (
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
