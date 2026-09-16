'use client'

/**
 * The Seatrade Cruise Med draw, on the front page.
 *
 * WHY IT IS HERE. The draw and its referral mechanics already existed at /seatrade/, reachable only
 * by people who had been handed the link at the booth. Everyone who arrives at portlink.app from a
 * post, a signature or a search saw nothing about it. A referral competition that the referred
 * person cannot find is a competition with one hop in it.
 *
 * The entry form itself stays at /seatrade/: it is seven questions that produce a benchmark score,
 * and inlining it here would put a long form in the middle of a landing page and duplicate the one
 * place that owns it. This section explains the draw, shows live standings, and sends people there.
 */
import Link from 'next/link'
import { Trophy, MailCheck, Share2 } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import Leaderboard from '@/components/seatrade/Leaderboard'
import { DRAW, EVENT, FUNNEL_PATH, PRIZE_NAME, REFERRAL_CAP, TERMS_PATH } from '@/lib/seatrade/config'

const steps = [
  {
    icon: Trophy,
    title: 'Score your port calls',
    body: 'Seven questions about how your port calls actually run. You get your own score and see how it compares with the rest of the show.',
  },
  {
    icon: MailCheck,
    title: 'Confirm your work email',
    body: 'One click in the email we send. That confirmation is what puts you in the draw, and it is why the board only holds real people in the industry.',
  },
  {
    icon: Share2,
    title: 'Invite colleagues',
    body: `Every colleague who confirms through your link adds an entry, up to ${REFERRAL_CAP}. Your link and your running total live on your own page.`,
  },
]

export default function DrawSection() {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="draw"
      className="section-pad"
      style={{ background: 'var(--surface-alt, var(--bg))', padding: '120px 24px' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center' }}>
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
            {EVENT.name}
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
            Score your port calls, invite the industry, win {PRIZE_NAME}.
          </h2>

          <p
            className="reveal"
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              maxWidth: '640px',
              margin: '0 auto 48px',
              lineHeight: 1.6,
            }}
          >
            Entries close {DRAW.closesLabel} and the draw is on {DRAW.drawLabel}. It is open to people
            working in cruise port calls, which is what the work email confirms.
          </p>
        </div>

        <div
          className="pilot-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '48px',
          }}
        >
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="reveal"
                style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '32px 26px',
                  textAlign: 'left',
                }}
              >
                <Icon size={20} style={{ color: 'var(--brand)', marginBottom: '14px' }} aria-hidden="true" />
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 }}>
                  {step.body}
                </p>
              </div>
            )
          })}
        </div>

        <div
          className="reveal"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '16px',
            padding: '32px 28px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px' }}>
            Standings
          </h3>
          <Leaderboard limit={10} />
        </div>

        <div className="reveal" style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link
            href={FUNNEL_PATH}
            style={{
              display: 'inline-block',
              background: 'var(--brand)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '16px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '10px',
            }}
          >
            Score your port calls
          </Link>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '14px' }}>
            Takes about two minutes. <Link href={TERMS_PATH} style={{ color: 'var(--text-muted)' }}>Draw terms</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
