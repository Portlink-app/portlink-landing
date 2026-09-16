'use client'

import { useState, type FormEvent, type FocusEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, ChevronRight, ChevronLeft, Ship, Anchor, Compass, Zap, Tag, HeadphonesIcon } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'

// ── Step definitions ──────────────────────────────────────────────────────────

type StepId = 'role' | 'identity' | 'operation' | 'done'

interface WizardData {
  role: string
  name: string
  email: string
  company: string
  // Cruise Line
  fleetSize: string
  portCallsPerYear: string
  currentPdaTool: string
  // Port Agent
  portsOperated: string
  cruiseLinesServed: string
  agentSoftware: string
  // Tour Operator
  destinationsCount: string
  groupSizeTypical: string
  bookingLeadTime: string
  // Shared
  keyPorts: string
  message: string
}

const roleOptions = [
  { value: 'Cruise Line',   icon: Ship,    desc: 'Fleet operations & port coordination' },
  { value: 'Port Agent',    icon: Anchor,  desc: 'Local port services & turnaround' },
  { value: 'Tour Operator', icon: Compass, desc: 'Shore excursions & bookings' },
]

// ── Animations ────────────────────────────────────────────────────────────────

const stepVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 48 : -48,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    opacity: 0,
  }),
}

const stepTransition = { duration: 0.32 }

// ── Input style ───────────────────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface)',
  border: '1px solid var(--border)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '13px 16px',
  fontSize: '15px',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard), box-shadow var(--ds-dur-2) var(--ds-ease-standard)',
  boxSizing: 'border-box',
}

// ── Pilot section (sits above the form) ───────────────────────────────────────

const pilotPerks = [
  { title: 'Shape what gets built',       body: 'Pilot participants work directly with our team. Your operational reality drives the roadmap.', icon: Zap },
  { title: 'Founding pricing, permanent', body: 'Lock in rates that will not be available after public launch. No promotional asterisk.',       icon: Tag },
  { title: 'Onboarding that actually works', body: 'We set you up, migrate your existing data, and stay until your team is running. Not a help article.', icon: HeadphonesIcon },
]

// ── Main component ────────────────────────────────────────────────────────────

