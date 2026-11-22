'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { useMotionAllowed, useNarrow } from '@/components/film/useFilm'
import { FramePlayer } from '@/components/harbour/frames/FramePlayer'
import { loadOcean } from '@/components/harbour/water/lazy'
import type { Ocean } from '@/components/harbour/water/ocean'
import type { RigCamera } from '@/components/harbour/water/camera'
import { BEATS_V4, CAPTURES_V4, ROLE_DESKS, type BeatV4 } from './scriptV4'
import styles from './harbour-v4.module.css'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function CapturePictureV4({
  id,
  mist = false,
  compact = false,
  loading = 'eager',
}: {
  id: keyof typeof CAPTURES_V4
  mist?: boolean
  compact?: boolean
  loading?: 'eager' | 'lazy'
}) {
  const cap = CAPTURES_V4[id]
  if (!cap) return null
  const cardClass = mist
    ? styles.captureCardMist
    : compact
      ? styles.captureCardStage
      : styles.captureCard
  return (
    <figure className={cardClass} data-ui="true">
      <picture>
        {cap.phone ? <source media="(max-width: 640px)" srcSet={cap.phone} /> : null}
        <img
          src={cap.desktop}
          alt={cap.alt}
          width={1440}
          height={900}
          loading={loading}
          decoding="async"
          className={compact ? styles.captureImgStage : styles.captureImg}
        />
      </picture>
      <figcaption className={mist ? styles.captionMist : styles.caption}>{cap.caption}</figcaption>
    </figure>
  )
}

export function RoleSwitcherV4() {
  const [activeRole, setActiveRole] = useState(ROLE_DESKS[0].id)
  const current = ROLE_DESKS.find((r) => r.id === activeRole) ?? ROLE_DESKS[0]

  return (
    <div className={styles.roleLayout}>
      <div className={styles.revealItem} data-reveal="true">
        <h2 className={styles.h2}>One call. Each role, its part.</h2>
        <p className={styles.leadMist}>
          Shared context is not shared everything. Switch roles to inspect the real screen each team works in on the Bergen call.
        </p>
        <div className={styles.roleTabs} role="tablist" aria-label="Choose your maritime role">
          {ROLE_DESKS.map((desk) => {
            const on = desk.id === current.id
            return (
              <button
                key={desk.id}
                type="button"
                role="tab"
                aria-selected={on}
                className={`${styles.roleTabBtn} ${on ? styles.roleTabBtnActive : ''}`}
                onClick={() => setActiveRole(desk.id)}
              >
                {desk.role}
              </button>
            )
          })}
        </div>
        <div className={styles.rolePanel} role="tabpanel">
          <h3 className={styles.h3}>{current.title}</h3>
          <p className={styles.bodyMist}>{current.summary}</p>
          <div className={styles.actions}>
            <a className={styles.btnMistPrimary} href={`#beat-${current.beatId}`}>
              Jump to this beat
            </a>
            <a className={styles.btnPrimary} href="#session">
              Get your free setup
            </a>
          </div>
        </div>
      </div>
      <div className={styles.revealItem} data-reveal="true">
        <CapturePictureV4 id={current.captureId} mist />
      </div>
    </div>
  )
}

