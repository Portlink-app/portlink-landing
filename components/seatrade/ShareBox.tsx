'use client'

import { useState, type CSSProperties } from 'react'
import { Check, Copy, Link2, Mail, Share2 } from 'lucide-react'

/**
 * The invitation link with the ways people actually share on a show floor: the phone's own share
 * sheet, WhatsApp, LinkedIn, email, or copy. The code is shown big enough to read out loud.
 */
export default function ShareBox({ url, code, prize }: { url: string; code: string; prize: string }) {
  const [copied, setCopied] = useState(false)
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const message = `What is your port call friction score? Seven taps, about a minute, and you are in the draw for ${prize} at Seatrade Med: ${url}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch { /* clipboard blocked: the link is selectable below */ }
  }

  const share = async () => {
    try { await navigator.share({ title: 'Port call friction score', text: message, url }) } catch { /* dismissed */ }
  }

  const btn: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 44, padding: '10px 14px', borderRadius: 'var(--ds-radius-pill)',
    border: '1px solid var(--border)', background: 'var(--surface-plain)', color: 'var(--text-primary)',
    fontFamily: 'inherit', fontSize: 'var(--ds-text-sm)', fontWeight: 600, textDecoration: 'none', cursor: 'pointer',
  }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-5)' }}>
      <p style={{ margin: '0 0 4px', fontSize: 'var(--ds-text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)', color: 'var(--text-muted)', fontWeight: 600 }}>Your invitation link</p>
      <p style={{ margin: '0 0 10px', fontFamily: 'var(--ds-font-mono)', fontSize: 'var(--ds-text-sm)', wordBreak: 'break-all', color: 'var(--text-primary)' }}>{url}</p>
      <p style={{ margin: '0 0 14px', fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)' }}>
        Code to read out: <strong style={{ fontFamily: 'var(--ds-font-mono)', fontSize: '1.05rem', letterSpacing: '0.08em', color: 'var(--text-primary)' }}>{code}</strong>
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {canShare && (
          <button type="button" onClick={share} style={{ ...btn, background: 'var(--brand)', color: 'var(--ds-primary-ink)', border: 'none' }}>
            <Share2 size={16} /> Share
          </button>
        )}
        <button type="button" onClick={copy} style={btn} aria-live="polite">
          {copied ? <Check size={16} color="var(--ds-success)" /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy link'}
        </button>
        <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" style={btn}><Link2 size={16} /> WhatsApp</a>
        <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" style={btn}><Link2 size={16} /> LinkedIn</a>
        <a href={`mailto:?subject=${encodeURIComponent('What is your port call friction score?')}&body=${encodeURIComponent(message)}`} style={btn}><Mail size={16} /> Email</a>
      </div>
    </div>
  )
}
