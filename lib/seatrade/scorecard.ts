/**
 * Port Call Friction Score — the model behind portlink.app/seatrade.
 *
 * Pure module: no React, no Node APIs. Imported by the client quiz, the API route (which
 * re-scores server-side and never trusts the client's number), the emails and the live report.
 *
 * Scoring: five questions carry friction points, two (role, biggest pain) carry none and only
 * shape the findings. Score = points / MAX_POINTS * 100, rounded. Higher = more friction.
 * Bands are nautical on purpose: people compare them out loud on a show floor.
 */

export type QuestionId = 'role' | 'volume' | 'system' | 'reentry' | 'change' | 'status' | 'pain'
export type Answers = Record<QuestionId, string>

export interface Option {
  id: string
  label: string
  points: number
  /** What this answer costs, in the visitor's words. Only shown when it is one of the top findings. */
  finding?: string
  /** What Portlink changes about it. Paired with `finding`. */
  fix?: string
}

export interface Question {
  id: QuestionId
  title: string
  hint?: string
  options: Option[]
}

export const QUESTIONS: Question[] = [
  {
    id: 'role',
    title: 'Which side of the port call are you on?',
    options: [
      { id: 'cruise', label: 'Cruise line', points: 0 },
      { id: 'agent',  label: 'Port agent', points: 0 },
      { id: 'port',   label: 'Port or terminal', points: 0 },
      { id: 'tour',   label: 'Tour operator or DMC', points: 0 },
      { id: 'other',  label: 'Something else', points: 0 },
    ],
  },
  {
    id: 'volume',
    title: 'How many port calls does your operation touch in a year?',
    options: [
      { id: 'lt100',   label: 'Fewer than 100', points: 0 },
      { id: '100-500', label: '100 to 500', points: 1 },
      { id: '500-2k',  label: '500 to 2 000', points: 2 },
      { id: '2k+',     label: 'More than 2 000', points: 3 },
    ],
  },
  {
    id: 'system',
    title: 'Where does a port call actually live today?',
    hint: 'The place you would look first for the current state of one call.',
    options: [
      {
        id: 'email', label: 'Email threads and spreadsheets', points: 4,
        finding: 'Your port calls live in email threads, so the latest version is wherever the last reply went.',
        fix: 'Portlink gives every port call one shared record. The latest version is the only version.',
      },
      {
        id: 'inbox', label: "Mostly in one person's inbox", points: 4,
        finding: 'The port call lives in one inbox. When that person is off, the port call is off too.',
        fix: 'Portlink keeps the full history on the port call itself, visible to everyone who works it.',
      },
      {
        id: 'internal', label: 'An internal system', points: 2,
        finding: 'Your system holds your side of the call. Agents, ports and operators still get it by email.',
        fix: 'Portlink puts the other parties on the same record, so your system stops being an island.',
      },
      {
        id: 'vendor', label: 'Third-party software', points: 1,
        finding: 'You have software, but the parties around you are still on email, so updates still leak.',
        fix: 'Portlink is built for all three sides of the call, not one company at a time.',
      },
      { id: 'shared', label: 'A platform shared with our partners', points: 0 },
    ],
  },
  {
    id: 'reentry',
    title: 'How many times does the same port call data get typed in again across parties?',
    hint: 'Vessel, ETA, berth, pax numbers, services. Line, agent, port, operator.',
    options: [
      { id: 'once', label: 'Once', points: 0 },
      {
        id: 'few', label: '2 to 5 times', points: 2,
        finding: 'Each port call is re-entered a few times. Every re-entry is a chance for a wrong number.',
        fix: 'In Portlink the data is entered once and reused by every party on the call.',
      },
      {
        id: 'many', label: '6 to 15 times', points: 4,
        finding: 'The same call is re-keyed up to 15 times. That is the copy-paste tax, paid on every call.',
        fix: 'Portlink removes the re-entry entirely: one record, every party, no copies.',
      },
      {
        id: 'lost', label: "We've lost count", points: 5,
        finding: 'Nobody knows how many copies of one port call exist. So nobody knows which one is right.',
        fix: 'Portlink has one record per call. Counting copies stops being a question.',
      },
    ],
  },
  {
    id: 'change',
    title: 'When something changes, how do the other parties find out?',
    hint: 'A new ETA, a berth swap, tour numbers moving.',
    options: [
      { id: 'shared', label: 'Everyone sees it in a shared record', points: 0 },
      {
        id: 'email', label: 'Someone sends an email', points: 3,
        finding: 'Changes travel by email, so they arrive in the wrong order, or not at all.',
        fix: 'In Portlink a change lands on the record and every party sees it at the same moment.',
      },
      {
        id: 'phone', label: 'A phone call or WhatsApp', points: 4,
        finding: 'Changes travel by phone and WhatsApp. Fast for two people, invisible to the other six.',
        fix: 'Portlink keeps the change on the port call, with who changed what and when.',
      },
      {
        id: 'late', label: "Often they don't, until it's a problem", points: 5,
        finding: 'Changes reach people when they have already become a problem at the quay.',
        fix: 'Portlink notifies the parties a change affects, before the ship is alongside.',
      },
    ],
  },
  {
    id: 'status',
    title: 'How long does it take to get the full picture of one port call?',
    hint: 'Status, agent, PDA, shore programme, open questions.',
    options: [
      { id: 'minutes', label: 'Minutes', points: 0 },
      {
        id: 'hour', label: 'About an hour', points: 2,
        finding: 'An hour to assemble the picture of one call. Multiply by your calls per week.',
        fix: 'Portlink shows the state of a port call on one screen, in seconds.',
      },
      {
        id: 'halfday', label: 'Half a day of chasing', points: 4,
        finding: 'Half a day of chasing to know where one call stands. That is the real cost of email.',
        fix: 'Portlink puts status, agent, PDA and shore programme on one record. No chasing.',
      },
      {
        id: 'days', label: "Days, and it's never complete", points: 5,
        finding: 'The full picture of a port call takes days and is never complete when you need it.',
        fix: 'Portlink keeps the picture complete by construction: every party writes to the same call.',
      },
    ],
  },
  {
    id: 'pain',
    title: 'What bites the most?',
    options: [
      { id: 'chasing',  label: 'Chasing status updates', points: 0 },
      { id: 'pda',      label: 'PDA and cost surprises', points: 0 },
      { id: 'tours',    label: 'Tour bookings and overbooking', points: 0 },
      { id: 'versions', label: 'Finding the latest version', points: 0 },
      { id: 'crew',     label: 'Crew changes, deliveries, services', points: 0 },
    ],
  },
]

