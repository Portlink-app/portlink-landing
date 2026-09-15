'use client'

import { Rocket, DollarSign, Users } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

const pilotCards = [
  {
    icon: Rocket,
    title: 'Shape what gets built',
    body: "Pilot participants work directly with our team. Your operational reality drives the roadmap, not a feature backlog written by people who've never done a port call.",
  },
  {
    icon: DollarSign,
    title: 'Founding pricing, permanent',
    body: 'Pilot participants lock in pricing that will not be available at public launch. No promotional asterisk.',
  },
  {
    icon: Users,
    title: 'Onboarding that actually works',
    body: 'We set you up, migrate your existing data, and stay until your team is running. Not a help article.',
  },
]

const pilotHeadline = "We're running a pilot programme with a small number of operators."
const pilotDesc =
  'The first group of operators will shape what Portlink becomes. Your operational reality drives the roadmap.'

export default function PilotSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="pilot"
      className="section-pad"
      style={{ background: 'var(--bg)', padding: '120px 24px' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
        <span
          className="reveal"
          style={{
            display: 'inline-block',
            background: 'var(--ds-primary-faint)',
            border: '1px solid var(--ds-border-1)',
            color: 'var(--text-muted)',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            borderRadius: '9999px',
            padding: '4px 14px',
            fontWeight: 500,
            marginBottom: '20px',
          }}
        >
          Early access
        </span>

        <h2
          className="reveal"
          style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}
        >
          {pilotHeadline}
        </h2>

        <p
          className="reveal"
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            maxWidth: '600px',
            margin: '0 auto 48px',
            lineHeight: 1.6,
          }}
        >
          {pilotDesc}
        </p>

        <div
          className="pilot-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          {pilotCards.map((card) => {
            const Icon = card.icon
            return (
              <div
                key={card.title}
                className="reveal"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '36px 28px',
                  textAlign: 'left',
                  transition: 'border-color var(--ds-dur-3) var(--ds-ease-standard)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--text-muted)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                }}
              >
                <Icon size={32} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{card.body}</p>
              </div>
            )
          })}
        </div>

        <a
          href="#access"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById('access')?.scrollIntoView({ behavior: 'smooth' })
          }}
          className="reveal"
          style={{
            display: 'inline-block',
            background: 'var(--brand)',
            color: 'var(--ds-primary-ink)',
            padding: '16px 40px',
            borderRadius: '9999px',
            fontWeight: 600,
            fontSize: '16px',
            textDecoration: 'none',
            transition: 'background var(--ds-dur-2) var(--ds-ease-standard)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-bright)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--brand)')}
        >
          Request Pilot Access
        </a>
      </div>
    </section>
  )
}
