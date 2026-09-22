'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { GROUPS, QUESTIONS } from '@/lib/havn/questions'
import ShareButton from './ShareButton'
import styles from './havn.module.css'

/**
 * The answer sheet. Built for three people in a car on a phone with patchy coverage: every
 * keystroke is saved to localStorage, the page can be closed and reopened, and nothing leaves the
 * phone until the one button at the bottom is pressed. A failed send keeps the draft and says so.
 */
const KEY = 'portlink-havn-v1'
type Phase = 'edit' | 'sending' | 'sent'

export default function Sporsmal() {
  const [who, setWho] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [website, setWebsite] = useState('') // honeypot
  const [phase, setPhase] = useState<Phase>('edit')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [loaded, setLoaded] = useState(false)
  const timer = useRef<number | null>(null)

  // Restore the draft after mount, from a task rather than synchronously in the effect body, so the
  // server-rendered empty form and the first client render agree (no hydration mismatch) and the
  // restore is one state update, not a cascade. Storage can be blocked (private mode, cleared
  // data): the page still works, it just starts empty.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(KEY)
        if (raw) {
          const d = JSON.parse(raw) as { who?: string; answers?: Record<string, string> }
          if (typeof d.who === 'string') setWho(d.who)
          if (d.answers && typeof d.answers === 'object') setAnswers(d.answers)
        }
      } catch { /* storage blocked */ }
      setLoaded(true)
    }, 0)
    return () => window.clearTimeout(id)
  }, [])

  // Save the draft, debounced. Never before the restore, or an empty state would overwrite it.
  useEffect(() => {
    if (!loaded) return
    if (timer.current) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(KEY, JSON.stringify({ who, answers }))
        setSavedAt(new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }))
      } catch { /* storage blocked */ }
    }, 400)
  }, [who, answers, loaded])

  const answered = useMemo(() => QUESTIONS.filter((q) => (answers[q.id] ?? '').trim()).length, [answers])
  const total = QUESTIONS.length

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (phase === 'sending') return
    setError('')
    if (answered === 0) {
      setError('Skriv minst ett svar før du sender.')
      return
    }
    setPhase('sending')
    try {
      const res = await fetch('/api/havn', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ who, answers, website }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Kunne ikke sende akkurat nå. Svarene ligger fortsatt på telefonen.')
        setPhase('edit')
        return
      }
      setPhase('sent')
    } catch {
      setError('Ingen forbindelse. Svarene ligger fortsatt på telefonen, prøv igjen når dere har dekning.')
      setPhase('edit')
    }
  }

  if (phase === 'sent') {
    return (
      <section id="sporsmal" className={styles.form} aria-labelledby="sporsmal-title">
        <div className={styles.formInner}>
          <div className={styles.sent} role="status">
            <span className={styles.eyebrow}>Sendt</span>
            <h2 id="sporsmal-title">Tusen takk.</h2>
            <p>{answered} av {total} svar er på vei til oss. Alt er nyttig, også det kritiske.</p>
            <p className={styles.sentNote}>Svarene ligger fortsatt på telefonen. Kommer dere på mer, kan dere fylle ut og sende igjen.</p>
            <div className={styles.sendActions}>
              <ShareButton title="Portlink og Grieg Connect" text="Hvordan Portlink og Grieg Connect kan leve sammen om det samme anløpet, og 22 spørsmål til dere som bruker systemet hver dag." />
              <button type="button" className={styles.secondary} onClick={() => setPhase('edit')}>Tilbake til svarene</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="sporsmal" className={styles.form} aria-labelledby="sporsmal-title">
      <div className={styles.formInner}>
        <div className={styles.formHeading}>
          <span className={styles.eyebrow}>Spørsmålene</span>
          <h2 id="sporsmal-title">{total} spørsmål til dere som bruker Grieg Connect hver dag.</h2>
          <p>Stikkord holder, vi leser alt. De fem første er de viktigste.</p>
        </div>

        <div className={styles.progress} role="status" aria-live="polite">
          <span className={styles.progressCount}><b>{answered}</b> av {total}</span>
          <span className={styles.progressBar}><i style={{ width: `${(answered / total) * 100}%` }} /></span>
          <span className={styles.progressSaved}>{savedAt ? `Lagret ${savedAt}` : 'Lagres på telefonen'}</span>
        </div>

        <form onSubmit={submit} noValidate>
          <div className={styles.who}>
            <label htmlFor="havn-who">Hvem svarer?</label>
            <input
              id="havn-who"
              type="text"
              value={who}
              onChange={(e) => setWho(e.target.value)}
              placeholder="Navn og rolle"
              maxLength={160}
              autoComplete="off"
            />
            <small>Valgfritt. Dere kan svare samlet.</small>
          </div>

          {/* Honeypot: off-screen, tab-skipped, never labelled for a person. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: -10000, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          {GROUPS.map((group) => {
            const first = Number(group.questions[0].id.slice(1))
            const last = Number(group.questions[group.questions.length - 1].id.slice(1))
            return (
              <fieldset key={group.title} className={styles.group}>
                <legend className={styles.groupHead}>
                  <span className={styles.groupTitle}>{group.title}</span>
                  {group.badge && <span className={styles.pill}>{group.badge}</span>}
                  <span className={styles.groupRange}>{first === last ? first : `${first} til ${last}`}</span>
                </legend>
                {group.questions.map((q) => {
                  const value = answers[q.id] ?? ''
                  const done = value.trim().length > 0
                  return (
                    <div key={q.id} className={styles.q} data-done={done}>
                      <span className={styles.qNum}>{q.id.slice(1).padStart(2, '0')}</span>
                      <label htmlFor={`havn-${q.id}`} className={styles.qText}>
                        {q.text}
                        {q.hint && <span className={styles.qHint}>{q.hint}</span>}
                      </label>
                      <textarea
                        id={`havn-${q.id}`}
                        value={value}
                        onChange={(e) => setAnswer(q.id, e.target.value)}
                        rows={3}
                        maxLength={4000}
                      />
                    </div>
                  )
                })}
              </fieldset>
            )
          })}

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.sendRow}>
            <p>Sendes som én e-post til Portlink, og dere kan sende flere ganger. Del gjerne siden videre med andre som jobber med dette.</p>
            <div className={styles.sendActions}>
              <ShareButton title="Portlink og Grieg Connect" text="Hvordan Portlink og Grieg Connect kan leve sammen om det samme anløpet, og 22 spørsmål til dere som bruker systemet hver dag." />
              <button type="submit" className={styles.primary} disabled={phase === 'sending'}>
                {phase === 'sending' ? 'Sender…' : 'Send svarene'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
