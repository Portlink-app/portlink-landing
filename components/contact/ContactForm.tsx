'use client'

/**
 * The one contact form. One implementation, two mounts, one endpoint.
 *
 * `/contact/` mounts it with the intent question asked and `build` selected on arrival, matching
 * its own H1 and the homepage link that sends people there. `AccessSection` mounts it with the
 * intent fixed to `pilot` and the question hidden, because a reader who has just read the pilot
 * terms has already answered it. Both post to `/api/access`.
 *
 * ⛔ `intent` IS REQUIRED, AND IT IS A SEPARATE QUESTION FROM `lockIntent`. `intent` is which
 * option is selected when the form opens. `lockIntent` is whether the reader is asked at all.
 * They used to be one optional `presetIntent` that meant both at once, so a mount wanting a
 * starting selection without hiding the question had no way to say so and fell through to a
 * `?? 'pilot'` tail nobody chose. Measured on the live page 17.09.2026: `/contact/` served the
 * `pilot` radio checked and `build` unchecked, under an H1 reading "Tell us what you need built."
 * A visitor who skimmed sent a pilot request meaning a build request, the submission looked valid,
 * the confirmation was plausible, and nothing anywhere recorded that the intent was wrong.
 * Requiring `intent` is the actual repair: `<ContactForm />` no longer compiles, so no future
 * mount can inherit a default nobody decided.
 *
 * WHY NOT FOUR PATHS. The obvious shape for "four audiences, two intents" is a router with a form
 * per branch, which is eight forms to keep in step, eight sets of validation and eight places for
 * the email rule to drift. What actually varies is the second step's fields, so that is the only
 * thing that branches. Step one is the same five questions for everybody.
 *
 * ⛔ IT NEVER SUBMITS ITSELF IN A TEST. `/api/access` mails a caller-supplied address from our
 * verified sender, so the path is proven through `scripts/check-access-guard.mjs`, never with a
 * live POST from a browser or a script.
 *
 * ⛔ `fontSize: 16` ON EVERY INPUT IS LOAD-BEARING, NOT A PREFERENCE. iOS Safari zooms the whole
 * viewport when a focused field is under 16 px, and it does not zoom back out. The old value was
 * 15 px, on the form the entire page points at. Do not shrink it to fit a layout.
 *
 * ⛔ NO JAVASCRIPT FOCUS STYLING. The previous version painted an 8 percent halo from `onFocus`,
 * which fires on a mouse click as well as a keyboard tab; the global `:focus-visible` rule in
 * globals.css already draws the correct ring for the correct input mode. Handlers here would fight
 * it, which is what they did.
 */

import { useId, useRef, useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, ChevronLeft, Hammer, Ship } from 'lucide-react'
import {
  ORG_TYPE_LABEL,
  PILOT_ROLES,
  pilotEmailProblem,
  type ContactIntent,
  type PilotRole,
} from '@/lib/access/eligibility'

type StepId = 'who' | 'detail' | 'done'

interface FormData {
  intent: ContactIntent
  role: string
  name: string
  email: string
  company: string
  // Cruise line
  fleetSize: string
  portCallsPerYear: string
  currentPdaTool: string
  // Port or terminal
  cruiseCallsPerYear: string
  berths: string
  currentSystem: string
  // Port agency
  portsOperated: string
  cruiseLinesServed: string
  agentSoftware: string
  // Tour operator
  destinationsCount: string
  groupSizeTypical: string
  bookingLeadTime: string
  // Build enquiry
  need: string
  timeline: string
  existingSystems: string
  // Shared
  keyPorts: string
  message: string
  /** Honeypot. Off-screen and tab-skipped, so only a script fills it. The API answers a filled
   *  one with a fake success and sends nothing. */
  website: string
}

/* Deliberately `Omit<…, 'intent'>`. It used to carry `intent: 'pilot'`, which the mount's value
   then overrode. A second place an intent could come from, and a silent winner the day anyone
   dropped the override. There is one source of the intent now, and it is the caller. */
const EMPTY: Omit<FormData, 'intent'> = {
  role: '', name: '', email: '', company: '',
  fleetSize: '', portCallsPerYear: '', currentPdaTool: '',
  cruiseCallsPerYear: '', berths: '', currentSystem: '',
  portsOperated: '', cruiseLinesServed: '', agentSoftware: '',
  destinationsCount: '', groupSizeTypical: '', bookingLeadTime: '',
  need: '', timeline: '', existingSystems: '',
  keyPorts: '', message: '', website: '',
}

