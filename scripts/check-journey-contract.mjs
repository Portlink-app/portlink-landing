import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { customerBrand } from '../lib/customer-brand.ts'
import { demoRecord, topics } from '../components/acquisition/journey-content.ts'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8')

for (const audience of ['cruise', 'agent', 'tour']) {
  for (const topic of topics.platform) {
    const record = demoRecord('platform', audience, topic.id, false)
    assert.ok(record.title && record.rows.length && record.action)
    if (topic.id === 'planning' && audience !== 'cruise') assert.ok(record.unavailable)
    else if (topic.id === 'accounts' && audience === 'tour') assert.ok(record.unavailable)
    else assert.equal(record.unavailable, undefined)
    if (topic.id === 'coordination') {
      assert.ok(record.title.includes(audience === 'tour' ? 'Shore quote' : 'Service record'))
    }
  }
}

assert.equal(new Set(topics.embark.map((t) => demoRecord('embark', 'operator', t.id, false).action)).size, 3)

for (let n = 0; n <= 255; n += 5) {
  const hex = '#' + n.toString(16).padStart(2, '0').repeat(3)
  const brand = customerBrand(hex)
  assert.equal(brand.requested, hex)
  assert.equal(brand.effective, hex)
  assert.ok(brand.contrast >= 4.5)
}
for (const hex of ['#ffffff', '#000000', '#00ff00', '#ff0000', '#0000ff', '#965a28', '#be4412', '#0f766e']) {
  assert.ok(customerBrand(hex).contrast >= 4.5)
}

// Verify Stage 2 Spatial Expedition Hero on / + Stage 1 D14 restoration + personalisation bar + topic deep-links
const homePage = read('app/page.tsx')
assert.ok(homePage.includes('<AcquisitionOpening page="company" />'), 'app/page.tsx must mount <AcquisitionOpening page="company" />')
assert.ok(homePage.includes('<FilmHero mediaOnly />'), 'app/page.tsx must mount <FilmHero mediaOnly />')

const portlinkPage = read('app/(product)/portlink/page.tsx')
for (const token of [
  'id="overview"',
  'id="live-record"',
  'id="voyage-ais"',
  'id="gangway-signoff"',
  'id="pda-fda"',
  'id="demo"',
  '<ProductPersonalisationBar',
  '<PortlinkLiveWorkspaceSample />',
  'PORTLINK_D14_ASSETS.ch1Hero.desktop',
  'PORTLINK_D14_ASSETS.ch3VoyageAis.filmBase',
  'PORTLINK_D14_ASSETS.ch4GangwaySignoff.mobile',
  '<PortlinkPdaFdaDiffSample />',
  'PORTLINK_D14_ASSETS.ch6Deployment.desktop',
  'topicId="planning"',
  'topicId="coordination"',
  'topicId="accounts"',
]) {
  assert.ok(portlinkPage.includes(token), `app/(product)/portlink/page.tsx missing required D14 token: ${token}`)
}

const embarkPage = read('app/(product)/embark/page.tsx')
for (const token of [
  'id="hero"',
  'id="quay-checkin"',
  'id="dispatch"',
  'id="paid-before"',
  'id="cruise-bridge"',
  'id="demo"',
  '/brand/embark-lockup.svg',
  '<ProductPersonalisationBar',
  '<EmbarkQuayCheckInSample />',
  'EMBARK_D14_ASSETS.ch1Hero.desktop',
  'EMBARK_D14_ASSETS.ch3DispatchRoster.filmBase',
  'EMBARK_D14_ASSETS.ch4WidgetInvoicing.desktop',
  '<EmbarkCruiseTradeBridge />',
  'EMBARK_D14_ASSETS.ch6OperatorOverview.desktop',
  'topicId="capacity"',
  'topicId="departures"',
  'topicId="bookings"',
]) {
  assert.ok(embarkPage.includes(token), `app/(product)/embark/page.tsx missing required D14 token: ${token}`)
}

const fragmentSrc = read('components/acquisition/ProductFragment.tsx')
for (const token of [
  'PORTLINK_D14_ASSETS',
  'EMBARK_D14_ASSETS',
  'PortlinkLiveWorkspaceSample',
  'PortlinkPdaFdaDiffSample',
  'EmbarkQuayCheckInSample',
  'EmbarkCruiseTradeBridge',
]) {
  assert.ok(fragmentSrc.includes(token), `ProductFragment.tsx missing D14 stage integration: ${token}`)
}

console.log('journey contract: audience/topic authority, contrast, 6-chapter D14 restoration, personalisation bar, and 6 topic stages pass')
