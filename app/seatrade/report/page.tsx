import SeatradeShell from '@/components/seatrade/Shell'
import { EVENT } from '@/lib/seatrade/config'
import { BANDS, QUESTIONS } from '@/lib/seatrade/scorecard'
import { getStats } from '@/lib/seatrade/store'

/**
 * portlink.app/seatrade/report/ — the live Port Call Friction Benchmark.
 * No names, no companies: counts and shares only. Rendered on every request so a booth screen
 * or a follow-up email always shows the current room. Test leads are excluded upstream.
 */
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Port Call Friction Benchmark · Seatrade Cruise Med 2026',
  description: 'How Seatrade Cruise Med 2026 scores on port call friction. Live, anonymous, updated as people answer.',
}

const BAND_TONE: Record<string, { fg: string; bg: string }> = {
  smooth: { fg: 'var(--ds-success)', bg: 'var(--ds-success-bg)' },
  choppy: { fg: 'var(--ds-warning)', bg: 'var(--ds-warning-bg)' },
  heavy:  { fg: 'var(--ds-danger)',  bg: 'var(--ds-danger-bg)' },
}

function pct(part: number, whole: number): number {
  return whole ? Math.round((part / whole) * 100) : 0
}

function Bar({ label, count, total }: { label: string; count: number; total: number }) {
  const p = pct(count, total)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 44px', gap: 10, alignItems: 'center', marginBottom: 8 }}>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--ds-text-sm)', marginBottom: 4 }}>
          <span style={{ color: 'var(--text-primary)' }}>{label}</span>
          <span style={{ color: 'var(--text-muted)' }}>{count}</span>
        </div>
        <div style={{ height: 8, background: 'var(--border)', borderRadius: 'var(--ds-radius-pill)', overflow: 'hidden' }}>
          <div style={{ width: `${p}%`, height: '100%', background: 'var(--brand)', borderRadius: 'var(--ds-radius-pill)' }} />
        </div>
      </div>
      <span style={{ fontSize: 'var(--ds-text-sm)', fontWeight: 600, textAlign: 'right' }}>{p}%</span>
    </div>
  )
}

export default async function ReportPage() {
  const stats = await getStats({ fresh: true })
  const { n } = stats

  return (
    <SeatradeShell wide>
      <p style={{ fontSize: 'var(--ds-text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 8px' }}>Live benchmark</p>
      <h1 style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: 'var(--ds-track-title)', margin: '0 0 var(--ds-gap-3)' }}>
        How {EVENT.name.replace('Cruise ', '')} scores on port call friction
      </h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--ds-gap-7)', fontSize: 'var(--ds-text-body)' }}>
        Every scorecard from {EVENT.city}, aggregated. Counts and shares only, no names, no companies. Updates as people answer.
      </p>

      {n === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-8)', textAlign: 'center' }}>
          <p style={{ fontSize: 'var(--ds-text-body)', color: 'var(--text-secondary)', margin: '0 0 var(--ds-gap-4)' }}>No scorecards yet. The first one sets the benchmark.</p>
          <a href="/seatrade/" style={{ display: 'inline-block', background: 'var(--brand)', color: 'var(--ds-primary-ink)', padding: '14px 28px', borderRadius: 'var(--ds-radius-pill)', fontWeight: 600, textDecoration: 'none' }}>Score your port calls</a>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 'var(--ds-gap-7)' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-lg)', padding: '18px 16px' }}>
              <span style={{ display: 'block', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }}>Scorecards</span>
              <span style={{ display: 'block', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.1 }}>{n}</span>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-lg)', padding: '18px 16px' }}>
              <span style={{ display: 'block', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }}>Average score</span>
              <span style={{ display: 'block', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.1 }}>{stats.avg}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> /100</span></span>
            </div>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-lg)', padding: '18px 16px' }}>
              <span style={{ display: 'block', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }}>Port calls on email</span>
              <span style={{ display: 'block', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.1 }}>{Math.round((stats.emailShare ?? 0) * 100)}<span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontWeight: 500 }}> %</span></span>
            </div>
          </div>

          <h2 style={{ fontSize: 'var(--ds-h3)', fontWeight: 700, margin: '0 0 var(--ds-gap-4)' }}>Bands</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 'var(--ds-gap-8)' }}>
            {BANDS.map(b => {
              const tone = BAND_TONE[b.id]
              const count = stats.bands[b.id] ?? 0
              return (
                <div key={b.id} style={{ background: tone.bg, borderRadius: 'var(--ds-radius-lg)', padding: '14px 12px' }}>
                  <span style={{ display: 'block', fontSize: 'var(--ds-text-xs)', color: tone.fg, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }}>{b.label}</span>
                  <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)' }}>{pct(count, n)}%</span>
                  <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)' }}>{count} of {n}</span>
                </div>
              )
            })}
          </div>

          {QUESTIONS.map(q => (
            <section key={q.id} style={{ marginBottom: 'var(--ds-gap-8)' }}>
              <h2 style={{ fontSize: 'var(--ds-h3)', fontWeight: 700, margin: '0 0 var(--ds-gap-4)', lineHeight: 1.3 }}>{q.title}</h2>
              {q.options.map(o => <Bar key={o.id} label={o.label} count={stats.answers[q.id]?.[o.id] ?? 0} total={n} />)}
            </section>
          ))}

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-6)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--ds-text-body)', color: 'var(--text-secondary)', margin: '0 0 var(--ds-gap-4)', lineHeight: 1.6 }}>Not in the benchmark yet? Seven taps, about a minute.</p>
            <a href="/seatrade/" style={{ display: 'inline-block', background: 'var(--brand)', color: 'var(--ds-primary-ink)', padding: '14px 28px', borderRadius: 'var(--ds-radius-pill)', fontWeight: 600, textDecoration: 'none' }}>Score your port calls</a>
          </div>
        </>
      )}
    </SeatradeShell>
  )
}
