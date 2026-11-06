'use client'
/**
 * The live thing on /portlink, in Waabi's partner-tabs card: pick a seat and the record shows that
 * seat's tabs by the platform's SECTION_VIS rule. Buttons with aria-pressed; without script the
 * cruise line's view (all tabs) is what renders.
 */
import { useState } from 'react'
import { SEATS, SEAT_NOTE, TABS, type Seat } from './content'

export default function SeatLens({ image }: { image: string }) {
  const [seat, setSeat] = useState<Seat>('cl')
  return (
    <div className="w-calc relative flex flex-col items-center justify-between md:flex-row">
      <div className="relative aspect-square w-full overflow-clip rounded-t-[var(--rounded-unit)] md:aspect-[unset] md:h-[80.7rem] md:w-10/12 md:rounded-[var(--rounded-unit)] bg-dark">
        <div className="absolute inset-0">
          <img className="h-full w-full object-cover object-left-top" src={image} alt="The port-call record of MS Trollfjord in Portlink" loading="lazy" />
        </div>
      </div>
      <div className="rounded-calc relative mt-[-2.8rem] flex w-full flex-col items-start justify-center bg-[var(--overlap-background,var(--color-dark))] p-28 text-[var(--overlap-text-color,var(--color-white))] md:absolute md:right-0 md:mt-0 md:w-[44.7rem] md:p-48 gap-24 overflow-clip md:gap-36">
        <div className="relative flex h-32 w-full items-center gap-24 border-b border-current/10 wbx-seattabs" role="group" aria-label="Choose a seat">
          {SEATS.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={seat === s.id}
              onClick={() => setSeat(s.id)}
              className={`relative h-33 shrink-0 items-center border-b-2 px-10 ${seat === s.id ? 'border-pink text-current' : 'border-transparent text-current/25 wbx-dim'}`}
            >
              <span className="type-text-14 md:type-text-15">{s.label}</span>
            </button>
          ))}
        </div>
        <div className="relative flex flex-col gap-24" aria-live="polite">
          <p className="type-h-18 md:type-display-24">{SEAT_NOTE[seat]}</p>
          <ul className="wbx-tabs" aria-label="Tabs this seat sees">
            {TABS.map((t) => {
              const on = t.seats.includes(seat)
              return (
                <li key={t.name} className={on ? 'is-on' : 'is-off'}>
                  {t.name}
                  {!on && <span className="sr-only"> (hidden for this seat)</span>}
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
