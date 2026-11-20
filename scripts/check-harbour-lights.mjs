// The One Harbour lights gate (DIRECTION.md 12.4, 12.8 WP5). Signal colour (--ds-signal, #f5b53d)
// may appear on the stage only inside a `lights-*` or `ship-lights` group. Every rendered plane is
// walked tag by tag: any fill, stroke or style carrying the signal outside such a group fails. The
// route plane is drawn in signal but never rendered (planeHidden), so it is checked to stay hidden.
// Each station's lights must start dark (CSS), fade up on its push-in and stay on to the track end.
// --selftest proves the instrument sees a miss: a stray signal fill outside a group must fail.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { LIGHTS_SCREENS, STOPS, TRACK_SCREENS, lightsAt, lightsIds } from '../components/harbour/script.ts'

const read = (rel) => readFileSync(new URL(`../${rel}`, import.meta.url), 'utf8')
const world = JSON.parse(read('public/media/harbour-v2/world.json'))
const SIGNAL = /#f5b53d\b|rgb\(\s*245\s*,\s*181\s*,\s*61\s*\)/i
const LIGHTS = /^(lights-[A-Za-z0-9-]+|ship-lights)$/

/** Signal-coloured elements outside a lights group, as "tag#id@line" strings. */
export function strays(svg) {
  const out = []
  const stack = []
  for (const m of svg.matchAll(/<(\/?)([a-zA-Z][\w:-]*)\b([^>]*?)(\/?)>/g)) {
    const [, close, tag, attrs, self] = m
    if (close) {
      stack.pop()
      continue
    }
    const id = attrs.match(/\sid="([^"]+)"/)?.[1] ?? ''
    const lit = LIGHTS.test(id) || stack.some((s) => LIGHTS.test(s))
    if (!lit && SIGNAL.test(attrs)) out.push(`${tag}#${id}@${svg.slice(0, m.index).split('\n').length}`)
    if (!self) stack.push(id)
  }
  return out
}

if (process.argv.includes('--selftest')) {
  assert.equal(strays('<svg><g id="sea"><rect fill="#F5B53D"/></g></svg>').length, 1, 'selftest: stray fill should fail')
  assert.equal(strays('<svg><path style="stroke: rgb(245, 181, 61)"/></svg>').length, 1, 'selftest: stray rgb should fail')
  assert.equal(strays('<svg><g id="lights-A2"><g><rect fill="#f5b53d"/></g></g></svg>').length, 0, 'selftest: nested light should pass')
  assert.equal(strays('<svg><g id="ship-lights"><path stroke="#f5b53d"/></g><rect fill="#f5b53e"/></svg>').length, 0)
  const s = STOPS[1]
  assert.equal(lightsAt(s, s.arrive - LIGHTS_SCREENS - 0.01), 0)
  assert.equal(lightsAt(s, s.arrive), 1)
  console.log('check-harbour-lights selftest: stray hex and rgb signal are seen, nested lights pass, fade curve holds')
  process.exit(0)
}

const lines = []
let groups = 0
for (const { id } of world.layers) {
  const svg = read(`public/media/harbour-v2/${id}.svg`)
  const bad = strays(svg)
  assert.deepEqual(bad, [], `${id}.svg: signal colour outside a lights group: ${bad.join(', ')}`)
  groups += (svg.match(/\sid="(lights-[^"]+|ship-lights)"/g) ?? []).length
}
assert.ok(groups > 0, 'no lights groups found: the instrument cannot see')
lines.push(`${world.layers.length} rendered planes, ${groups} lights groups, 0 signal outside them`)

// Every lights group in the planes belongs to a stop, so none is left dark for the whole track.
const quayWater = ['03-quay', '04-water'].map((id) => read(`public/media/harbour-v2/${id}.svg`)).join('\n')
const known = new Set(STOPS.flatMap((s) => lightsIds(s.station)))
for (const [, id] of quayWater.matchAll(/\sid="(lights-[^"]+)"/g)) assert.ok(known.has(id), `${id}: no stop fades it up`)

const stage = read('components/harbour/HarbourStage.tsx')
assert.match(stage, /world\.route\.id \? styles\.planeHidden/, 'the route plane (drawn in signal) must render hidden')
const css = read('components/harbour/harbour.module.css')
assert.match(css, /\.plane :global\(\[id\^='lights-'\]\)\s*\{\s*opacity:\s*0;/, 'lights groups must start dark')

for (const stop of STOPS) {
  let prev = 0
  for (let k = 0; k <= 200; k++) {
    const x = (TRACK_SCREENS * k) / 200
    const v = lightsAt(stop, x)
    assert.ok(v >= prev - 1e-12, `${stop.station}: lights dim at ${x.toFixed(2)} screens`)
    prev = v
  }
  assert.equal(lightsAt(stop, stop.arrive - LIGHTS_SCREENS), 0, `${stop.station}: lit before its push-in`)
  assert.equal(lightsAt(stop, stop.arrive), 1, `${stop.station}: not fully lit at arrive`)
  assert.equal(lightsAt(stop, TRACK_SCREENS), 1, `${stop.station}: not lit at the track end`)
  lines.push(`${stop.station}: dark until ${(stop.arrive - LIGHTS_SCREENS).toFixed(1)}, full at ${stop.arrive}, on to ${TRACK_SCREENS}`)
}
console.log(`check-harbour-lights: ${lines.join('; ')}`)
