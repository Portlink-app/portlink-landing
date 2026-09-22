'use client'

import { useState } from 'react'
import { Check, Link2, Share2 } from 'lucide-react'
import styles from './havn.module.css'

/**
 * Share the page. On a phone this opens the system share sheet (Messages, mail, Teams, whatever
 * they use); where the Web Share API is absent it copies the link and says so. Never a mailto:
 * the respondents decide the channel.
 */
export default function ShareButton({ title, text }: { title: string; text: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'shared'>('idle')

  async function share() {
    const url = window.location.href.split('#')[0]
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ title, text, url })
        setState('shared')
      } else {
        await navigator.clipboard.writeText(url)
        setState('copied')
      }
    } catch {
      // Dismissed share sheet or blocked clipboard: nothing to report, the button stays usable.
      return
    }
    window.setTimeout(() => setState('idle'), 2400)
  }

  const label = state === 'copied' ? 'Lenke kopiert' : state === 'shared' ? 'Delt' : 'Del siden'
  const Icon = state === 'idle' ? Share2 : state === 'copied' ? Link2 : Check

  return (
    <button type="button" className={styles.share} onClick={share} aria-live="polite">
      <Icon size={16} aria-hidden="true" /> {label}
    </button>
  )
}
