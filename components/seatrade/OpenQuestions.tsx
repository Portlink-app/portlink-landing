'use client'

import { useState, type CSSProperties, type FormEvent } from 'react'
import { Check, MessageSquareText } from 'lucide-react'
import { OPEN_ANSWER_MAX, OPEN_QUESTIONS, type OpenQuestionId } from '@/lib/seatrade/openQuestions'

/**
 * The two open questions, shown only on the "sent" screen.
 *
 * Everything about this component assumes the entry is already secured: it appears after the
 * scorecard has been mailed, so both boxes are optional in the sense that matters - a blank
 * answer costs nobody an entry, and a failure to save says so without implying anything about
 * the draw. The send button IS inert while both boxes are empty, because there is nothing to
 * send; that is a property of this form, never a condition on the draw.
 */
export default function OpenQuestions({ leadId }: { leadId: string }) {
  const [values, setValues] = useState<Record<OpenQuestionId, string>>({ friction: '', wish: '' })
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const empty = OPEN_QUESTIONS.every(q => !values[q.id].trim())

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (empty || state === 'saving') return
    setState('saving')
    try {
      const res = await fetch('/api/seatrade/notes/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ t: leadId, answers: values }),
      })
      const data = (await res.json()) as { ok?: boolean }
      if (!res.ok || !data.ok) throw new Error('save failed')
      setState('saved')
    } catch {
      setState('error')
    }
  }

  if (state === 'saved') {
    return (
      <div style={{ ...card, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <span style={{ color: 'var(--ds-success)', flexShrink: 0, marginTop: 2 }}><Check size={20} /></span>
        <p style={{ margin: 0, fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Thank you. That goes straight to David, and it is the kind of detail a score cannot carry.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={send} style={card}>
      <h2 style={{ fontSize: 'clamp(1.1rem, 4vw, 1.3rem)', fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <MessageSquareText size={20} color="var(--brand)" /> Two questions, if you have a minute
      </h2>
      <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 var(--ds-gap-5)' }}>
        Optional, and nothing here changes your entry. It is already in.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {OPEN_QUESTIONS.map(q => (
          <label key={q.id} style={{ fontSize: 'var(--ds-text-sm)', fontWeight: 500, color: 'var(--text-primary)', lineHeight: 1.45 }}>
            {q.label}
            <textarea
              value={values[q.id]}
              onChange={e => setValues(v => ({ ...v, [q.id]: e.target.value }))}
              maxLength={OPEN_ANSWER_MAX}
              rows={3}
              placeholder={q.placeholder}
              style={textarea}
            />
          </label>
        ))}
      </div>

      {state === 'error' && (
        <p role="alert" style={{ color: 'var(--danger)', fontSize: 'var(--ds-text-sm)', margin: '14px 0 0', lineHeight: 1.55 }}>
          That did not save. Your entry is not affected. Try once more, or just reply to the email.
        </p>
      )}

      <button type="submit" disabled={empty || state === 'saving'} style={{ ...button, opacity: empty || state === 'saving' ? 0.5 : 1, cursor: empty || state === 'saving' ? 'not-allowed' : 'pointer' }}>
        {state === 'saving' ? 'Sending…' : 'Send these too'}
      </button>
    </form>
  )
}

const card: CSSProperties = {
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--ds-radius-xl)',
  padding: 'var(--ds-gap-6)',
  marginTop: 'var(--ds-gap-5)',
}

const textarea: CSSProperties = {
  width: '100%',
  marginTop: 8,
  background: 'var(--surface-plain)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--ds-radius-md)',
  padding: '12px 14px',
  fontSize: 16, // 16px keeps iOS Safari from zooming the page on focus
  fontFamily: 'inherit',
  lineHeight: 1.55,
  outline: 'none',
  boxSizing: 'border-box',
  resize: 'vertical',
  minHeight: 88,
}

const button: CSSProperties = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  marginTop: 'var(--ds-gap-5)',
  background: 'transparent',
  color: 'var(--text-secondary)',
  border: '1px solid var(--border)',
  borderRadius: 'var(--ds-radius-pill)',
  padding: '14px 24px',
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'inherit',
  minHeight: 52,
}
