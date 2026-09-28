'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { hasGpc, parseChoices, readConsentKey, subscribe, type Choices } from '@/lib/consent'

/** The visitor's current choices, live across every component that shows them. Null until chosen. */
export function useConsent(): { choices: Choices | null; gpc: boolean } {
  const key = useSyncExternalStore(subscribe, readConsentKey, () => 'unset')
  const gpc = useSyncExternalStore(subscribe, hasGpc, () => false)
  const choices = useMemo(() => parseChoices(key), [key])
  return { choices, gpc }
}
