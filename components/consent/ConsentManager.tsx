'use client'

/**
 * The consent banner, mounted once in the root layout. Entry doc: docs/OSPRY.md.
 *
 * What it does, in order:
 *   1. On /seatrade/* (archived draw), or when the browser sends Global Privacy Control: nothing.
 *   2. A choice already on record: loads the allowed tags (lib/consent.ts is the only code that can).
 *   3. No choice yet: waits for the visitor to engage, then shows the card. First layer: one
 *      sentence, Accept all and Reject all as equals, and Settings. Settings swaps the card to the
 *      per-category switches (ConsentPreferences), the same component /privacy/ uses.
 *   4. The footer's "Cookie settings" and the privacy page reopen it through requestOpen().
 *
 * WHY IT WAITS (see docs/OSPRY.md, "Consent design"). Nothing of Ospry's loads before a yes, so
 * the timing of the question is free, and asking a visitor who has just arrived and knows nothing
 * about us yet is asking at the moment trust is lowest. The card appears after a first real sign
 * of interest: a scroll past most of the first screen, a second page, or ENGAGE_MS on the page.
 */
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { allChoices, choose, closeRequested, isExcludedPath, isOpenRequested, loadAllowed, subscribe } from '@/lib/consent'
import ConsentPreferences from './ConsentPreferences'
import { useConsent } from './useConsent'
import styles from './Consent.module.css'

const ENGAGE_MS = 12000
const ENGAGE_SCROLL = 0.6

export default function ConsentManager() {
  const pathname = usePathname()
  const { choices, gpc } = useConsent()
  const state = choices ? 'chosen' : 'unset'
  const [layer, setLayer] = useState<'first' | 'settings'>('first')
  const [engaged, setEngaged] = useState(false)
  const [reopened, setReopened] = useState(false)
  // The path the visit started on. Reaching any other page is engagement in itself.
  const [firstPath] = useState(pathname)
  const excluded = isExcludedPath(pathname)

  useEffect(() => subscribe(() => setReopened(isOpenRequested())), [])

  useEffect(() => {
    if (!excluded && choices) loadAllowed()
  }, [excluded, choices])

  // Reopening from the footer goes straight to the switches: that is what the visitor came for.
  useEffect(() => { if (reopened) setLayer('settings') }, [reopened])

  // Engagement: a second page counts at once; otherwise scroll depth or time on page.
  const secondPage = pathname !== firstPath
  useEffect(() => {
    if (engaged || secondPage || excluded || state !== 'unset' || gpc) return
    const onScroll = () => { if (window.scrollY > window.innerHeight * ENGAGE_SCROLL) setEngaged(true) }
    const timer = window.setTimeout(() => setEngaged(true), ENGAGE_MS)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.clearTimeout(timer); window.removeEventListener('scroll', onScroll) }
  }, [engaged, secondPage, excluded, state, gpc])

  const visible = !excluded && !gpc && (reopened || (state === 'unset' && (engaged || secondPage)))
  if (!visible) return null

  return (
    <section className={styles.banner} role="region" aria-labelledby="consent-title">
      {layer === 'first' ? (
        <>
          <p id="consent-title" className={styles.lead}>
            Optional cookies let a US partner show us which company is visiting. Nothing optional
            runs until you choose.
          </p>
          <div className={styles.actions}>
            <button type="button" className={styles.button} onClick={() => choose(allChoices(true))}>Accept all</button>
            <button type="button" className={styles.button} onClick={() => choose(allChoices(false))}>Reject all</button>
          </div>
          <button type="button" className={styles.link} onClick={() => setLayer('settings')}>Settings</button>
        </>
      ) : (
        <>
          <h2 id="consent-title" className={styles.title}>Cookie settings</h2>
          <ConsentPreferences key={JSON.stringify(choices)} idPrefix="banner" />
          <p className={styles.fine}>
            More in our <Link href="/privacy/#choices" className={styles.more}>privacy notice</Link>.
            {reopened && (
              <>
                {' '}
                <button type="button" className={styles.link} onClick={closeRequested}>Close without changing anything</button>
              </>
            )}
          </p>
        </>
      )}
    </section>
  )
}