const intentOptions: { value: ContactIntent; label: string; desc: string; icon: typeof Ship }[] = [
  { value: 'pilot', label: 'We want to use Portlink', desc: 'The port call platform, in pilot now', icon: Ship },
  { value: 'build', label: 'We need something built', desc: 'Software for your own operation', icon: Hammer },
]

// ── Animations ────────────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}
const stepTransition = { duration: 0.32 }

// ── Shared input styling ──────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '13px 16px',
  /* 16 px, not 15. See the header: below 16 px iOS Safari zooms the viewport on focus. */
  fontSize: '16px',
  fontFamily: 'inherit',
  transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard)',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-secondary)',
  marginBottom: 6,
}

const stepHeading: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 700,
  color: 'var(--text-primary)',
  marginBottom: 8,
  scrollMarginTop: 88,
}

const stepLede: React.CSSProperties = {
  fontSize: 15,
  color: 'var(--text-secondary)',
  marginBottom: 28,
  lineHeight: 1.5,
}

const primaryButton: React.CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  background: 'var(--brand)',
  color: 'var(--ds-primary-ink)',
  borderRadius: 9999,
  padding: '12px 24px',
  fontWeight: 600,
  fontSize: 15,
  border: 'none',
  cursor: 'pointer',
  fontFamily: 'inherit',
  transition: 'background var(--ds-dur-2) var(--ds-ease-standard)',
}

const backButton: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'transparent',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  borderRadius: 9999,
  padding: '12px 20px',
  cursor: 'pointer',
  fontFamily: 'inherit',
  fontSize: 14,
  fontWeight: 500,
}

// ── Field helpers ─────────────────────────────────────────────────────────────

function Field({
  id, label, value, onChange, placeholder, type = 'text', required, optional, autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  required?: boolean
  optional?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        style={inputBase}
        inputMode={type === 'number' ? 'numeric' : undefined}
        min={type === 'number' ? '1' : undefined}
      />
    </div>
  )
}

function SelectField({
  id, label, value, onChange, options, required, optional, labelFor,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: readonly string[]
  required?: boolean
  optional?: boolean
  /**
   * Maps an option's WIRE value to what the visitor reads. Identity when absent.
   *
   * ⛔ IT EXISTS BECAUSE THE ORG-TYPE QUESTION HAS TWO VOCABULARIES. `PILOT_ROLES` carries the
   * values `/api/access` validates; `ORG_TYPE_LABEL` carries the sentences a person reads. Posting
   * the label instead of the value is refused by `isPilotRole` on every single submission, which
   * is exactly what the first version of this file did.
   */
  labelFor?: (v: string) => string
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional)</span>}
      </label>
      <select
        id={id}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...inputBase,
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          paddingRight: '36px',
          cursor: 'pointer',
        }}
      >
        <option value="" disabled>Select one</option>
        {options.map((o) => <option key={o} value={o}>{labelFor ? labelFor(o) : o}</option>)}
      </select>
    </div>
  )
}

function TextareaField({
  id, label, value, onChange, placeholder, rows = 4, required, optional, maxLength,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  required?: boolean
  optional?: boolean
  maxLength?: number
}) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional)</span>}
      </label>
      <textarea
        id={id}
        value={value}
        rows={rows}
        placeholder={placeholder}
        required={required}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        style={{ ...inputBase, resize: 'vertical' }}
      />
    </div>
  )
}

// ── The form ──────────────────────────────────────────────────────────────────

type ContactFormProps = {
  /** Which option is selected when the form opens. Required on purpose. See the header. */
  intent: ContactIntent
  /** When true the question is not asked and `intent` stands as the answer. */
  lockIntent?: boolean
}

