'use client'
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import { useEffect, useState } from 'react'
import { display, body } from './fonts'
import { portCallRoles, type PortCallRole } from '@/components/sections/portCallStory'
import { setManualMotion, useMotionAllowed } from '@/components/film/useFilm'
import contract from './contract.json'
import ExpeditionStage, {
  type ExpeditionProduct,
  type ExpeditionRole,
  type ExpeditionStateItem,
} from './ExpeditionStage'
import styles from './AcquisitionOpening.module.css'

type Role = ExpeditionRole
type Product = ExpeditionProduct
const audience: Record<Role, PortCallRole | 'operator'> = {
  cruise: 'cruise',
  agent: 'agent',
  dmc: 'tour',
  operator: 'operator',
}
const roleKeys = Object.keys(contract.roles) as Role[]

/** Pinned illustrative content, never permission or purchase state. See docs/ACQUISITION.md. */
export default function AcquisitionOpening({ page }: { page: 'company' | Product }) {
  const [role, setRole] = useState<Role>(page === 'embark' ? 'operator' : 'cruise')
  const [index, setIndex] = useState(0)
  const [roleChosen, setRoleChosen] = useState(false)
  const product: Product = page === 'company' ? (role === 'operator' ? 'embark' : 'platform') : page
  const states = contract[product] as unknown as ExpeditionStateItem[]
  const state = states[index] ?? states[0]
  const motion = useMotionAllowed()
  const selected = contract.roles[role]
  const prefix = `discovery-${product}-`

  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.slice(1)
      if (page === 'company' && hash.startsWith('discovery-embark-') && role !== 'operator') {
        setRole('operator')
        setRoleChosen(true)
        return
      }
      const next = states.findIndex((item) => hash === prefix + item.id)
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

  const label = (key: Role) =>
    portCallRoles.find((item) => item.id === audience[key])?.label ?? contract.roles[key].label

  return (
    <div
      className={`${styles.root} ${display.variable} ${body.variable} ${product === 'embark' ? styles.embark : ''}`}
      data-acquisition={page}
      data-motion={motion ? 'on' : 'off'}
    >
      <section className={styles.opening} id={page === 'platform' ? 'overview' : 'hero'}>
        <div className={styles.intro}>
          <div>
            <p className={styles.kickerTag}>
              <span>
                {product === 'embark'
                  ? 'Embark by Portlink · Operator Dispatch & Departures'
                  : 'Portlink Maritime Workspace · Planner to Final Account'}
              </span>
            </p>
            <h1>
              {page === 'company' && !roleChosen
                ? 'From the first itinerary to the final port call.'
                : selected.headline}
            </h1>
          </div>

          <div className={styles.introAside}>
            <p className={styles.lead}>
              {page === 'company' && !roleChosen
                ? 'Software for cruise lines planning voyages years ahead, port agents and DMCs preparing each call, and independent tour operators running daily departures.'
                : role === 'operator'
                  ? 'Plan bookings, boat and guide capacity, and quayside check-in for your tour operation. Platform is not required.'
                  : selected.body}
            </p>
            <div className={styles.actions}>
              <a
                className={styles.cta}
                href={`/start/?product=${product}&audience=${audience[role]}`}
                data-cta={`trial-${page}-hero`}
              >
                Explore trial options
              </a>
              <a
                className={styles.secondaryCta}
                href="/#access"
                data-cta={
                  page === 'company'
                    ? 'demo-hero'
                    : `demo-${page === 'platform' ? 'portlink' : 'embark'}-hero`
                }
              >
                Book a 20-minute demo
              </a>
            </div>
          </div>
        </div>

        <div className={styles.controlDeck} id="discovery-workflow">
          {page === 'platform' && <span id="live-record" />}
          {page === 'embark' && <span id="quay-checkin" />}
          {page === 'company' && (
            <div className={styles.roleBlock}>
              <span className={styles.controlHeading}>1. Choose your role</span>
              <div className={styles.roles} role="group" aria-label="Choose your work">
                {roleKeys.map((key) => (
                  <button
                    type="button"
                    key={key}
                    onClick={() => selectRole(key)}
                    aria-pressed={role === key}
                  >
                    {label(key)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className={styles.stepBlock}>
            <p className={styles.controlHeading} data-scene-summary>
              {page === 'company' ? '2. Trace the handoff:' : 'Trace the handoff:'} Example:{' '}
              {state.status}
            </p>
            <div className={styles.sceneSteps} role="group" aria-label="Scene chapters">
              {states.map((item, i) => (
                <button
                  type="button"
                  key={item.id}
                  id={prefix + item.id}
                  aria-label={`Show ${item.label.toLowerCase()} scene`}
                  aria-pressed={index === i}
                  aria-controls="discovery-proof"
                  onClick={() => selectStep(i)}
                >
                  <span className={styles.stepNum}>0{i + 1}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <ExpeditionStage
          page={page}
          product={product}
          role={role}
          state={state}
          index={index}
          motion={motion}
          onSelectRole={selectRole}
          onSelectStep={selectStep}
          statesCount={states.length}
        />

        <div className={styles.caption}>
          <span>
            {product === 'embark'
              ? 'Embark · Independent tour operations (30-day trial path)'
              : 'Platform · Voyage and port-call planning (90-day trial path)'}
          </span>
          {page === 'company' && (
            <button
              type="button"
              className={styles.motionBtn}
              aria-pressed={motion}
              onClick={() => setManualMotion(!motion)}
            >
              Motion: {motion ? 'On' : 'Off'}
            </button>
          )}
        </div>

        {page === 'company' && (
          <div className={styles.products} aria-label="Portlink product family">
            <article className={styles.productDoor} data-active={product === 'platform'}>
              <div className={styles.doorMeta}>Maritime Workspace · 90-day trial</div>
              <h2>
                <a href="/portlink/">Platform</a>
              </h2>
              <p>
                Voyages, port calls, berth readiness, shorex requests and PDA-to-FDA settlement for
                cruise lines, port agents and DMCs.
              </p>
              <a href="/portlink/" className={styles.doorLink}>
                Explore 6 D14 Platform chapters →
              </a>
            </article>

            <article className={styles.productDoor} data-active={product === 'embark'}>
              <div className={styles.doorMeta}>Connected Product · Independent workspace</div>
              <h2>
                <a href="/embark/">
                  <img
                    src="/brand/embark-symbol-on-dark.svg"
                    alt=""
                    width={22}
                    height={22}
                    aria-hidden="true"
                    style={{ display: 'inline-block', verticalAlign: '-4px', marginRight: 8 }}
                  />
                  Embark
                </a>
              </h2>
              <p>
                Daily departures, boat and guide capacity, Vipps/Stripe web checkout and quayside
                check-in for tour operators. Platform is not required.
              </p>
              <a href="/embark/" className={styles.doorLink}>
                Explore 6 D14 Embark chapters →
              </a>
            </article>

            <article className={styles.productDoor}>
              <div className={styles.doorMeta}>Included Module &amp; Company Workspace</div>
              <h2>Wheelhouse</h2>
              <p>
                Contextual work management included in Platform for maritime teams, or available for
                company operations workspaces.
              </p>
              <a href="/#access" className={styles.doorLink}>
                Discuss a standalone workspace →
              </a>
            </article>
          </div>
        )}

        <noscript>
          {states.slice(1).map((item) => (
            <article key={item.id}>
              <h3>{item.title}</h3>
              <p>
                {item.body} Status: {item.status}.
              </p>
            </article>
          ))}
        </noscript>
      </section>
    </div>
  )
}
