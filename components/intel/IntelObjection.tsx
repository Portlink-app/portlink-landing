'use client'

/**
 * The objection to company-level recording, on /privacy/. One click, as easy as the recording is
 * invisible. Sets the strictly necessary cookie `pl_optout`, which the tracker and the collector
 * both honour (lib/intel/client.ts, app/api/intel/v/route.ts).
 */
import { useSyncExternalStore } from 'react'
import { hasObjected, setObjection } from '@/lib/intel/client'
import styles from '@/components/consent/Consent.module.css'

const listeners = new Set<() => void>()
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l) }

export default function IntelObjection() {
  const objected = useSyncExternalStore(subscribe, hasObjected, () => false)
  const gpc = useSyncExternalStore(subscribe, () => !!(navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl, () => false)
  const toggle = () => { setObjection(!objected); listeners.forEach((l) => l()) }
  return (
    <div className={styles.controls} id="objection">
      <p className={styles.controlsState} aria-live="polite">
        {gpc
          ? 'Your browser sends Global Privacy Control, so your visits are not recorded.'
          : objected
            ? 'You have objected. Your visits from this browser are not recorded.'
            : 'Your visits are recorded at company level, as described above.'}
      </p>
      {!gpc && (
        <button type="button" className={styles.button} onClick={toggle}>
          {objected ? 'Allow company-level recording again' : 'Do not record my visits'}
        </button>
      )}
    </div>
  )
}
