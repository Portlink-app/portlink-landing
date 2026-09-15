'use client'

/**
 * S7 — record / split. "Keep track of permits, certificates and compliance."
 *
 * Wide: the register, with what expires when. Narrow: what needs attention
 * first, then the register — a phone reader wants the exception, not the list.
 */

import { AppFrame, Caps, Narrow, Num, Pill, Wide, type Tone } from './ui'

type Doc = { name: string; issuer: string; validTo: string; state: string; tone: Tone }

const docs: Doc[] = [
  { name: 'Ship Sanitation Certificate', issuer: 'Port health, Oslo',   validTo: '14 Mar 2027', state: 'Valid',        tone: 'success' },
  { name: 'Waste delivery receipt',      issuer: 'Havnegata Agency',    validTo: 'Per call',    state: 'Filed',        tone: 'success' },
  { name: 'Pilot exemption certificate', issuer: 'Kystverket',          validTo: '06 Oct 2026', state: 'Expires soon', tone: 'warning' },
  { name: 'Shorex operator insurance',   issuer: 'Fjord Excursions AS', validTo: '31 Dec 2026', state: 'Valid',        tone: 'success' },
  { name: 'Security declaration (DoS)',  issuer: 'Port facility, Oslo', validTo: '19 Sep 2026', state: 'Renewal filed', tone: 'info' },
]

const counts = [
  { label: 'Valid', value: 3, tone: 'success' as Tone },
  { label: 'Expiring in 30 days', value: 1, tone: 'warning' as Tone },
  { label: 'Awaiting counter-signature', value: 1, tone: 'info' as Tone },
]

function Summary({ stacked = false }: { stacked?: boolean }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: stacked ? '1fr' : 'repeat(3, 1fr)',
        gap: stacked ? 8 : 10,
      }}
    >
      {counts.map((c) => (
        <div
          key={c.label}
          style={{
            border: '1px solid var(--ds-border-1)',
            borderRadius: 'var(--ds-radius-md)',
            padding: '10px 12px',
            background: 'var(--ds-surface-2)',
            display: stacked ? 'flex' : 'block',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
          }}
        >
          <Caps>{c.label}</Caps>
          <div style={{ marginTop: stacked ? 0 : 6 }}>
            <Pill tone={c.tone}>{c.value}</Pill>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function S7Compliance() {
  return (
    <>
      <Wide>
        <AppFrame title="Permits and certificates" meta={<Caps>Nordvik Aurora · Oslo</Caps>}>
          <Summary />
          <div style={{ marginTop: 14, border: '1px solid var(--ds-border-1)', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1.3fr 1fr 1.1fr', padding: '9px 14px', background: 'var(--ds-surface-2)', borderBottom: '1px solid var(--ds-border-1)' }}>
              {['Document', 'Issued by', 'Valid to', 'State'].map((h) => <Caps key={h}>{h}</Caps>)}
            </div>
            {docs.map((d, i) => (
              <div
                key={d.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.8fr 1.3fr 1fr 1.1fr',
                  alignItems: 'center',
                  padding: '11px 14px',
                  paddingLeft: d.tone === 'warning' ? 11 : 14,
                  borderBottom: i === docs.length - 1 ? 'none' : '1px solid var(--ds-border-1)',
                  borderLeft: d.tone === 'warning' ? '3px solid var(--ds-warning)' : 'none',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--ds-text-1)' }}>{d.name}</span>
                <span style={{ fontSize: 12.5, color: 'var(--ds-text-2)' }}>{d.issuer}</span>
                <Num style={{ color: 'var(--ds-text-2)' }}>{d.validTo}</Num>
                <span><Pill tone={d.tone}>{d.state}</Pill></span>
              </div>
            ))}
          </div>
        </AppFrame>
      </Wide>

      <Narrow>
        <AppFrame title="Permits and certificates" meta={<Caps>Nordvik Aurora</Caps>}>
          <Summary stacked />
          <div style={{ marginTop: 14 }}>
            {docs.map((d, i) => (
              <div
                key={d.name}
                style={{
                  padding: '12px 0',
                  borderTop: i === 0 ? 'none' : '1px solid var(--ds-border-1)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ds-text-1)', lineHeight: 1.35 }}>{d.name}</span>
                  <span style={{ flexShrink: 0 }}><Pill tone={d.tone}>{d.state}</Pill></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 5, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>{d.issuer}</span>
                  <span style={{ color: 'var(--ds-text-3)', fontSize: 11 }}>·</span>
                  <Num style={{ fontSize: 11.5, color: d.tone === 'warning' ? 'var(--ds-warning)' : 'var(--ds-text-3)', fontWeight: d.tone === 'warning' ? 600 : 400 }}>
                    to {d.validTo}
                  </Num>
                </div>
              </div>
            ))}
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
