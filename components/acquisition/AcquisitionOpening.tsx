'use client'
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useEffect, useState } from 'react'
import localFont from 'next/font/local'
import { portCallRoles, type PortCallRole } from '@/components/sections/portCallStory'
import { setManualMotion, useMotionAllowed } from '@/components/film/useFilm'
import contract from './contract.json'
import styles from './AcquisitionOpening.module.css'

const display = localFont({ src: '../../app/_fonts/schibsted-grotesk-latin.woff2', variable: '--acq-display', display: 'optional' })
const body = localFont({ src: '../../app/_fonts/manrope-latin.woff2', variable: '--acq-body', display: 'optional' })

type Role = keyof typeof contract.roles
type Product = 'platform' | 'embark'
const audience: Record<Role, PortCallRole | 'operator'> = { cruise: 'cruise', agent: 'agent', dmc: 'tour', operator: 'operator' }
const roleKeys = Object.keys(contract.roles) as Role[]

/** Pinned illustrative content, never permission or purchase state. See docs/ACQUISITION.md. */
export default function AcquisitionOpening({ page }: { page: 'company' | Product }) {
  const [role, setRole] = useState<Role>(page === 'embark' ? 'operator' : 'cruise')
  const [index, setIndex] = useState(0)
  const [roleChosen, setRoleChosen] = useState(false)
  const product: Product = page === 'company' ? (role === 'operator' ? 'embark' : 'platform') : page
  const states = contract[product]
  const state = states[index] ?? states[0]
  const motion = useMotionAllowed()
  const selected = contract.roles[role]
  const prefix = `discovery-${product}-`

  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.slice(1)
      if (page === 'company' && hash.startsWith('discovery-embark-') && role !== 'operator') { setRole('operator'); setRoleChosen(true); return }
      const next = states.findIndex(item => hash === prefix + item.id)
      if (next >= 0) setIndex(next)
    }
    readHash()
    window.addEventListener('hashchange', readHash)
    return () => window.removeEventListener('hashchange', readHash)
  }, [states, prefix, page, role])

  function selectStep(next: number) {
    setIndex(next)
    window.history.replaceState(null, '', `#${prefix}${states[next].id}`)
  }

  function selectRole(next: Role) {
    setRole(next)
    setRoleChosen(true)
    setIndex(0)
    // Old chapter hashes must not select an unrelated product on the next page load.
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
  }

  const label = (key: Role) => portCallRoles.find(item => item.id === audience[key])?.label ?? contract.roles[key].label
  return <div className={`${styles.root} ${display.variable} ${body.variable} ${product === 'embark' ? styles.embark : ''}`} data-acquisition={page} data-motion={motion ? 'on' : 'off'}>
    <section className={styles.opening} id={page === 'platform' ? 'overview' : 'hero'}>
      <div className={styles.intro}>
        <h1>{page === 'company' && !roleChosen ? 'Find your next workspace' : selected.headline}</h1>
        <div><p className={styles.lead}>{page === 'company' && !roleChosen ? 'Software for the people planning voyages, arranging port calls and running tours.' : selected.body}</p>
          <div className={styles.actions}>
            <a className={styles.cta} href="/#access" data-cta={page === 'company' ? 'demo-hero' : `demo-${page === 'platform' ? 'portlink' : 'embark'}-hero`}>Book a 20-minute demo</a>
            <a href={`/start/?product=${product}&audience=${audience[role]}`} data-cta={`trial-${page}-hero`}>Explore trial options</a>
          </div>
        </div>
      </div>
      {page === 'company' && <div className={styles.roles} role="group" aria-label="Choose your work">
        {roleKeys.map(key => <button key={key} onClick={() => selectRole(key)} aria-pressed={role === key}>{label(key)}</button>)}
      </div>}
      <div className={styles.stage}>
        <img className={styles.landscape} src={product === 'embark' ? '/product/sea-kayak-800.webp' : '/product/fjord-cruise-1600.webp'} srcSet={product === 'embark' ? '/product/sea-kayak-800.webp 800w, /product/sea-kayak-1600.webp 1600w' : '/product/fjord-cruise-800.webp 800w, /product/fjord-cruise-1600.webp 1600w'} sizes="(max-width: 767px) calc(100vw - 40px), 94vw" alt={product === 'embark' ? 'Kayaking on coastal water' : 'A cruise vessel in a Norwegian fjord'} width={1600} height={1000} fetchPriority="high" />
        <div className={styles.panel}>
          <p>{product === 'embark' ? 'Sample departure · Coastal kayaking' : 'Sample voyage · Summer 2028'}</p>
          <strong>{product === 'embark' ? '12 guests. One prepared team.' : 'The itinerary comes first.'}</strong>
          <p>{product === 'embark' ? 'Bookings and capacity stay visible before the first guest arrives.' : 'One proposed Bergen call becomes a shore request, then an explicit commitment.'}</p>
          <a href={product === 'embark' ? '/embark/' : '/portlink/'}>{product === 'embark' ? 'Explore Embark' : 'Explore Platform'} →</a>
        </div>
      </div>
      <div className={styles.caption}><span>{product === 'embark' ? 'Embark · Independent tour operations' : 'Platform · Voyage and port-call planning'}</span><button aria-pressed={motion} onClick={() => setManualMotion(!motion)}>Motion: {motion ? 'On' : 'Off'}</button></div>
      {page === 'company' && <div className={styles.products}>
        <article><h2><a href="/portlink/">Platform</a></h2><p>Voyages, port calls and the people preparing them.</p></article>
        <article><h2><a href="/embark/">Embark</a></h2><p>Departures, bookings and delivery for independent tour operators.</p></article>
        <article><h2>Wheelhouse</h2><p>Work management included in Platform. <a href="/#access">Discuss a standalone workspace</a>.</p></article>
      </div>}
    </section>
    <section className={styles.chapter} id="discovery-workflow" aria-label="Illustrative workflow">
      {page === 'platform' && <span id="live-record" />}
      {page === 'embark' && <span id="quay-checkin" />}
      <div className={styles.chapterHead}><h2>{product === 'embark' ? 'Review a changed departure' : 'Follow a planned call'}</h2><p>{product === 'embark' ? 'A capacity change needs a human decision.' : 'Begin with the planner, then follow one call into a shore request and accepted quote.'}</p></div>
      <nav className={styles.steps} aria-label="Example chapters">
        {states.map((item, i) => <button key={item.id} id={prefix + item.id} aria-current={i === index ? 'step' : undefined} aria-controls="discovery-proof" onClick={() => selectStep(i)}>{item.label}</button>)}
      </nav>
      <div className={styles.proof} id="discovery-proof">
        <div><p>{state.owner}</p><h3>{state.title}</h3><p>{state.body}</p>
          <div className={styles.controls}><button disabled={index === 0} onClick={() => selectStep(index - 1)}>Previous</button><button onClick={() => selectStep(index === states.length - 1 ? 0 : index + 1)}>{index === states.length - 1 ? 'Replay' : 'Next chapter'}</button></div>
        </div>
        <div className={styles.sample} key={`${product}-${state.id}`} data-ui>
          <p>{state.record}</p><strong role="status" aria-live="polite">{state.status}</strong>
          <dl>{state.rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
          <p>Illustrative workflow · no live booking</p>
        </div>
      </div>
      <noscript>{states.slice(1).map(item => <article key={item.id}><h3>{item.title}</h3><p>{item.body} Status: {item.status}.</p></article>)}</noscript>
    </section>
  </div>
}
