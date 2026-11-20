/**
 * The One Harbour shot table: the single source for the scroll track, the thread map, the
 * telemetry strip, deep links and the reduced-motion stills page (DIRECTION.md section 4).
 *
 * Ranges are in screens (1.0 = one viewport height). `start` and `end` are positions on the
 * track. Copy is exactly the lines DIRECTION.md section 4 gives; a stop with `heading: null`
 * carries none. Nothing here is a claim beyond those lines.
 *
 * Capture ids are real product captures from the local demo seed (platform PR #3230, MS Disko Star
 * (demo) at Ilulissat; Embark from its own local demo data). Claim register: docs/HARBOUR-CLAIMS.md.
 * P2 (typical conditions) and P10 (Embark field mode) have no real capture, so they and stop S9
 * are removed, never mocked. P7, P11 and stop S10 are cut: those screens show real ships from the
 * shared demo fleet, and no real name appears on this page. Copy lines claim only what a capture shows.
 */

export type Product = 'Portlink platform' | 'Embark' | 'Portlink and Embark' | 'Mist' | 'all'

export type Shot = {
  id: string
  /** Range on the track, in screens. */
  start: number
  end: number
  /** Role or kind of the stop, as DIRECTION.md section 4 names it. */
  role: string
  product: Product
  /** Generated clip that drives the dive, or null. No clip exists yet. */
  clip: string | null
  /** Planned real captures. */
  captures: string[]
  /** 32 characters or fewer. */
  heading: string | null
  line: string | null
  /** Echo of the record status visible in the capture. Shown only once captures exist. */
  telemetry: string | null
  /** Short label for the thread map. */
  label: string
  /** True when the stop is a node on the thread map. */
  node: boolean
  /** True when the stop lives on the sticky stage; false means normal document flow. */
  staged: boolean
}

export const CAPTURES_READY = true

export type Capture = { desktop: string | null; phone: string | null; alt: string }

const C = (id: string, desktop: boolean, phone: boolean, alt: string): Capture => ({
  desktop: desktop ? `/media/harbour-2026-11/captures/${id}-desktop.webp` : null,
  phone: phone ? `/media/harbour-2026-11/captures/${id}-phone.webp` : null,
  alt,
})

/** Every real capture on the page. Demo data from a local seed, labelled as such on the page. */
export const CAPTURES: Record<string, Capture> = {
  P1: C('P01', true, true, 'Voyage builder: the demo route on a planning chart with four passages'),
  P3: C('P03', true, false, 'Route editor with RTZ, GPX and CSV export and the waypoint table'),
  P4: C('P04', true, false, 'Voyage map, satellite layer, the whole route, 3,118 NM over four passages'),
  P5: C('P05', true, true, 'Voyage costs: day by day fuel and the port cost waiting on the agent estimate'),
  P6: C('P06', true, true, 'Agent workspace: the call with the agent appointed and the PDA sent'),
  P8: C('P08', true, true, 'DMC bookings: the tour intake marked quote requested'),
  P9: C('P09', true, true, 'Embark: departures with a guide column'),
  P12: C('P12', true, true, 'Call money tab: PDA sent, departure report complete, FDA in draft'),
}

