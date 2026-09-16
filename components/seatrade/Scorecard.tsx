'use client'

import { useEffect, useMemo, useState, type CSSProperties, type FormEvent } from 'react'
import Link from 'next/link'
import { MotionConfig, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Mail, MailCheck } from 'lucide-react'
import { PrizeChip } from '@/components/seatrade/PrizeImage'
import ShareBox from '@/components/seatrade/ShareBox'
import { DRAW, PRIZE_NAME, REFERRAL_CAP, TERMS_PATH } from '@/lib/seatrade/config'
import { cleanCode, workEmailProblem } from '@/lib/seatrade/eligibility'
import {
  QUESTIONS, ROLE_LINES, isComplete, score,
  type Answers, type Band, type Finding, type QuestionId,
} from '@/lib/seatrade/scorecard'

type Phase = 'quiz' | 'result' | 'sent'

interface LiveStats { n: number; avg: number | null; emailShare: number | null; topEntries?: number }

interface SubmitResponse {
  ok: boolean
  error?: string
  score: number
  band: Band
  findings: Finding[]
  stats: LiveStats
  isNew: boolean
  verified: boolean
  referralCode: string
  referralUrl: string
  mePath: string
  invitedBy: string | null
}

const BAND_TONE: Record<Band['id'], { fg: string; bg: string }> = {
  smooth: { fg: 'var(--ds-success)', bg: 'var(--ds-success-bg)' },
  choppy: { fg: 'var(--ds-warning)', bg: 'var(--ds-warning-bg)' },
  heavy:  { fg: 'var(--ds-danger)',  bg: 'var(--ds-danger-bg)' },
}

/** Enter-only motion. No exit stage: a throttled tab (background, low battery) must never leave a
 *  visitor staring at an empty screen between two questions. The new question is in the DOM at once. */
const enter = (dir: number) => ({ x: dir > 0 ? 24 : -24, opacity: 0 })

const inputStyle: CSSProperties = {
  width: '100%',
  background: 'var(--surface-plain)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: 'var(--ds-radius-md)',
  padding: '14px 16px',
  fontSize: 16, // 16px keeps iOS Safari from zooming the page on focus
  fontFamily: 'inherit',
  outline: 'none',
  boxSizing: 'border-box',
}

const primaryButton: CSSProperties = {
  width: '100%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: 'var(--brand)',
  color: 'var(--ds-primary-ink)',
  border: 'none',
  borderRadius: 'var(--ds-radius-pill)',
  padding: '16px 24px',
  fontSize: 16,
  fontWeight: 600,
  fontFamily: 'inherit',
  cursor: 'pointer',
  minHeight: 52,
}

const labelStyle: CSSProperties = { fontSize: 'var(--ds-text-sm)', fontWeight: 500, color: 'var(--text-secondary)' }

function StatPill({ stats }: { stats: LiveStats | null }) {
  if (!stats) return null
  const text = stats.n >= 5 && stats.avg !== null
    ? `${stats.n} scored so far · show average ${stats.avg}/100`
    : 'Be one of the first to set the Med benchmark'
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 'var(--ds-radius-pill)', padding: '6px 14px',
        fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', fontWeight: 500,
      }}
    >
      <span aria-hidden style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ds-success)', animation: 'pulse-live 2s ease-in-out infinite' }} />
      {text}
    </span>
  )
}

