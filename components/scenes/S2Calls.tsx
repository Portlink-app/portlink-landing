'use client'

/**
 * S2 — calls / ledger. "Every call from every line in one list, with its state."
 *
 * This is the scene the brief puts first, because it is the hardest: a seven
 * column ledger is the densest surface in the product. The wide composition is
 * that ledger. The narrow composition is not the ledger scaled down — it is the
 * same six calls re-authored as cards, vessel and state on the first line,
 * because that is the pair a reader scans for.
 *
 * Data is invented. The lines, vessels and agencies below are fictional; the
 * ports are public Norwegian geography.
 */

import { AppFrame, Caps, Narrow, Num, Pill, Wide, type Tone } from './ui'

type Call = {
  vessel: string
  line: string
  port: string
  eta: string
  etd: string
  state: string
  tone: Tone
  agent: string
}

const calls: Call[] = [
  { vessel: 'Nordvik Aurora',  line: 'Nordvik Line',     port: 'Oslo',      eta: '19 Sep 08:00', etd: '19 Sep 18:00', state: 'In port',       tone: 'success', agent: 'Havnegata Agency' },
  { vessel: 'Saltvik Serena',  line: 'Saltvik Cruises',  port: 'Arendal',   eta: '20 Sep 08:03', etd: '20 Sep 18:00', state: 'Confirmed',     tone: 'primary', agent: 'Sørlandet Shipping' },
  { vessel: 'Fjordway Maris',  line: 'Fjordway',         port: 'Bergen',    eta: '21 Sep 12:00', etd: '21 Sep 22:00', state: 'Awaiting berth', tone: 'warning', agent: 'Vestkyst Agency' },
  { vessel: 'Nordvik Polaris', line: 'Nordvik Line',     port: 'Ålesund',   eta: '22 Sep 07:30', etd: '22 Sep 17:00', state: 'Confirmed',     tone: 'primary', agent: 'Nordvest Agency' },
  { vessel: 'Saltvik Vela',    line: 'Saltvik Cruises',  port: 'Trondheim', eta: '23 Sep 09:00', etd: '23 Sep 19:30', state: 'No agent yet',  tone: 'danger',  agent: 'Not appointed' },
  { vessel: 'Fjordway Lyra',   line: 'Fjordway',         port: 'Stavanger', eta: '24 Sep 06:45', etd: '24 Sep 16:15', state: 'Draft',         tone: 'neutral', agent: 'Rogaland Port Services' },
]

const chips = ['All lines', 'Next 7 days', 'Every state']

function Chips() {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {chips.map((c, i) => (
        <span
          key={c}
          style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 'var(--ds-radius-pill)',
            border: '1px solid var(--ds-border-1)',
            background: i === 0 ? 'var(--ds-primary-faint)' : 'transparent',
            color: i === 0 ? 'var(--ds-primary)' : 'var(--ds-text-3)',
            whiteSpace: 'nowrap',
          }}
        >
          {c}
        </span>
      ))}
    </div>
  )
}

export default function S2Calls() {
  return (
    <>
      {/* ── Wide: the ledger, as it is in the product ───────────────────── */}
      <Wide>
        <AppFrame title="Port calls" meta={<Caps>6 calls · 3 lines</Caps>} padded={false}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--ds-border-1)' }}>
            <Chips />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.1fr 1fr 1.15fr 1.15fr 1.1fr 1.3fr', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid var(--ds-border-1)', background: 'var(--ds-surface-2)' }}>
            {['Vessel', 'Line', 'Port', 'ETA', 'ETD', 'State', 'Agent'].map((h) => (
              <Caps key={h}>{h}</Caps>
            ))}
          </div>

          {calls.map((c, i) => (
            <div
              key={c.vessel}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1.1fr 1fr 1.15fr 1.15fr 1.1fr 1.3fr',
                alignItems: 'center',
                padding: '12px 16px',
                borderBottom: i === calls.length - 1 ? 'none' : '1px solid var(--ds-border-1)',
                background: i === 0 ? 'var(--ds-primary-faint)' : 'transparent',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ds-text-1)' }}>{c.vessel}</span>
              <span style={{ fontSize: 12, color: 'var(--ds-text-2)' }}>{c.line}</span>
              <span style={{ fontSize: 12, color: 'var(--ds-text-2)' }}>{c.port}</span>
              <Num>{c.eta}</Num>
              <Num>{c.etd}</Num>
              <span><Pill tone={c.tone}>{c.state}</Pill></span>
              <span style={{ fontSize: 12, color: c.agent === 'Not appointed' ? 'var(--ds-danger)' : 'var(--ds-text-2)' }}>{c.agent}</span>
            </div>
          ))}
        </AppFrame>
      </Wide>

      {/* ── Narrow: the same six calls, authored as cards ───────────────── */}
      <Narrow>
        <AppFrame title="Port calls" meta={<Caps>6 calls</Caps>} padded={false}>
          <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--ds-border-1)' }}>
            <Chips />
          </div>

          <div style={{ padding: '4px 12px 12px' }}>
            {calls.map((c, i) => (
              <div
                key={c.vessel}
                style={{
                  borderTop: i === 0 ? 'none' : '1px solid var(--ds-border-1)',
                  padding: '12px 0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--ds-text-1)' }}>{c.vessel}</span>
                  <Pill tone={c.tone}>{c.state}</Pill>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12.5, color: 'var(--ds-text-2)' }}>{c.port}</span>
                  <span style={{ color: 'var(--ds-text-3)', fontSize: 12 }}>·</span>
                  <Num style={{ fontSize: 12.5 }}>{c.eta}</Num>
                  <span style={{ color: 'var(--ds-text-3)', fontSize: 12 }}>→</span>
                  <Num style={{ fontSize: 12.5 }}>{c.etd.slice(-5)}</Num>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <Caps style={{ fontSize: 11 }}>{c.line}</Caps>
                  <span style={{ color: 'var(--ds-text-3)', fontSize: 11 }}>·</span>
                  <span style={{ fontSize: 11.5, color: c.agent === 'Not appointed' ? 'var(--ds-danger)' : 'var(--ds-text-3)', fontWeight: c.agent === 'Not appointed' ? 600 : 400 }}>
                    {c.agent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
