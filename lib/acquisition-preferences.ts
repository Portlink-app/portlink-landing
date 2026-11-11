/** Anonymous presentation preferences. Never workspace identity, permission or demo operations. */
export type AcquisitionProduct = 'platform' | 'embark'
export type AcquisitionAudience = 'cruise' | 'agent' | 'tour' | 'operator'
export type AcquisitionPreferences = {
  companyName: string
  brandColor: string
  audience: AcquisitionAudience
}
export type PreferenceEnvelope = {
  version: 1
  product: AcquisitionProduct
  savedAt: number
  preferences: AcquisitionPreferences
}
export const PREFERENCE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000
const MAX_RECORD_LENGTH = 1024
const audiences = new Set<string>(['cruise', 'agent', 'tour', 'operator'])

export function defaultPreferences(product: AcquisitionProduct): AcquisitionPreferences {
  return { companyName: '', brandColor: '', audience: product === 'embark' ? 'operator' : 'cruise' }
}

/** Explicit projection drops all unknown fields, including tenant IDs, prices and sample records. */
export function validatePreferences(input: unknown): AcquisitionPreferences | null {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null
  const value = input as Record<string, unknown>
  if (typeof value.companyName !== 'string' || typeof value.brandColor !== 'string' ||
      typeof value.audience !== 'string' || !audiences.has(value.audience)) return null
  const companyName = value.companyName.trim().normalize('NFC')
  // Disallow markup, bidi overrides and controls. Names remain plain text, never HTML.
  if (companyName.length > 100 || /[<>\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u.test(companyName)) return null
  const brandColor = value.brandColor.trim().toLowerCase()
  if (brandColor !== '' && !/^#[0-9a-f]{6}$/.test(brandColor)) return null
  return { companyName, brandColor, audience: value.audience as AcquisitionAudience }
}

export function preferenceKey(product: AcquisitionProduct): string {
  return `portlink:acquisition:v1:${product}`
}

export function encodePreferences(product: AcquisitionProduct, input: unknown, now: number): string | null {
  const preferences = validatePreferences(input)
  if (!preferences || !Number.isSafeInteger(now) || now < 0) return null
  return JSON.stringify({ version: 1, product, savedAt: now, preferences } satisfies PreferenceEnvelope)
}

export function decodePreferences(product: AcquisitionProduct, raw: string | null, now: number): AcquisitionPreferences | null {
  if (!raw || raw.length > MAX_RECORD_LENGTH || !Number.isSafeInteger(now) || now < 0) return null
  try {
    const envelope = JSON.parse(raw) as Partial<PreferenceEnvelope> | null
    if (!envelope || envelope.version !== 1 || envelope.product !== product ||
        !Number.isSafeInteger(envelope.savedAt) || typeof envelope.savedAt !== 'number' ||
        envelope.savedAt < 0 || envelope.savedAt > now || now - envelope.savedAt >= PREFERENCE_MAX_AGE_MS) return null
    return validatePreferences(envelope.preferences)
  } catch { return null }
}

type PreferenceStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>
// Resolve storage inside the try: merely accessing window.localStorage can throw.
export function readPreferences(product: AcquisitionProduct, storage: () => PreferenceStorage, now = Date.now()): AcquisitionPreferences | null {
  try { return decodePreferences(product, storage().getItem(preferenceKey(product)), now) }
  catch { return null }
}

export function savePreferences(product: AcquisitionProduct, input: unknown, storage: () => PreferenceStorage, now = Date.now()): boolean {
  const encoded = encodePreferences(product, input, now)
  if (!encoded) return false
  try { storage().setItem(preferenceKey(product), encoded); return true }
  catch { return false }
}

export function resetPreferences(product: AcquisitionProduct, storage: () => PreferenceStorage): boolean {
  try { storage().removeItem(preferenceKey(product)); return true }
  catch { return false }
}
