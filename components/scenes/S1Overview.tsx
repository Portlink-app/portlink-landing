'use client'

/**
 * S1 — overview / workdesk. "You decide what your Dashboard looks like."
 *
 * Wide: the dashboard canvas, with one widget picked up and a rail of widgets
 * waiting to be added. Narrow: the same widgets as a single column in edit
 * mode, because a drag-and-drop canvas is not a phone gesture worth miming.
 */

import { AppFrame, Caps, Narrow, Num, Wide } from './ui'

type Widget = { title: string; value: string; note: string; span: number }

const widgets: Widget[] = [
  { title: 'Next port calls', value: '6',        note: 'next 7 days',        span: 2 },
  { title: 'Open tasks',      value: '14',       note: '3 due today',        span: 1 },
  { title: 'Cost vs estimate', value: '+1,9 %',  note: 'across 4 open calls', span: 1 },
  { title: 'Berth occupancy', value: '78 %',     note: 'Oslo, this week',    span: 1 },
  { title: 'Unread on records', value: '9',      note: '4 records',          span: 1 },
]

const rail = ['Certificates expiring', 'Shorex capacity', 'Sea days', 'Fuel plan', 'Agent response time']

function Tile({ w, picked = false }: { w: Widget; picked?: boolean }) {
  return (
    <div
      style={{
        gridColumn: `span ${w.span}`,
        background: 'var(--ds-surface-1)',
        border: picked ? '1px dashed var(--ds-primary)' : '1px solid var(--ds-border-1)',
        borderRadius: 'var(--ds-radius-md)',
        padding: '12px 14px',
        boxShadow: picked ? 'var(--ds-shadow-2)' : 'none',
        transform: picked ? 'translateY(-3px)' : 'none',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Caps>{w.title}</Caps>
        <span style={{ color: picked ? 'var(--ds-primary)' : 'var(--ds-text-3)', fontSize: 13, letterSpacing: '0.12em', lineHeight: 1 }}>
          ⠿
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--ds-text-1)', letterSpacing: '-0.02em' }}>{w.value}</span>
        <span style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>{w.note}</span>
      </div>
      {picked && (
        <span
          style={{
            position: 'absolute',
            right: 6,
            bottom: 6,
            width: 10,
            height: 10,
            borderRight: '2px solid var(--ds-primary)',
            borderBottom: '2px solid var(--ds-primary)',
            borderBottomRightRadius: 2,
          }}
        />
      )}
    </div>
  )
}

export default function S1Overview() {
  return (
    <>
      <Wide>
        <AppFrame
          title="Dashboard"
          meta={
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ds-primary)', background: 'var(--ds-primary-faint)', padding: '3px 9px', borderRadius: 'var(--ds-radius-pill)' }}>
                Editing layout
              </span>
              <Caps>Saved 13:37</Caps>
            </span>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 14, alignItems: 'start' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {widgets.map((w, i) => (
                <Tile key={w.title} w={w} picked={i === 2} />
              ))}
              <div
                style={{
                  gridColumn: 'span 1',
                  border: '1px dashed var(--ds-border-2)',
                  borderRadius: 'var(--ds-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 76,
                  color: 'var(--ds-text-3)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Drop here
              </div>
            </div>

            <div style={{ border: '1px solid var(--ds-border-1)', borderRadius: 'var(--ds-radius-md)', overflow: 'hidden' }}>
              <div style={{ padding: '9px 12px', borderBottom: '1px solid var(--ds-border-1)', background: 'var(--ds-surface-2)' }}>
                <Caps>Add a widget</Caps>
              </div>
              <div style={{ padding: '4px 12px 8px' }}>
                {rail.map((r, i) => (
                  <div
                    key={r}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '9px 0',
                      borderTop: i === 0 ? 'none' : '1px solid var(--ds-border-1)',
                      fontSize: 12.5,
                      color: 'var(--ds-text-2)',
                    }}
                  >
                    {r}
                    <span style={{ color: 'var(--ds-primary)', fontSize: 15, fontWeight: 600, lineHeight: 1 }}>+</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </AppFrame>
      </Wide>

      <Narrow>
        <AppFrame title="Dashboard" meta={<Caps>Editing</Caps>} padded={false}>
          <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {widgets.slice(0, 4).map((w, i) => (
              <div
                key={w.title}
                style={{
                  background: 'var(--ds-surface-1)',
                  border: i === 1 ? '1px dashed var(--ds-primary)' : '1px solid var(--ds-border-1)',
                  borderRadius: 'var(--ds-radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  boxShadow: i === 1 ? 'var(--ds-shadow-2)' : 'none',
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <Caps>{w.title}</Caps>
                  <span style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 6 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--ds-text-1)' }}>{w.value}</span>
                    <span style={{ fontSize: 11.5, color: 'var(--ds-text-3)' }}>{w.note}</span>
                  </span>
                </span>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'center', color: i === 1 ? 'var(--ds-primary)' : 'var(--ds-text-3)', flexShrink: 0 }}>
                  <span style={{ fontSize: 13, lineHeight: 1 }}>▲</span>
                  <span style={{ fontSize: 13, lineHeight: 1 }}>▼</span>
                </span>
              </div>
            ))}

            <div
              style={{
                border: '1px dashed var(--ds-border-2)',
                borderRadius: 'var(--ds-radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: 'var(--ds-text-2)',
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              Add a widget
              <Num style={{ color: 'var(--ds-text-3)' }}>5 available</Num>
            </div>
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
