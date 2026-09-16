/**
 * check:access - the pilot form must refuse a submission BEFORE it can send mail.
 *
 * WHY A GATE AND NOT A COMMENT. `/api/access` sends a confirmation to an address the caller
 * supplies, from the verified sender pilot@portlink.app. Until 16.09.2026 the only check was that
 * four fields were non-empty, so anyone could make our domain deliver a message to any address on
 * earth. The refusals added that day are only worth anything if they stay in front of the send,
 * and "in front of" is an ordering property: it survives no refactor unless something measures it.
 *
 * THE INSTRUMENT MEASURES THE THING, NOT A TRACE OF IT. A 400 status is a trace. The thing is
 * whether an HTTP request left for api.resend.com. So `fetch` is replaced by a recorder for the
 * whole run and every refusal case asserts the recorder saw NOTHING. The recorder is calibrated
 * first, with a known-positive that really does call Resend, because a recorder that cannot see
 * would let every deny case pass while the endpoint mailed the world.
 *
 * THE DENY CASES RUN WITH RESEND_API_KEY UNSET. `new Resend(undefined)` throws, so if a refusal
 * ever slips past the guard clauses, the route blows up loudly instead of quietly returning 400
 * with a sent email behind it.
 *
 * PAIRED ALLOW, because a gate with only deny cases passes on an endpoint that refuses everything.
 * The accept case asserts two sends, the right recipients, and that a hostile name arrives
 * HTML-escaped rather than as live markup in David's inbox.
 *
 * NO REAL MAIL IS SENT. `fetch` never reaches the network, and the key used for the accept cases
 * is a literal dummy.
 */
import assert from 'node:assert/strict'

// Recorder, installed before the route module is imported.
let calls = []
const realFetch = globalThis.fetch
globalThis.fetch = async (url, options = {}) => {
  let payload = null
  try { payload = JSON.parse(options.body) } catch { payload = options.body ?? null }
  calls.push({ url: String(url), payload })
  return new Response(JSON.stringify({ id: 'dummy-not-sent' }), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  })
}

process.env.ADMIN_EMAIL = 'admin@portlink.test'
delete process.env.RESEND_API_KEY

const { POST } = await import('../app/api/access/route.ts')
const { resetRateLimits } = await import('../lib/rateLimit.ts')

const post = async (body, headers = {}) => {
  calls = []
  resetRateLimits()
  const init = {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }
  // A route that throws is a case to report, not a crash: the run must reach every other case.
  let res
  try {
    res = await POST(new Request('https://portlink.app/api/access', init))
  } catch (err) {
    return { status: 500, json: { error: `handler threw: ${err.message}` }, sent: calls.slice() }
  }
  let json = null
  try { json = await res.json() } catch { json = null }
  return { status: res.status, json, sent: calls.slice() }
}

const VALID = {
  role: 'Port Agent',
  name: 'Ada Lovelace',
  email: 'ada@nordicportagency.com',
  company: 'Nordic Port Agency',
  portsOperated: 'Bergen, Stavanger',
  cruiseLinesServed: '4-10',
  agentSoftware: 'Email only',
}

const failures = []
/** Async, so a case that returns a promise is awaited. A synchronous runner would print `ok` for
 *  a rejected assertion, which is the exact shape of a check that cannot see. */
const check = async (label, fn) => {
  try { await fn(); console.log(`  ok    ${label}`) }
  catch (err) { failures.push(label); console.log(`  FAIL  ${label}\n        ${err.message.split('\n')[0]}`) }
}

// CALIBRATION: prove the recorder can see a send at all.
console.log('calibration')
{
  const { Resend } = await import('resend')
  const probe = new Resend('re_dummy_calibration_key')
  calls = []
  await probe.emails.send({ from: 'a@portlink.app', to: 'b@example.com', subject: 's', html: 'h' })
  await check('the recorder sees a real Resend send (known positive)', () => {
    assert.equal(calls.length, 1)
    assert.match(calls[0].url, /api\.resend\.com\/emails/)
  })
  await check('the recorder sees nothing when nothing is sent (known negative)', () => {
    calls = []
    assert.equal(calls.length, 0)
  })
}

