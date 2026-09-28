'use client'

/**
 * The consent banner, mounted once in the root layout. Entry doc: docs/OSPRY.md.
 *
 * What it does, in order:
 *   1. On /seatrade/* (archived draw), or when the browser sends Global Privacy Control: nothing.
 *   2. Consent already on record: loads the tag (lib/consent.ts is the only code that can).
 *   3. No choice yet: waits for the visitor to engage, then shows the card.
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
import { choose, closeRequested, isExcludedPath, isOpenRequested, loadOspry, subscribe } from '@/lib/consent'
import { useConsent } from './useConsent'
import styles from './Consent.module.css'

const ENGAGE_MS = 12000
const ENGAGE_SCROLL = 0.6

export default function ConsentManager() {
  const pathname = usePathname()
  const { state, gpc } = useConsent()
  const [engaged, setEngaged] = useState(false)
  const [reopened, setReopened] = useState(false)
  // The path the visit started on. Reaching any other page is engagement in itself.
  const [firstPath] = useState(pathname)
  const excluded = isExcludedPath(pathname)

  useEffect(() => subscribe(() => setReopened(isOpenRequested())), [])

  useEffect(() => {
    if (!excluded && state === 'granted') loadOspry()
  }, [excluded, state])

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
    <section className={styles.banner} role="region" aria-labelledby="consent-title" aria-describedby="consent-body">
      <h2 id="consent-title" className={styles.title}>Can we see which company you are from?</h2>
      <p id="consent-body" className={styles.body}>
        With your permission, Ospry, a US service, shows us which company is visiting, what you read
        and what you send through our forms. In the US it can also name you. It helps us follow up
        only with teams who are really looking. Off unless you
        allow it. <Link href="/privacy/#choices" className={styles.more}>Details</Link>
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.button} onClick={() => choose('granted')}>Allow</button>
        <button type="button" className={styles.button} onClick={() => choose('denied')}>Decline</button>
      </div>
      {reopened && (
        <button type="button" className={styles.fine} style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer' }} onClick={closeRequested}>
          Close without changing anything
        </button>
      )}
    </section>
  )
}
