import Link from 'next/link'
import SeatradeShell from '@/components/seatrade/Shell'

export const metadata = { title: 'Unsubscribed · Portlink', robots: { index: false } }

export default function UnsubscribedPage() {
  return (
    <SeatradeShell>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-8) var(--ds-gap-6)', textAlign: 'center' }}>
        <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 700, margin: '0 0 10px', lineHeight: 1.15 }}>You are unsubscribed.</h1>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--ds-gap-5)', fontSize: 'var(--ds-text-body)' }}>
          The newsletter and any scheduled follow-ups have stopped. Your scorecard stays in your inbox, your entry in the draw stays, and your answers stay anonymous in the benchmark.
        </p>
        <Link href="/" style={{ display: 'inline-block', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', padding: '12px 24px', borderRadius: 'var(--ds-radius-pill)', fontWeight: 600, textDecoration: 'none', fontSize: 'var(--ds-text-sm)' }}>Back to portlink.app</Link>
      </div>
    </SeatradeShell>
  )
}
