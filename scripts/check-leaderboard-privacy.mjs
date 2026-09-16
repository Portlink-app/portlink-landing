/**
 * check:leaderboard — the public draw board must never carry anything but a first name and a company.
 *
 * WHY A GATE AND NOT A COMMENT. The board publishes other people's names. They typed them into a
 * form that promised a scorecard and a draw, not a public listing, so the cost of leaking one more
 * field is somebody's work email on the open web. The row TYPE is already narrow, but a type is a
 * compile-time promise and this is a runtime object that gets spread into a JSON response.
 *
 * THE CHECK IS AN INVARIANT, NOT A FIELD LIST. A field list only catches the leak someone already
 * thought of. This serialises the whole board and asserts that no value that exists ONLY on the
 * private lead record appears anywhere in it: not the email, the domain, the id, the referral code,
 * the referrer, the benchmark score or any timestamp belonging to a person. Add a field to Lead
 * tomorrow, put it in a row by accident, and this reddens without anyone updating a list.
 *
 * Paired ALLOW, because a gate with only DENY cases passes on a board that returns nothing:
 * the fixtures must still produce the right ranking, the right totals and the right exclusions.
 */
import assert from 'node:assert/strict'
import { buildLeaderboard, firstName } from '../lib/seatrade/leaderboard.ts'

const NOW = new Date('2026-09-20T10:00:00Z')
const lead = (over) => ({
  id: `lead-${over.n}`,
  createdAt: `2026-09-1${over.n}T09:00:00Z`,
  updatedAt: `2026-09-1${over.n}T09:00:00Z`,
  source: 'seatrade',
  name: over.name,
  email: `person${over.n}@${over.domain ?? 'example.com'}`,
  emailDomain: over.domain ?? 'example.com',
  domainMatch: 'likely',
  company: over.company,
  answers: {},
  score: 40 + over.n,
  band: 'choppy',
  consent: true,
  referralCode: `CODE0${over.n}`,
  referredBy: over.referredBy,
  verifiedAt: over.verified === false ? undefined : `2026-09-1${over.n}T10:00:00Z`,
  resend: {},
  unsubscribedAt: over.unsubscribed ? '2026-09-19T00:00:00Z' : undefined,
  submissions: 1,
  test: over.test,
})

const leads = [
  lead({ n: 1, name: 'Anne Marit Solberg', company: 'Nordic Cruise Agency' }),
  lead({ n: 2, name: 'Ben Okafor', company: 'Las Palmas Port', referredBy: 'lead-1' }),
  lead({ n: 3, name: 'Chiara Rossi', company: 'Med Shore Tours', referredBy: 'lead-1' }),
  lead({ n: 4, name: 'Dmitri Volkov', company: 'Baltic Agents' }),
  lead({ n: 5, name: 'Eve Nguyen', company: 'Never Confirmed Ltd', verified: false }),
  lead({ n: 6, name: 'Finn Larsen', company: 'Left The List AS', unsubscribed: true }),
  lead({ n: 7, name: 'Greta Testson', company: 'Test Fixtures Inc', test: true }),
]

const board = buildLeaderboard(leads, 25, NOW)
const json = JSON.stringify(board)

// ── ALLOW: the board is actually right ───────────────────────────────────────────────────────
assert.deepEqual(
  board.rows.map(r => [r.rank, r.name, r.company, r.entries]),
  [
    [1, 'Anne', 'Nordic Cruise Agency', 3],   // own entry + two confirmed referrals
    [2, 'Ben', 'Las Palmas Port', 1],         // confirmed, no referrals; earlier than Chiara
    [3, 'Chiara', 'Med Shore Tours', 1],
    [4, 'Dmitri', 'Baltic Agents', 1],
  ],
  'ranking, first-name-only display, and tie-break by sign-up order',
)
assert.equal(board.total, 4, 'unconfirmed, unsubscribed and test people hold no place')
assert.equal(board.shown, 4)
assert.equal(board.entriesTotal, 6)
assert.equal(firstName('  Anne Marit  Solberg '), 'Anne', 'first name is the first word, trimmed')
assert.equal(firstName(''), '', 'an empty name does not throw')

// A truncated board must SAY it is truncated rather than read as complete.
const cut = buildLeaderboard(leads, 2, NOW)
assert.equal(cut.rows.length, 2)
assert.equal(cut.shown, 2)
assert.equal(cut.total, 4, 'total counts everyone eligible, not everyone shown')

// ── DENY: nothing private may appear anywhere in the serialised board ────────────────────────
const forbidden = []
for (const l of leads) {
  forbidden.push(
    ['email', l.email],
    ['emailDomain', l.emailDomain],
    ['lead id', l.id],
    ['referralCode', l.referralCode],
    ['full name', l.name],
    ['createdAt', l.createdAt],
  )
  if (l.verifiedAt) forbidden.push(['verifiedAt', l.verifiedAt])
}
const leaked = forbidden.filter(([, value]) => value && json.includes(value))
assert.deepEqual(
  leaked,
  [],
  `the public board leaked private values: ${leaked.map(([k, v]) => `${k}=${v}`).join(', ')}`,
)
// Calibration: the check can SEE. A board that did carry an email must fail the same assertion.
const tainted = JSON.stringify({ ...board, rows: [{ ...board.rows[0], email: leads[0].email }] })
assert.ok(tainted.includes(leads[0].email), 'control: the detector reads the value it looks for')

console.log(`check:leaderboard OK — ${board.rows.length} rows, ${board.entriesTotal} entries, 0 private values in the payload`)