export default function AccessSection() {
  const sectionRef = useReveal()

  const [step, setStep] = useState<StepId>('role')
  const [dir, setDir] = useState(1) // 1 = forward, -1 = back
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [data, setData] = useState<WizardData>({
    role: '', name: '', email: '', company: '',
    fleetSize: '', portCallsPerYear: '', currentPdaTool: '',
    portsOperated: '', cruiseLinesServed: '', agentSoftware: '',
    destinationsCount: '', groupSizeTypical: '', bookingLeadTime: '',
    keyPorts: '', message: '',
  })

  const steps: StepId[] = ['role', 'identity', 'operation']
  const stepIndex = steps.indexOf(step as Exclude<StepId, 'done'>)
  const totalSteps = steps.length

  const go = (next: StepId, direction: number) => {
    setDir(direction)
    setStep(next)
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
      if (!res.ok) throw new Error('Request failed')
      go('done', 1)
    } catch {
      setSubmitError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const focusStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--brand)'
    e.currentTarget.style.boxShadow = '0 0 0 3px var(--ds-primary-faint)'
  }
  const blurStyle = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'var(--border)'
    e.currentTarget.style.boxShadow = 'none'
  }

  return (
    <section
      ref={sectionRef}
      id="access"
      style={{ background: 'var(--bg)', padding: '0 0 80px' }}
    >
      {/* ── Pilot CTA block (above form) ── */}
      <div
        className="reveal"
        style={{
          background: 'var(--surface)',
          borderBottom: '1px solid var(--border)',
          padding: '80px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <span style={{
            fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em',
            color: 'var(--text-muted)', fontWeight: 600,
          }}>
            Request access
          </span>
          <h2 style={{
            fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 700,
            color: 'var(--text-primary)', margin: '14px 0 16px',
          }}>
            Founding cohort, onboarding now.
          </h2>
          <p style={{ fontSize: '17px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '48px', maxWidth: '560px', margin: '0 auto 48px' }}>
            The first group will shape what Portlink becomes, so we work with a small number of teams at a time. Best fit: complex operations, a low tolerance for manual work, and strong opinions about what is broken.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            textAlign: 'left',
          }}>
            {pilotPerks.map((perk) => {
              const PerkIcon = perk.icon
              return (
                <div key={perk.title} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '14px',
                  padding: '24px 20px',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 14,
                  }}>
                    <PerkIcon size={18} color="var(--brand)" />
                  </div>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                    {perk.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {perk.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Wizard form ── */}
      <div
        className="reveal"
        style={{ maxWidth: '540px', margin: '0 auto', padding: '64px 24px 0' }}
      >
        <AnimatePresence mode="wait" custom={dir}>
          {step === 'done' ? (
            <motion.div
              key="done"
              custom={1}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={stepTransition}
              style={{ textAlign: 'center', padding: '48px 24px' }}
            >
              <CheckCircle size={52} color="var(--brand)" style={{ display: 'block', margin: '0 auto 20px' }} />
              <h3 style={{ fontSize: '26px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>
                We got your request.
              </h3>
              <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: 8 }}>
                We have sent a confirmation to <strong style={{ color: 'var(--text-primary)' }}>{data.email}</strong>. Our team will review your application and get back to you within 48 hours.
              </p>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
                Check your spam folder if you do not see it.
              </p>
            </motion.div>
          ) : (
            <motion.div key="form">
              {/* Progress bar */}
              {stepIndex >= 0 && (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>
                      Step {stepIndex + 1} of {totalSteps}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                      {step === 'role' ? 'Your role' : step === 'identity' ? 'About you' : 'Your operation'}
                    </span>
                  </div>
                  <div style={{
                    height: 3, background: 'var(--border)',
                    borderRadius: 9999, overflow: 'hidden',
                  }}>
                    <motion.div
                      animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                      style={{ height: '100%', background: 'var(--brand)', borderRadius: 9999 }}
                    />
                  </div>
                </div>
              )}

              {/* Step content */}
              <AnimatePresence mode="wait" custom={dir}>
                {step === 'role' && (
                  <motion.div
                    key="role"
                    custom={dir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                  >
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      What is your role?
                    </h3>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
                      We tailor the pilot to your operation.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {roleOptions.map((opt) => {
                        const Icon = opt.icon
                        const isSelected = data.role === opt.value
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setData(d => ({ ...d, role: opt.value }))
                              setTimeout(() => go('identity', 1), 160)
                            }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 16,
                              padding: '18px 20px',
                              borderRadius: 14,
                              border: `1.5px solid ${isSelected ? 'var(--brand)' : 'var(--border)'}`,
                              background: isSelected ? 'var(--brand-faint)' : 'var(--surface)',
                              cursor: 'pointer',
                              textAlign: 'left',
                              fontFamily: 'inherit',
                              transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard), background var(--ds-dur-2) var(--ds-ease-standard)',
                              width: '100%',
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--brand)' }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)' }}
                          >
                            <span style={{
                              width: 42, height: 42, borderRadius: 10,
                              background: 'var(--surface)',
                              border: '1px solid var(--border)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              flexShrink: 0,
                            }}>
                              <Icon size={18} color="var(--brand)" />
                            </span>
                            <span>
                              <span style={{ display: 'block', fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                                {opt.value}
                              </span>
                              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{opt.desc}</span>
                            </span>
                            <ChevronRight size={16} color="var(--text-muted)" style={{ marginLeft: 'auto', flexShrink: 0 }} />
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}

                {step === 'identity' && (
                  <motion.form
                    key="identity"
                    custom={dir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                    onSubmit={(e) => { e.preventDefault(); go('operation', 1) }}
                  >
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      About you
                    </h3>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
                      How should we reach you?
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                      {[
                        { name: 'name' as const, label: 'Full name', type: 'text', placeholder: 'Jane Smith', auto: 'name' },
                        { name: 'email' as const, label: 'Work email', type: 'email', placeholder: 'jane@cruiseline.com', auto: 'email' },
                        { name: 'company' as const, label: 'Company', type: 'text', placeholder: 'Your company name', auto: 'organization' },
                      ].map((f) => (
                        <div key={f.name}>
                          <label htmlFor={f.name} style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                            {f.label}
                          </label>
                          <input
                            id={f.name}
                            type={f.type}
                            placeholder={f.placeholder}
                            autoComplete={f.auto}
                            required
                            value={data[f.name]}
                            onChange={(e) => setData(d => ({ ...d, [f.name]: e.target.value }))}
                            style={inputBase}
                            onFocus={focusStyle}
                            onBlur={blurStyle}
                          />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                      <button type="button" onClick={() => go('role', -1)} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', borderRadius: 9999,
                        padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 14, fontWeight: 500, transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard)',
                      }}>
                        <ChevronLeft size={15} /> Back
                      </button>
                      <button type="submit" style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'var(--brand)', color: 'var(--ds-primary-ink)',
                        borderRadius: 9999, padding: '12px 24px',
                        fontWeight: 600, fontSize: 15, border: 'none',
                        cursor: 'pointer', fontFamily: 'inherit', transition: 'background var(--ds-dur-2) var(--ds-ease-standard)',
                      }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--brand-bright)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--brand)')}
                      >
                        Continue <ChevronRight size={15} />
                      </button>
                    </div>
                  </motion.form>
                )}

                {step === 'operation' && (
                  <motion.form
                    key="operation"
                    custom={dir}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={stepTransition}
                    onSubmit={handleSubmit}
                  >
                    <h3 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                      Your operation
                    </h3>
                    <p style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 28, lineHeight: 1.5 }}>
                      Help us understand your setup so we can tailor the pilot.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

                      {/* ── CRUISE LINE fields ── */}
                      {data.role === 'Cruise Line' && <>
                        <Field id="fleetSize" label="Number of vessels in your fleet" required
                          placeholder="e.g. 12" type="number"
                          value={data.fleetSize} onChange={v => setData(d => ({ ...d, fleetSize: v }))}
                          onFocus={focusStyle} onBlur={blurStyle} inputBase={inputBase} />
                        <SelectField id="portCallsPerYear" label="Estimated port calls per year" required
                          value={data.portCallsPerYear} onChange={v => setData(d => ({ ...d, portCallsPerYear: v }))}
                          options={['< 100', '100-500', '500-2,000', '2,000-10,000', '10,000+']}
                          inputBase={inputBase} />
                        <Field id="keyPorts" label="Key ports of call" optional
                          placeholder="e.g. Barcelona, Miami, Piraeus, Southampton"
                          value={data.keyPorts} onChange={v => setData(d => ({ ...d, keyPorts: v }))}
                          onFocus={focusStyle} onBlur={blurStyle} inputBase={inputBase} />
                        <SelectField id="currentPdaTool" label="How do you currently manage PDAs?" required
                          value={data.currentPdaTool} onChange={v => setData(d => ({ ...d, currentPdaTool: v }))}
                          options={['Email + spreadsheets', 'Internal system', 'Third-party software', 'Port agent manages it', 'No formal process']}
                          inputBase={inputBase} />
                      </>}

                      {/* ── PORT AGENT fields ── */}
                      {data.role === 'Port Agent' && <>
                        <Field id="portsOperated" label="Ports you operate in" required
                          placeholder="e.g. Rotterdam, Hamburg, Antwerp"
                          value={data.portsOperated} onChange={v => setData(d => ({ ...d, portsOperated: v }))}
                          onFocus={focusStyle} onBlur={blurStyle} inputBase={inputBase} />
                        <SelectField id="cruiseLinesServed" label="Cruise lines you currently serve" required
                          value={data.cruiseLinesServed} onChange={v => setData(d => ({ ...d, cruiseLinesServed: v }))}
                          options={['1-3', '4-10', '11-25', '25+']}
                          inputBase={inputBase} />
                        <SelectField id="agentSoftware" label="Current tools for managing port calls" required
                          value={data.agentSoftware} onChange={v => setData(d => ({ ...d, agentSoftware: v }))}
                          options={['Email only', 'Spreadsheets', 'Casper / Mespas', 'Custom/internal system', 'Other']}
                          inputBase={inputBase} />
                        <Field id="keyPorts" label="Any additional comments on your setup" optional
                          placeholder="Seasonal volumes, special services, etc."
                          value={data.keyPorts} onChange={v => setData(d => ({ ...d, keyPorts: v }))}
                          onFocus={focusStyle} onBlur={blurStyle} inputBase={inputBase} />
                      </>}

                      {/* ── TOUR OPERATOR / DMC fields ── */}
                      {data.role === 'Tour Operator' && <>
                        <Field id="destinationsCount" label="Number of cruise port destinations you cover" required
                          placeholder="e.g. 18"
                          type="number"
                          value={data.destinationsCount} onChange={v => setData(d => ({ ...d, destinationsCount: v }))}
                          onFocus={focusStyle} onBlur={blurStyle} inputBase={inputBase} />
                        <SelectField id="groupSizeTypical" label="Typical group size per excursion" required
                          value={data.groupSizeTypical} onChange={v => setData(d => ({ ...d, groupSizeTypical: v }))}
                          options={['1-15 pax', '16-40 pax', '41-100 pax', '100+ pax', 'Varies widely']}
                          inputBase={inputBase} />
                        <SelectField id="bookingLeadTime" label="How far in advance do you receive bookings?" required
                          value={data.bookingLeadTime} onChange={v => setData(d => ({ ...d, bookingLeadTime: v }))}
                          options={['Days before arrival', '1-4 weeks', '1-3 months', '3+ months']}
                          inputBase={inputBase} />
                        <Field id="keyPorts" label="Key ports or regions" optional
                          placeholder="e.g. Western Mediterranean, Caribbean, Nordics"
                          value={data.keyPorts} onChange={v => setData(d => ({ ...d, keyPorts: v }))}
                          onFocus={focusStyle} onBlur={blurStyle} inputBase={inputBase} />
                      </>}

                      {/* Shared message */}
                      <div>
                        <label htmlFor="message" style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
                          Anything else? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span>
                        </label>
                        <textarea
                          id="message"
                          placeholder="Current challenges, specific needs, or questions for our team..."
                          rows={3}
                          value={data.message}
                          onChange={(e) => setData(d => ({ ...d, message: e.target.value }))}
                          style={{ ...inputBase, resize: 'vertical' }}
                          onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                          onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                        />
                      </div>
                    </div>

                    {submitError && (
                      <p style={{ color: 'var(--alert)', fontSize: 14, marginTop: 16, marginBottom: 0 }}>
                        {submitError}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: 12, marginTop: 28 }}>
                      <button type="button" onClick={() => go('identity', -1)} disabled={submitting} style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: '1px solid var(--border)',
                        color: 'var(--text-secondary)', borderRadius: 9999,
                        padding: '12px 20px', cursor: 'pointer', fontFamily: 'inherit',
                        fontSize: 14, fontWeight: 500, transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard)',
                        opacity: submitting ? 0.5 : 1,
                      }}>
                        <ChevronLeft size={15} /> Back
                      </button>
                      <button type="submit" disabled={submitting} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: 'var(--brand)', color: 'var(--ds-primary-ink)',
                        borderRadius: 9999, padding: '12px 24px',
                        fontWeight: 600, fontSize: 15, border: 'none',
                        cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'background var(--ds-dur-2) var(--ds-ease-standard)',
                        opacity: submitting ? 0.7 : 1,
                      }}
                        onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--brand-bright)' }}
                        onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = 'var(--brand)' }}
                      >
                        {submitting ? 'Sending...' : 'Request access'} {!submitting && <ChevronRight size={15} />}
                      </button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  )
}

