/**
 * One Harbour v4 (/harbour-v4) shot & claim script.
 * Single source of truth for beats b00..b06, real product captures from the Bergen demo seed
 * (portlink-platform 407c6d383), role switcher, product family and conversion copy.
 *
 * Authority: RESEARCH/one-harbour-v2/v5/ONE_HARBOUR_PLAN_FABLE.md (§C, §D, §F, §G) and DIRECTION.md §14.
 * /harbour (v2/v3) and / remain untouched.
 */

export type VesselType = 'expedition_cruise' | 'harbour_launch' | 'ship_tender' | 'tour_boat'
export type Segment = 'cruise' | 'port_agent' | 'dmc' | 'tour_operator'

export type CaptureV4 = {
  id: string
  desktop: string
  phone: string | null
  alt: string
  caption: string
}

/**
 * Publish gates from ONE_HARBOUR_PLAN_FABLE.md §G items 8 and 9:
 * - Karoline at Vela Nordic quote/photo/logo requires written approval before live publish.
 * - Advisor names and roles require each named person's yes before live publish.
 * Kept false so no unapproved quote or advisor name is rendered; scripts/check-harbour-v4.mjs enforces both.
 */
export const VELA_QUOTE_APPROVED = false
export const ADVISORS_APPROVED = false

export const CAPTURES_V4: Record<string, CaptureV4> = {
  P01: {
    id: 'P01',
    desktop: '/media/harbour-v4/captures/P01-desktop.webp',
    phone: '/media/harbour-v4/captures/P01-phone.webp',
    alt: 'Portlink voyage planner showing Norwegian Coast 2026-N4 route from Stavanger to Bergen, Alesund and Trondheim',
    caption: 'Voyage planner: 421 NM coastal route across Stavanger, Bergen, Alesund and Trondheim.',
  },
  P03: {
    id: 'P03',
    desktop: '/media/harbour-v4/captures/P03-desktop.webp',
    phone: null,
    alt: 'Passage editor for Stavanger to Bergen with 12 waypoints, sun curve and RTZ, GPX and CSV export buttons',
    caption: 'Passage editor: 102 NM Stavanger to Bergen leg with waypoint table and RTZ, GPX and CSV export.',
  },
  P04: {
    id: 'P04',
    desktop: '/media/harbour-v4/captures/P04-desktop.webp',
    phone: null,
    alt: 'Voyage map on the satellite chart layer along the Norwegian coast',
    caption: 'Satellite layer: full coastal track verified against planning chart symbols.',
  },
  P05: {
    id: 'P05',
    desktop: '/media/harbour-v4/captures/P05-desktop.webp',
    phone: '/media/harbour-v4/captures/P05-phone.webp',
    alt: 'Voyage costs tab showing fuel estimate from the consumption curve and Bergen PDA waiting for approval',
    caption: 'Voyage costs: fuel calculated from distance and speed, joined by the Bergen port agent estimate.',
  },
  P06: {
    id: 'P06',
    desktop: '/media/harbour-v4/captures/P06-desktop.webp',
    phone: '/media/harbour-v4/captures/P06-phone.webp',
    alt: 'Port agent call workspace for Bergen at Skolten 3 with tide curve, readiness 5 of 5 and sent PDA',
    caption: 'Port agent workspace: Bergen call at Skolten 3, Kartverket tide window, readiness and sent PDA.',
  },
  P08: {
    id: 'P08',
    desktop: '/media/harbour-v4/captures/P08-desktop.webp',
    phone: '/media/harbour-v4/captures/P08-phone.webp',
    alt: 'DMC bookings workspace showing Fjord and city tour Bergen for 90 guests marked quote requested',
    caption: 'DMC bookings: shore excursion request for 90 guests on the Bergen call, marked quote requested.',
  },
  P08b: {
    id: 'P08b',
    desktop: '/media/harbour-v4/captures/P08b-desktop.webp',
    phone: '/media/harbour-v4/captures/P08b-phone.webp',
    alt: 'DMC operators requests view showing an Embark Trade API v1 agreement with Fjordland Boat Tours',
    caption: 'Embark trade link: DMC operator terms agreed with Fjordland Boat Tours through Trade API v1.',
  },
  P09: {
    id: 'P09',
    desktop: '/media/harbour-v4/captures/P09-desktop.webp',
    phone: '/media/harbour-v4/captures/P09-phone.webp',
    alt: 'Embark departures back office showing upcoming boat tours, guest capacity and guide assignments',
    caption: 'Embark back office: departures, guest lists and guide assignments for tour and boat operators.',
  },
  P10: {
    id: 'P10',
    desktop: '/media/harbour-v4/captures/P10-desktop.webp',
    phone: '/media/harbour-v4/captures/P10-phone.webp',
    alt: 'Wheelhouse phone and desktop task list showing Bergen call tasks at Skolten 3',
    caption: 'Wheelhouse: the crew and agency task list for the Bergen call at Skolten 3, worked from any phone.',
  },
  P12: {
    id: 'P12',
    desktop: '/media/harbour-v4/captures/P12-desktop.webp',
    phone: '/media/harbour-v4/captures/P12-phone.webp',
    alt: 'Call money tab showing sent PDA, completed departure report and draft FDA side by side',
    caption: 'Call close-out: PDA estimate, completed departure report and draft FDA on one record.',
  },
}