export function HarbourV4PilotForm() {
  const [role, setRole] = useState('Cruise Line')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      const r = await fetch('/api/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'pilot',
          role,
          name,
          email,
          company,
          message,
          website: '',
        }),
      })
      if (r.ok) {
        setStatus('sent')
      } else {
        const data = (await r.json().catch(() => ({}))) as { error?: string }
        setErrorMsg(data.error ?? 'Could not submit request. Please check your work email.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Network error. Please try again.')
      setStatus('error')
    }
  }

  return (
    <form className={`${styles.pilotFormCard} ${styles.revealItem}`} data-reveal="true" onSubmit={onSubmit}>
      <h3 className={styles.h3}>Start your 30-day workspace</h3>
      <p className={styles.bodyMist}>
        Choose your organisation type and work email. We configure your first port call with you.
      </p>
      <div className={styles.pilotFormStack}>
        <div>
          <label htmlFor="v4-org-type" className={styles.pilotFieldLabel}>
            Organisation type
          </label>
          <select
            id="v4-org-type"
            className={styles.pilotInput}
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="Cruise Line">Cruise line</option>
            <option value="Port Agent">Port agent</option>
            <option value="Tour Operator">Tour operator or DMC</option>
            <option value="Port or Terminal">Port or terminal</option>
            <option value="Other">Something else</option>
          </select>
        </div>
        <div>
          <label htmlFor="v4-name" className={styles.pilotFieldLabel}>
            Full name
          </label>
          <input
            id="v4-name"
            type="text"
            required
            autoComplete="name"
            placeholder="Henrik Lindqvist"
            className={styles.pilotInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="v4-email" className={styles.pilotFieldLabel}>
            Work email
          </label>
          <input
            id="v4-email"
            type="email"
            required
            autoComplete="email"
            placeholder="henrik@nordic-cruise.no"
            className={styles.pilotInput}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="v4-company" className={styles.pilotFieldLabel}>
            Company or port authority
          </label>
          <input
            id="v4-company"
            type="text"
            required
            autoComplete="organization"
            placeholder="Nordic Expedition Lines"
            className={styles.pilotInput}
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="v4-message" className={styles.pilotFieldLabel}>
            Key ports or call notes
          </label>
          <textarea
            id="v4-message"
            rows={3}
            placeholder="Bergen, Tromso, Longyearbyen or your upcoming call schedule"
            className={styles.pilotInput}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <div>
          <button type="submit" className={styles.btnPrimary} disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending request' : 'Get your free setup'}
          </button>
        </div>
        {status === 'sent' ? (
          <p className={styles.pilotStatus} role="status">
            Request received. Check your work inbox for your setup confirmation.
          </p>
        ) : null}
        {status === 'error' ? (
          <p className={styles.pilotStatus} role="alert">
            {errorMsg}
          </p>
        ) : null}
      </div>
    </form>
  )
}

