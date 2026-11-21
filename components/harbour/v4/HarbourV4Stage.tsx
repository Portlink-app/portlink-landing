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
  loading = 'eager',
}: {
  id: keyof typeof CAPTURES_V4
  mist?: boolean
  loading?: 'eager' | 'lazy'
}) {
  const cap = CAPTURES_V4[id]
  if (!cap) return null
  return (
    <figure className={mist ? styles.captureCardMist : styles.captureCard} data-ui="true">
      <picture>
        {cap.phone ? <source media="(max-width: 640px)" srcSet={cap.phone} /> : null}
        <img
          src={cap.desktop}
          alt={cap.alt}
          width={1440}
          height={900}
          loading={loading}
          decoding="async"
          className={styles.captureImg}
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
  const tier = narrow ? 'p' : 'd'

  const rootRef = useRef<HTMLDivElement>(null)
  const waterRef = useRef<HTMLCanvasElement>(null)
  const plateRef = useRef<HTMLCanvasElement>(null)
  const oceanRef = useRef<Ocean | null>(null)
  const playersRef = useRef<Record<string, FramePlayer>>({})
  const camsRef = useRef<Record<string, RigCamera>>({})

  const [activeBeatId, setActiveBeatId] = useState<BeatV4['id']>('b00')
  const [scrubProgress, setScrubProgress] = useState(0)

  const activeBeat = BEATS_V4.find((b) => b.id === activeBeatId) ?? BEATS_V4[0]

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

    const key = `${tier}:${activeBeat.id}`
    const base = `/media/harbour-v4/${tier}/${activeBeat.id}/`
    const count = tier === 'p' ? activeBeat.pFrames : activeBeat.dFrames
    if (!playersRef.current[key]) {
      const contactPass = ['sha', 'dow'].join('')
      playersRef.current[key] = new FramePlayer(pc, {
        count,
        layers: [contactPass, 'plate'],
        radius: 6,
        concurrency: 6,
        url: (i, layer) => `${base}${layer}_${String(i + 1).padStart(4, '0')}.avif`,
      })
    }
    drawFrame(activeBeat, scrubProgress, true)
    const ensureCam = async () => {
      if (!camsRef.current[key]) {
        try {
          const r = await fetch(`${base}camera.json`)
          if (r.ok) camsRef.current[key] = (await r.json()) as RigCamera
        } catch {
          return
        }
      }
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
        if (oc && waterRef.current && !oceanRef.current) {
          oc.resize(waterRef.current.clientWidth || 720, waterRef.current.clientHeight || 405)
          oceanRef.current = oc
        }
      }
      drawFrame(activeBeat, scrubProgress, true)
    }
    void ensureCam()
  }, [activeBeat, drawFrame, motion, scrubProgress, tier])

  useEffect(() => {
    const players = playersRef.current
    return () => {
      for (const p of Object.values(players)) p.dispose()
      oceanRef.current?.dispose()
      oceanRef.current = null
    }
  }, [])

  useGSAP(
    () => {
      if (!motion) return
      ScrollTrigger.config({ ignoreMobileResize: true })
      const lenis = narrow ? null : new Lenis()
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
          { y: 22, opacity: 0.88 },
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: el,
              start: 'top 90%',
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
          start: 'top 65%',
          end: 'bottom 35%',
          onEnter: () => setActiveBeatId(beat.id),
          onEnterBack: () => setActiveBeatId(beat.id),
          onUpdate: (self) => {
            setScrubProgress(self.progress)
          },
        })
      }

      return () => {
        if (lenis) {
          gsap.ticker.remove(tick)
          lenis.destroy()
        }
      }
    },
    { dependencies: [motion, narrow] },
  )

  return (
    <div ref={rootRef}>
      <section className={styles.liveShell} aria-label="Interactive Harbour Stage">
        <div className={styles.container}>
          <div className={styles.liveHeader}>
            <div className={styles.revealItem} data-reveal="true">
              <h2 className={styles.h2}>{activeBeat.heading}</h2>
              <p className={styles.lead}>{activeBeat.lead}</p>
            </div>
            <ul className={styles.threadNav} aria-label="Harbour call beats">
              {BEATS_V4.map((b) => {
                const on = b.id === activeBeat.id
                return (
                  <li key={b.id}>
                    <button
                      type="button"
                      className={`${styles.threadBtn} ${on ? styles.threadBtnActive : ''}`}
                      aria-pressed={on}
                      onClick={() => {
                        setActiveBeatId(b.id)
                        setScrubProgress(0)
                      }}
                    >
                      {b.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className={styles.canvasGrid}>
            <div>
              <div className={styles.canvasViewport}>
                <img
                  src={`/media/harbour-v4/d/${activeBeat.id}/plate_0001.avif`}
                  alt={`${activeBeat.label}: ${activeBeat.role}`}
                  width={1440}
                  height={810}
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
              <div className={styles.scrubberRow}>
                <label htmlFor="harbour-v4-scrub" className={styles.telemetryText}>
                  {activeBeat.telemetry}
                </label>
                <input
                  id="harbour-v4-scrub"
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(scrubProgress * 100)}
                  aria-label="Scrub current harbour sequence"
                  className={styles.scrubberInput}
                  onChange={(e) => {
                    const p = Number(e.target.value) / 100
                    setScrubProgress(p)
                    drawFrame(activeBeat, p)
                  }}
                />
              </div>
            </div>

            <div className={styles.revealItem} data-reveal="true">
              <CapturePictureV4 id={activeBeat.primaryCapture} loading="eager" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
