#!/usr/bin/env node
/**
 * lead-link.mjs: a portlink.app link that tells /leads who opened it. For emails YOU send one
 * person (outreach, follow-ups). Entry doc: docs/VISITOR-INTELLIGENCE.md.
 *
 *   INTEL_SECRET=… node scripts/lead-link.mjs <email> [--name "Jane Doe"] [--company "Carnival"] [--url https://portlink.app/contact/]
 *   or, with 1Password:  op run --env-file=.env.op -- node scripts/lead-link.mjs jane@carnival.com
 *
 * The token is signed with INTEL_SECRET, so only links made here are believed. When the person
 * opens it, /leads shows them by name on that visit; if they have "Remember me" on, their later
 * visits too. Do not put these links anywhere public: whoever clicks is recorded as that person.
 */
import { createHmac } from 'node:crypto'

const args = process.argv.slice(2)
const email = args.find((a) => !a.startsWith('--') && a.includes('@'))
const opt = (name) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined }
const key = process.env.INTEL_SECRET
if (!email) { console.error('usage: node scripts/lead-link.mjs <email> [--name N] [--company C] [--url U]'); process.exit(2) }
if (!key || key.length < 32) { console.error('INTEL_SECRET (32+ characters) is not set in the environment.'); process.exit(2) }

const id = { e: email.trim().toLowerCase() }
if (opt('name')) id.n = opt('name')
if (opt('company')) id.c = opt('company')
const payload = Buffer.from(JSON.stringify(id)).toString('base64url')
// Must match makeLinkToken in lib/intel/token.ts: HMAC-SHA256 over "link:<payload>", base64url.
const sig = createHmac('sha256', key).update(`link:${payload}`).digest('base64url')
const url = new URL(opt('url') ?? 'https://portlink.app/')
url.searchParams.set('pl', `${payload}.${sig}`)
console.log(url.toString())
