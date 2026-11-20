'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import Lenis from 'lenis'
import { useMotionAllowed, useNarrow } from '@/components/film/useFilm'
import { CAPTURES_READY, SHOTS, STAGED_SHOTS, TRACK_SCREENS, shotAt } from './script'
import type { Shot } from './script'
import type { PlayerMode } from './SequencePlayer'
import styles from './harbour.module.css'
import CaptureFigure from './CaptureFigure'
import { DESKTOP, LAYERS, cameraAt, clampCamera, layerTransform } from './camera'
import type { Plane } from './planes'
import world from '@/public/media/harbour-v2/world.json'

gsap.registerPlugin(useGSAP, ScrollTrigger)

/** The captures the stage can show, once each, in track order. */
const stageCaptures = [...new Set(STAGED_SHOTS.filter((s) => s.start > 0).flatMap((s) => s.captures.slice(0, 1)))]

type BakeoffPlayer = typeof import('./SequencePlayer').default

/**
 * Bake-off assets for gate G1 (public/media/harbour-2026-11/bakeoff/). Named only here, behind a
 * client-side query, and loaded with import(): the built /harbour HTML must reference neither.
 */
const BAKEOFF = {
  webp: { src: '/media/harbour-2026-11/bakeoff/hero-A-webp', frames: 72 },
  intra: { src: '/media/harbour-2026-11/bakeoff/hero-A-intra.mp4', frames: 0 },
} as const

/** Horizontal parallax per plane id (world.json); the route lies on the fx 1 plane with the ship. */
const FX: Record<string, number> = Object.fromEntries([...LAYERS.map((l) => [l.id, l.fx]), [world.route.id, 1]])
const [PIVOT_X, PIVOT_Y] = world.ship.pivot
const [SHIP_W, SHIP_H] = world.ship.viewBox
/** Until WP3 puts the ship on the route, it waits at A1, the anchorage of the opening frames. */
const SHIP_AT = world.stations.A1

function readBakeoff(): PlayerMode | null {
  const v = new URLSearchParams(window.location.search).get('bakeoff')
  return v === 'webp' || v === 'intra' ? v : null
}

/**
 * The camera over the stills page (DIRECTION.md sections 4 and 7).
 *
 * The server sends `children`: the reduced-motion stills page, which makes every claim on its own.
 * Only when the browser has answered that motion is welcome (useMotionAllowed starts at "no") and
 * the viewport is not a phone does the stage replace those stills with one sticky 100svh stage
 * inside a tall track. Native scroll on touch: Lenis is not asked to take touch over.
 *
 * The track is (TRACK_SCREENS + 1) viewports tall: the stage is stuck for TRACK_SCREENS of scroll,
 * so a shot range in script.ts is literally the scroll distance in screens from the track top.
 */