export default function HarbourV4Stage() {
  const motion = useMotionAllowed()
  const narrow = useNarrow()
  // The 16:9 canvasViewport uses the 16:9 desktop sequence and camera projection at all widths so
  // mobile never stretches a portrait 585x1266 frame into a 16:9 stage.
  const tier = 'd' as 'd' | 'p'

  const rootRef = useRef<HTMLElement>(null)
  const waterRef = useRef<HTMLCanvasElement>(null)
  const plateRef = useRef<HTMLCanvasElement>(null)
  const scrubberRef = useRef<HTMLInputElement>(null)
  const oceanRef = useRef<Ocean | null>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const playersRef = useRef<Record<string, FramePlayer>>({})
  const camsRef = useRef<Record<string, RigCamera>>({})
  const progressRef = useRef(0)

  const [activeBeatId, setActiveBeatId] = useState<BeatV4['id']>('b00')
  const [selectedCapture, setSelectedCapture] = useState<keyof typeof CAPTURES_V4 | null>(null)

  const activeBeat = BEATS_V4.find((b) => b.id === activeBeatId) ?? BEATS_V4[0]
  const beatCaptures = [activeBeat.primaryCapture, ...activeBeat.insetCaptures]
  const shownCapture =
    selectedCapture && beatCaptures.includes(selectedCapture)
      ? selectedCapture
      : activeBeat.primaryCapture

  const drawFrame = useCallback(
    (beat: BeatV4, p: number, force = false) => {
      const player = playersRef.current[`${tier}:${beat.id}`]
      if (!player) return
      const idx = player.seek(p)
      const shown = player.draw(force)
      const cam = camsRef.current[`${tier}:${beat.id}`]
      if (cam && oceanRef.current) {
        const frameIdx = shown >= 0 ? shown : idx
        const sx = cam.ship_x?.[frameIdx] ?? 0
        oceanRef.current.step(sx)
      }
    },
    [tier],
  )

  const ensureBeatPlayer = useCallback(
    (beat: BeatV4) => {
      const pc = plateRef.current
      if (!pc) return
      const key = `${tier}:${beat.id}`
      const base = `/media/harbour-v4/${tier}/${beat.id}/`
      const count = tier === 'p' ? beat.pFrames : beat.dFrames
      if (!playersRef.current[key]) {
        playersRef.current[key] = new FramePlayer(pc, {
          count,
          layers: ['shadow_', 'plate_'],
          radius: 8,
          concurrency: 6,
          url: (i, layer) => `${base}${layer}${String(i + 1).padStart(4, '0')}.avif`,
        })
      }
    },
    [tier],
  )

  useEffect(() => {
    const pc = plateRef.current
    if (!pc) return
    const dpr = Math.min(window.devicePixelRatio || 1, tier === 'p' ? 2 : 1.5)
    const w = tier === 'p' ? 585 : 1440
    const h = tier === 'p' ? 1266 : 810
    const targetW = Math.round(w * dpr)
    const targetH = Math.round(h * dpr)
    if (pc.width !== targetW || pc.height !== targetH) {
      pc.width = targetW
      pc.height = targetH
    }

    ensureBeatPlayer(activeBeat)
    // Pre-warm the next beat player so scrolling across a boundary has frame 0 ready.
    const curIdx = BEATS_V4.findIndex((b) => b.id === activeBeat.id)
    if (curIdx >= 0 && curIdx + 1 < BEATS_V4.length) {
      const nextBeat = BEATS_V4[curIdx + 1]
      ensureBeatPlayer(nextBeat)
      playersRef.current[`${tier}:${nextBeat.id}`]?.seek(0)
    }

    const key = `${tier}:${activeBeat.id}`
    const base = `/media/harbour-v4/${tier}/${activeBeat.id}/`
    drawFrame(activeBeat, progressRef.current, true)

    let cancelled = false
    const ensureCam = async () => {
      if (!camsRef.current[key]) {
        try {
          const r = await fetch(`${base}camera.json`)
          if (r.ok) camsRef.current[key] = (await r.json()) as RigCamera
        } catch {
          return
        }
      }
      if (cancelled) return
      const cam = camsRef.current[key]
      if (!cam) return
      if (oceanRef.current) {
        oceanRef.current.setCamera(cam)
      } else if (motion && waterRef.current) {
        const oc = await loadOcean(waterRef.current, cam, {
          dpr,
          sim: tier === 'p' ? 192 : 256,
          seg: tier === 'p' ? 160 : 256,
        })
        if (oc && waterRef.current && !oceanRef.current && !cancelled) {
          oc.resize(waterRef.current.clientWidth || 720, waterRef.current.clientHeight || 405)
          oceanRef.current = oc
        }
      }
      if (!cancelled) {
        drawFrame(activeBeat, progressRef.current, true)
      }
    }
    void ensureCam()
    return () => {
      cancelled = true
    }
  }, [activeBeat, drawFrame, ensureBeatPlayer, motion, tier])

  // Gentle ambient water step while reading a beat at rest, and redraw when async bitmaps arrive.
  useEffect(() => {
    if (!motion) return
    let raf = 0
    let last = 0
    const loop = (now: number) => {
      if (now - last >= 33) {
        last = now
        drawFrame(activeBeat, progressRef.current, false)
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [activeBeat, drawFrame, motion])

  useEffect(() => {
    const players = playersRef.current
    return () => {
      for (const p of Object.values(players)) p.dispose()
      oceanRef.current?.dispose()
      oceanRef.current = null
    }
  }, [])

  const selectBeat = useCallback((beat: BeatV4, scrollIntoView = false) => {
    progressRef.current = 0
    if (scrubberRef.current) scrubberRef.current.value = '0'
    setActiveBeatId((cur) => (cur === beat.id ? cur : beat.id))
    setSelectedCapture(beat.primaryCapture)
    if (scrollIntoView) {
      const sec = document.getElementById(`beat-${beat.id}`)
      if (sec) {
        const y = sec.getBoundingClientRect().top + window.scrollY - 24
        if (lenisRef.current) lenisRef.current.scrollTo(y)
        else window.scrollTo({ top: y, behavior: 'smooth' })
      }
    }
  }, [])

  useGSAP(
    () => {
      if (!motion) return
      ScrollTrigger.config({ ignoreMobileResize: true })
      const lenis = narrow ? null : new Lenis()
      lenisRef.current = lenis
      const tick = (t: number) => lenis?.raf(t * 1000)
      if (lenis) {
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add(tick)
        gsap.ticker.lagSmoothing(0)
      }

      const items = gsap.utils.toArray<HTMLElement>('[data-reveal="true"]')
      for (const el of items) {
        gsap.fromTo(
          el,
          { y: 18, opacity: 0.9 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 92%',
              toggleActions: 'play none none reverse',
            },
          },
        )
      }

      for (const beat of BEATS_V4) {
        const sec = document.getElementById(`beat-${beat.id}`)
        if (!sec) continue
        ScrollTrigger.create({
          trigger: sec,
          start: 'top 58%',
          end: 'bottom 42%',
          onEnter: () => {
            setActiveBeatId((cur) => (cur === beat.id ? cur : beat.id))
            setSelectedCapture(beat.primaryCapture)
          },
          onEnterBack: () => {
            setActiveBeatId((cur) => (cur === beat.id ? cur : beat.id))
            setSelectedCapture(beat.primaryCapture)
          },
          onUpdate: (self) => {
            // Imperative ref-driven update: zero React state churn per scroll pixel.
            progressRef.current = self.progress
            if (scrubberRef.current) {
              scrubberRef.current.value = String(Math.round(self.progress * 100))
            }
            drawFrame(beat, self.progress, false)
          },
        })
      }

      return () => {
        if (lenis) {
          gsap.ticker.remove(tick)
          lenis.destroy()
          lenisRef.current = null
        }
      }
    },
    { dependencies: [drawFrame, motion, narrow] },
  )

  const heroBeat = BEATS_V4[0]
  const storyBeats = BEATS_V4.slice(1)
  const heroBeatCaps = [heroBeat.primaryCapture, ...heroBeat.insetCaptures]

  return (
    <section ref={rootRef} className={styles.storySection} aria-label="One Harbour v4 Port Call Story">
      <div className={styles.container}>
        <div className={styles.storyGrid}>
          {/* Child 1 (Left top on desktop, First on mobile): Hero (#beat-b00) */}
          <article
            id={`beat-${heroBeat.id}`}
            className={`${styles.heroStep} ${activeBeat.id === heroBeat.id ? styles.beatStepActive : ''}`}
          >
            <div className={styles.revealItem} data-reveal="true">
              <h1 className={styles.h1} data-reveal="true">
                {heroBeat.heading}
              </h1>
              <p className={styles.lead} data-reveal="true">
                {heroBeat.lead}
              </p>
              <p className={styles.body}>{heroBeat.body}</p>

              <div className={styles.actions} data-reveal="true">
                <a className={styles.btnPrimary} href="#session">
                  Get your free setup
                </a>
                <a className={styles.btnSecondary} href={`#beat-${BEATS_V4[1].id}`}>
                  Follow the call
                </a>
              </div>

              {heroBeatCaps.length > 1 ? (
                <div className={styles.stepCaptureTabs} aria-label={`${heroBeat.label} product views`}>
                  {heroBeatCaps.map((cid) => {
                    const cap = CAPTURES_V4[cid]
                    const on = activeBeat.id === heroBeat.id && shownCapture === cid
                    return (
                      <button
                        key={cid}
                        type="button"
                        className={`${styles.captureTabBtn} ${on ? styles.captureTabBtnActive : ''}`}
                        onClick={() => {
                          setActiveBeatId(heroBeat.id)
                          setSelectedCapture(cid)
                        }}
                      >
                        {cap?.label ?? cid}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          </article>

          {/* Child 2 (Right sticky column spanning all beats on desktop, Second right below Hero on mobile):
              ONE sticky stage with live WebGL2 water + FramePlayer + real capture >= 55% viewport */}
          <div className={styles.stickyCol}>
            <div className={styles.stickyStage}>
              <div className={styles.stageTopBar}>
                <ul className={styles.threadNav} aria-label="Harbour call beats">
                  {BEATS_V4.map((b) => {
                    const on = b.id === activeBeat.id
                    return (
                      <li key={b.id}>
                        <button
                          type="button"
                          className={`${styles.threadBtn} ${on ? styles.threadBtnActive : ''}`}
                          aria-pressed={on}
                          onClick={() => selectBeat(b, true)}
                        >
                          {b.label}
                        </button>
                      </li>
                    )
                  })}
                </ul>

                <div className={styles.scrubberRow}>
                  <label htmlFor="harbour-v4-scrub" className={styles.telemetryText}>
                    {activeBeat.telemetry}
                  </label>
                  <input
                    ref={scrubberRef}
                    id="harbour-v4-scrub"
                    type="range"
                    min={0}
                    max={100}
                    defaultValue={0}
                    aria-label="Scrub current harbour sequence"
                    className={styles.scrubberInput}
                    onInput={(e) => {
                      const p = Number((e.target as HTMLInputElement).value) / 100
                      progressRef.current = p
                      drawFrame(activeBeat, p, true)
                    }}
                  />
                </div>
              </div>

              <div className={styles.canvasViewport}>
                <img
                  src={`/media/harbour-v4/d/${activeBeat.id}/plate_0001.avif`}
                  alt={`${activeBeat.label}: ${activeBeat.heading}`}
                  width={1440}
                  height={810}
                  fetchPriority="high"
                  className={styles.plateImg}
                />
                <canvas ref={waterRef} className={styles.waterCanvas} aria-hidden="true" />
                <canvas ref={plateRef} className={styles.plateCanvas} aria-hidden="true" />
                {activeBeat.id === 'b01' ? (
                  <svg className={styles.routeSvg} viewBox="0 0 600 44" aria-hidden="true">
                    <path
                      d="M 16 32 C 140 12, 260 36, 390 18 C 470 8, 530 24, 584 14"
                      fill="none"
                      stroke="#f5b53d"
                      strokeWidth="2.5"
                    />
                    <circle cx="16" cy="32" r="4" fill="#f5b53d" />
                    <circle cx="210" cy="24" r="5" fill="#f5b53d" />
                    <circle cx="390" cy="18" r="4" fill="#f5b53d" />
                    <circle cx="584" cy="14" r="4" fill="#f5b53d" />
                  </svg>
                ) : null}
              </div>

              <div className={styles.stageCaptureDock}>
                {beatCaptures.length > 1 ? (
                  <div className={styles.dockTabs} role="tablist" aria-label="Active beat screens">
                    {beatCaptures.map((cid) => {
                      const cap = CAPTURES_V4[cid]
                      const on = shownCapture === cid
                      return (
                        <button
                          key={cid}
                          type="button"
                          role="tab"
                          aria-selected={on}
                          className={`${styles.captureTabBtn} ${on ? styles.captureTabBtnActive : ''}`}
                          onClick={() => setSelectedCapture(cid)}
                        >
                          {cap?.label ?? cid}
                        </button>
                      )
                    })}
                  </div>
                ) : null}
                <CapturePictureV4 id={shownCapture} compact loading="eager" />
              </div>
            </div>
          </div>

          {/* Child 3 (Left column below Hero on desktop, Third on mobile): Beats b01..b06 */}
          <div className={styles.storySteps}>
            {storyBeats.map((beat) => {
              const isActive = beat.id === activeBeat.id
              const allBeatCaps = [beat.primaryCapture, ...beat.insetCaptures]
              return (
                <article
                  key={beat.id}
                  id={`beat-${beat.id}`}
                  className={`${styles.beatStep} ${isActive ? styles.beatStepActive : ''}`}
                >
                  <div className={styles.revealItem} data-reveal="true">
                    <h2 className={styles.h2} data-reveal="true">
                      {beat.heading}
                    </h2>
                    <p className={styles.lead} data-reveal="true">
                      {beat.lead}
                    </p>
                    <p className={styles.body}>{beat.body}</p>

                    {allBeatCaps.length > 1 ? (
                      <div className={styles.stepCaptureTabs} aria-label={`${beat.label} product views`}>
                        {allBeatCaps.map((cid) => {
                          const cap = CAPTURES_V4[cid]
                          const on = isActive && shownCapture === cid
                          return (
                            <button
                              key={cid}
                              type="button"
                              className={`${styles.captureTabBtn} ${on ? styles.captureTabBtnActive : ''}`}
                              onClick={() => {
                                setActiveBeatId(beat.id)
                                setSelectedCapture(cid)
                              }}
                            >
                              {cap?.label ?? cid}
                            </button>
                          )
                        })}
                      </div>
                    ) : null}
                  </div>

                  {/* Mobile / narrow viewport inline capture fallback (hidden on wide desktop where sticky stage holds it) */}
                  <div className={styles.mobileBeatCapture}>
                    <CapturePictureV4 id={beat.primaryCapture} loading="lazy" />
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
