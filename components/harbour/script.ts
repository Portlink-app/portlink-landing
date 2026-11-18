/**
 * The One Harbour shot table: the single source for the scroll track, the thread map, the
 * telemetry strip, deep links and the reduced-motion stills page (DIRECTION.md section 4).
 *
 * Ranges are in screens (1.0 = one viewport height). `start` and `end` are positions on the
 * track. Copy is exactly the lines DIRECTION.md section 4 gives; a stop with `heading: null`
 * carries none. Nothing here is a claim beyond those lines.
 *
 * Capture ids (P1..P12) are the planned real captures. None exist yet (WP3), so `CAPTURES_READY`
 * is false and no component may draw a capture, mock UI or placeholder image for them.
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

export const CAPTURES_READY = false

export const SHOTS: readonly Shot[] = [
  {
    id: 'S0', start: 0, end: 1, role: 'Itinerary planner', product: 'Portlink platform',
    clip: null, captures: ['P1'],
    heading: 'One port call. Every desk.',
    line: "Follow one cruise call from the planner's screen to the guide's phone, on the real screens each role works in.",
    telemetry: null, label: 'Plan', node: true, staged: true,
  },
  {
    id: 'S1', start: 1, end: 2.6, role: 'Itinerary planner', product: 'Portlink platform',
    clip: null, captures: ['P1', 'P2', 'P3'],
    heading: 'The plan the bridge can load.',
    line: 'Draw the route on charts made for planning, check typical conditions for your dates, export RTZ for the ECDIS.',
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
    telemetry: 'Distance run', label: 'Crossing', node: true, staged: true,
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
    line: 'One ship in the bay, four teams ashore and on board, one call record between them.',
    telemetry: null, label: 'Arrival', node: true, staged: true,
  },
  {
    id: 'S6', start: 8.2, end: 10.2, role: 'Port agent', product: 'Portlink platform',
    clip: 'C3', captures: ['P6', 'P7'],
    heading: 'One request. One estimate.',
    line: "Accept the call, send the PDA on the shared record, and see the cruise line's review there.",
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
    line: 'Embark runs departures, guides, bookings and payments for small tour operators. First deployment: Greenland.',
    telemetry: null, label: 'Tour operator', node: true, staged: true,
  },
  {
    id: 'S9', start: 14.4, end: 16.2, role: 'Guide', product: 'Embark',
    clip: 'C6', captures: ['P10'],
    heading: "The tour, in the guide's hand.",
    line: "Embark field mode is the guide's phone view on tour. This is the real screen.",
    telemetry: null, label: 'Guide', node: true, staged: true,
  },
  {
    id: 'S10', start: 16.2, end: 18, role: 'Vessel, nav team', product: 'Portlink platform',
    clip: 'C7', captures: ['P11'],
    heading: 'A berth change is never small.',
    line: 'On the call record a changed berth is a material amendment. A same-day time shift is treated differently.',
    telemetry: 'Amendment: material', label: 'Bridge', node: true, staged: true,
  },
  {
    id: 'S11', start: 18, end: 19.2, role: 'Port ops and port agent', product: 'Portlink platform',
    clip: null, captures: ['P12'],
    heading: 'Estimate and actual, one record.',
    line: "The agent's estimate and the draft FDA sit on the same call, not in two spreadsheets.",
    telemetry: 'FDA: draft', label: 'Departure', node: true, staged: true,
  },
  {
    id: 'S12', start: 19.2, end: 20.4, role: 'All roles', product: 'all',
    clip: null, captures: [],
    heading: 'One call. Each role, its part.',
    line: 'Shared context is not shared everything. Each workspace sees what its role on the call allows.',
    telemetry: null, label: 'Harbour', node: true, staged: true,
  },
  {
    id: 'S13', start: 20.4, end: 21.8, role: 'Products', product: 'Mist',
    clip: null, captures: [],
    heading: 'Three products, one company.',
    line: null, telemetry: null, label: 'Products', node: false, staged: false,
  },
  {
    id: 'S14', start: 21.8, end: 23.2, role: 'Working session', product: 'Mist',
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

/** The three product regions of S13. Wheelhouse carries no claim (Q5 default). */
export const PRODUCTS = [
  { name: 'Portlink', href: '/portlink/', text: 'One call record shared by the cruise line, the port agent, the DMC and the vessel.' },
  { name: 'Embark', href: '/embark/', text: 'Departures, guides, bookings and payments for small tour operators.' },
  { name: 'Wheelhouse', href: '/contact/', text: 'Ask us.' },
] as const