// DENY: nothing here may reach the send path.
console.log('refusals (RESEND_API_KEY unset, so a leak cannot be silent)')
const deny = [
  ['malformed JSON returns 400, not 500', 'not json', 400, /Invalid JSON/],
  ['a JSON body that is not an object', '"just a string"', 400, /Invalid JSON|choose your role/],
  ['an empty body', {}, 400, /choose your role/],
  ['a missing name', { ...VALID, name: '' }, 400, /enter your name/],
  ['a missing company', { ...VALID, company: '' }, 400, /enter your company/],
  ['a role that is not one of the three', { ...VALID, role: 'Hacker' }, 400, /choose your role/],
  ['an address that is not an address', { ...VALID, email: 'ada-at-example' }, 400, /valid email address/],
  ['a free-mail address', { ...VALID, email: 'ada@gmail.com' }, 400, /work email address/],
  ['a free-mail address on a country domain', { ...VALID, email: 'ada@hotmail.co.uk' }, 400, /work email address/],
  ['a disposable address', { ...VALID, email: 'ada@mailinator.com' }, 400, /work email address/],
  ['an array of addresses, which would fan out one submission to many inboxes',
    { ...VALID, email: ['a@corp.com', 'b@corp.com'] }, 400, /valid email address/],
  ['an object where the address should be', { ...VALID, email: { to: 'a@corp.com' } }, 400, /valid email address/],
  ['a null name', { ...VALID, name: null }, 400, /enter your name/],
]
for (const [label, body, status, message] of deny) {
  const r = await post(body)
  await check(label, () => {
    assert.equal(r.status, status, `status was ${r.status}`)
    assert.match(String(r.json?.error ?? ''), message)
    assert.deepEqual(r.sent, [], `${r.sent.length} request(s) reached the network`)
  })
}

// DENY, but answering 200 on purpose.
console.log('honeypot')
{
  const r = await post({ ...VALID, website: 'http://spam.example' })
  await check('a filled honeypot looks like success and sends nothing', () => {
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { ok: true })
    assert.deepEqual(r.sent, [], `${r.sent.length} request(s) reached the network`)
  })
}

console.log('rate limit')
{
  calls = []
  resetRateLimits()
  process.env.RESEND_API_KEY = 're_dummy_never_sent'
  const headers = { 'content-type': 'application/json', 'x-nf-client-connection-ip': '198.51.100.7' }
  const fire = () => POST(new Request('https://portlink.app/api/access', {
    method: 'POST', headers, body: JSON.stringify(VALID),
  }))
  const statuses = []
  for (let i = 0; i < 7; i++) statuses.push((await fire()).status)
  await check('the same recipient is cut off after the third message', () => {
    assert.deepEqual(statuses, [200, 200, 200, 429, 429, 429, 429])
  })
  await check('no send happens on a refused attempt', () => {
    assert.equal(calls.length, 6, `${calls.length} requests for 3 accepted submissions`)
  })
  await check('a plus tag does not buy a fresh allowance to the same inbox', () => {
    resetRateLimits()
    calls = []
    const burst = []
    for (let i = 0; i < 5; i++) {
      burst.push(POST(new Request('https://portlink.app/api/access', {
        method: 'POST', headers,
        body: JSON.stringify({ ...VALID, email: `ada+${i}@nordicportagency.com` }),
      })))
    }
    return Promise.all(burst).then(rs => {
      assert.deepEqual(rs.map(r => r.status), [200, 200, 200, 429, 429])
    })
  })
  delete process.env.RESEND_API_KEY
}

// ALLOW: a real submission still works, and arrives safe.
console.log('accept')
{
  process.env.RESEND_API_KEY = 're_dummy_never_sent'
  const hostile = {
    ...VALID,
    email: 'ada+pilot@nordicportagency.com',
    name: 'Ada <script>alert(1)</script>',
    company: 'Nordic & Port "Agency"',
    message: 'line one\nline two',
  }
  const r = await post(hostile)
  const bodies = r.sent.map(c => c.payload)
  await check('a valid work submission is accepted', () => {
    assert.equal(r.status, 200)
    assert.deepEqual(r.json, { ok: true })
  })
  await check('exactly two messages leave, to the visitor and to the admin', () => {
    assert.equal(bodies.length, 2)
    assert.deepEqual(bodies.map(b => b.to).flat().sort(), ['ada+pilot@nordicportagency.com', 'admin@portlink.test'])
  })
  await check('the plus tag survives, so the visitor gets the address they typed', () => {
    const toVisitor = bodies.find(b => String(b.to).includes('nordicportagency'))
    assert.equal(String(toVisitor.to), 'ada+pilot@nordicportagency.com')
  })
  await check('a hostile name arrives escaped, never as live markup', () => {
    for (const b of bodies) {
      assert.equal(b.html.includes('<script>'), false, 'raw script tag in an email body')
    }
    const admin = bodies.find(b => String(b.to).includes('admin@portlink.test'))
    assert.match(admin.html, /&lt;script&gt;/)
    assert.match(admin.html, /Nordic &amp; Port &quot;Agency&quot;/)
  })
  await check('no header can be smuggled into a subject line', () => {
    for (const b of bodies) assert.equal(/[\r\n]/.test(b.subject), false, 'newline in a subject')
  })
  delete process.env.RESEND_API_KEY
}

globalThis.fetch = realFetch

if (failures.length) {
  console.error(`\ncheck:access FAILED - ${failures.length} case(s):\n  ${failures.join('\n  ')}`)
  process.exit(1)
}
console.log('\ncheck:access clean. No message reached the network in this run.')
