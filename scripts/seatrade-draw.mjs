#!/usr/bin/env node
/**
 * Draw the Seatrade Med winner from the exported CSV, weighted by entries, reproducibly.
 *
 *   node scripts/seatrade-draw.mjs seatrade-leads-2026-09-29.csv --seed "<a public value>"
 *
 * Input: the CSV that /api/seatrade/export/ mails to the admin (columns `entries`, `eligible`,
 * `test`). Only rows with eligible=yes, test empty and entries>0 take part. The seed makes the
 * result reproducible: use something nobody controls and publish it with the result (e.g. the
 * closing price of a named index on the draw date, or a public hash). Prints an audit table.
 *
 * Weighted draw = one ticket per entry, one ticket picked uniformly with a seeded PRNG.
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'

const [file, ...rest] = process.argv.slice(2)
const seedIdx = rest.indexOf('--seed')
const seed = seedIdx >= 0 ? rest[seedIdx + 1] : ''
if (!file || !seed) {
  console.error('usage: seatrade-draw.mjs <export.csv> --seed "<public value>"')
  process.exit(2)
}

function parseCsv(text) {
  const rows = []
  let row = [], field = '', q = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (q) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') q = false
      else field += c
    } else if (c === '"') q = true
    else if (c === ',') { row.push(field); field = '' }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (c !== '\r') field += c
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const [header, ...data] = rows
  return data.filter(r => r.length === header.length).map(r => Object.fromEntries(header.map((h, i) => [h, r[i]])))
}

const leads = parseCsv(readFileSync(file, 'utf8'))
const eligible = leads.filter(l => l.eligible === 'yes' && !l.test && Number(l.entries) > 0)
const tickets = []
for (const l of eligible) for (let i = 0; i < Number(l.entries); i++) tickets.push(l)

if (tickets.length === 0) { console.error('no eligible entries'); process.exit(1) }

// Seeded uniform pick: SHA-256 of the seed + the ticket count, first 8 bytes as an integer.
const digest = createHash('sha256').update(`${seed}|${tickets.length}`).digest()
const n = Number(digest.readBigUInt64BE(0) % BigInt(tickets.length))
const winner = tickets[n]

console.log(`Eligible people: ${eligible.length}   Tickets: ${tickets.length}   Seed: "${seed}"   Ticket drawn: #${n + 1}`)
console.log('')
console.log('name'.padEnd(28), 'company'.padEnd(30), 'entries', 'chance')
for (const l of [...eligible].sort((a, b) => Number(b.entries) - Number(a.entries))) {
  console.log(l.name.slice(0, 27).padEnd(28), l.company.slice(0, 29).padEnd(30), String(l.entries).padStart(7), `${(100 * Number(l.entries) / tickets.length).toFixed(1)} %`)
}
console.log('')
console.log(`WINNER: ${winner.name}, ${winner.company} <${winner.email}> with ${winner.entries} ${Number(winner.entries) === 1 ? 'entry' : 'entries'}`)
console.log('Check before announcing: work email domain vs company (column domainMatch), role, and that they are a real person in the industry.')
