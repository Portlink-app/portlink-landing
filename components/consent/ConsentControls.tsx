'use client'

/**
 * The standing place to change the choice, on /privacy/#choices. Withdrawing has to be as easy as
 * giving consent, so the same two buttons sit here permanently, with the current state beside them.
 */
import { choose } from '@/lib/consent'
import { useConsent } from './useConsent'
import styles from './Consent.module.css'

const LABEL = {
  granted: 'You have allowed it.',
  denied: 'You have declined it.',
  unset: 'You have not chosen yet.',
} as const

export default function ConsentControls() {
  const { state, gpc } = useConsent()
  return (
    <div className={styles.controls} id="choices">
      <p className={styles.controlsState} aria-live="polite">
        {gpc
          ? 'Your browser sends Global Privacy Control, which we treat as a no. Nothing loads.'
          : LABEL[state]}
      </p>
      {!gpc && (
        <div className={styles.actions}>
          <button type="button" className={styles.button} aria-pressed={state === 'granted'} onClick={() => choose('granted')}>
            Allow
          </button>
          <button type="button" className={styles.button} aria-pressed={state === 'denied'} onClick={() => choose('denied')}>
            Decline
          </button>
        </div>
      )}
    </div>
  )
}