// ── Reusable field helpers ────────────────────────────────────────────────────

interface FieldProps {
  id: string
  label: string
  placeholder?: string
  type?: string
  required?: boolean
  optional?: boolean
  value: string
  onChange: (v: string) => void
  onFocus: (e: FocusEvent<HTMLInputElement>) => void
  onBlur: (e: FocusEvent<HTMLInputElement>) => void
  inputBase: React.CSSProperties
}

function Field({ id, label, placeholder, type = 'text', required, optional, value, onChange, onFocus, onBlur, inputBase }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label}{optional && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional)</span>}
      </label>
      <input
        id={id} type={type} placeholder={placeholder}
        required={required} value={value}
        onChange={(e) => onChange(e.target.value)}
        style={inputBase} onFocus={onFocus} onBlur={onBlur}
        min={type === 'number' ? '1' : undefined}
      />
    </div>
  )
}

interface SelectFieldProps {
  id: string
  label: string
  required?: boolean
  value: string
  onChange: (v: string) => void
  options: string[]
  inputBase: React.CSSProperties
}

function SelectField({ id, label, required, value, onChange, options, inputBase }: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} style={{ display: 'block', fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
        {label}
      </label>
      <select
        id={id} required={required} value={value}
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
        <option value="" disabled>Select one…</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}