export const SHOTS: readonly Shot[] = [
  {
    id: 'S0', start: 0, end: 1, role: 'Itinerary planner', product: 'Portlink platform',
    clip: null, captures: ['P1'],
    heading: 'One port call. Every desk.',
    line: "Follow one cruise call from the planner's screen to the tour operator's desk, on the real screens each role works in.",
    telemetry: null, label: 'Plan', node: true, staged: true,
  },
  {
    id: 'S1', start: 1, end: 2.6, role: 'Itinerary planner', product: 'Portlink platform',
    clip: null, captures: ['P1', 'P3'],
    heading: 'The plan the bridge can load.',
    line: 'Draw the route on charts made for planning and export it as RTZ for the ECDIS.',
    telemetry: 'Route: RTZ export', label: 'Plan', node: false, staged: true,
  },
  {
    id: 'S2', start: 2.6, end: 3.6, role: 'Transition', product: 'Portlink platform',
    clip: 'C1', captures: ['P4'], heading: null, line: null,
    telemetry: null, label: 'Out the window', node: false, staged: true,
  },
  {
    id: 'S3', start: 3.6, end: 6, role: 'Cruise line port ops and cost forecasting', product: 'Portlink platform',
    clip: null, captures: ['P4', 'P5'],
    heading: 'The cost is already moving.',
    line: "Fuel is on the voyage from the first waypoint. Port costs join it when the agent's estimate lands on the same call.",
    telemetry: 'Distance: 3,118 NM', label: 'Crossing', node: true, staged: true,
  },
  {
    id: 'S4', start: 6, end: 7.2, role: 'Transition', product: 'Portlink platform',
    clip: 'C2', captures: [], heading: null, line: null,
    telemetry: null, label: 'Into the fjord', node: false, staged: true,
  },
  {
    id: 'S5', start: 7.2, end: 8.2, role: 'All roles', product: 'all',
    clip: null, captures: [],
    heading: 'Anchored. Now it gets busy.',
    line: 'One ship in the bay, four teams, one call record between them.',
    telemetry: null, label: 'Arrival', node: true, staged: true,
  },
  {
    id: 'S6', start: 8.2, end: 10.2, role: 'Port agent', product: 'Portlink platform',
    clip: 'C3', captures: ['P6'],
    heading: 'One request. One estimate.',
    line: 'Accept the call and send the PDA on the shared record.',
    telemetry: 'PDA: sent', label: 'Port agent', node: true, staged: true,
  },
  {
    id: 'S7', start: 10.2, end: 12.2, role: 'DMC', product: 'Portlink platform',
    clip: 'C4', captures: ['P8'],
    heading: 'The request lands as intake.',
    line: 'A shore request arrives on its call, marked quote requested. Nothing reads as confirmed until you confirm it.',
    telemetry: 'Intake: quote requested', label: 'DMC', node: true, staged: true,
  },
  {
    id: 'S8', start: 12.2, end: 14.4, role: 'Tour operator', product: 'Embark',
    clip: 'C5', captures: ['P9'],
    heading: "Tomorrow's departures, staffed.",
    line: 'Embark runs departures, guides and bookings for small tour operators.',
    telemetry: null, label: 'Tour operator', node: true, staged: true,
  },
  {
    id: 'S11', start: 14.4, end: 15.6, role: 'Port ops and port agent', product: 'Portlink platform',
    clip: null, captures: ['P12'],
    heading: 'Estimate and actual, one record.',
    line: "The agent's estimate and the draft FDA sit on the same call, not in two spreadsheets.",
    telemetry: 'FDA: draft', label: 'Departure', node: true, staged: true,
  },
  {
    id: 'S12', start: 15.6, end: 16.8, role: 'All roles', product: 'all',
    clip: null, captures: [],
    heading: 'One call. Each role, its part.',
    line: 'Shared context is not shared everything. Each workspace sees what its role on the call allows.',
    telemetry: null, label: 'Harbour', node: true, staged: true,
  },
  {
    id: 'S13', start: 16.8, end: 18.2, role: 'Products', product: 'Mist',
    clip: null, captures: [],
    heading: 'Three products, one company.',
    line: null, telemetry: null, label: 'Products', node: false, staged: false,
  },
  {
    id: 'S14', start: 18.2, end: 19.6, role: 'Working session', product: 'Mist',
    clip: null, captures: [],
    heading: 'Bring one port to a session.',
    line: 'We block the time, open your port on screen and work through it with you.',
    telemetry: null, label: 'Session', node: true, staged: false,
  },
]

/** Track length in screens: the end of the last staged shot. */
export const TRACK_SCREENS = Math.max(...SHOTS.filter((s) => s.staged).map((s) => s.end))

export const STAGED_SHOTS = SHOTS.filter((s) => s.staged)

export function shotAt(screens: number): Shot {
  for (const s of STAGED_SHOTS) if (screens < s.end) return s
  return STAGED_SHOTS[STAGED_SHOTS.length - 1]
}

/**
 * The station stops (DIRECTION.md 12.3, 12.4): the single source for which shot stops at which
 * station and which capture lifts there. `arrive` and `depart` are scroll positions in screens; the
 * camera rows in camera.ts sit on the station at both, so the camera and the ship rest between them.
 * Inside that rest the capture lifts for LIFT_SCREENS, holds, and returns for LIFT_SCREENS.
 *
 * Chose: A5 stops without a capture. Over: lifting P9 a second time. Because: A5's proof is P10
 * (Embark field mode), which is not captured yet, and showing one capture twice reads as filler.
 * Revisit if: P10 lands in public/media/harbour-2026-11/captures.
 */
export type Stop = { station: 'A1' | 'A2' | 'A3' | 'A4' | 'A5'; shot: string; capture: string | null; arrive: number; depart: number }

export const LIFT_SCREENS = 0.2

export const STOPS: readonly Stop[] = [
  { station: 'A1', shot: 'S3', capture: 'P5', arrive: 3.6, depart: 6 },
  { station: 'A2', shot: 'S6', capture: 'P6', arrive: 8.2, depart: 9.4 },
  { station: 'A3', shot: 'S7', capture: 'P8', arrive: 10.2, depart: 11.4 },
  { station: 'A4', shot: 'S8', capture: 'P9', arrive: 12.2, depart: 13.4 },
  { station: 'A5', shot: 'S8', capture: null, arrive: 13.8, depart: 14.4 },
]

/** Screens of scroll the stop's capture is fully lifted. */
export const holdScreens = (s: Stop) => s.depart - s.arrive - 2 * LIFT_SCREENS

/** How far the stop's capture is lifted at a scroll position: 0 on its anchor, 1 fully up. */
export function liftAt(s: Stop, screens: number): number {
  const u = Math.min(screens - s.arrive, s.depart - screens) / LIFT_SCREENS
  return Math.min(1, Math.max(0, u))
}

/** The three product regions of S13. Wheelhouse carries no claim (Q5 default). */
export const PRODUCTS = [
  { name: 'Portlink', href: '/portlink/', text: 'One call record shared by the cruise line, the port agent and the DMC.' },
  { name: 'Embark', href: '/embark/', text: 'Departures, guides and bookings for small tour operators.' },
  { name: 'Wheelhouse', href: '/contact/', text: 'Ask us.' },
] as const
