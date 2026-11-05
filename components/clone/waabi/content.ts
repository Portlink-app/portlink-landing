/** Content shared by the /portlink server page and its client parts (a client module's exports are references on the server). */
const V = '/video/landing-2026-09-15'
const H = '/havn'

export type SplitItem = { title: string; body: string; video?: string; poster?: string; still?: string; alt: string }

/** Waabi's Safe / Scalable / Practical, as the three things the record does before, during and after the call. */
export const SPLIT: SplitItem[] = [
  {
    title: 'Ready',
    body: 'Agent appointed, berth, PDA sent, clearance filed, pilot booked, tugs booked, documents uploaded. Each line has an owner, and the call shows how many of seven are done.',
    still: `${H}/app-portcall.jpg`,
    alt: 'A Portlink port-call record showing arrival readiness, ETA, ETD and the next step',
  },
  {
    title: 'Shared',
    body: 'The voyage plan feeds every call. The agent, the DMC and the ship work in the same record instead of a thread of emails.',
    video: `${V}/hero-A`,
    poster: `${V}/hero-A.jpg`,
    alt: 'Portlink voyage builder with the route drawn on a nautical chart',
  },
  {
    title: 'Settled',
    body: 'The PDA, the departure report and the FDA sit on the call, so the final account is checked line by line against what was estimated.',
    still: `${H}/app-pda.jpg`,
    alt: 'Portlink finance view with PDAs awaiting approval',
  },
]

export type Seat = 'cl' | 'pa' | 'dmc' | 'ship'
export const SEATS: { id: Seat; label: string }[] = [
  { id: 'cl', label: 'Cruise line' },
  { id: 'pa', label: 'Port agent' },
  { id: 'dmc', label: 'DMC' },
  { id: 'ship', label: 'Ship' },
]
/** The record's tabs and the platform's SECTION_VIS rule (record-sections.tsx): finance and services
 *  for the cruise line and the agent, programme for the cruise line and the DMC. */
export const TABS: { name: string; seats: Seat[] }[] = [
  { name: 'Overview', seats: ['cl', 'pa', 'dmc', 'ship'] },
  { name: 'Readiness', seats: ['cl', 'pa', 'dmc', 'ship'] },
  { name: 'Finance', seats: ['cl', 'pa'] },
  { name: 'Programme', seats: ['cl', 'dmc'] },
  { name: 'Services', seats: ['cl', 'pa'] },
  { name: 'Tasks', seats: ['cl', 'pa', 'dmc', 'ship'] },
  { name: 'Comms', seats: ['cl', 'pa', 'dmc', 'ship'] },
]
export const SEAT_NOTE: Record<Seat, string> = {
  cl: 'The cruise line sees the whole call: readiness, money, the shore programme and every service ordered.',
  pa: 'The port agent runs the call and its money: readiness, the PDA and FDA, and the services in port.',
  dmc: 'The DMC sees the shore programme it delivers with its operators, and the tasks that are its own.',
  ship: 'The ship sees what it must act on: readiness, its tasks and the messages, and nothing about money.',
}