export default function Scorecard() {
  const [phase, setPhase] = useState<Phase>('quiz')
  const [index, setIndex] = useState(0)
  const [dir, setDir] = useState(1)
  const [answers, setAnswers] = useState<Partial<Answers>>({})
  const [stats, setStats] = useState<LiveStats | null>(null)
  const [source, setSource] = useState('direct')
  const [ref, setRef] = useState<string | null>(null)
  const [invitedBy, setInvitedBy] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const [company, setCompany] = useState('')
  const [roleDetail, setRoleDetail] = useState('')
  const [consent, setConsent] = useState(false)
  const [website, setWebsite] = useState('') // honeypot
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [response, setResponse] = useState<SubmitResponse | null>(null)

  useEffect(() => {
    let code: string | null = null
    let src: string | null = null
    try {
      const params = new URLSearchParams(window.location.search)
      src = params.get('s')
      code = cleanCode(params.get('r'))
      // A code survives a page reload or a detour to the report page, but never a different device.
      if (code) window.sessionStorage.setItem('seatrade-ref', code)
      else code = cleanCode(window.sessionStorage.getItem('seatrade-ref'))
    } catch { /* storage blocked: the code from the URL still applies for this page view */ }
    if (src) setSource(src)
    else if (code) setSource('referral')
    if (code) {
      setRef(code)
      fetch(`/api/seatrade/ref/?c=${code}`)
        .then(r => (r.ok ? r.json() : null))
        .then((d: { ok: boolean; firstName?: string } | null) => { if (d?.ok && d.firstName) setInvitedBy(d.firstName) })
        .catch(() => {})
    }
    fetch('/api/seatrade/stats/')
      .then(r => (r.ok ? r.json() : null))
      .then((s: LiveStats | null) => { if (s) setStats({ n: s.n, avg: s.avg, emailShare: s.emailShare, topEntries: s.topEntries }) })
      .catch(() => {})
  }, [])

  const question = QUESTIONS[index]
  const total = QUESTIONS.length
  const local = useMemo(() => (isComplete(answers) ? score(answers) : null), [answers])

  // Advance on the tap itself, no timer: browsers throttle timers in background or low-power tabs,
  // and a visitor on a show floor should never wait for a question to change.
  const choose = (qid: QuestionId, oid: string) => {
    const next = { ...answers, [qid]: oid }
    setAnswers(next)
    setDir(1)
    if (index + 1 < total) setIndex(index + 1)
    else if (isComplete(next)) { setPhase('result'); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  const back = () => {
    if (phase === 'result') { setPhase('quiz'); setIndex(total - 1); setDir(-1); return }
    if (index > 0) { setDir(-1); setIndex(index - 1) }
  }

  const checkEmail = () => setEmailHint(email.trim() ? (workEmailProblem(email) ?? '') : '')

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isComplete(answers)) return
    const problem = workEmailProblem(email)
    if (problem) { setEmailHint(problem); setError(problem); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/seatrade/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, company, roleDetail, consent, website, source, ref, answers }),
      })
      const data = (await res.json()) as SubmitResponse
      if (!res.ok || !data.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setResponse(data)
      setStats(data.stats)
      setPhase('sent')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Quiz ──
  if (phase === 'quiz') {
    return (
      <section aria-labelledby="sc-title">
        {ref && (
          <div style={{ background: 'var(--brand-faint)', border: '1px solid var(--brand)', borderRadius: 'var(--ds-radius-lg)', padding: '10px 14px', marginBottom: 'var(--ds-gap-4)', fontSize: 'var(--ds-text-sm)', color: 'var(--text-primary)' }}>
            {invitedBy ? <><strong>{invitedBy}</strong> invited you to score your port calls.</> : <>You came through an invitation link.</>} Confirm your work email after scoring and you are both in the draw.
          </div>
        )}
        <div style={{ marginBottom: 'var(--ds-gap-6)' }}>
          <h1 id="sc-title" style={{ fontSize: 'clamp(1.75rem, 6vw, 2.5rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: 'var(--ds-track-title)', margin: '0 0 var(--ds-gap-3)' }}>
            What is your port call friction score?
          </h1>
          <p style={{ fontSize: 'var(--ds-text-body)', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 var(--ds-gap-3)' }}>
            Seven taps, about a minute. See how much of your port call still runs on email, and how you compare with the rest of the show.
          </p>
          {/* The prize sits INSIDE the draw line rather than above it. A full-width banner here read
              well and pushed the first option off a 390x844 screen (measured: option bottom 866 with
              the banner, 559 without). As a chip beside the text it is visible and costs ~30px. */}
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', margin: '0 0 var(--ds-gap-4)', background: 'var(--surface-plain)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-lg)', padding: 12 }}>
            <PrizeChip size={84} />
            <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              Confirm your work email and you are in the draw for <strong style={{ color: 'var(--text-primary)' }}>{PRIZE_NAME}</strong>. Every colleague you invite who confirms adds an entry. <Link href={TERMS_PATH} style={{ color: 'var(--text-muted)' }}>Terms</Link>
            </p>
          </div>
          <StatPill stats={stats} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontSize: 'var(--ds-text-sm)', color: 'var(--text-muted)' }}>
          <span>{index + 1} of {total}</span>
          {index > 0 && (
            <button type="button" onClick={back} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ds-text-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 4 }}>
              <ArrowLeft size={14} /> Back
            </button>
          )}
        </div>
        <div style={{ height: 3, background: 'var(--border)', borderRadius: 'var(--ds-radius-pill)', overflow: 'hidden', marginBottom: 'var(--ds-gap-6)' }}>
          <motion.div animate={{ width: `${((index + 1) / total) * 100}%` }} transition={{ duration: 0.35 }} style={{ height: '100%', background: 'var(--brand)' }} />
        </div>

        <MotionConfig reducedMotion="user">
          <motion.div key={question.id} initial={enter(dir)} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.18 }}>
            <h2 style={{ fontSize: 'clamp(1.25rem, 4.5vw, 1.5rem)', fontWeight: 700, lineHeight: 1.25, margin: '0 0 6px' }}>{question.title}</h2>
            {question.hint && <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--text-muted)', margin: '0 0 var(--ds-gap-5)', lineHeight: 1.5 }}>{question.hint}</p>}
            {!question.hint && <div style={{ height: 'var(--ds-gap-4)' }} />}
            <div role="group" aria-label={question.title} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {question.options.map(opt => {
                const selected = answers[question.id] === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => choose(question.id, opt.id)}
                    aria-pressed={selected}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
                      width: '100%', minHeight: 56, padding: '14px 18px', textAlign: 'left',
                      background: selected ? 'var(--brand-faint)' : 'var(--surface-plain)',
                      border: `1.5px solid ${selected ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: 'var(--ds-radius-lg)', color: 'var(--text-primary)',
                      fontSize: 16, fontWeight: 500, fontFamily: 'inherit', cursor: 'pointer',
                      transition: 'border-color var(--ds-dur-1) var(--ds-ease-standard), background var(--ds-dur-1) var(--ds-ease-standard)',
                    }}
                  >
                    <span>{opt.label}</span>
                    {selected ? <Check size={18} color="var(--brand)" /> : <ArrowRight size={16} color="var(--text-muted)" />}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </MotionConfig>
      </section>
    )
  }

  // ── Result + capture ──
  if (phase === 'result' && local) {
    const tone = BAND_TONE[local.band.id]
    const isOther = answers.role === 'other'
    return (
      <section aria-labelledby="res-title">
        <button type="button" onClick={back} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 'var(--ds-text-sm)', display: 'inline-flex', alignItems: 'center', gap: 4, padding: 0, marginBottom: 'var(--ds-gap-4)' }}>
          <ArrowLeft size={14} /> Change an answer
        </button>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-6)', marginBottom: 'var(--ds-gap-5)' }}>
          <p style={{ fontSize: 'var(--ds-text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 6px' }}>Your port call friction score</p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
            <span id="res-title" style={{ fontSize: 'clamp(3.5rem, 16vw, 5rem)', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>{local.score}</span>
            <span style={{ fontSize: 'var(--ds-text-body)', color: 'var(--text-muted)' }}>/ 100</span>
          </div>
          <span style={{ display: 'inline-block', marginTop: 12, background: tone.bg, color: tone.fg, fontSize: 'var(--ds-text-xs)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)', padding: '6px 12px', borderRadius: 'var(--ds-radius-pill)' }}>
            {local.band.label}
          </span>
          <p style={{ margin: 'var(--ds-gap-4) 0 0', fontSize: 'var(--ds-text-body)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{local.band.descriptor}</p>
          {stats && stats.n >= 5 && stats.avg !== null && (
            <p style={{ margin: 'var(--ds-gap-3) 0 0', fontSize: 'var(--ds-text-sm)', color: 'var(--text-muted)' }}>
              Show average so far: <strong style={{ color: 'var(--text-primary)' }}>{stats.avg}</strong> from {stats.n} scorecards.
            </p>
          )}
        </motion.div>

        <ol style={{ listStyle: 'none', padding: 0, margin: '0 0 var(--ds-gap-7)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {local.findings.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, background: 'var(--surface-plain)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-lg)', padding: '14px 16px' }}>
              <span style={{ color: 'var(--brand)', fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span>
                <span style={{ display: 'block', fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>{f.title}</span>
                <span style={{ display: 'block', fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.55 }}>{f.body}</span>
              </span>
            </li>
          ))}
        </ol>

        <form onSubmit={submit} noValidate style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-6)' }}>
          <h2 style={{ fontSize: 'clamp(1.2rem, 4.5vw, 1.4rem)', fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Mail size={20} color="var(--brand)" /> Email me the full scorecard
          </h2>
          <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 var(--ds-gap-5)' }}>
            Your findings, the live Seatrade Med benchmark, and your entry in the draw for {PRIZE_NAME}. Work email only: the draw is for people in the industry, and the domain is how we see where you work.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={labelStyle}>
              Name
              <input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith" style={{ ...inputStyle, marginTop: 6 }} />
            </label>
            <label style={labelStyle}>
              Work email
              <input required type="email" inputMode="email" autoComplete="email" autoCapitalize="none" value={email}
                onChange={e => { setEmail(e.target.value); if (emailHint) setEmailHint('') }} onBlur={checkEmail}
                placeholder="jane@cruiseline.com" aria-invalid={!!emailHint} aria-describedby="email-hint"
                style={{ ...inputStyle, marginTop: 6, borderColor: emailHint ? 'var(--danger)' : 'var(--border)' }} />
              {emailHint && <span id="email-hint" role="alert" style={{ display: 'block', marginTop: 6, fontSize: 'var(--ds-text-xs)', color: 'var(--danger)', lineHeight: 1.5, fontWeight: 500 }}>{emailHint}</span>}
            </label>
            <label style={labelStyle}>
              Where you work
              <input required autoComplete="organization" value={company} onChange={e => setCompany(e.target.value)} placeholder="Company or port" style={{ ...inputStyle, marginTop: 6 }} />
            </label>
            {isOther && (
              <label style={labelStyle}>
                What you do in the industry
                <input required value={roleDetail} onChange={e => setRoleDetail(e.target.value)} placeholder="e.g. port authority marketing, ship supplier" style={{ ...inputStyle, marginTop: 6 }} />
              </label>
            )}
            {/* Honeypot: off-screen, tab-skipped, never filled by people. */}
            <label aria-hidden style={{ position: 'absolute', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
              Website <input tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} />
            </label>
            <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5, cursor: 'pointer' }}>
              <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18, accentColor: 'var(--brand)', flexShrink: 0 }} />
              <span>Send my scorecard, enter me in the draw, and send up to three Portlink follow-ups. Unsubscribe anytime. <Link href={TERMS_PATH} style={{ color: 'var(--text-muted)' }}>Draw terms</Link>.</span>
            </label>
          </div>

          {error && <p role="alert" style={{ color: 'var(--danger)', fontSize: 'var(--ds-text-sm)', margin: '14px 0 0' }}>{error}</p>}

          <button type="submit" disabled={submitting || !consent} style={{ ...primaryButton, marginTop: 'var(--ds-gap-5)', opacity: submitting || !consent ? 0.6 : 1, cursor: submitting || !consent ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'Sending…' : 'Send my scorecard'} {!submitting && <ArrowRight size={16} />}
          </button>
          <p style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', margin: '12px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
            Your answers join the anonymous benchmark. We never publish names or companies.
          </p>
        </form>
      </section>
    )
  }

  // ── Sent ──
  if (phase === 'sent' && response) {
    const tone = BAND_TONE[response.band.id]
    const roleLine = ROLE_LINES[answers.role ?? 'other'] ?? ROLE_LINES.other
    return (
      <section aria-labelledby="sent-title">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.35 }}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-6)', textAlign: 'center', marginBottom: 'var(--ds-gap-4)' }}>
          <span style={{ display: 'inline-flex', width: 56, height: 56, borderRadius: '50%', background: response.verified ? 'var(--ds-success-bg)' : 'var(--brand-faint)', color: response.verified ? 'var(--ds-success)' : 'var(--brand)', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--ds-gap-4)' }}>
            {response.verified ? <Check size={28} /> : <MailCheck size={28} />}
          </span>
          <h1 id="sent-title" style={{ fontSize: 'clamp(1.5rem, 6vw, 2rem)', fontWeight: 700, margin: '0 0 8px', lineHeight: 1.15 }}>
            {response.verified ? 'Sent. Your entry is active.' : 'One more tap, in your inbox'}
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--ds-gap-5)', fontSize: 'var(--ds-text-body)' }}>
            {response.verified
              ? <>Your scorecard is on its way to {email}.</>
              : <>Your scorecard is on its way to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. Open it and press <strong style={{ color: 'var(--text-primary)' }}>Confirm my email</strong> to activate your entry in the draw for {PRIZE_NAME}. If it is not there in a minute, check spam and look for pilot@portlink.app.</>}
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '0 0 var(--ds-gap-5)' }}>
            <div style={{ background: tone.bg, borderRadius: 'var(--ds-radius-lg)', padding: '14px 12px' }}>
              <span style={{ display: 'block', fontSize: 'var(--ds-text-xs)', color: tone.fg, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }}>You</span>
              <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, lineHeight: 1.1, color: 'var(--text-primary)' }}>{response.score}</span>
              <span style={{ fontSize: 'var(--ds-text-xs)', color: tone.fg, fontWeight: 600 }}>{response.band.label}</span>
            </div>
            <div style={{ background: 'var(--surface-plain)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-lg)', padding: '14px 12px' }}>
              <span style={{ display: 'block', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }}>Show average</span>
              <span style={{ display: 'block', fontSize: '2rem', fontWeight: 800, lineHeight: 1.1 }}>{response.stats.n >= 5 && response.stats.avg !== null ? response.stats.avg : '–'}</span>
              <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', fontWeight: 500 }}>{response.stats.n >= 5 ? `${response.stats.n} scorecards` : 'needs 5 scorecards'}</span>
            </div>
          </div>

          <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, textAlign: 'left' }}>{roleLine}</p>
        </motion.div>

        <p style={{ fontSize: 'var(--ds-text-sm)', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 10px' }}>
          <strong style={{ color: 'var(--text-primary)' }}>More entries:</strong> every colleague or partner who scores their port calls through your link and confirms their work email adds one, up to {REFERRAL_CAP}. Entries close {DRAW.closesLabel}.
        </p>
        <ShareBox url={response.referralUrl} code={response.referralCode} prize={PRIZE_NAME} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 'var(--ds-gap-5)' }}>
          <a href={response.mePath} style={{ ...primaryButton, textDecoration: 'none' }}>My entries <ArrowRight size={16} /></a>
          <a href="/seatrade/report/" style={{ ...primaryButton, background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}>See the live benchmark</a>
        </div>
        <p style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', margin: '14px 0 0', lineHeight: 1.5, textAlign: 'center' }}>
          Want to see Portlink on one of your own port calls? Reply to the email and we will find you at the terminal.
        </p>
      </section>
    )
  }

  return null
}
