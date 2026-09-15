'use client'

/**
 * S3 — record / split. "Each department signs off its own part."
 *
 * Wide: the stage bar across the record, and who owes what underneath.
 * Narrow: the same five stages as a vertical run, which is how a sign-off
 * chain actually reads on a phone.
 */

import { AppFrame, Caps, Dot, Narrow, Num, Pill, Wide, type Tone } from './ui'

type Stage = {
  dept: string
  state: 'Signed' | 'In review' | 'Waiting'
  who: string
  when: string
  tone: Tone
}

const stages: Stage[] = [
  { dept: 'Marine Ops',  state: 'Signed',    who: 'Ops desk',        when: '17 Sep 09:12', tone: 'success' },
  { dept: 'Port Agency', state: 'Signed',    who: 'Havnegata Agency', when: '17 Sep 14:40', tone: 'success' },
  { dept: 'Shorex',      state: 'In review', who: 'Shore programme',  when: 'since 18 Sep', tone: 'warning' },
  { dept: 'Finance',     state: 'Waiting',   who: 'Cost control',     when: 'after Shorex', tone: 'neutral' },
  { dept: 'Compliance',  state: 'Waiting',   who: 'HSEQ',             when: 'after Finance', tone: 'neutral' },
]

const signed = stages.filter((s) => s.state === 'Signed').length

function RecordHead() {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ds-text-1)' }}>Norwegian Fjords</span>
      <Pill tone="primary">In review</Pill>
      <Num style={{ color: 'var(--ds-text-3)' }}>19–24 Sep 2026 · 6 ports</Num>
    </div>
  )
}

export default function S3Review() {
  return (
    <>
      <Wide>
        <AppFrame title="Voyage · review flow" meta={<Caps>{signed} of {stages.length} signed</Caps>}>
          <RecordHead />

          {/* Stage bar */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 8, marginBottom: 16 }}>
            {stages.map((s) => (
              <div key={s.dept}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 'var(--ds-radius-pill)',
                    background:
                      s.state === 'Signed' ? 'var(--ds-success)' : s.state === 'In review' ? 'var(--ds-warning)' : 'var(--ds-border-1)',
                  }}
                />
                <div style={{ marginTop: 7, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Dot tone={s.tone} size={6} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: s.state === 'Waiting' ? 'var(--ds-text-3)' : 'var(--ds-text-1)' }}>
                    {s.dept}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Who owes what */}
          <div style={{ border: '1px solid var(--ds-border-1)', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr 1fr 1.2fr', padding: '9px 14px', background: 'var(--ds-surface-2)', borderBottom: '1px solid var(--ds-border-1)' }}>
              {['Department', 'Owner', 'State', 'When'].map((h) => <Caps key={h}>{h}</Caps>)}
            </div>
            {stages.map((s, i) => (
              <div
                key={s.dept}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.1fr 1.3fr 1fr 1.2fr',
                  alignItems: 'center',
                  padding: '11px 14px',
                  paddingLeft: s.state === 'In review' ? 11 : 14,
                  borderBottom: i === stages.length - 1 ? 'none' : '1px solid var(--ds-border-1)',
                  // An accent bar rather than a tint: a warning pill on a warning
                  // tint loses its shape and reads as loose text.
                  borderLeft: s.state === 'In review' ? '3px solid var(--ds-warning)' : 'none',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ds-text-1)' }}>{s.dept}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ds-text-2)' }}>{s.who}</span>
                <span><Pill tone={s.tone}>{s.state}</Pill></span>
                <Num style={{ color: 'var(--ds-text-3)' }}>{s.when}</Num>
              </div>
            ))}
          </div>
        </AppFrame>
      </Wide>

      <Narrow>
        <AppFrame title="Voyage · review flow" meta={<Caps>{signed} of {stages.length}</Caps>}>
          <RecordHead />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {stages.map((s, i) => (
              <div key={s.dept} style={{ display: 'flex', gap: 12 }}>
                {/* The chain itself */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, paddingTop: 4 }}>
                  <Dot tone={s.tone} size={9} />
                  {i < stages.length - 1 && (
                    <span
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 34,
                        background: s.state === 'Signed' ? 'var(--ds-success)' : 'var(--ds-border-1)',
                        marginTop: 3,
                      }}
                    />
                  )}
                </div>

                <div style={{ paddingBottom: i === stages.length - 1 ? 0 : 14, minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: s.state === 'Waiting' ? 'var(--ds-text-3)' : 'var(--ds-text-1)' }}>
                      {s.dept}
                    </span>
                    <Pill tone={s.tone}>{s.state}</Pill>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: 'var(--ds-text-2)' }}>{s.who}</span>
                    <span style={{ color: 'var(--ds-text-3)', fontSize: 11 }}>·</span>
                    <Num style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>{s.when}</Num>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
