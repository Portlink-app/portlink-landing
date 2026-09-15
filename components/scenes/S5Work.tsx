'use client'

/**
 * S5 — work / field. "You shouldn't have to move between apps to get stuff done."
 *
 * Wide: the board, because the board is the thing that replaces the other app.
 * Narrow: the same tasks as the day list a phone is actually used for, with the
 * view switch left visible so the board is clearly still there.
 */

import { AppFrame, Caps, Dot, Narrow, Num, Wide, type Tone } from './ui'

type Task = { title: string; dept: string; due: string; tone: Tone }

const board: { column: string; tone: Tone; tasks: Task[] }[] = [
  {
    column: 'To do',
    tone: 'neutral',
    tasks: [
      { title: 'Confirm berth window, Bergen', dept: 'Port Agency', due: 'Today 16:00', tone: 'warning' },
      { title: 'Send shore programme brief',   dept: 'Shorex',      due: 'Tomorrow',    tone: 'neutral' },
    ],
  },
  {
    column: 'In progress',
    tone: 'primary',
    tasks: [
      { title: 'Reconcile pilotage invoice', dept: 'Finance',    due: 'Today 12:00', tone: 'warning' },
      { title: 'Update passage plan, leg 3', dept: 'Marine Ops', due: '22 Sep',      tone: 'neutral' },
    ],
  },
  {
    column: 'Done',
    tone: 'success',
    tasks: [
      { title: 'Appoint agent, Ålesund', dept: 'Port Agency', due: '17 Sep', tone: 'success' },
      { title: 'File waste declaration', dept: 'Compliance',  due: '17 Sep', tone: 'success' },
    ],
  },
]

const views = ['Board', 'List', 'Calendar']

const byDay = [
  {
    day: 'Today · 19 Sep',
    tasks: [
      { title: 'Reconcile pilotage invoice',   dept: 'Finance',     due: '12:00', tone: 'warning' as Tone },
      { title: 'Confirm berth window, Bergen', dept: 'Port Agency', due: '16:00', tone: 'warning' as Tone },
    ],
  },
  {
    day: 'Tomorrow · 20 Sep',
    tasks: [
      { title: 'Send shore programme brief', dept: 'Shorex',     due: '09:00', tone: 'neutral' as Tone },
      { title: 'Update passage plan, leg 3', dept: 'Marine Ops', due: '14:30', tone: 'neutral' as Tone },
    ],
  },
]

function TaskCard({ t }: { t: Task }) {
  return (
    <div
      style={{
        background: 'var(--ds-surface-1)',
        border: '1px solid var(--ds-border-1)',
        borderRadius: 'var(--ds-radius-md)',
        padding: '10px 12px',
      }}
    >
      <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ds-text-1)', lineHeight: 1.35, display: 'block' }}>
        {t.title}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
        <Caps style={{ fontSize: 11 }}>{t.dept}</Caps>
        <span style={{ color: 'var(--ds-text-3)', fontSize: 11 }}>·</span>
        <Num style={{ fontSize: 11.5, color: t.tone === 'warning' ? 'var(--ds-warning)' : 'var(--ds-text-3)', fontWeight: t.tone === 'warning' ? 600 : 400 }}>
          {t.due}
        </Num>
      </div>
    </div>
  )
}

function ViewSwitch({ active }: { active: string }) {
  return (
    <div style={{ display: 'inline-flex', padding: 3, gap: 2, background: 'var(--ds-surface-2)', border: '1px solid var(--ds-border-1)', borderRadius: 'var(--ds-radius-pill)' }}>
      {views.map((v) => (
        <span
          key={v}
          style={{
            fontSize: 11.5,
            fontWeight: 600,
            padding: '5px 12px',
            borderRadius: 'var(--ds-radius-pill)',
            background: v === active ? 'var(--ds-surface-1)' : 'transparent',
            color: v === active ? 'var(--ds-text-1)' : 'var(--ds-text-3)',
            boxShadow: v === active ? 'var(--ds-shadow-xs)' : 'none',
          }}
        >
          {v}
        </span>
      ))}
    </div>
  )
}

export default function S5Work() {
  return (
    <>
      <Wide>
        <AppFrame title="Tasks" meta={<ViewSwitch active="Board" />} padded={false}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, padding: 14 }}>
            {board.map((col) => (
              <div key={col.column}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
                  <Dot tone={col.tone} size={7} />
                  <Caps>{col.column}</Caps>
                  <Num style={{ fontSize: 11, color: 'var(--ds-text-3)' }}>{col.tasks.length}</Num>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {col.tasks.map((t) => <TaskCard key={t.title} t={t} />)}
                </div>
              </div>
            ))}
          </div>
        </AppFrame>
      </Wide>

      <Narrow>
        <AppFrame title="Tasks" padded={false}>
          <div style={{ padding: '12px 12px 0' }}>
            <ViewSwitch active="List" />
          </div>
          <div style={{ padding: 12 }}>
            {byDay.map((group, gi) => (
              <div key={group.day} style={{ marginTop: gi === 0 ? 4 : 18 }}>
                <Caps>{group.day}</Caps>
                <div style={{ marginTop: 8 }}>
                  {group.tasks.map((t, i) => (
                    <div
                      key={t.title}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 10,
                        padding: '11px 0',
                        borderTop: i === 0 ? 'none' : '1px solid var(--ds-border-1)',
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 5,
                          border: '1.5px solid var(--ds-border-2)',
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      />
                      <span style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ds-text-1)', display: 'block', lineHeight: 1.35 }}>
                          {t.title}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 5 }}>
                          <Caps style={{ fontSize: 11 }}>{t.dept}</Caps>
                          <span style={{ color: 'var(--ds-text-3)', fontSize: 11 }}>·</span>
                          <Num style={{ fontSize: 11.5, color: t.tone === 'warning' ? 'var(--ds-warning)' : 'var(--ds-text-3)', fontWeight: t.tone === 'warning' ? 600 : 400 }}>
                            {t.due}
                          </Num>
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </AppFrame>
      </Narrow>
    </>
  )
}
