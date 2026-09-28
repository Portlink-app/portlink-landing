'use client'

/**
 * The standing place to change the choice, on /privacy/#choices. Withdrawing has to be as easy as
 * giving consent, so the same settings layer as the banner sits here permanently.
 */
import ConsentPreferences from './ConsentPreferences'
import { useConsent } from './useConsent'
import styles from './Consent.module.css'

export default function ConsentControls() {
  const { choices, gpc } = useConsent()
  return (
    <div className={styles.controls} id="choices">
      <p className={styles.controlsState} aria-live="polite">
        {gpc
          ? 'Your browser sends Global Privacy Control, which we treat as a no to everything optional. Nothing loads.'
          : choices
            ? 'Your current choices are below. Change them at any time.'
            : 'You have not chosen yet.'}
      </p>
      {/* key: re-seed the switches from the stored choice whenever it changes elsewhere */}
      {!gpc && <ConsentPreferences key={JSON.stringify(choices)} idPrefix="privacy" />}
    </div>
  )
}
