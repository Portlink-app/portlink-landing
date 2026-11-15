/** Production HTTP proof: Next header rules can override the directly tested GET handler. */
import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { setTimeout as delay } from 'node:timers/promises'

const reservation = createServer()
await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve))
const port = reservation.address().port
await new Promise(resolve => reservation.close(resolve))
const base = `http://127.0.0.1:${port}`
const server = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)],
  { stdio: ['ignore', 'pipe', 'pipe'] })
let output = ''
server.stdout.on('data', chunk => { output += chunk })
server.stderr.on('data', chunk => { output += chunk })
const exited = new Promise(resolve => server.once('exit', resolve))
const request = path => fetch(`${base}${path}`, { redirect: 'manual', signal: AbortSignal.timeout(5000) })
try {
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error(output)
    try { await request('/'); ready = true; break } catch { await delay(200) }
  }
  assert.ok(ready, `Next server failed to start: ${output}`)
  // Check the real canonicalisation path too; never follow a redirect into a remote product.
  const canonical = await request('/start?audience=agent')
  assert.equal(canonical.status, 308)
  assert.equal(canonical.headers.get('location'), '/start/?audience=agent')
  let configured = null
  try {
    const url = new URL(process.env.NEXT_PUBLIC_SELF_SERVE_URL ?? '')
    if (url.protocol === 'https:' && !url.username && !url.password && url.pathname === '/' && !url.search && !url.hash) configured = url.origin
  } catch { /* Unconfigured builds must keep assisted entry. */ }
  const cases = [
    ['?audience=agent', configured ? `${configured}/start?segment=port_agent` : '/#access'],
    ['?audience=tour', configured ? `${configured}/start?segment=dmc` : '/#access'],
    ['?product=embark&audience=operator', '/#access'],
    ['?product=wheelhouse&audience=company', '/#access'],
    ['?audience=agent&audience=cruise', '/#access'],
  ]
  for (const [query, expected] of cases) {
    const response = await request(`/start/${query}`)
    assert.equal(response.status, 307)
    assert.equal(response.headers.get('location'), expected)
    assert.equal(response.headers.get('cache-control'), 'private, no-store')
    assert.equal(response.headers.get('referrer-policy'), 'no-referrer')
    assert.equal(response.headers.get('x-robots-tag'), 'noindex, nofollow')
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN')
  }
  for (const path of ['/', '/portlink/', '/embark/', '/contact/']) {
    const response = await request(path)
    assert.equal(response.status, 200, path)
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin', path)
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN', path)
  }
  console.log(`check:acquisition:http clean: canonical redirect, 5 handoffs, 4 neighbours; ${configured ? 'configured' : 'assisted'} mode; external redirects not followed.`)
} finally {
  server.kill('SIGTERM')
  const timer = setTimeout(() => server.kill('SIGKILL'), 5000)
  await exited
  clearTimeout(timer)
}
