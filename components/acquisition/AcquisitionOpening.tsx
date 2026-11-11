'use client'
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useEffect, useState } from 'react'
import { getImageProps } from 'next/image'
import { display, body } from './fonts'
import { portCallRoles, type PortCallRole } from '@/components/sections/portCallStory'
import { setManualMotion, useMotionAllowed } from '@/components/film/useFilm'
import contract from './contract.json'
import styles from './AcquisitionOpening.module.css'


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
  const scenery = product === 'embark' ? 'operator' : 'coast'
  const { props: phoneScenery } = getImageProps({
    src: `/acquisition/${scenery}-phone.webp`, alt: '', width: 640, height: 960,
    sizes: '(max-width: 767px) calc(100vw - 40px), 640px',
  })
  const changedCapacity = product === 'embark' && index > 0

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
        <div><p className={styles.lead}>{page === 'company' && !roleChosen ? 'Software for the people planning voyages, arranging port calls and running tours.' : role === 'operator' ? 'Plan bookings, capacity and guide preparation for your tour operation.' : selected.body}</p>
          <div className={styles.actions}>
            <a className={styles.cta} href="/#access" data-cta={page === 'company' ? 'demo-hero' : `demo-${page === 'platform' ? 'portlink' : 'embark'}-hero`}>Book a 20-minute demo</a>
            <a href={`/start/?product=${product}&audience=${audience[role]}`} data-cta={`trial-${page}-hero`}>Explore trial options</a>
          </div>
        </div>
      </div>
      {page === 'company' && <div className={styles.roles} role="group" aria-label="Choose your work">
        {roleKeys.map(key => <button key={key} onClick={() => selectRole(key)} aria-pressed={role === key}>{label(key)}</button>)}
      </div>}
      <p data-scene-summary>Example: {state.status}</p>
      <div className={styles.sceneSteps} role="group" aria-label="Scene chapters">
        {states.map((item, i) => <button key={item.id} aria-label={`Show ${item.label.toLowerCase()} scene`} aria-pressed={index === i} onClick={() => selectStep(i)}>{item.label}</button>)}
      </div>
      <div className={styles.stage} data-scene={product} data-chapter={state.id}>
        <picture className={styles.scenery}>
          <source media="(max-width: 767px)" srcSet={phoneScenery.srcSet} sizes={phoneScenery.sizes} />
          <img className={styles.landscape} src={`/acquisition/${scenery}-wide.webp`} alt="" width={1536} height={1024} fetchPriority="high" />
        </picture>
        <div className={styles.actors} aria-label={product === 'embark' ? 'Independent operation' : 'Separate supporting organisations'}>
          {product === 'platform' ? <>
            <span className={styles.ship}>Assigned vessel</span>
            <span className={styles.agent} data-selected={role === 'agent'}>Port agent</span>
            <span className={styles.dmc} data-selected={role === 'dmc'}>DMC</span>
          </> : <><span className={styles.operator}>Tour operator</span><span className={styles.guide}>Guide</span></>}
        </div>
        <div className={styles.panel} data-scene-record>
          <p className={styles.record}>{state.record}</p>
          <p className={styles.owner}>Owner: {state.owner}</p>
          <h2>{state.status}</h2>
          {product === 'platform' && <div className={styles.itinerary} aria-label="Future itinerary context">
            <span>Summer <b>2028</b></span><span>Northern coast<b>Bergen call</b></span>
          </div>}
          {product === 'embark' && <div className={styles.capacity}>
            <p>{changedCapacity ? '10 seats · 12 booked guests' : '12 seats · 12 booked guests'}</p>
            <div className={styles.places} aria-hidden="true">{Array.from({ length: 12 }, (_, seat) => <span key={seat} data-unresolved={changedCapacity && seat >= 10}>{seat + 1}</span>)}</div>
            <p>{changedCapacity ? '2 unresolved guests. No automatic reassignment.' : 'Guide assigned. Capacity remains the operator’s responsibility.'}</p>
          </div>}
          <dl>{state.rows.map(([name, value]) => <div key={name}><dt>{name}</dt><dd>{value}</dd></div>)}</dl>
          <p className={styles.sceneExplanation}>{state.body}</p>
          <a href={page === 'company' ? (product === 'embark' ? '/embark/' : '/portlink/') : '#discovery-workflow'}>{page === 'company' ? (product === 'embark' ? 'Explore Embark' : 'Explore Platform') : 'Read the workflow example'} →</a>
        </div>
        <p className={styles.sceneNote}>Illustrative Greenland setting. {product === 'platform' ? 'Bergen workflow example.' : 'Independent operator example.'} No live booking.</p>
      </div>
      <div className={styles.caption}><span>{product === 'embark' ? 'Embark · Independent tour operations' : 'Platform · Voyage and port-call planning'}</span>{page === 'company' && <button aria-pressed={motion} onClick={() => setManualMotion(!motion)}>Motion: {motion ? 'On' : 'Off'}</button>}</div>
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
        <div><p>Owner: {state.owner}</p><h3>{state.title}</h3><p>{state.body}</p>
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