export const MAX_POINTS = QUESTIONS.reduce(
  (sum, q) => sum + Math.max(...q.options.map(o => o.points)),
  0,
) // 22

export type BandId = 'smooth' | 'choppy' | 'heavy'

export interface Band {
  id: BandId
  label: string
  /** One or two sentences read out loud on the result screen and in email 1. */
  descriptor: string
  min: number
}

export const BANDS: Band[] = [
  {
    id: 'smooth', label: 'Smooth sailing', min: 0,
    descriptor: 'Your port calls mostly live in shared, current records. You are ahead of most of the room.',
  },
  {
    id: 'choppy', label: 'Choppy', min: 34,
    descriptor: 'Some of it is shared, a lot of it still travels by email. Manageable on a good day, painful when the ETA moves.',
  },
  {
    id: 'heavy', label: 'Heavy weather', min: 67,
    descriptor: 'Most of your port call runs on inboxes and re-typed data. Every change is a chase.',
  },
]

export const ROLE_LABELS: Record<string, string> = Object.fromEntries(
  QUESTIONS[0].options.map(o => [o.id, o.label]),
)

/** Role-specific line used on the result screen and in every email. */
export const ROLE_LINES: Record<string, string> = {
  cruise: 'For cruise lines, Portlink shows every port call across the deployment in one place: status, agents, PDA, shore programmes, without chasing anyone.',
  agent:  'For port agents, Portlink is one workspace per port call, one login, and full history across every cruise line you serve. No more copy-paste between formats.',
  port:   'For ports and terminals, Portlink is the same live record the cruise line and the agent see: berths, ETAs and services without the email chase.',
  tour:   'For tour operators and DMCs, Portlink enforces booking deadlines automatically and keeps your programme locked unless you approve the change.',
  other:  'Portlink connects cruise lines, port agents, ports and tour operators on a single port call record, so everyone sees the same status and nobody re-enters the same data.',
}

export interface Finding {
  title: string
  body: string
}

export interface ScoreResult {
  score: number
  points: number
  band: Band
  findings: Finding[]
}

export function questionById(id: QuestionId): Question {
  const q = QUESTIONS.find(x => x.id === id)
  if (!q) throw new Error(`Unknown question ${id}`)
  return q
}

export function optionFor(qid: QuestionId, oid: string): Option | undefined {
  return questionById(qid).options.find(o => o.id === oid)
}

/** True when every question has a valid option id. */
export function isComplete(answers: Partial<Record<QuestionId, string>>): answers is Answers {
  return QUESTIONS.every(q => typeof answers[q.id] === 'string' && q.options.some(o => o.id === answers[q.id]))
}

export function bandFor(score: number): Band {
  let band = BANDS[0]
  for (const b of BANDS) if (score >= b.min) band = b
  return band
}

const PAIN_FINDINGS: Record<string, Finding> = {
  chasing:  { title: 'Chasing status updates is your biggest cost.', body: 'Portlink shows the state of every call without asking anyone.' },
  pda:      { title: 'PDA and cost surprises bite the most.', body: 'Portlink keeps the PDA on the port call, versioned, visible to the line and the agent.' },
  tours:    { title: 'Tour bookings and overbooking bite the most.', body: 'Portlink enforces booking deadlines and locks the programme unless you approve the change.' },
  versions: { title: 'Finding the latest version bites the most.', body: 'Portlink has one record per call, so the latest version is the only version.' },
  crew:     { title: 'Crew changes, deliveries and services bite the most.', body: 'Portlink tracks every service on the call, with who owns it and where it stands.' },
}

export function score(answers: Answers): ScoreResult {
  let points = 0
  const candidates: { points: number; finding: Finding }[] = []

  for (const q of QUESTIONS) {
    const opt = optionFor(q.id, answers[q.id])
    if (!opt) throw new Error(`Invalid answer for ${q.id}`)
    points += opt.points
    if (opt.finding && opt.fix && opt.points >= 2) {
      candidates.push({ points: opt.points, finding: { title: opt.finding, body: opt.fix } })
    }
  }

  const value = Math.round((points / MAX_POINTS) * 100)
  const findings = candidates
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map(c => c.finding)

  // Always give people something to take away, even at a low score.
  if (findings.length < 3) {
    const pain = PAIN_FINDINGS[answers.pain]
    if (pain) findings.push(pain)
  }
  if (findings.length === 0) {
    findings.push({
      title: 'You are already close to one shared record.',
      body: 'Portlink closes the last gap: the other parties on the call, on the same record.',
    })
  }

  return { score: value, points, band: bandFor(value), findings }
}

/** Sanitised source tag from the QR code or link (`?s=badge`). */
export function cleanSource(raw: unknown): string {
  if (typeof raw !== 'string') return 'direct'
  const s = raw.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 32)
  return s || 'direct'
}