export default function ContactForm({ intent, lockIntent = false }: ContactFormProps) {
  /* Unique per mount, so two mounts on one document cannot collide on an input id. The homepage has
     one today, but a duplicate id silently breaks every `label for=`, which is the kind of defect
     that only shows up in a screen reader. */
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const fid = (name: string) => `${name}-${uid}`

  const [step, setStep] = useState<StepId>('who')
  const [dir, setDir] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [emailHint, setEmailHint] = useState('')
  const headingRef = useRef<HTMLHeadingElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)
  const pendingFocus = useRef<StepId | null>(null)
  /* No `??` tail. The caller decided, and the type made it decide. */
  const [data, setData] = useState<FormData>({ ...EMPTY, intent })

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  const go = (next: StepId, direction: number) => {
    pendingFocus.current = next
    setDir(direction)
    setStep(next)
  }

  const focusStep = (entered: StepId, animation: unknown) => {
    if (animation !== 'center' || pendingFocus.current !== entered) return
    pendingFocus.current = null
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }

  const totalSteps = 2
  const stepIndex = step === 'who' ? 0 : step === 'detail' ? 1 : -1

  const submitWho = (e: FormEvent) => {
    e.preventDefault()
    const problem = pilotEmailProblem(data.email)
    if (problem) { setEmailHint(problem); emailRef.current?.focus(); return }
    go('detail', 1)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError('')
    try {
      const res = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const payload = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null
      if (!res.ok || !payload?.ok) throw new Error(payload?.error || 'Something went wrong. Please try again.')
      go('done', 1)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  /** The API's own rule, run in the browser so a wrong address is fixable in place rather than
   *  after a round trip. Same module, so the two can never drift apart. */
  const checkEmail = () =>
    setEmailHint(data.email.trim() ? (pilotEmailProblem(data.email) ?? '') : '')

  const buildIntent = data.intent === 'build'

  return (
    <div style={{ maxWidth: '540px', margin: '0 auto', width: '100%' }}>
      <AnimatePresence mode="wait" custom={dir}>
        {step === 'done' ? (
          <motion.div
            key="done"
            onAnimationComplete={(animation) => focusStep('done', animation)}
            custom={1}
            variants={stepVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition}
            style={{ textAlign: 'center', padding: '48px 24px' }}
          >
            <CheckCircle size={52} color="var(--brand)" style={{ display: 'block', margin: '0 auto 20px' }} />
            <h3 ref={headingRef} tabIndex={-1} style={{ scrollMarginTop: 88, fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
              {buildIntent ? 'We got it.' : 'We got your request.'}
            </h3>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 8 }}>
              We have sent a confirmation to{' '}
              <strong style={{ color: 'var(--text-primary)' }}>{data.email}</strong>.{' '}
              {buildIntent
                ? 'David or Kris will read it and reply within 48 hours.'
                : 'Our team will review your application and get back to you within 48 hours.'}
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Check your spam folder if you do not see it.
            </p>
          </motion.div>
        ) : (
          <motion.div key="form">
            {stepIndex >= 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                    Step {stepIndex + 1} of {totalSteps}
                  </span>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    {step === 'who' ? 'About you' : buildIntent ? 'What you need' : 'Your operation'}
                  </span>
                </div>
                <div style={{ height: 3, background: 'var(--border)', borderRadius: 9999, overflow: 'hidden' }}>
                  <motion.div
                    animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    style={{ height: '100%', background: 'var(--brand)', borderRadius: 9999 }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence mode="wait" custom={dir}>
              {step === 'who' && (
                <motion.form
                  key="who"
                  onAnimationComplete={(animation) => focusStep('who', animation)}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  onSubmit={submitWho}
                >
                  <h3 ref={headingRef} tabIndex={-1} style={stepHeading}>{lockIntent ? 'About you' : 'What can we help with?'}</h3>
                  <p style={stepLede}>
                    {lockIntent
                      ? 'How should we reach you?'
                      : 'Your contact details, then what you need.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* The intent question, asked only where it has not already been answered. */}
                    {!lockIntent && (
                      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                        <legend style={{ ...labelStyle, marginBottom: 10 }}>What brings you here?</legend>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                          {intentOptions.map((opt) => {
                            const Icon = opt.icon
                            const selected = data.intent === opt.value
                            return (
                              <label
                                key={opt.value}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 14,
                                  padding: '16px 18px',
                                  borderRadius: 14,
                                  border: `1.5px solid ${selected ? 'var(--brand)' : 'var(--border)'}`,
                                  background: selected ? 'var(--brand-faint)' : 'var(--surface)',
                                  cursor: 'pointer',
                                  transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard), background var(--ds-dur-2) var(--ds-ease-standard)',
                                }}
                              >
                                <input
                                  type="radio"
                                  name={fid('intent')}
                                  value={opt.value}
                                  checked={selected}
                                  onChange={() => set('intent', opt.value)}
                                  style={{ width: 18, height: 18, accentColor: 'var(--brand)', flexShrink: 0, margin: 0 }}
                                />
                                <Icon size={18} color="var(--brand)" style={{ flexShrink: 0 }} aria-hidden="true" />
                                <span>
                                  <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                                    {opt.label}
                                  </span>
                                  <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{opt.desc}</span>
                                </span>
                              </label>
                            )
                          })}
                        </div>
                      </fieldset>
                    )}

                    <SelectField
                      id={fid('orgType')}
                      label="What kind of organisation?"
                      value={data.role}
                      onChange={(v) => set('role', v)}
                      options={PILOT_ROLES}
                      labelFor={(v) => ORG_TYPE_LABEL[v as PilotRole]}
                      required
                    />

                    <Field id={fid('name')} label="Full name" value={data.name}
                      onChange={(v) => set('name', v)} placeholder="Jane Smith"
                      autoComplete="name" required />

                    <div>
                      <label htmlFor={fid('email')} style={labelStyle}>Work email</label>
                      <input
                        id={fid('email')}
                        type="email"
                        inputMode="email"
                        ref={emailRef}
                        aria-invalid={!!emailHint}
                        value={data.email}
                        placeholder="jane@cruiseline.com"
                        autoComplete="email"
                        required
                        onChange={(e) => {
                          set('email', e.target.value)
                          if (emailHint) setEmailHint('')
                        }}
                        onBlur={checkEmail}
                        style={inputBase}
                        aria-describedby={emailHint ? fid('email-hint') : undefined}
                      />
                      {emailHint && (
                        <p id={fid('email-hint')} role="alert" style={{ color: 'var(--alert)', fontSize: 13, margin: '6px 0 0', lineHeight: 1.5 }}>
                          {emailHint}
                        </p>
                      )}
                    </div>

                    <Field id={fid('company')} label="Company" value={data.company}
                      onChange={(v) => set('company', v)} placeholder="Your company name"
                      autoComplete="organization" required />

                    {/* Honeypot: off-screen, tab-skipped, never filled by people. */}
                    <label aria-hidden style={{ position: 'absolute', left: -9999, top: 0, width: 1, height: 1, overflow: 'hidden' }}>
                      Website
                      <input
                        tabIndex={-1}
                        autoComplete="off"
                        value={data.website}
                        onChange={(e) => set('website', e.target.value)}
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    <button
                      type="submit"
                      style={primaryButton}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-bright)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--brand)')}
                    >
                      Continue <ChevronRight size={15} />
                    </button>
                  </div>
                </motion.form>
              )}

              {step === 'detail' && (
                <motion.form
                  key="detail"
                  onAnimationComplete={(animation) => focusStep('detail', animation)}
                  custom={dir}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={stepTransition}
                  onSubmit={handleSubmit}
                >
                  <h3 ref={headingRef} tabIndex={-1} style={stepHeading}>{buildIntent ? 'What do you need built?' : 'Your operation'}</h3>
                  <p style={stepLede}>
                    {buildIntent
                      ? 'The more concrete this is, the more useful our first reply will be.'
                      : 'Help us understand your setup so we can tailor the pilot.'}
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {buildIntent ? (
                      <>
                        <TextareaField
                          id={fid('need')}
                          label="What do you need"
                          value={data.need}
                          onChange={(v) => set('need', v)}
                          rows={5}
                          required
                          maxLength={2000}
                          placeholder="The part of your week that still runs on email. Who does it, how often, and what goes wrong."
                        />
                        <SelectField
                          id={fid('timeline')}
                          label="Timeline"
                          value={data.timeline}
                          onChange={(v) => set('timeline', v)}
                          options={['Just exploring', 'This quarter', 'Already budgeted']}
                          optional
                        />
                        <Field
                          id={fid('existingSystems')}
                          label="What it would have to talk to"
                          value={data.existingSystems}
                          onChange={(v) => set('existingSystems', v)}
                          placeholder="Anything it has to exchange data with"
                          optional
                        />
                      </>
                    ) : (
                      <>
                        {data.role === 'Cruise Line' && <>
                          <Field id={fid('fleetSize')} label="Number of vessels in your fleet" type="number" required
                            placeholder="e.g. 12" value={data.fleetSize} onChange={(v) => set('fleetSize', v)} />
                          <SelectField id={fid('portCallsPerYear')} label="Estimated port calls per year" required
                            value={data.portCallsPerYear} onChange={(v) => set('portCallsPerYear', v)}
                            options={['< 100', '100-500', '500-2,000', '2,000-10,000', '10,000+']} />
                          <Field id={fid('keyPorts')} label="Key ports of call" optional
                            placeholder="e.g. Barcelona, Miami, Piraeus, Southampton"
                            value={data.keyPorts} onChange={(v) => set('keyPorts', v)} />
                          <SelectField id={fid('currentPdaTool')} label="How do you currently manage PDAs?" required
                            value={data.currentPdaTool} onChange={(v) => set('currentPdaTool', v)}
                            options={['Email + spreadsheets', 'Internal system', 'Third-party software', 'Port agent manages it', 'No formal process']} />
                        </>}

                        {data.role === 'Port or Terminal' && <>
                          <SelectField id={fid('cruiseCallsPerYear')} label="Cruise calls per year" required
                            value={data.cruiseCallsPerYear} onChange={(v) => set('cruiseCallsPerYear', v)}
                            options={['Under 50', '50 to 200', '200 to 500', '500 and above']} />
                          <Field id={fid('berths')} label="Berths" optional
                            placeholder="e.g. 3 cruise berths"
                            value={data.berths} onChange={(v) => set('berths', v)} />
                          <SelectField id={fid('currentSystem')} label="What runs it today?" required
                            value={data.currentSystem} onChange={(v) => set('currentSystem', v)}
                            options={['Email and spreadsheets', 'A port community system', 'An internal system', 'Something else']} />
                        </>}

                        {data.role === 'Port Agent' && <>
                          <Field id={fid('portsOperated')} label="Ports you operate in" required
                            placeholder="e.g. Rotterdam, Hamburg, Antwerp"
                            value={data.portsOperated} onChange={(v) => set('portsOperated', v)} />
                          <SelectField id={fid('cruiseLinesServed')} label="Cruise lines you currently serve" required
                            value={data.cruiseLinesServed} onChange={(v) => set('cruiseLinesServed', v)}
                            options={['1-3', '4-10', '11-25', '25+']} />
                          <SelectField id={fid('agentSoftware')} label="Current tools for managing port calls" required
                            value={data.agentSoftware} onChange={(v) => set('agentSoftware', v)}
                            options={['Email only', 'Spreadsheets', 'Casper / Mespas', 'Custom/internal system', 'Other']} />
                        </>}

                        {data.role === 'Tour Operator' && <>
                          <Field id={fid('destinationsCount')} label="Number of cruise port destinations you cover" type="number" required
                            placeholder="e.g. 18"
                            value={data.destinationsCount} onChange={(v) => set('destinationsCount', v)} />
                          <SelectField id={fid('groupSizeTypical')} label="Typical group size per excursion" required
                            value={data.groupSizeTypical} onChange={(v) => set('groupSizeTypical', v)}
                            options={['1-15 pax', '16-40 pax', '41-100 pax', '100+ pax', 'Varies widely']} />
                          <SelectField id={fid('bookingLeadTime')} label="How far in advance do you receive bookings?" required
                            value={data.bookingLeadTime} onChange={(v) => set('bookingLeadTime', v)}
                            options={['Days before arrival', '1-4 weeks', '1-3 months', '3+ months']} />
                          <Field id={fid('keyPortsTour')} label="Key ports or regions" optional
                            placeholder="e.g. Western Mediterranean, Caribbean, Nordics"
                            value={data.keyPorts} onChange={(v) => set('keyPorts', v)} />
                        </>}

                        <TextareaField
                          id={fid('message')}
                          label="Anything else?"
                          value={data.message}
                          onChange={(v) => set('message', v)}
                          rows={3}
                          optional
                          maxLength={2000}
                          placeholder="Current challenges, specific needs, or questions for our team"
                        />
                      </>
                    )}
                  </div>

                  {submitError && (
                    <p role="alert" style={{ color: 'var(--alert)', fontSize: 14, marginTop: 16, marginBottom: 0 }}>
                      {submitError}
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                    <button type="button" onClick={() => go('who', -1)} disabled={submitting}
                      style={{ ...backButton, opacity: submitting ? 0.5 : 1 }}>
                      <ChevronLeft size={15} /> Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        ...primaryButton,
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1,
                      }}
                      onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--brand-bright)' }}
                      onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--brand)' }}
                    >
                      {submitting ? 'Sending' : buildIntent ? 'Send it' : 'Request access'}
                      {!submitting && <ChevronRight size={15} />}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
