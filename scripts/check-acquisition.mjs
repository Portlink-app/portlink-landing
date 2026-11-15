import assert from 'node:assert/strict'

// Exercise the real route with a fixture origin; no network or commercial action is performed.
process.env.NEXT_PUBLIC_SELF_SERVE_URL = 'https://platform.portlink.test'
const { GET } = await import('../app/start/route.ts')
const { resolveAcquisitionEntry } = await import('../lib/acquisition.ts')
const origin = 'https://platform.portlink.test'
let cases = 0
function route(query, expected) {
  const response = GET(new Request(`https://portlink.test/start${query}`))
  assert.equal(response.status, 307)
  assert.equal(response.headers.get('location'), expected)
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
  assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
  cases++
}

// Positive controls prove every supported persona reaches its actual catalogue segment.
route('', `${origin}/start?segment=cruise_line`)
for (const [role, segment] of [['cruise', 'cruise_line'], ['agent', 'port_agent'], ['tour', 'dmc']]) {
  route(`?product=platform&audience=${role}`, `${origin}/start?segment=${segment}`)
}
// Paired negative controls protect product separation and explicit unsupported selections.
for (const query of [
  '?product=embark&audience=tour', '?product=embark&audience=operator',
  '?product=wheelhouse&audience=company', '?audience=vessel', '?audience=port',
  '?audience=operator', '?audience=unknown', '?audience=__proto__', '?audience=constructor',
  '?audience=', '?product=', '?product=unknown',
  '?audience=agent&audience=cruise', '?product=platform&product=embark',
]) route(query, '/#access')

// Unrecognised query values cannot smuggle a redirect, price, signer, tenant or personal data.
route('?audience=agent&next=https://evil.test&segment=cruise_line&email=private%40example.test&workspace=private&band=1-2&period=monthly',
  `${origin}/start?segment=port_agent`)

for (const config of [null, undefined, '', 'garbage', '//evil.test', 'javascript:alert(1)',
  'http://platform.portlink.test', `${origin}/start`, `${origin}?next=evil`, `${origin}#token`,
  'https://user:password@platform.portlink.test']) {
  assert.deepEqual(resolveAcquisitionEntry(new URLSearchParams('audience=agent'), config),
    { kind: 'assisted', href: '/#access' })
  cases++
}
assert.equal(resolveAcquisitionEntry(new URLSearchParams('audience=tour'), `${origin}/`).href,
  `${origin}/start?segment=dmc`)
cases++
console.log(`check:acquisition clean: ${cases} handoff cases; no network, mail or billing calls.`)
