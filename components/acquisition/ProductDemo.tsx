'use client'
import { customerBrand } from '@/lib/customer-brand'
import { useProductSession } from './ProductSession'
import { audienceLabels, demoRecord, topics } from './journey-content'
import styles from './ProductJourney.module.css'
export default function ProductDemo({ topic }: { topic: string }) {
  const session = useProductSession()
  const record = demoRecord(session.product, session.preferences.audience, topic, !!session.progress[topic])
  const brand = customerBrand(session.preferences.brandColor)
  return <>
    <nav className={styles.demoNav} aria-label="Explore demo topics">{topics[session.product].map(t => <button key={t.id} aria-pressed={t.id === topic} onClick={() => session.open(t.id)}>{t.id}</button>)}</nav>
    <div className={styles.demoBody}>
      <section className={styles.record} data-ui aria-label="Sample workspace" >
        <p className={styles.customerBrand} style={{ background: brand.effective, color: brand.foreground }}>{session.preferences.companyName || 'Your company'} · Sample workspace</p><h3>{record.title}</h3><p>Owner: {record.owner}</p>
        <dl>{record.rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
        {record.unavailable && <p id="topic-unavailable">{record.unavailable}</p>}<button disabled={!!record.unavailable} aria-describedby={record.unavailable ? 'topic-unavailable' : undefined} className={styles.primary} onClick={() => session.review(topic)}>{record.action}</button>
        {session.progress[topic] && <p role="status">{record.result}</p>}
      </section>
      <aside><h3>Try one task</h3><p>Review the sample record, then use the outlined action to see its consequence. Explore other topics without losing your progress.</p><p id="demo-unavailable">Sending, payments and real bookings are unavailable in this illustrative demo.</p><button disabled aria-describedby="demo-unavailable">Send to customer</button><button onClick={session.resetDemo}>Reset sample operations</button><p>Your company preferences are kept when you reset the sample.</p></aside>
    </div>
  </>
}
