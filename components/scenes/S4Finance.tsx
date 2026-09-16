'use client'

/**
 * S4 — finance / framed. "From PDA to FDA: every cost, every call, tracked."
 *
 * Wide: estimate against actual, line by line, with the variance in its own
 * column. Narrow: the number that decides the conversation first, then the
 * lines that produced it.
 *
 * Figures are invented and internally consistent: the lines below sum to the
 * totals shown.
 */

import { AppFrame, Caps, Narrow, Num, Pill, Wide } from './ui'

type Line = { item: string; pda: number; fda: number }

const lines: Line[] = [
  { item: 'Port dues',        pda: 186400, fda: 186400 },
  { item: 'Pilotage',         pda: 64200,  fda: 68950 },
  { item: 'Mooring',          pda: 28500,  fda: 28500 },
  { item: 'Waste reception',  pda: 12900,  fda: 14190 },
  { item: 'Agency fee',       pda: 21000,  fda: 21000 },
]

const pdaTotal = lines.reduce((s, l) => s + l.pda, 0)
const fdaTotal = lines.reduce((s, l) => s + l.fda, 0)
const delta = fdaTotal - pdaTotal
const pct = ((delta / pdaTotal) * 100).toFixed(1).replace('.', ',')

/** Norwegian number form: non-breaking thousands separator, so a sum never wraps mid-number. */
const kr = (n: number) => `${n.toLocaleString('nb-NO')}\u00A0kr`
const signed = (n: number) => (n === 0 ? '-' : `${n > 0 ? '+' : '−'}${kr(Math.abs(n))}`)

function TotalBar() {
  return (
    <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--ds-surface-2)', borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--ds-border-1)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <Caps>Final against estimate</Caps>
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--ds-text-1)' }}>{kr(fdaTotal)}</span>
          <Pill tone="warning">+{pct} %</Pill>
        </span>
      </div>
      <div style={{ marginTop: 10, height: 6, borderRadius: 'var(--ds-radius-pill)', background: 'var(--ds-border-1)', overflow: 'hidden', display: 'flex' }}>
        <span style={{ width: `${(pdaTotal / fdaTotal) * 100}%`, background: 'var(--ds-primary)' }} />
        <span style={{ flex: 1, background: 'var(--ds-warning)' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 7 }}>
        <Num style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>Estimate {kr(pdaTotal)}</Num>
        <Num style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>Over by {kr(delta)}</Num>
      </div>
    </div>
  )
}

export default function S4Finance() {
  return (
    <>
      <Wide>
        <AppFrame title="Nordvik Aurora · Oslo · 19 Sep" meta={<Caps>PDA → FDA</Caps>}>
          <div style={{ border: '1px solid var(--ds-border-1)', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr', padding: '9px 14px', background: 'var(--ds-surface-2)', borderBottom: '1px solid var(--ds-border-1)' }}>
              <Caps>Cost line</Caps>
              <Caps style={{ textAlign: 'right' }}>Estimate (PDA)</Caps>
              <Caps style={{ textAlign: 'right' }}>Final (FDA)</Caps>
              <Caps style={{ textAlign: 'right' }}>Variance</Caps>
            </div>
            {lines.map((l, i) => {
              const d = l.fda - l.pda
              return (
                <div
                  key={l.item}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.6fr 1fr 1fr 1fr',
                    alignItems: 'center',
                    padding: '11px 14px',
                    borderBottom: i === lines.length - 1 ? 'none' : '1px solid var(--ds-border-1)',
                  }}
                >
                  <span style={{ fontSize: 13, color: 'var(--ds-text-1)', fontWeight: 500 }}>{l.item}</span>
                  <Num style={{ textAlign: 'right', color: 'var(--ds-text-2)' }}>{kr(l.pda)}</Num>
                  <Num style={{ textAlign: 'right' }}>{kr(l.fda)}</Num>
                  <Num style={{ textAlign: 'right', color: d > 0 ? 'var(--ds-warning)' : 'var(--ds-text-3)', fontWeight: d > 0 ? 600 : 400 }}>
                    {signed(d)}
                  </Num>
                </div>
              )
            })}
          </div>
          <TotalBar />
        </AppFrame>
      </Wide>

      <Narrow>
        <AppFrame title="Nordvik Aurora · Oslo" meta={<Caps>PDA → FDA</Caps>}>
          <TotalBar />
          <div style={{ marginTop: 14 }}>
            {lines.map((l, i) => {
              const d = l.fda - l.pda
              return (
                <div
                  key={l.item}
                  style={{
                    padding: '11px 0',
                    borderTop: i === 0 ? 'none' : '1px solid var(--ds-border-1)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ds-text-1)' }}>{l.item}</span>
                    <Num style={{ fontSize: 13, fontWeight: 600 }}>{kr(l.fda)}</Num>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 4 }}>
                    <Num style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>est. {kr(l.pda)}</Num>
                    {d !== 0 && (
                      <Num style={{ fontSize: 11.5, color: 'var(--ds-warning)', fontWeight: 600 }}>{signed(d)}</Num>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
