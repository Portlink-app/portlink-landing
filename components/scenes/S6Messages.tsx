'use client'

/**
 * S6 — messages / reading. "Coordination and communication is per call record."
 *
 * Wide: the record on the left, the conversation on the right — the point being
 * that the two are the same object. Narrow: the record collapses to a header
 * that stays above the thread, so the context never leaves the screen.
 */

import { AppFrame, Caps, Narrow, Num, Pill, Wide } from './ui'

type Message = { org: string; who: string; when: string; body: string; attachment?: string; own?: boolean }

const thread: Message[] = [
  {
    org: 'Havnegata Agency',
    who: 'Agent desk',
    when: '18 Sep 09:14',
    body: 'Berth 4 is held for 08:00. Pilot boards at the pilot station, 06:40.',
  },
  {
    org: 'Nordvik Line',
    who: 'Marine Ops',
    when: '18 Sep 09:31',
    body: 'Understood. Passenger count is up 140 on the last manifest — does that change the gangway plan?',
    own: true,
  },
  {
    org: 'Havnegata Agency',
    who: 'Agent desk',
    when: '18 Sep 10:02',
    body: 'Second gangway ordered. Updated port call sheet attached.',
    attachment: 'port-call-sheet-oslo-19sep.pdf',
  },
]

const participants = ['Nordvik Line · Marine Ops', 'Havnegata Agency', 'Fjord Excursions AS']

function ContextCard({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        border: '1px solid var(--ds-border-1)',
        borderRadius: 'var(--ds-radius-md)',
        padding: compact ? '10px 12px' : '12px 14px',
        background: 'var(--ds-surface-2)',
      }}
    >
      <Caps>On this record</Caps>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ds-text-1)', marginTop: 7 }}>Nordvik Aurora</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 4, flexWrap: 'wrap' }}>
        <Num style={{ color: 'var(--ds-text-2)' }}>Oslo · 19 Sep 08:00</Num>
        <Pill tone="success">In port</Pill>
      </div>

      {!compact && (
        <div style={{ marginTop: 12 }}>
          <Caps>Participants</Caps>
          <div style={{ marginTop: 7, display: 'flex', flexDirection: 'column', gap: 7 }}>
            {participants.map((p) => (
              <span key={p} style={{ fontSize: 12, color: 'var(--ds-text-2)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: '50%',
                    background: 'var(--ds-primary-faint)',
                    color: 'var(--ds-primary)',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {p.slice(0, 2).toUpperCase()}
                </span>
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Thread() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {thread.map((m) => (
        <div
          key={m.when}
          style={{
            border: '1px solid var(--ds-border-1)',
            borderLeft: `3px solid ${m.own ? 'var(--ds-primary)' : 'var(--ds-border-2)'}`,
            borderRadius: 'var(--ds-radius-md)',
            padding: '10px 12px',
            background: 'var(--ds-surface-1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ds-text-1)' }}>
              {m.org}
              <span style={{ fontWeight: 500, color: 'var(--ds-text-3)' }}> · {m.who}</span>
            </span>
            <Num style={{ fontSize: 11, color: 'var(--ds-text-3)' }}>{m.when}</Num>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ds-text-2)', lineHeight: 1.5, margin: '7px 0 0' }}>{m.body}</p>
          {m.attachment && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                marginTop: 9,
                padding: '5px 10px',
                borderRadius: 'var(--ds-radius-sm)',
                border: '1px solid var(--ds-border-1)',
                background: 'var(--ds-surface-2)',
                fontSize: 11.5,
                color: 'var(--ds-text-2)',
                maxWidth: '100%',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              <span style={{ color: 'var(--ds-primary)', fontWeight: 700 }}>PDF</span>
              {m.attachment}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}

function Composer() {
  return (
    <div
      style={{
        marginTop: 10,
        border: '1px solid var(--ds-border-1)',
        borderRadius: 'var(--ds-radius-md)',
        padding: '10px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
        background: 'var(--ds-surface-1)',
      }}
    >
      <span style={{ fontSize: 12.5, color: 'var(--ds-text-3)' }}>Reply on this port call…</span>
      <span
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          color: 'var(--ds-primary-ink)',
          background: 'var(--ds-primary)',
          padding: '5px 12px',
          borderRadius: 'var(--ds-radius-pill)',
          flexShrink: 0,
        }}
      >
        Send
      </span>
    </div>
  )
}

export default function S6Messages() {
  return (
    <>
      <Wide>
        <AppFrame title="Port call · messages" meta={<Caps>3 organisations</Caps>}>
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 14, alignItems: 'start' }}>
            <ContextCard />
            <div>
              <Thread />
              <Composer />
            </div>
          </div>
        </AppFrame>
      </Wide>

      <Narrow>
        <AppFrame title="Port call · messages" padded={false}>
          <div style={{ padding: 12 }}>
            <ContextCard compact />
            <div style={{ marginTop: 12 }}>
              <Thread />
              <Composer />
            </div>
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
