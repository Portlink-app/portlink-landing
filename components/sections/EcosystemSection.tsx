'use client'

import { useState } from 'react'
import { Anchor, Building2, Compass, Ship, ArrowRight, RotateCcw, Check } from 'lucide-react'
import styles from './EcosystemSection.module.css'

// These responsibilities are the existing published descriptions. The diagram demonstrates
// visibility of one update, not automatic approvals, berth allocation or an operational feed.
const partners = [
  {
    icon: Ship,
    title: 'Cruise lines',
    body: 'Push the itinerary and the requirements once. See prep status, agent confirmations and cost against estimate across the whole deployment, without calling anyone.',
  },
  {
    icon: Anchor,
    title: 'Port agents',
    body: 'Every inbound call from every line in one workspace, with the documents, the costs and the history attached to the call rather than to an inbox.',
  },
  {
    icon: Compass,
    title: 'Tour operators',
    body: 'Confirmed calls early enough to plan capacity, briefs that arrive in the same shape every time, and changes that come with a sign-off instead of a surprise.',
  },
  {
    icon: Building2,
    title: 'Ports and terminals',
    body: 'One view of who is arriving, what they need and who is handling it. Berth and service requests land on the call record with the documents attached, instead of arriving as an attachment to a message somebody has to forward.',
  },
]


const paths = ['M300 210 C300 135 110 155 110 85', 'M300 210 C300 135 490 155 490 85', 'M300 210 C300 285 110 265 110 335', 'M300 210 C300 285 490 265 490 335']

export default function EcosystemSection() {
  const [traced, setTraced] = useState(false)

  return (
    <section id="ecosystem" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.top}>
          <div className={styles.copy}>
            <span className={styles.eyebrow}>The connected port call</span>
            <h2>Four sides.<br />One shared record.</h2>
            <p>The status one side changes is the status the other three are reading. The itinerary, the conversation and the paperwork stay connected.</p>
            <button type="button" onClick={() => setTraced(!traced)} className={styles.trace}>
              {traced ? 'Reset illustration' : 'Trace a shared update'}
              {traced ? <RotateCcw size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
            </button>
            <span className={styles.note}>An illustration of how the shared record connects the teams.</span>
          </div>
          <div className={styles.diagram} data-traced={traced}>
            <div className={styles.grid} aria-hidden="true" />
            <svg viewBox="0 0 600 420" preserveAspectRatio="none" className={styles.lines} aria-hidden="true">
              {paths.map((d) => <path key={d} d={d} className={styles.basePath} />)}
              {paths.map((d, index) => <path key={d} d={d} pathLength="1" className={styles.signal} style={{ transitionDelay: `${index * 100}ms` }} />)}
            </svg>
            <div className={styles.record}>
              <span className={styles.recordIcon}><Anchor size={27} strokeWidth={1.5} aria-hidden="true" /></span>
              <strong>Portlink</strong>
              <span>One port call</span>
              <span className={styles.recordStatus} aria-live="polite">{traced ? 'Update shared' : 'The shared record'}</span>
            </div>
            {partners.map((partner, index) => {
              const Icon = partner.icon
              return (
                <div className={styles.node} data-node={index} key={partner.title}>
                  <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  <strong>{partner.title}</strong>
                  <span>{traced ? <><Check size={12} aria-hidden="true" /> Update visible</> : 'Connected'}</span>
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles.responsibilities}>
          {partners.map((partner) => <div key={partner.title}><h3>{partner.title}</h3><p>{partner.body}</p></div>)}
        </div>
      </div>
    </section>
  )
}