export type BeatV4 = {
  id: 'b00' | 'b01' | 'b02' | 'b03' | 'b04' | 'b05' | 'b06'
  start: number
  end: number
  label: string
  role: string
  vessel_type: VesselType
  segment: Segment
  props?: readonly string[]
  dFrames: number
  pFrames: number
  heading: string
  lead: string
  body: string
  telemetry: string
  primaryCapture: keyof typeof CAPTURES_V4
  insetCaptures: readonly (keyof typeof CAPTURES_V4)[]
}

export const BEATS_V4: readonly BeatV4[] = [
  {
    id: 'b00',
    start: 0,
    end: 1.4,
    label: 'Harbour',
    role: 'Expedition cruise line, port agent, DMC',
    vessel_type: 'expedition_cruise',
    segment: 'cruise',
    dFrames: 1,
    pFrames: 1,
    heading: 'One port call. Every desk.',
    lead: 'One shared record per port call across the cruise line, the port agent, the DMC and the tour operator.',
    body: 'Follow a 150 m expedition vessel calling at Bergen Skolten 3. Every stop below opens the real screen that team works in.',
    telemetry: 'Call: NOBGO · Skolten 3 · Alongside',
    primaryCapture: 'P01',
    insetCaptures: [],
  },
  {
    id: 'b01',
    start: 1.4,
    end: 3.4,
    label: 'Voyage plan',
    role: 'Itinerary planner',
    vessel_type: 'expedition_cruise',
    segment: 'cruise',
    dFrames: 8,
    pFrames: 6,
    heading: 'The plan the bridge loads.',
    lead: 'Draw the coastal route on planning charts, check solar elevation at arrival, and export RTZ, GPX or CSV.',
    body: 'The cruise line creates the voyage once. Passages, distance and berth windows carry forward to every call on the itinerary. Planning aid, not for navigation.',
    telemetry: 'Voyage: 421 NM · RTZ / GPX / CSV',
    primaryCapture: 'P01',
    insetCaptures: ['P03', 'P04'],
  },
  {
    id: 'b02',
    start: 3.4,
    end: 5.4,
    label: 'Voyage costs',
    role: 'Port operations & finance',
    vessel_type: 'expedition_cruise',
    segment: 'cruise',
    dFrames: 8,
    pFrames: 6,
    heading: 'The cost is already moving.',
    lead: 'Fuel sits on the voyage from distance and speed. Port costs join when the agent sends the estimate.',
    body: 'Each steaming day prices fuel from the vessel consumption curve. When the port agent submits the Bergen PDA, it lands on the voyage forecast for review.',
    telemetry: 'Fuel: 30,7 t · PDA waiting review',
    primaryCapture: 'P05',
    insetCaptures: [],
  },
  {
    id: 'b03',
    start: 5.4,
    end: 7.4,
    label: 'Port agent',
    role: 'Port agent',
    vessel_type: 'harbour_launch',
    segment: 'port_agent',
    dFrames: 8,
    pFrames: 6,
    heading: 'One request. One estimate.',
    lead: 'The cruise line created the call. The agent never re-types ship, dates or berth.',
    body: 'Accept the appointment, build or start the PDA on the shared Bergen record, and track pilotage, linesmen, waste and Kartverket tide limits in one place.',
    telemetry: 'PDA: 117 284 kr · Sent on call',
    primaryCapture: 'P06',
    insetCaptures: [],
  },
  {
    id: 'b04',
    start: 7.4,
    end: 9.4,
    label: 'DMC intake',
    role: 'Destination management company',
    vessel_type: 'ship_tender',
    segment: 'dmc',
    dFrames: 8,
    pFrames: 6,
    heading: 'The request lands as intake.',
    lead: 'A shore request arrives on its call, marked quote requested until you confirm it.',
    body: 'The DMC sees guest counts, berth and cutoff times on the call record, and agrees tour terms with local boat operators through the Embark trade link. DMC workspace in use with Vela Nordic.',
    telemetry: 'Intake: 90 guests · Quote requested',
    primaryCapture: 'P08',
    insetCaptures: ['P08b'],
  },
  {
    id: 'b05',
    start: 9.4,
    end: 11.4,
    label: 'Embark tours',
    role: 'Tour & boat operator',
    vessel_type: 'tour_boat',
    segment: 'tour_operator',
    props: ['iceberg'],
    dFrames: 8,
    pFrames: 6,
    heading: "The tour, in the guide's hand.",
    lead: 'Embark runs departures, guides and bookings for small tour, boat and activity operators.',
    body: 'Operators manage daily departures and guide assignments in Embark while answering DMC trade requests directly through Trade API v1.',
    telemetry: 'Embark: Trade API v1 connected',
    primaryCapture: 'P09',
    insetCaptures: ['P08b'],
  },
  {
    id: 'b06',
    start: 11.4,
    end: 13.4,
    label: 'Close-out',
    role: 'Port ops & port agent',
    vessel_type: 'expedition_cruise',
    segment: 'cruise',
    dFrames: 8,
    pFrames: 6,
    heading: 'Estimate and actual, together.',
    lead: 'The agent estimate, the completed departure report and the draft FDA sit on the same call.',
    body: 'When the ship sails from Skolten 3, the departure report generates the draft final disbursement account beside the original PDA so every variance is visible.',
    telemetry: 'FDA: 118 634 kr · Draft',
    primaryCapture: 'P12',
    insetCaptures: [],
  },
]

