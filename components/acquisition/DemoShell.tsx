'use client'
import { useEffect, useRef, useState, type ComponentType } from 'react'
import { useProductSession } from './ProductSession'
import { audienceLabels } from './journey-content'
import styles from './ProductJourney.module.css'
export default function DemoShell({ topic, onClose, onRestore }: { topic: string; onClose: () => void; onRestore: () => void }) {
  const s = useProductSession(), ref = useRef<HTMLDialogElement>(null), restore = useRef(onRestore)
  const [Body, setBody] = useState<ComponentType<{ topic: string }> | null>(null)
  const [failed, setFailed] = useState(false)
  useEffect(() => { restore.current = onRestore }, [onRestore])
  useEffect(() => { let live = true; import('./ProductDemo').then(m => { if (live) setBody(() => m.default) }).catch(() => { if (live) setFailed(true) }); return () => { live = false } }, [])
  useEffect(() => { const dialog = ref.current, previous = document.body.style.overflow; dialog?.showModal(); document.body.style.overflow = 'hidden'; return () => { dialog?.close(); document.body.style.overflow = previous; restore.current() } }, [])
  return <dialog ref={ref} className={styles.dialog} aria-labelledby="product-demo-title" onCancel={e => { e.preventDefault(); onClose() }} onKeyDown={event => {
    if (event.key !== 'Tab') return
    const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), [tabindex="0"]')).filter(el => el.getClientRects().length)
    const first = controls[0], last = controls[controls.length - 1]
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
  }}>
    <div className={styles.demoHeader}><div><p>Illustrative demo · No live operations</p><h2 id="product-demo-title">{s.product === 'embark' ? 'Embark' : 'Platform'} / {audienceLabels[s.preferences.audience]} / {topic}</h2></div><button autoFocus onClick={onClose}>Close demo</button></div>
    {Body ? <Body topic={topic} /> : <section role="status"><p>{failed ? 'The interactive example could not load. The topic page remains readable.' : 'Loading the interactive example…'}</p><button onClick={onClose}>Return to readable topic</button></section>}
  </dialog>
}
