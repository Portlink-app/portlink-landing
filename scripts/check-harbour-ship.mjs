// The One Harbour ship gate (DIRECTION.md 12.8 WP3): the ship sits on #route at all five stations
// within 1 world unit, at both proof keyframe sets, with the wake on only while under way and the
// chain on only at anchor at A1. --selftest proves the instrument sees a miss: the pre-WP3 camera
// value t 0.29 at A1 must fail, the station's own t must pass.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { DESKTOP, PHONE, cameraAt } from '../components/harbour/camera.ts'
import { ROUTE_LENGTH, buildRoute, routeD, shipState } from '../components/harbour/route.ts'

const world = JSON.parse(readFileSync(new URL('../public/media/harbour-v2/world.json', import.meta.url), 'utf8'))
const route = buildRoute(routeD(readFileSync(new URL('../public/media/harbour-v2/route.svg', import.meta.url), 'utf8')))
const STATIONS = ['A1', 'A2', 'A3', 'A4', 'A5']
const TOL = 1

const miss = (t, id) => {
  const p = route.at(t)
  const st = world.stations[id]
  return Math.hypot(p.x - st.x, p.y - st.y)
}

if (process.argv.includes('--selftest')) {
  assert.ok(miss(0.29, 'A1') > TOL, 'selftest: t 0.29 at A1 should miss by more than 1 unit')
  for (const id of STATIONS) assert.ok(miss(world.stations[id].t, id) <= TOL, `selftest: ${id} own t misses`)
  assert.deepEqual(shipState(world.stations.A1.t, world.stations.A1.t), { underWay: false, atAnchor: true })
  assert.deepEqual(shipState(world.stations.A3.t, world.stations.A3.t), { underWay: false, atAnchor: false })
  assert.deepEqual(shipState(0.5, 0.51), { underWay: true, atAnchor: false })
  assert.throws(() => buildRoute('M0 0Q1 1 2 2'), /unsupported/)
  console.log('check-harbour-ship selftest: a 0.29 miss is seen, station points pass, wake and chain states hold')
  process.exit(0)
}

const lenErr = Math.abs(route.length - ROUTE_LENGTH)
assert.ok(lenErr < 2, `route length ${route.length.toFixed(2)} differs from world.route.length ${ROUTE_LENGTH} by ${lenErr.toFixed(2)}`)

const worst = { d: 0, at: '' }
for (const [name, rows] of [['desktop', DESKTOP], ['phone', PHONE]]) {
  for (const id of STATIONS) {
    const st = world.stations[id]
    const stops = rows.filter((r) => Math.abs(r.t - st.t) * ROUTE_LENGTH < TOL)
    assert.ok(stops.length > 0, `${name}: no camera row stops at ${id} (t ${st.t})`)
    for (const r of stops) {
      const cam = cameraAt(r.at, rows)
      const d = miss(cam.t, id)
      assert.ok(d <= TOL, `${name}: ship at ${id} row ${r.at} is ${d.toFixed(2)} units off the station`)
      if (d > worst.d) Object.assign(worst, { d, at: `${name} ${id} @${r.at}` })
    }
  }
  // Wake: on at a mid-passage scroll, off at a stop.
  const a2 = rows.find((r) => r.t === world.stations.A2.t).at
  const mid = (rows.filter((r) => r.at < a2).at(-1).at + a2) / 2
  assert.equal(shipState(cameraAt(mid, rows).t, cameraAt(mid + 0.01, rows).t).underWay, true, `${name}: no wake under way at ${mid}`)
  const a1 = rows.find((r) => r.t === world.stations.A1.t && r.at > 0).at
  assert.deepEqual(shipState(cameraAt(a1, rows).t, cameraAt(a1 + 0.01, rows).t), { underWay: false, atAnchor: true }, `${name}: not at anchor at A1`)
}
console.log(`check-harbour-ship: route ${route.length.toFixed(2)} units (world ${ROUTE_LENGTH}), ship within ${worst.d.toFixed(3)} unit of every station (worst ${worst.at}), wake and chain states hold`)