export const TRACK_SCREENS_V4 = BEATS_V4[BEATS_V4.length - 1].end

export function beatAtV4(screens: number): BeatV4 {
  for (const b of BEATS_V4) {
    if (screens < b.end) return b
  }
  return BEATS_V4[BEATS_V4.length - 1]
}

export type RoleDesk = {
  id: string
  role: string
  title: string
  summary: string
  captureId: keyof typeof CAPTURES_V4
  beatId: BeatV4['id']
}

export const ROLE_DESKS: readonly RoleDesk[] = [
  {
    id: 'cruise-line',
    role: 'Cruise line',
    title: 'Plan the voyage and close the call budget on one record.',
    summary: 'Draw passages with RTZ export, price fuel from the vessel curve, and review the agent PDA and draft FDA on the call.',
    captureId: 'P01',
    beatId: 'b01',
  },
  {
    id: 'port-agent',
    role: 'Port agent',
    title: 'Staff the call, send the PDA, and close the departure report.',
    summary: 'Join the call the cruise line created, build the PDA from tariffs or blank, and turn the signed departure report into a draft FDA.',
    captureId: 'P06',
    beatId: 'b03',
  },
  {
    id: 'dmc',
    role: 'DMC',
    title: 'Take shore requests on the call and agree operator terms.',
    summary: 'Receive tour requests tied to the ship arrival and departure times, and connect with local operators over Trade API v1. Used by Vela Nordic on the DMC side.',
    captureId: 'P08',
    beatId: 'b04',
  },
  {
    id: 'tour-operator',
    role: 'Tour operator',
    title: 'Run daily boat and activity departures in Embark.',
    summary: 'Assign guides, track guest capacity, and answer DMC trade requests from one back office built for tour and boat operators.',
    captureId: 'P09',
    beatId: 'b05',
  },
  {
    id: 'crew-tasks',
    role: 'Wheelhouse tasks',
    title: "Wheelhouse: the crew's task list, worked from any phone.",
    summary: 'Keep quayside checks, hose connections, coach staging and departure sign-offs on one board that works from any phone.',
    captureId: 'P10',
    beatId: 'b03',
  },
]

export const PRODUCTS_V4 = [
  {
    name: 'Portlink Platform',
    href: '/portlink/',
    lead: 'One shared record per port call for cruise lines, port agents, DMCs and vessels.',
    detail: 'Voyage planning with RTZ export, voyage fuel and port cost forecasting, shared call readiness, PDA to draft FDA close-out, and DMC shore excursion intake.',
    captureId: 'P06' as const,
  },
  {
    name: 'Embark (by Portlink)',
    href: '/embark/',
    lead: 'Departures, guides, bookings and Trade API v1 link for tour and boat operators.',
    detail: 'Built for small tour, boat and activity operators, with direct Trade API v1 agreement sync into the DMC workspace in Portlink Platform.',
    captureId: 'P09' as const,
  },
  {
    name: 'Wheelhouse (by Portlink)',
    href: '/contact/',
    lead: "Wheelhouse: the crew's task list, worked from any phone.",
    detail: ' Kanban boards, personal to-do queues, checklists and CRM for maritime teams and standalone companies.',
    captureId: 'P10' as const,
  },
] as const
