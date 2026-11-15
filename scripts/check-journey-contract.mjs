import assert from 'node:assert/strict'
import { customerBrand } from '../lib/customer-brand.ts'
import { demoRecord, topics } from '../components/acquisition/journey-content.ts'
for (const audience of ['cruise','agent','tour']) for (const topic of topics.platform) {
  const record = demoRecord('platform', audience, topic.id, false)
  assert.ok(record.title && record.rows.length && record.action)
  if (topic.id === 'planning' && audience !== 'cruise') assert.ok(record.unavailable)
  else if (topic.id === 'accounts' && audience === 'tour') assert.ok(record.unavailable)
  else assert.equal(record.unavailable, undefined)
  if (topic.id === 'coordination') assert.ok(record.title.includes(audience === 'tour' ? 'Shore quote' : 'Service record'))
}
assert.equal(new Set(topics.embark.map(t => demoRecord('embark','operator',t.id,false).action)).size,3)
for (let n=0;n<=255;n+=5) {
  const hex='#'+n.toString(16).padStart(2,'0').repeat(3)
  const brand=customerBrand(hex); assert.equal(brand.requested,hex); assert.equal(brand.effective,hex); assert.ok(brand.contrast>=4.5)
}
for (const hex of ['#ffffff','#000000','#00ff00','#ff0000','#0000ff','#965a28']) assert.ok(customerBrand(hex).contrast>=4.5)
console.log('journey contract: audience/topic authority and requested/effective contrast pass')
