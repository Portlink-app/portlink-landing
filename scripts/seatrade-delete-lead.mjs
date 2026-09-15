#!/usr/bin/env node
/**
 * Delete one Seatrade lead (and its email pointer) from the site-wide Netlify Blobs store.
 * For removing verification leads before/after the show. Real leads: think twice, export first.
 * Removes the lead document, its email pointer and its referral-code pointer.
 *
 *   NETLIFY_AUTH_TOKEN=… node scripts/seatrade-delete-lead.mjs someone@example.com
 *   NETLIFY_AUTH_TOKEN=… node scripts/seatrade-delete-lead.mjs --list      # print ids + emails
 */
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { getStore } from '@netlify/blobs'

const SITE_ID = (() => {
  try { return JSON.parse(readFileSync(new URL('../.netlify/state.json', import.meta.url), 'utf8')).siteId }
  catch { return '34ab2932-19da-44e5-b761-0bc83acc0055' }
})()
const token = process.env.NETLIFY_AUTH_TOKEN
if (!token) { console.error('NETLIFY_AUTH_TOKEN missing'); process.exit(2) }

const store = getStore({ name: 'seatrade-leads', siteID: SITE_ID, token, consistency: 'strong' })
const arg = process.argv[2]

if (!arg) { console.error('usage: seatrade-delete-lead.mjs <email> | --list'); process.exit(2) }

if (arg === '--list') {
  const { blobs } = await store.list({ prefix: 'lead/' })
  for (const b of blobs) {
    const l = await store.get(b.key, { type: 'json' })
    console.log(`${l.createdAt.slice(0, 16)}  ${l.score.toString().padStart(3)}  ${l.test ? 'TEST ' : '     '}${l.email}  ${l.company}  ${l.id}`)
  }
  console.log(`${blobs.length} lead(s)`)
  process.exit(0)
}

const email = arg.trim().toLowerCase()
const pointerKey = 'email/' + createHash('sha256').update(email).digest('hex')
const ref = await store.get(pointerKey, { type: 'json' })
if (!ref?.id) { console.error(`no lead for ${email}`); process.exit(1) }
const lead = await store.get(`lead/${ref.id}`, { type: 'json' })
await store.delete(`lead/${ref.id}`)
await store.delete(pointerKey)
if (lead?.referralCode) await store.delete(`code/${lead.referralCode}`)
console.log(`deleted lead ${ref.id} (${email})${lead?.referralCode ? ` and code ${lead.referralCode}` : ''}`)
