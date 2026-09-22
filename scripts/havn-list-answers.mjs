#!/usr/bin/env node
/**
 * havn-list-answers: print every submission from portlink.app/portlink+griegconnect as JSON.
 *
 *   NETLIFY_SITE_ID=… NETLIFY_AUTH_TOKEN=… node scripts/havn-list-answers.mjs          (all, JSON)
 *   NETLIFY_SITE_ID=… NETLIFY_AUTH_TOKEN=… node scripts/havn-list-answers.mjs --text   (readable)
 *
 * Reads the `havn-answers` Netlify Blobs store the route writes to (lib/havn/store.ts). Read only.
 * This is the export the platform's admin import will consume; until that exists it is how the
 * answers are read outside the inbox.
 */
import { readFileSync } from 'node:fs'
import { getStore } from '@netlify/blobs'

function linkedSiteId() {
  try { return JSON.parse(readFileSync(new URL('../.netlify/state.json', import.meta.url), 'utf8')).siteId } catch { return undefined }
}
const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID || linkedSiteId()
const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
if (!siteID || !token) {
  console.error('havn-list-answers: set NETLIFY_SITE_ID and NETLIFY_AUTH_TOKEN (the Portlink Netlify site and token).')
  process.exit(2)
}

const store = getStore({ name: 'havn-answers', siteID, token, consistency: 'strong' })
const { blobs } = await store.list({ prefix: 'submission/' })
const rows = []
for (const b of blobs) {
  const s = await store.get(b.key, { type: 'json' })
  if (s) rows.push(s)
}
rows.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))

if (process.argv.includes('--text')) {
  for (const s of rows) {
    console.log(`\n== ${s.receivedAt} · ${s.who || '(uten navn)'} · ${Object.keys(s.answers).length + Object.keys(s.choices).filter((k) => !(k in s.answers)).length} svar ==`)
    const ids = new Set([...Object.keys(s.answers), ...Object.keys(s.choices)])
    for (const id of [...ids].sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))) {
      const c = s.choices[id]
      console.log(`${id.slice(1).padStart(2, '0')}. ${c ? `[${c.join(', ')}] ` : ''}${s.answers[id] ?? ''}`)
    }
  }
  console.log(`\n${rows.length} innsending(er).`)
} else {
  console.log(JSON.stringify(rows, null, 2))
}
