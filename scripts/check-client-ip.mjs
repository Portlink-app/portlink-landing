#!/usr/bin/env node
/**
 * check:client-ip - the caller's address is the VISITOR's, not Cloudflare's. (npm run check:client-ip, prebuild)
 *
 * The trap, sprung 29.09.2026: portlink.app is proxied by Cloudflare, so the connection Netlify sees
 * is a Cloudflare edge. clientIp() returned that edge for every request: visitor intelligence named
 * every visit "Cloudflare, Inc." and the per-IP rate limits of /api/access and /api/havn were shared
 * by everyone behind the same Cloudflare location. Each case below is a request shape measured or
 * possible in production, with the answer it must get.
 */
import { clientGeo, clientIp, isCloudflareEdge } from '../lib/rateLimit.ts'

const req = (h) => new Request('https://portlink.app/api/x', { headers: h })
const cases = [
  ['Cloudflare edge v4 carrying a visitor', req({ 'x-nf-client-connection-ip': '172.70.34.10', 'cf-connecting-ip': '85.221.16.84' }), '85.221.16.84'],
  ['Cloudflare edge v6 carrying a visitor', req({ 'x-nf-client-connection-ip': '2a06:98c0:3600::103', 'cf-connecting-ip': '151.124.176.10' }), '151.124.176.10'],
  ['direct hit on the Netlify origin cannot pick its own address', req({ 'x-nf-client-connection-ip': '85.221.16.84', 'cf-connecting-ip': '1.2.3.4' }), '85.221.16.84'],
  ['no Cloudflare header', req({ 'x-nf-client-connection-ip': '85.221.16.84' }), '85.221.16.84'],
  ['only x-forwarded-for', req({ 'x-forwarded-for': '85.221.16.84, 10.0.0.1' }), '85.221.16.84'],
  ['nothing at all', req({}), null],
]
let bad = 0
for (const [name, r, want] of cases) {
  const got = clientIp(r)
  if (got !== want) { bad++; console.error(`FAIL ${name}: got ${got}, want ${want}`) }
}
for (const [ip, want] of [['104.16.0.1', true], ['162.159.1.1', true], ['85.221.16.84', false], ['2606:4700::6815:34d1', true], ['2001:db8::1', false], ['garbage', false]]) {
  if (isCloudflareEdge(ip) !== want) { bad++; console.error(`FAIL isCloudflareEdge(${ip}) != ${want}`) }
}
const geoCf = clientGeo(req({ 'x-nf-client-connection-ip': '172.70.34.10', 'cf-ipcountry': 'NO', 'x-nf-geo': Buffer.from(JSON.stringify({ country: { code: 'US' }, city: 'Ashburn' })).toString('base64') }))
if (geoCf.country !== 'NO' || geoCf.city) { bad++; console.error('FAIL behind Cloudflare the country must come from cf-ipcountry and no edge city', geoCf) }
if (bad) { console.error(`check:client-ip: ${bad} failure(s)`); process.exit(1) }
console.log(`check:client-ip clean: ${cases.length} request shapes and 6 range checks answer the visitor, never the edge.`)
