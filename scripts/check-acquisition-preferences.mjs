import assert from 'node:assert/strict'
import {
  defaultPreferences, validatePreferences, encodePreferences, decodePreferences,
  preferenceKey, readPreferences, savePreferences, resetPreferences, PREFERENCE_MAX_AGE_MS,
} from '../lib/acquisition-preferences.ts'

const now = 1_000_000_000
const input = { companyName: '  Northern Coast  ', brandColor: '#A45C20', audience: 'agent',
  workspaceId: 'other-tenant', bookings: [{ paid: true }], entitlement: 'admin', logo: 'data:payload' }
const expected = { companyName: 'Northern Coast', brandColor: '#a45c20', audience: 'agent' }
assert.deepEqual(validatePreferences(input), expected)
for (const product of ['platform', 'embark']) {
  assert.deepEqual(decodePreferences(product, encodePreferences(product, input, now), now), expected)
  assert.deepEqual(validatePreferences(defaultPreferences(product)), defaultPreferences(product))
}
for (const audience of ['cruise', 'agent', 'tour', 'operator']) {
  assert.equal(validatePreferences({ ...input, audience }).audience, audience)
}
for (const invalid of [null, [], 'text', {}, { ...input, audience: '__proto__' },
  { ...input, companyName: '<script>bad</script>' }, { ...input, companyName: 'a'.repeat(101) },
  { ...input, companyName: 'Name\u202e' }, { ...input, companyName: 'Name\nNext' },
  { ...input, brandColor: 'url(https://example.test)' }, { ...input, brandColor: '#12345' },
  { ...input, brandColor: '#ffffff00' }, { ...input, brandColor: 123 }]) {
  assert.equal(validatePreferences(invalid), null)
}
assert.equal(validatePreferences({ ...input, companyName: 'Cafe\u0301' }).companyName, 'Café')
const raw = encodePreferences('platform', input, now)
assert.equal(decodePreferences('embark', raw, now), null)
assert.equal(decodePreferences('platform', raw, now - 1), null)
assert.equal(decodePreferences('platform', raw, now + PREFERENCE_MAX_AGE_MS), null)
assert.deepEqual(decodePreferences('platform', raw, now + PREFERENCE_MAX_AGE_MS - 1), expected)
for (const invalid of ['{', 'null', '[]', 'x'.repeat(1025), raw.replace('"version":1', '"version":2')]) {
  assert.equal(decodePreferences('platform', invalid, now), null)
}
for (const invalidTime of [NaN, Infinity, -1, 0.5]) {
  assert.equal(encodePreferences('platform', input, invalidTime), null)
  assert.equal(decodePreferences('platform', raw, invalidTime), null)
}
const records = new Map()
const storage = () => ({
  getItem: key => records.get(key) ?? null,
  setItem: (key, value) => records.set(key, value),
  removeItem: key => records.delete(key),
})
assert.equal(savePreferences('platform', input, storage, now), true)
assert.equal(savePreferences('embark', defaultPreferences('embark'), storage, now), true)
assert.deepEqual(readPreferences('platform', storage, now), expected)
assert.deepEqual(readPreferences('embark', storage, now), defaultPreferences('embark'))
assert.equal(savePreferences('platform', { ...input, brandColor: 'invalid' }, storage, now), false)
assert.deepEqual(readPreferences('platform', storage, now), expected)
assert.equal(resetPreferences('platform', storage), true)
assert.equal(readPreferences('platform', storage, now), null)
assert.equal(records.has(preferenceKey('embark')), true)
assert.equal(records.size, 1)
const inaccessible = () => { throw new Error('Storage denied') }
const quota = () => ({ ...storage(), setItem: () => { throw new Error('Quota exceeded') } })
assert.equal(readPreferences('platform', inaccessible, now), null)
assert.equal(savePreferences('platform', input, inaccessible, now), false)
assert.equal(savePreferences('platform', input, quota, now), false)
assert.equal(resetPreferences('platform', inaccessible), false)
console.log('check:acquisition-preferences clean: validation, isolation, expiry, reset and storage denial; no network or tenant mutation.')
