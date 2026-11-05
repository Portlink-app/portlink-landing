'use client'

/**
 * The guide's phone on the Embark hero: the page's live thing. Tap a booking and the aboard count
 * follows, as in Embark On Tour ("{n} of {total} aboard", "Check in all {n}", "Scan a ticket").
 * "Scan a ticket" checks in the next booking, as a scan would. Without script it shows a true
 * still: 17 of 24 aboard.
 */
import { useState } from 'react'

const TOTAL = 24
const GUESTS = [
  { name: 'Hansen family', size: 4, via: 'Booked by web', start: true },
  { name: 'Larsen', size: 2, via: 'Booked by Fjordland DMC', start: true },
  { name: 'Okafor group', size: 3, via: 'Booked by web', start: false },
  { name: 'Müller', size: 4, via: 'Booked by phone', start: false },
]
/** Guests already aboard who are not in the four rows shown (the list scrolls in the app). */
const OFFSCREEN = 11

export default function CheckIn() {
  const [on, setOn] = useState(GUESTS.map((g) => g.start))
  const aboard = OFFSCREEN + GUESTS.reduce((n, g, i) => n + (on[i] ? g.size : 0), 0)
  const left = TOTAL - aboard
  return (
    <div className="phone">
      <div data-ui>
        <div className="hd" style={{ paddingBottom: 0 }}><b>Sea kayak, kl. 10.00</b></div>
        <p className="count" aria-live="polite">
          {left ? <>{aboard} <small>of {TOTAL} aboard</small></> : <>{aboard} <small>All {TOTAL} aboard</small></>}
        </p>
        {GUESTS.map((g, i) => (
          <button
            key={g.name}
            type="button"
            className="guest"
            aria-pressed={on[i]}
            onClick={() => setOn((s) => s.map((v, j) => (j === i ? !v : v)))}
          >
            <span>{g.name}<span className="sub">{g.size} guests · {g.via}</span></span>
            <span className="tick" aria-hidden="true" />
          </button>
        ))}
        <div className="scan">
          <button
            type="button"
            className="btn"
            disabled={!left}
            onClick={() => setOn((s) => { const i = s.indexOf(false); return s.map((v, j) => (j === i ? true : v)) })}
          >
            Scan a ticket
          </button>
          <button type="button" className="btn alt" disabled={!left} onClick={() => setOn(GUESTS.map(() => true))}>
            {left ? `Check in all ${left}` : 'Done'}
          </button>
        </div>
      </div>
    </div>
  )
}
