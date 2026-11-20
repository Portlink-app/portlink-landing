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
// DIRECTION.md 12.9 rim light: a hero surface (the ship, the quay cranes) carries a 1 to 2 unit Low
// sun edge on its sun side. Inside a hero group, signal is admitted only as a hairline stroke: no
// signal fill, and a stroke-width of at most 2 on the same element. A signal fill there still fails.
const HERO = /^(ship(-[A-Za-z0-9-]+)?|quay-crane-[A-Za-z0-9-]+)$/
const rimEdge = (attrs) => {
  if (SIGNAL.test(attrs.match(/\sfill="([^"]*)"/i)?.[1] ?? '')) return false
  if (/style="/i.test(attrs)) return false
  const w = Number(attrs.match(/\sstroke-width="([\d.]+)"/)?.[1])
  return SIGNAL.test(attrs.match(/\sstroke="([^"]*)"/i)?.[1] ?? '') && w > 0 && w <= 2
}

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
    const hero = HERO.test(id) || stack.some((s) => HERO.test(s))
    if (!lit && SIGNAL.test(attrs) && !(hero && rimEdge(attrs))) out.push(`${tag}#${id}@${svg.slice(0, m.index).split('\n').length}`)
    if (!self) stack.push(id)
  }
  return out
}

if (process.argv.includes('--selftest')) {
  assert.equal(strays('<svg><g id="sea"><rect fill="#F5B53D"/></g></svg>').length, 1, 'selftest: stray fill should fail')
  assert.equal(strays('<svg><path style="stroke: rgb(245, 181, 61)"/></svg>').length, 1, 'selftest: stray rgb should fail')
  assert.equal(strays('<svg><g id="lights-A2"><g><rect fill="#f5b53d"/></g></g></svg>').length, 0, 'selftest: nested light should pass')
  assert.equal(strays('<svg><g id="ship-lights"><path stroke="#f5b53d"/></g><rect fill="#f5b53e"/></svg>').length, 0)
  assert.equal(strays('<svg><g id="quay-crane-portal"><g fill="none" stroke="#f5b53d" stroke-width="1.5"/></g></svg>').length, 0, 'selftest: rim edge on a hero should pass')
  assert.equal(strays('<svg><g id="quay-crane-portal"><rect fill="#f5b53d"/></g></svg>').length, 1, 'selftest: signal fill on a hero should fail')
  assert.equal(strays('<svg><g id="ship"><path stroke="#f5b53d" stroke-width="3"/></g></svg>').length, 1, 'selftest: a thick signal stroke on a hero should fail')
  assert.equal(strays('<svg><g id="quay-wall"><path fill="none" stroke="#f5b53d" stroke-width="1.5"/></g></svg>').length, 1, 'selftest: a rim edge off a hero should fail')
  const s = STOPS[1]
  assert.equal(lightsAt(s, s.arrive - LIGHTS_SCREENS - 0.01), 0)
  assert.equal(lightsAt(s, s.arrive), 1)
  console.log('check-harbour-lights selftest: stray hex and rgb signal are seen, nested lights pass, hero rim edges pass and hero fills fail, fade curve holds')
  process.exit(0)
}

const lines = []
let groups = 0
for (const { id } of world.layers) {
  const svg = read(`public/media/harbour-v2/${id}.svg`)
  const bad = strays(svg)
  assert.deepEqual(bad, [], `${id}.svg: signal colour outside a lights group or a hero rim edge: ${bad.join(', ')}`)
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
