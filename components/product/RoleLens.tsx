'use client'

/**
 * "Each seat sees its own record": the Portlink page's live thing. Pick a seat and the same record
 * re-renders with that role's tabs, by the platform's own rule: portlink-platform
 * src/modules/port-calls record-sections.tsx SECTION_VIS (finance = cruise line + agent,
 * programme = cruise line + DMC, services = cruise line + agent; the ship sees none of the three).
 *
 * Without script the server markup shows the port agent's view, which is a complete, true state.
 */
import { useState } from 'react'

type Seat = 'cl' | 'pa' | 'dmc' | 'vessel'

const SEATS: { id: Seat; label: string }[] = [
  { id: 'cl', label: 'Cruise line' },
  { id: 'pa', label: 'Port agent' },
  { id: 'dmc', label: 'DMC' },
  { id: 'vessel', label: 'Ship' },
]
const VIS: Record<'finance' | 'programme' | 'services', Seat[]> = {
  finance: ['cl', 'pa'],
  programme: ['cl', 'dmc'],
  services: ['cl', 'pa'],
}
const TABS: { label: string; gated?: keyof typeof VIS }[] = [
  { label: 'Overview' },
  { label: 'Readiness' },
  { label: 'Finance', gated: 'finance' },
  { label: 'Programme', gated: 'programme' },
  { label: 'Services', gated: 'services' },
  { label: 'Tasks' },
  { label: 'Comms' },
]
const META: Record<Seat, string> = {
  cl: 'Viewing as Nordkyst Line',
  pa: 'Viewing as Vestkyst Agency',
  dmc: 'Viewing as Fjordland DMC',
  vessel: 'Viewing as MS Nordkyst',
}
const NOTE: Record<Seat, string> = {
  cl: 'The cruise line owns the call and sees every tab.',
  pa: 'The agent sees the money and the suppliers. Tours stay with the cruise line and the DMC.',
  dmc: 'The DMC sees the programme and its tours. The money stays between line and agent.',
  vessel: 'The ship sees the call, its tasks and messages. No prices, no supplier board.',
}
const OWN: Record<Seat, [string, string, string]> = {
  cl: ['agent', 'agent', 'you'],
  pa: ['you', 'you', 'cruise line'],
  dmc: ['agent', 'agent', 'cruise line'],
  vessel: ['agent', 'agent', 'cruise line'],
}
const ROWS: { item: string; chip: string; tone: string }[] = [
  { item: 'Pilot booked', chip: 'Booked', tone: 'c-ok' },
  { item: 'Tugs booked', chip: 'Due in 1 d', tone: 'c-warn' },
  { item: 'Documents uploaded', chip: 'Overdue 1 d', tone: 'c-bad' },
]

export default function RoleLens() {
  const [seat, setSeat] = useState<Seat>('pa')
  return (
    <div className="wrap grid split-5">
      <div className="copy">
        <h2>Each seat sees its own record</h2>
        <div className="lens" role="group" aria-label="View the record as">
          {SEATS.map((s) => (
            <button key={s.id} type="button" aria-pressed={seat === s.id} onClick={() => setSeat(s.id)}>
              {s.label}
            </button>
          ))}
        </div>
        <p className="lensnote" aria-live="polite">{NOTE[seat]}</p>
      </div>
      <div className="frag" data-ui>
        <div className="hd"><b>Nordkyst at Bergen</b><span className="meta">{META[seat]}</span></div>
        <div className="tabs">
          {TABS.map((t, i) => {
            const hidden = t.gated && !VIS[t.gated].includes(seat)
            return (
              <span key={t.label} className={i === 0 ? 'on' : hidden ? 'off' : undefined}>
                {t.label}
                {hidden ? <span className="sr-only"> (not shown to this seat)</span> : null}
              </span>
            )
          })}
        </div>
        {ROWS.map((r, i) => (
          <div className="row" key={r.item}>
            <span>{r.item}</span>
            <span className="o">{OWN[seat][i]}</span>
            <span className={`chip ${r.tone}`}>{r.chip}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
