import { ArrowUpRight, Plus } from 'lucide-react'
import styles from './PainSection.module.css'

const problems = [
  { number: '01', title: 'Which version is everyone working from?', situation: 'The itinerary changes. A spreadsheet, an email and the agent’s copy now tell different stories.', answer: 'Keep the itinerary and the call together. Follow the request from planning through confirmation and see what needs attention.', label: 'Follow a port call', href: '#calls', detail: 'Itinerary · request · confirmation' },
  { number: '02', title: 'Where did we agree that change?', situation: 'A new arrival time is buried in a thread. The people preparing the call need the decision and its context.', answer: 'Keep messages with the call they concern. Review operational amendments with a record of the response.', label: 'See the conversation', href: '#messages', detail: 'Conversation · amendment · response' },
  { number: '03', title: 'What happened between the estimate and the bill?', situation: 'An estimate in one file, supporting documents in another. Comparing them becomes a separate job.', answer: 'Prepare and review the disbursement account against its port call, with cost items and supporting documents together.', label: 'Open the finance view', href: '#finance', detail: 'Estimate · documents · review' },
]

export default function PainSection() {
  return (
    <section id="pain" className={styles.section}>
      <div className={styles.layout}>
        <div className={styles.intro}>
          <span className="section-eyebrow">The work between port calls</span>
          <h2>Too much depends on finding the right file.</h2>
          <p>Port calls cross teams, time zones and systems. The handover is where the gaps show.</p>
          <span className={styles.note}>Open a question to see how the work connects.</span>
        </div>
        <div className={styles.questions}>
          {problems.map((item, index) => (
            <details key={item.number} name="port-call-problems" open={index === 0} className={styles.question}>
              <summary><span className={styles.number}>{item.number}</span><h3>{item.title}</h3><Plus size={20} aria-hidden="true" /></summary>
              <div className={styles.answer}>
                <p>{item.situation}</p>
                <div className={styles.connected}><span>{item.detail}</span><p>{item.answer}</p><a href={item.href}>{item.label}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
