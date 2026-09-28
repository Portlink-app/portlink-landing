'use client'

/**
 * The settings layer: one row per category with its own switch, plus the strictly necessary row
 * that cannot be switched off. Rendered inside the banner (after "Settings") and permanently on
 * /privacy/#choices, so there is one set of code for both places.
 */
import { useRef, useState } from 'react'
import { CATEGORIES, allChoices, choose, type CategoryId, type Choices } from '@/lib/consent'
import { useConsent } from './useConsent'
import styles from './Consent.module.css'

export default function ConsentPreferences({ idPrefix }: { idPrefix: string }) {
  const { choices } = useConsent()
  // Nothing optional is switched on until the visitor turns it on.
  const [draft, setDraft] = useState<Choices>(() => choices ?? allChoices(false))
  // Save reads the ref, not the render's copy, so a Save pressed in the same moment as a switch
  // (a fast double tap, assistive tech) always stores what the switches show.
  const latest = useRef(draft)
  const toggle = (id: CategoryId) => {
    latest.current = { ...latest.current, [id]: !latest.current[id] }
    setDraft(latest.current)
  }

  return (
    <div>
      <ul className={styles.list}>
        <li className={styles.row}>
          <div>
            <p className={styles.rowName} id={`${idPrefix}-necessary`}>Necessary</p>
            <p className={styles.rowText}>Remembers the choice you make here, in our own cookie pl_consent.</p>
          </div>
          <span className={styles.always}>Always on</span>
        </li>
        {CATEGORIES.map((c) => (
          <li key={c.id} className={styles.row}>
            <div>
              <p className={styles.rowName} id={`${idPrefix}-${c.id}`}>{c.name}</p>
              <p className={styles.rowText}>{c.description}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={draft[c.id]}
              aria-labelledby={`${idPrefix}-${c.id}`}
              className={styles.switch}
              onClick={() => toggle(c.id)}
            >
              <span className={styles.knob} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => choose(latest.current)}>Save choices</button>
        <button type="button" className={styles.button} onClick={() => choose(allChoices(true))}>Accept all</button>
      </div>
    </div>
  )
}
