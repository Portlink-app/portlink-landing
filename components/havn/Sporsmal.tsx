'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import { ArrowLeft, ArrowRight, Check, ChevronRight } from 'lucide-react'
import { GROUPS, QUESTIONS, type Question } from '@/lib/havn/questions'
import ShareButton from './ShareButton'
import styles from './havn.module.css'

/**
 * The answer sheet, in two layers (Kris, 22.09.2026: "23 fields under each other is a wall").
 *
 *   1. An overview of the seven groups as cards, each with its own progress. Three people answering
 *      together pick the group they know best; the page reads as short even though it is not.
 *   2. One group open at a time, with previous/next and a way back to the overview.
 *
 * Seven questions offer tap-first answers (lib/havn/questions.ts `options`), free text underneath.
 * A question counts as answered when it has a choice or text. Every keystroke and tap is saved to
 * localStorage, nothing leaves the device until the one button is pressed, and a failed send keeps
 * the draft and says so.
 */
const KEY = 'portlink-havn-v1'
type Phase = 'edit' | 'sending' | 'sent'
type Choice = string | string[]

/** The open question at the end is not a theme: it stays visible on the overview, below the cards. */
const CARD_GROUPS = GROUPS.filter((g) => g.title !== 'Fritt ord')
const OPEN_GROUP = GROUPS.find((g) => g.title === 'Fritt ord')

const SHARE_TITLE = 'Portlink og Grieg Connect'
const SHARE_TEXT = 'Hvordan Portlink og Grieg Connect kan leve sammen om det samme anløpet, og 23 spørsmål til dere som bruker systemet hver dag.'

function hasChoice(c: Choice | undefined): boolean {
  return Array.isArray(c) ? c.length > 0 : typeof c === 'string' && c.length > 0
}

