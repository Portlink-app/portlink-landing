'use client'

import { useState } from 'react'
import { Anchor, ArrowLeft, ArrowRight, RotateCcw, LockKeyhole } from 'lucide-react'
import { portCallRoles, portCallSteps } from './portCallStory'
import styles from './EcosystemSection.module.css'

const paths = ['M300 250 C300 155 110 180 110 70', 'M300 250 C300 155 490 180 490 70', 'M300 250 C300 345 110 320 110 430', 'M300 250 C300 345 490 320 490 430']

export default function EcosystemSection() {
  const [step, setStep] = useState(0)
  const current = portCallSteps[step]
  const last = step === portCallSteps.length - 1

  return (
    <section id="ecosystem" className={styles.section} aria-labelledby="ecosystem-title">
      <div className={styles.inner}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>The connected port call</span>
            <h2 id="ecosystem-title">Four sides.<br />One shared record.</h2>
          </div>
          <p>Follow a call from the first agreement to the final account. The people change. The context stays with the call.</p>
        </div>
        <nav aria-label="Follow a port call" className={styles.steps}>
          {portCallSteps.map((item, index) => (
            <button type="button" key={item.label} aria-current={step === index ? 'step' : undefined} aria-controls="port-call-story" onClick={() => setStep(index)}>
              <span className={styles.stepNumber}>{String(index + 1).padStart(2, '0')}</span><span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div id="port-call-story" className={styles.top}>
          <div className={styles.copy}>
            <div className={styles.narrative} aria-live="polite" aria-atomic="true">
              <span className={styles.handoff}>{current.handoff}</span>
              <h3>{current.title}</h3>
              <p>{current.body}</p>
              <p className={styles.detail}>{current.detail}</p>
            </div>
            <div className={styles.controls}>
              <button type="button" className={styles.previous} aria-label="Previous handoff" disabled={step === 0} onClick={() => setStep(step - 1)}><ArrowLeft size={18} aria-hidden="true" /></button>
              <button type="button" className={styles.next} onClick={() => setStep(last ? 0 : step + 1)}>
                {last ? 'Follow it again' : 'Next handoff'}
                {last ? <RotateCcw size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
              </button>
              <span className={styles.counter}>{String(step + 1).padStart(2, '0')} / {String(portCallSteps.length).padStart(2, '0')}</span>
            </div>
            <span className={styles.note}>An illustrative port call. Select a step to follow the handoff.</span>
          </div>
          <div>
            <div className={styles.diagram} aria-label={`Connected teams: ${current.active.map(id => portCallRoles.find(role => role.id === id)!.title).join(', ')}`}>
              <div className={styles.grid} aria-hidden="true" />
              <svg viewBox="0 0 600 500" preserveAspectRatio="none" className={styles.lines} aria-hidden="true">
                {paths.map(d => <path key={d} d={d} className={styles.basePath} />)}
                {paths.map((d, index) => current.active.includes(portCallRoles[index].id) && <path key={`${step}-${index}`} d={d} pathLength="1" className={styles.signal} />)}
              </svg>
              <div className={styles.record}>
                <span className={styles.recordBrand}><Anchor size={18} strokeWidth={1.5} aria-hidden="true" /> Portlink</span>
                <strong>One port call</strong><span className={styles.recordCaption}>Connected throughout</span>
                <div className={styles.recordContent} key={step}>
                  <span className={styles.recordStatus}>{current.record}</span>
                  <dl>{current.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
                </div>
              </div>
              {portCallRoles.map((partner, index) => {
                const Icon = partner.icon
                const active = current.active.includes(partner.id)
                return <div className={styles.node} data-node={index} data-active={active} key={partner.id}>
                  <Icon size={23} strokeWidth={1.5} aria-hidden="true" /><strong>{partner.title}</strong>
                  <span><i aria-hidden="true" />{current.states[partner.id]}</span>
                </div>
              })}
            </div>
            <p className={styles.legend}><span aria-hidden="true" /> Highlighted teams take part in this step</p>
          </div>
        </div>
        <div className={styles.permissions}><LockKeyhole size={17} aria-hidden="true" /><p><strong>Shared context. Clear permissions.</strong> Each team works with the information and actions available to its role.</p></div>
        <div className={styles.responsibilities}>
          {portCallRoles.map(partner => <div key={partner.id}><h3>{partner.title}</h3><p>{partner.body}</p></div>)}
        </div>
      </div>
    </section>
  )
}
