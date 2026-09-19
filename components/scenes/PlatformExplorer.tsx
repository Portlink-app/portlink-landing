'use client'

import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ArrowRight, LayoutDashboard, Anchor, GitBranch, Receipt, ListChecks, MessagesSquare, ShieldCheck } from 'lucide-react'
import { chapters } from './chapters'
import styles from './PlatformExplorer.module.css'

const icons = [LayoutDashboard, Anchor, GitBranch, Receipt, ListChecks, MessagesSquare, ShieldCheck]

/** One chapter controller. Direct fragments and browser history select the same panels as the tabs. */
export default function PlatformExplorer() {
  const [active, setActive] = useState(0)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const read = () => {
      const index = chapters.findIndex((chapter) => `#${chapter.id}` === window.location.hash)
      if (index >= 0) {
        setActive(index)
        root.current?.scrollIntoView({ behavior: 'instant', block: 'start' })
      }
    }
    const frame = requestAnimationFrame(read)
    window.addEventListener('hashchange', read)
    window.addEventListener('popstate', read)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('hashchange', read)
      window.removeEventListener('popstate', read)
    }
  }, [])

  function select(index: number, focus = false) {
    setActive(index)
    // Keep Next's router history fields intact and avoid native scrolling to a hidden panel.
    window.history.replaceState(window.history.state, '', `#${chapters[index].id}`)
    if (focus) tabs.current[index]?.focus({ preventScroll: true })
  }

  function keyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number
    if (event.key === 'ArrowRight') next = (index + 1) % chapters.length
    else if (event.key === 'ArrowLeft') next = (index - 1 + chapters.length) % chapters.length
    else if (event.key === 'Home') next = 0
    else if (event.key === 'End') next = chapters.length - 1
    else return
    event.preventDefault()
    select(next, true)
  }

  return (
    <section id="dashboard" ref={root} className={styles.explorer} aria-label="Explore the Portlink platform">
      {/* A stable first panel prevents hydration from collapsing a full page of previews. */}
      <noscript><style>{'#dashboard [data-platform-panel] { display: block; } #dashboard [role="tablist"], #dashboard [data-platform-next] { display: none; }'}</style></noscript>
      <div className={styles.inner}>
        <div className={styles.labelRow}>
          <span className="section-eyebrow">Inside the platform</span>
          <span className={styles.instruction}>Choose a surface. See how it works.</span>
        </div>
        <div className={styles.tabs} role="tablist" aria-label="Platform surfaces">
          {chapters.map((chapter, index) => {
            const Icon = icons[index]
            return (
              <button key={chapter.id} ref={(node) => { tabs.current[index] = node }}
                id={`platform-tab-${chapter.id}`} role="tab" type="button"
                aria-selected={active === index} aria-controls={`platform-panel-${chapter.id}`}
                tabIndex={active === index ? 0 : -1} onClick={() => select(index)}
                onKeyDown={(event) => keyDown(event, index)}>
                <Icon size={18} aria-hidden="true" /><span>{chapter.label}</span>
              </button>
            )
          })}
        </div>
        {chapters.map((chapter, index) => {
          const Scene = chapter.component
          return (
            <div key={chapter.id} id={`platform-panel-${chapter.id}`} role="tabpanel" data-platform-panel
              aria-labelledby={`platform-tab-${chapter.id}`} tabIndex={0}
              hidden={active !== index} className={styles.panel}>
              {/* Legacy section fragments remain real targets even before JavaScript is available. */}
              {chapter.id !== 'dashboard' && <span id={chapter.id} className={styles.anchor} />}
              <div className={styles.copy}>
                <div><span className={styles.chapter}>0{index + 1} / 0{chapters.length}</span><h3>{chapter.title}</h3></div>
                <p>{chapter.body}</p>
              </div>
              <div className={styles.stage}><Scene /></div>
            </div>
          )
        })}
        <div className={styles.footer}>
          <span>Product interface preview <span aria-hidden="true">·</span> Illustrative data</span>
          <button type="button" data-platform-next onClick={() => select((active + 1) % chapters.length, true)}>
            {active === chapters.length - 1 ? 'Back to overview' : `Explore ${chapters[active + 1].label.toLowerCase()}`}
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  )
}
