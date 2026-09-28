'use client'

import { useSyncExternalStore } from 'react'
import { hasGpc, readConsent, subscribe, type ConsentState } from '@/lib/consent'

/** The visitor's current choice, live across every component that shows it. 'unset' on the server. */
export function useConsent(): { state: ConsentState; gpc: boolean } {
  const state = useSyncExternalStore(subscribe, readConsent, () => 'unset' as const)
  const gpc = useSyncExternalStore(subscribe, hasGpc, () => false)
  return { state, gpc }
}
