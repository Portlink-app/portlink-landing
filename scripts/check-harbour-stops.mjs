// The One Harbour stop gate (DIRECTION.md 12.4, 12.8 WP4): at every station stop the camera and the
// ship rest on the station from arrive to depart, desktop and phone; every lifted capture exists,
// holds for at least 0,7 screens between its lift and its pull-back, and is laid out at least 55 % of
// the viewport wide (the --ds-capture-hold-min token). --selftest proves the instrument sees a miss:
// a 0,6 hold and a 50vw token must fail, the shipped values must pass.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DESKTOP, PHONE, cameraAt } from '../components/harbour/camera.ts'
import { ROUTE_LENGTH } from '../components/harbour/route.ts'
import { CAPTURES, LIFT_SCREENS, STOPS, holdScreens, liftAt } from '../components/harbour/script.ts'

const world = JSON.parse(readFileSync(new URL('../public/media/harbour-v2/world.json', import.meta.url), 'utf8'))
const tokens = readFileSync(new URL('../components/harbour/harbour-tokens.css', import.meta.url), 'utf8')
const MIN_HOLD = 0.7
const MIN_VW = 55

const tokenVw = (css) => {
  const m = css.match(/--ds-capture-hold-min:\s*([\d.]+)vw/)
  assert.ok(m, 'no --ds-capture-hold-min in vw')
  return Number(m[1])
}
const holdOk = (stop) => holdScreens(stop) >= MIN_HOLD - 1e-9

if (process.argv.includes('--selftest')) {
  const short = { ...STOPS[1], depart: STOPS[1].arrive + 0.6 + 2 * LIFT_SCREENS }
  assert.ok(!holdOk(short), 'selftest: a 0,6 hold should fail')
  assert.ok(tokenVw('--ds-capture-hold-min: 50vw;') < MIN_VW, 'selftest: a 50vw token should fail')
  assert.ok(tokenVw(tokens) >= MIN_VW, 'selftest: the shipped token should pass')
  const s = STOPS[0]
  assert.equal(liftAt(s, s.arrive - 0.1), 0)
  assert.equal(liftAt(s, (s.arrive + s.depart) / 2), 1)
  assert.equal(liftAt(s, s.depart + 0.1), 0)
  console.log('check-harbour-stops selftest: a 0,6 hold and a 50vw floor are seen, lift curve holds')
  process.exit(0)
}

assert.ok(tokenVw(tokens) >= MIN_VW, `--ds-capture-hold-min ${tokenVw(tokens)}vw is under ${MIN_VW}vw`)
const lines = []
for (const stop of STOPS) {
  const st = world.stations[stop.station]
  assert.ok(st, `${stop.station}: no such station`)
  if (stop.capture) {
    assert.ok(CAPTURES[stop.capture]?.desktop, `${stop.station}: capture ${stop.capture} missing`)
    assert.ok(holdOk(stop), `${stop.station}: hold ${holdScreens(stop).toFixed(2)} under ${MIN_HOLD}`)
  }
  for (const [name, rows] of [['desktop', DESKTOP], ['phone', PHONE]]) {
    for (let k = 0; k <= 10; k++) {
      const at = stop.arrive + ((stop.depart - stop.arrive) * k) / 10
      const r = cameraAt(at, rows)
      const tMiss = Math.abs(r.t - st.t) * ROUTE_LENGTH
      assert.ok(tMiss < 1, `${name} ${stop.station} at ${at.toFixed(2)}: ship ${tMiss.toFixed(2)} units off the station`)
      if (name === 'desktop') {
        assert.ok(Math.abs(r.cx - rows.find((x) => x.at === stop.arrive).cx) < 1e-6, `${name} ${stop.station}: camera moves during the stop`)
      }
    }
    assert.ok(rows.some((x) => x.at === stop.arrive) && rows.some((x) => x.at === stop.depart), `${name} ${stop.station}: no camera rows at arrive and depart`)
  }
  lines.push(`${stop.station} ${stop.capture ?? 'none'} hold ${holdScreens(stop).toFixed(2)}`)
}
console.log(`check-harbour-stops: ${STOPS.length} stops rest on their stations desktop and phone; ${lines.join(', ')}; floor ${tokenVw(tokens)}vw`)