export default function HarbourStage({ children, planes }: { children: ReactNode; planes: Plane[] }) {
  const motion = useMotionAllowed()
  const narrow = useNarrow()
  const enabled = motion && !narrow

  const track = useRef<HTMLElement>(null)
  const lenisRef = useRef<Lenis | null>(null)
  const progress = useRef(0)
  const copies = useRef<Record<string, HTMLElement | null>>({})
  const planeEls = useRef<Record<string, HTMLDivElement | null>>({})
  const [activeId, setActiveId] = useState(STAGED_SHOTS[0].id)
  const [bakeoff, setBakeoff] = useState<PlayerMode | null>(null)
  const [Player, setPlayer] = useState<BakeoffPlayer | null>(null)

  useEffect(() => {
    setBakeoff(readBakeoff())
  }, [])

  useEffect(() => {
    if (!enabled || !bakeoff) return
    let live = true
    void import('./SequencePlayer').then((m) => {
      if (live) setPlayer(() => m.default)
    })
    return () => {
      live = false
    }
  }, [enabled, bakeoff])

  useGSAP(
    () => {
      if (!enabled || !track.current) return
      ScrollTrigger.config({ ignoreMobileResize: true })
      const lenis = new Lenis()
      lenisRef.current = lenis
      lenis.on('scroll', ScrollTrigger.update)
      const tick = (t: number) => lenis.raf(t * 1000)
      gsap.ticker.add(tick)
      gsap.ticker.lagSmoothing(0)

      // The camera (DIRECTION.md 12.2, 12.6): the keyframes are wishes, clampCamera is the law, so
      // no scroll position or viewport can show the edge of a full-bleed plane or of the world.
      const shoot = (screens: number) => {
        const vw = window.innerWidth
        const vh = window.innerHeight
        const cam = clampCamera(cameraAt(screens, DESKTOP), vw, vh)
        for (const [id, el] of Object.entries(planeEls.current)) {
          if (!el) continue
          const { tx, ty, s } = layerTransform(cam, FX[id] ?? 1, vw, vh)
          el.style.transform = `translate3d(${tx}px, ${ty}px, 0) scale(${s})`
        }
      }
      shoot(0)
      const reshoot = () => shoot(progress.current * TRACK_SCREENS)
      window.addEventListener('resize', reshoot)

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: track.current,
          start: 'top top',
          end: () => `+=${TRACK_SCREENS * window.innerHeight}`,
          scrub: true,
          onUpdate: (self) => {
            progress.current = self.progress
            shoot(self.progress * TRACK_SCREENS)
            const id = shotAt(self.progress * TRACK_SCREENS).id
            setActiveId((cur) => (cur === id ? cur : id))
          },
        },
      })
      // One master timeline in screens. Each shot's copy fades in after its start and out before its end.
      for (const shot of STAGED_SHOTS) {
        const el = copies.current[shot.id]
        if (!el || !shot.heading) continue
        const fade = Math.min(0.25, (shot.end - shot.start) / 4)
        // The hero is already on screen at scroll 0: it only fades out.
        // autoAlpha, not opacity: a faded copy also becomes visibility: hidden, so it stops lying
        // over the copy that is on screen (hit-testing and assistive tech skip it).
        if (shot.start === 0) gsap.set(el, { autoAlpha: 1 })
        else tl.fromTo(el, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: fade }, shot.start + 0.05)
        if (shot.id !== STAGED_SHOTS[STAGED_SHOTS.length - 1].id) {
          tl.to(el, { autoAlpha: 0, duration: fade }, shot.end - fade)
        }
      }
      tl.set({}, {}, TRACK_SCREENS)

      return () => {
        window.removeEventListener('resize', reshoot)
        gsap.ticker.remove(tick)
        lenis.destroy()
        lenisRef.current = null
      }
    },
    { dependencies: [enabled], scope: track, revertOnUpdate: true },
  )

  const goTo = useCallback((shot: Shot) => {
    const el = track.current
    if (!el) return
    const y = el.getBoundingClientRect().top + window.scrollY + shot.start * window.innerHeight
    if (lenisRef.current) lenisRef.current.scrollTo(y)
    else window.scrollTo({ top: y })
  }, [])

  if (!enabled) return <>{children}</>

  const active = STAGED_SHOTS.find((s) => s.id === activeId) ?? STAGED_SHOTS[0]
  const telemetry = CAPTURES_READY && active.telemetry ? active.telemetry : active.role
  const nodes = SHOTS.filter((s) => s.node && s.staged)
  const activeCapture = active.start === 0 ? null : (active.captures[0] ?? null)

  return (
    <section
      ref={track}
      className={styles.track}
      data-surface="harbour"
      style={{ height: `${(TRACK_SCREENS + 1) * 100}svh` }}
      aria-label="One Harbour"
    >
      <div className={styles.stage}>
        {/* The planes, in draw order, each at world size under one camera transform. Our own committed
            artwork read on the server (planes.ts), never user input. */}
        <div className={styles.world} aria-hidden="true">
          {planes.map((p) =>
            p.id === 'ship' ? (
              <div key={p.id} className={styles.plane} data-plane={p.id} ref={(el) => void (planeEls.current[p.id] = el)}>
                <svg
                  className={styles.ship}
                  viewBox={p.viewBox}
                  width={SHIP_W}
                  height={SHIP_H}
                  style={{ left: SHIP_AT.x - PIVOT_X, top: SHIP_AT.y - PIVOT_Y }}
                  dangerouslySetInnerHTML={{ __html: p.inner }}
                />
              </div>
            ) : (
              <div
                key={p.id}
                className={`${styles.plane} ${p.id === world.route.id ? styles.planeHidden : ''}`}
                data-plane={p.id}
                ref={(el) => void (planeEls.current[p.id] = el)}
              >
                <svg viewBox={p.viewBox} dangerouslySetInnerHTML={{ __html: p.inner }} />
              </div>
            ),
          )}
        </div>
        {bakeoff && Player ? (
          <Player
            mode={bakeoff}
            src={BAKEOFF[bakeoff].src}
            frames={BAKEOFF[bakeoff].frames || undefined}
            progress={progress}
          />
        ) : null}
        {bakeoff ? <p className={styles.bakeoffNote}>bakeoff: {bakeoff}</p> : null}
        <div className={styles.scrim} aria-hidden="true" />
        {/* Every capture stays mounted and loads up front; only the active stop's is shown. The hero
            (S0) holds no capture: the title owns the first screen and nothing lies over it. */}
        {CAPTURES_READY
          ? stageCaptures.map((id) => (
              <CaptureFigure
                key={id}
                id={id}
                loading="eager"
                className={`${styles.stageCapture} ${id === activeCapture ? styles.stageCaptureOn : ''}`}
              />
            ))
          : null}

        {STAGED_SHOTS.filter((s) => s.heading).map((s) => (
          <div
            key={s.id}
            id={`harbour-${s.id.toLowerCase()}`}
            className={`${styles.copy} ${s.start === 0 ? styles.copyHero : ''}`}
            ref={(el) => {
              copies.current[s.id] = el
            }}
          >
            {s.id === 'S0' ? <h1 className={styles.h1}>{s.heading}</h1> : <h2 className={styles.h2}>{s.heading}</h2>}
            {s.line ? <p className={styles.line}>{s.line}</p> : null}
            {s.id === 'S0' ? (
              <div className={styles.actions}>
                <button type="button" className={styles.btnSun} onClick={() => goTo(SHOTS[1])}>
                  Follow the call
                </button>
                <a className={styles.btnSunGhost} href="#session">
                  Book a working session
                </a>
              </div>
            ) : null}
          </div>
        ))}

        <nav className={styles.map} aria-label="Harbour stops">
          <ol className={styles.mapList}>
            {nodes.map((s) => (
              <li key={s.id}>
                <button
                  type="button"
                  className={`${styles.mapNode} ${s.id === active.id ? styles.mapNodeOn : ''}`}
                  aria-current={s.id === active.id ? 'step' : undefined}
                  onClick={() => goTo(s)}
                >
                  {s.label}
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <p className={styles.telemetry} aria-live="off">
          {telemetry}
        </p>
      </div>
    </section>
  )
}
