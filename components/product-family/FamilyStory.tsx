'use client'

import { useEffect, useRef, useState } from 'react'
import { scenes, type Product, type Scene } from './content'
import styles from './Family.module.css'

function RecordSheet({ scene, index }: { scene: Scene; index: number }) {
  return <div className={styles.record}>
    <div className={styles.sheetHead}><span>{scene.owner}</span><span>0{index + 1} / 03</span></div>
    <strong>Icefjord by boat</strong><p>Ilulissat · Illustrative record</p>
    <dl>{scene.fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
    <div className={styles.status}><span/> {scene.status}</div>
  </div>
}

export default function FamilyStory({ product }: { product: Product }) {
  const steps = scenes[product]
  const articles = useRef<(HTMLElement | null)[]>([])
  const [active, setActive] = useState(0)
  useEffect(() => {
    const update = () => {
      const mid = window.innerHeight * 0.55
      let current = 0
      articles.current.forEach((el, i) => { if (el && el.getBoundingClientRect().top <= mid) current = i })
      setActive(current)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => { window.removeEventListener('scroll', update); window.removeEventListener('resize', update) }
  }, [])
  return <section id={product === 'Embark' ? 'departure' : 'pain'} className={styles.story} aria-label="Illustrative walkthrough">
    <div className={styles.steps}>{steps.map((step, i) => <article key={step.title} ref={el => { articles.current[i] = el }}>
      <small>{product} walkthrough · 0{i + 1} / 03</small><h2>{step.title}</h2><p>{step.body}</p>
      <div className={styles.inline}><RecordSheet scene={step} index={i}/></div>
    </article>)}</div>
    <div className={styles.stage} aria-hidden="true"><div className={styles.stageInner}><RecordSheet scene={steps[active]} index={active}/></div></div>
    <div className={styles.transcript}><h3>Example record details</h3>{steps.map((step,i) => <RecordSheet key={step.title} scene={step} index={i}/>)}</div>
  </section>
}
