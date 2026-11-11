'use client'
import { useEffect, useRef } from 'react'
import { useProductSession } from './ProductSession'
import { audienceLabels, demoRecord, topics } from './journey-content'
import styles from './ProductJourney.module.css'
export default function ProductDemo({ topic, onClose, onRestore }: { topic: string; onClose: () => void; onRestore: () => void }) {
  const session = useProductSession()
  const ref = useRef<HTMLDialogElement>(null)
  const restore = useRef(onRestore)
  useEffect(() => { restore.current = onRestore }, [onRestore])
  useEffect(() => {
    const dialog = ref.current; const oldOverflow = document.body.style.overflow
    dialog?.showModal(); document.body.style.overflow = 'hidden'
    return () => { dialog?.close(); document.body.style.overflow = oldOverflow; restore.current() }
  }, [])
  const record = demoRecord(session.product, session.preferences.audience, topic, !!session.progress[topic])
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="product-demo-title" onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(el => el.getClientRects().length)
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }} onCancel={event => { event.preventDefault(); onClose() }}>
    <div className={styles.demoHeader}><div><p>Illustrative demo · No live operations</p><h2 id="product-demo-title">{session.product === 'embark' ? 'Embark' : 'Platform'} / {audienceLabels[session.preferences.audience]}</h2></div><button autoFocus onClick={onClose}>Close demo</button></div>
    <nav className={styles.demoNav} aria-label="Explore demo topics">{topics[session.product].map(t => <button key={t.id} aria-pressed={t.id === topic} onClick={() => session.open(t.id)}>{t.id}</button>)}</nav>
    <div className={styles.demoBody}>
      <section className={styles.record} data-ui aria-label="Sample workspace" style={{ borderColor: session.preferences.brandColor || undefined }}>
        <p>{session.preferences.companyName || 'Your company'} · Sample workspace</p><h3>{record.title}</h3><p>Owner: {record.owner}</p>
        <dl>{record.rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
        <button className={styles.primary} onClick={() => session.review(topic)}>{record.action}</button>
        {session.progress[topic] && <p role="status">{record.result}</p>}
      </section>
      <aside><h3>Try one task</h3><p>Review the sample record, then use the outlined action to see its consequence. Explore other topics without losing your progress.</p><p id="demo-unavailable">Sending, payments and real bookings are unavailable in this illustrative demo.</p><button disabled aria-describedby="demo-unavailable">Send to customer</button><button onClick={session.resetDemo}>Reset sample operations</button><p>Your company preferences are kept when you reset the sample.</p></aside>
    </div>
  </dialog>
}