export default function Sporsmal() {
  const [who, setWho] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [choices, setChoices] = useState<Record<string, Choice>>({})
  const [website, setWebsite] = useState('') // honeypot
  const [phase, setPhase] = useState<Phase>('edit')
  const [error, setError] = useState('')
  const [savedAt, setSavedAt] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const timer = useRef<number | null>(null)
  const topRef = useRef<HTMLDivElement>(null)

  // Restore the draft after mount, from a task rather than synchronously in the effect body, so the
  // server-rendered empty form and the first client render agree and the restore is one update.
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const raw = window.localStorage.getItem(KEY)
        if (raw) {
          const d = JSON.parse(raw) as { who?: string; answers?: Record<string, string>; choices?: Record<string, Choice> }
          if (typeof d.who === 'string') setWho(d.who)
          if (d.answers && typeof d.answers === 'object') setAnswers(d.answers)
          if (d.choices && typeof d.choices === 'object') setChoices(d.choices)
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
        window.localStorage.setItem(KEY, JSON.stringify({ who, answers, choices }))
        setSavedAt(new Date().toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' }))
      } catch { /* storage blocked */ }
    }, 400)
  }, [who, answers, choices, loaded])

  const isDone = useCallback(
    (q: Question) => (answers[q.id] ?? '').trim().length > 0 || hasChoice(choices[q.id]),
    [answers, choices],
  )
  const answered = useMemo(() => QUESTIONS.filter(isDone).length, [isDone])
  const total = QUESTIONS.length
  const doneInGroup = (gi: number) => CARD_GROUPS[gi].questions.filter(isDone).length

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }, [])

  const toggleChoice = useCallback((q: Question, option: string) => {
    setChoices((prev) => {
      const cur = prev[q.id]
      if (q.multi) {
        const arr = Array.isArray(cur) ? cur : []
        const next = arr.includes(option) ? arr.filter((o) => o !== option) : [...arr, option]
        return { ...prev, [q.id]: next }
      }
      return { ...prev, [q.id]: cur === option ? '' : option }
    })
  }, [])

  const renderQuestion = (q: Question) => {
    const value = answers[q.id] ?? ''
    const picked = choices[q.id]
    return (
      <div key={q.id} className={styles.q} data-done={isDone(q)}>
        <span className={styles.qNum}>{q.id.slice(1).padStart(2, '0')}</span>
        <label htmlFor={`havn-${q.id}`} className={styles.qText}>
          {q.text}
          {q.hint && <span className={styles.qHint}>{q.hint}</span>}
        </label>
        {q.options && (
          <div className={styles.chips} role="group" aria-label={q.multi ? 'Velg en eller flere' : 'Velg ett'}>
            {q.options.map((o) => {
              const on = Array.isArray(picked) ? picked.includes(o) : picked === o
              return (
                <button key={o} type="button" className={styles.chip} aria-pressed={on} onClick={() => toggleChoice(q, o)}>
                  {on && <Check size={13} aria-hidden="true" />}{o}
                </button>
              )
            })}
            <span className={styles.chipsNote}>{q.multi ? 'Flere kan velges.' : 'Ett valg.'} Utdyp gjerne under.</span>
          </div>
        )}
        <textarea
          id={`havn-${q.id}`}
          value={value}
          onChange={(e) => setAnswer(q.id, e.target.value)}
          rows={q.options ? 2 : 3}
          maxLength={4000}
        />
      </div>
    )
  }

  function openGroup(i: number | null) {
    setOpen(i)
    window.requestAnimationFrame(() => topRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (phase === 'sending') return
    setError('')
    if (answered === 0) {
      setError('Svar på minst ett spørsmål før du sender.')
      return
    }
    setPhase('sending')
    try {
      const res = await fetch('/api/havn/', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ who, answers, choices, website }),
      })
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error || 'Kunne ikke sende akkurat nå. Svarene er tatt vare på.')
        setPhase('edit')
        return
      }
      setPhase('sent')
    } catch {
      setError('Ingen forbindelse. Svarene er tatt vare på, prøv igjen når dere er på nett.')
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
            <p className={styles.sentNote}>Svarene ligger fortsatt her i nettleseren. Kommer dere på mer, kan dere fylle ut og sende igjen.</p>
            <div className={styles.sendActions}>
              <ShareButton title={SHARE_TITLE} text={SHARE_TEXT} />
              <button type="button" className={styles.secondary} onClick={() => setPhase('edit')}>Tilbake til svarene</button>
            </div>
          </div>
        </div>
      </section>
    )
  }

  const group = open === null ? null : CARD_GROUPS[open]

  return (
    <section id="sporsmal" className={styles.form} aria-labelledby="sporsmal-title">
      <div className={styles.formInner}>
        <div className={styles.formHeading}>
          <span className={styles.eyebrow}>Spørsmålene</span>
          <h2 id="sporsmal-title">{total} spørsmål til dere som bruker Grieg Connect hver dag.</h2>
          <p>Velg et tema og svar på det dere kan best. Stikkord holder, vi leser alt. De fem første er de viktigste.</p>
        </div>

        <div className={styles.progress} role="status" aria-live="polite">
          <span className={styles.progressCount}><b>{answered}</b> av {total}</span>
          <span className={styles.progressBar}><i style={{ width: `${(answered / total) * 100}%` }} /></span>
          <span className={styles.progressSaved}>{savedAt ? `Lagret ${savedAt}` : 'Lagres underveis'}</span>
        </div>

        <div ref={topRef} className={styles.formAnchor} />

        <form onSubmit={submit} noValidate>
          {/* Honeypot: off-screen, tab-skipped, never labelled for a person. */}
          <div aria-hidden="true" style={{ position: 'absolute', left: -10000, top: 'auto', width: 1, height: 1, overflow: 'hidden' }}>
            <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </div>

          {group === null ? (
            <>
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

              <ul className={styles.groupCards} aria-label="Temaer">
                {CARD_GROUPS.map((g, i) => {
                  const done = doneInGroup(i)
                  const n = g.questions.length
                  const first = Number(g.questions[0].id.slice(1))
                  const last = Number(g.questions[n - 1].id.slice(1))
                  return (
                    <li key={g.title}>
                      <button type="button" className={styles.groupCard} data-complete={done === n} onClick={() => openGroup(i)}>
                        <span className={styles.groupCardTop}>
                          <span className={styles.groupCardRange}>{first === last ? first : `${first} til ${last}`}</span>
                          {g.badge && <span className={styles.pill}>{g.badge}</span>}
                        </span>
                        <strong>{g.title}</strong>
                        <span className={styles.groupCardMeta}>
                          <span className={styles.groupCardBar}><i style={{ width: `${(done / n) * 100}%` }} /></span>
                          <span>{done === n ? <><Check size={13} aria-hidden="true" /> Ferdig</> : `${done} av ${n}`}</span>
                          <ChevronRight size={16} aria-hidden="true" className={styles.groupCardChevron} />
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {OPEN_GROUP && (
                <fieldset className={`${styles.group} ${styles.openGroup}`}>
                  <legend className={styles.groupHead}>
                    <span className={styles.groupTitle}>{OPEN_GROUP.title}</span>
                    <span className={styles.groupRange}>{OPEN_GROUP.questions[0].id.slice(1)}</span>
                  </legend>
                  {OPEN_GROUP.questions.map(renderQuestion)}
                </fieldset>
              )}
            </>
          ) : (
            <fieldset className={styles.group}>
              <legend className={styles.groupHead}>
                <button type="button" className={styles.backLink} onClick={() => openGroup(null)}><ArrowLeft size={15} aria-hidden="true" /> Alle temaer</button>
                <span className={styles.groupRange}>{open! + 1} av {CARD_GROUPS.length}</span>
              </legend>
              <div className={styles.groupTitleRow}>
                <span className={styles.groupTitle}>{group.title}</span>
                {group.badge && <span className={styles.pill}>{group.badge}</span>}
                <span className={styles.groupRange}>{doneInGroup(open!)} av {group.questions.length} besvart</span>
              </div>

              {group.questions.map(renderQuestion)}

              <div className={styles.groupNav}>
                <button type="button" className={styles.secondary} disabled={open === 0} onClick={() => openGroup(open! - 1)}><ArrowLeft size={15} aria-hidden="true" /> Forrige tema</button>
                {open! < CARD_GROUPS.length - 1 ? (
                  <button type="button" className={styles.primary} onClick={() => openGroup(open! + 1)}>Neste tema <ArrowRight size={15} aria-hidden="true" /></button>
                ) : (
                  <button type="button" className={styles.primary} onClick={() => openGroup(null)}>Til oversikten <ArrowRight size={15} aria-hidden="true" /></button>
                )}
              </div>
            </fieldset>
          )}

          {error && <p className={styles.error} role="alert">{error}</p>}

          <div className={styles.sendRow}>
            <p>Sendes som én e-post til Portlink, og dere kan sende flere ganger. Del gjerne siden videre med andre som jobber med dette.</p>
            <div className={styles.sendActions}>
              <ShareButton title={SHARE_TITLE} text={SHARE_TEXT} />
              <button type="submit" className={styles.primary} disabled={phase === 'sending'}>
                {phase === 'sending' ? 'Sender…' : answered > 0 ? `Send ${answered} svar` : 'Send svarene'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  )
}
