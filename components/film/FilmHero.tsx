'use client'

/**
 * The hero: one short film of the real product, in two stages, pinned.
 *
 * The copy reads first and scrolls away. Then the film takes the screen and
 * stays there: the section below it is a tall track, the film sits in a sticky
 * pane inside it, and scrolling moves through the stages rather than past them.
 * Only once the last stage has been read does the pin release into the first
 * feature scene. That is David's request of 16.09.2026 — "you should stay and
 * then eventually scroll to each feature section and place in the video".
 *
 * Stage one builds a voyage; stage two is the chart and the passage plan. The
 * change between them is a cross-fade with a scale settle — not a hard cut, and
 * not frame scrubbing, which was measured at 6,5 MB for the first segment
 * against 606 036 byte for the same footage played normally.
 *
 * The pinning itself is CSS (`.film-track` / `.film-pane` in globals.css), so
 * nothing here touches the wheel, the touch or the momentum, and a
 * reduced-motion visitor gets no track at all. This component only decides
 * which stage is showing, and only when there is a track to read.
 *
 * Desktop and phone are separate encodes, and exactly one of them is fetched:
 * see StageMedia, where the CSS-hidden pair this used to render was measured
 * downloading both. The phone cut is a portrait re-cut of the same recording
 * rather than a zoom into the landscape one. Measured 16.09.2026: with the
 * landscape encode the pinned pane
 * on a 390x844 phone was a 358x201 band with roughly 600 px of empty screen
 * around it — pinning a reader to a mostly empty screen for two stages is worse
 * than not pinning at all. The portrait cut fills 477 px of the same screen and
 * still reads: stage one keeps the location column and the port rows, stage two
 * is the chart.
 */

import { useRef, useState } from 'react'
import { ArrowDown, ArrowUpRight, Pause, Play } from 'lucide-react'
import { useMotionAllowed, useInViewPlayback, useNarrow, useTrackStage } from './useFilm'
import styles from './FilmHero.module.css'

type Stage = {
  label: string
  caption: string
  desktop: string
  desktopPoster: string
  mobile: string
  mobilePoster: string
}

const stages: Stage[] = [
  {
    label: 'Building the voyage',
    caption: 'Ports go in, and the distances, times and route come out.',
    desktop: '/video/landing-2026-09-15/hero-A.mp4',
    desktopPoster: '/video/landing-2026-09-15/hero-A.jpg',
    mobile: '/video/landing-2026-09-15/m-A-portrait.mp4',
    mobilePoster: '/video/landing-2026-09-15/m-A-portrait.jpg',
  },
  {
    label: 'The passage plan',
    caption: 'The same voyage on the chart, routed through charted water.',
    desktop: '/video/landing-2026-09-15/hero-B.mp4',
    desktopPoster: '/video/landing-2026-09-15/hero-B.jpg',
    mobile: '/video/landing-2026-09-15/m-B-portrait.mp4',
    mobilePoster: '/video/landing-2026-09-15/m-B-portrait.jpg',
  },
]

/**
 * One stage's media, filling its frame, in exactly one encode.
 *
 * ⛔ THE PAIR USED TO BE RENDERED TWICE AND HIDDEN WITH CSS, AND `display: none` DOES NOT STOP A
 * FETCH. Measured 16.09.2026 on preview 2 at `6b1829f8`: a phone pulled hero-A.jpg (47 258) and
 * hero-B.jpg (64 632) it can never display, and a desktop pulled m-A-portrait.jpg (23 627) and
 * m-B-portrait.jpg (30 187) it can never display. The film is the larger half of the same defect:
 * the desktop also fetched both portrait mp4s (346 704 + 187 183) and a phone both landscape ones
 * (606 036 + 406 007). The old comment was right that a hidden element never DECODES; it never
 * said anything about the request, which is the byte a visitor actually pays for.
 *
 * So there is one element now, and it chooses:
 *   still  <picture> + <source media>, which the browser resolves before it fetches anything, with
 *          no JavaScript. This is the branch the SERVER renders, so it has to work without us.
 *   film   `media` on <source> is honoured inside <picture> and ignored inside <video>, so the
 *          film picks its src from matchMedia instead. That is client-only and costs nothing:
 *          nothing plays until the reduced-motion answer has arrived on the client anyway.
 */
function StageMedia({
  stage,
  label,
  playing,
  motionAllowed,
  narrow,
  eager,
}: {
  stage: Stage
  label: string
  playing: boolean
  motionAllowed: boolean
  narrow: boolean
  eager: boolean
}) {
  const ref = useInViewPlayback(playing && motionAllowed)

  if (!motionAllowed) {
    return (
      <picture>
        <source media="(max-width: 767px)" srcSet={stage.mobilePoster} />
        <img
          className="film-media"
          src={stage.desktopPoster}
          alt={label}
          /* The hero is the first thing on the page, so its stills are not deferred. Stage two is
             eager too: it lives in the same pinned pane and is one scroll step away, and a still
             that arrives after the cross-fade has started is a blank frame at the moment the
             reader is looking straight at it. */
          loading={eager ? 'eager' : 'lazy'}
          fetchPriority={eager ? 'high' : 'auto'}
          decoding="async"
        />
      </picture>
    )
  }

  return (
    <video
      className="film-media"
      ref={ref}
      src={narrow ? stage.mobile : stage.desktop}
      poster={narrow ? stage.mobilePoster : stage.desktopPoster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
    />
  )
}

function StageStack({
  stage,
  motionAllowed,
  narrow,
  paused,
}: {
  stage: number
  motionAllowed: boolean
  narrow: boolean
  paused: boolean
}) {
  return (
    <div className="film-stack">
      {stages.map((s, i) => (
        <figure key={s.label} className="film-slide" data-active={i === stage ? 'true' : 'false'}>
          <div className="film-frame">
            <StageMedia
              stage={s}
              label={`Portlink: ${s.label}`}
              playing={i === stage && !paused}
              motionAllowed={motionAllowed}
              narrow={narrow}
              eager
            />
          </div>
          {/* Read only without the pin, where every stage is on screen at once. */}
          <figcaption className="film-slide-cap">
            <b>{s.label}.</b> {s.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  )
}

export default function FilmHero() {
  const trackRef = useRef<HTMLDivElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const motionAllowed = useMotionAllowed()
  const narrow = useNarrow()
  const [paused, setPaused] = useState(false)
  const stage = useTrackStage(trackRef, paneRef, stages.length, motionAllowed)

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.intro}>
        <div className={styles.eyebrow}><span className="section-eyebrow">Maritime software engineering</span><span>Oslo, Norway</span></div>
        <div className={styles.copyGrid}>
          <h1>Maritime software.<br />Built by people<br />who know port calls.</h1>
          <div className={styles.aside}>
            <p>We have run the port calls. Now we build the software behind them.</p>
            <p>Portlink is our platform for the cruise and port industry. The same team builds what ports, agents, cruise lines and tour operators need next.</p>
            <div className={styles.actions}>
              <a href="/contact/" className={styles.primary}>Tell us what you need <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a href="#dashboard" className={styles.secondary}>Explore the platform <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
        <div className={styles.filmLead}><span>Built here. Working below.</span><span>Scroll to follow a voyage <ArrowDown size={14} aria-hidden="true" /></span></div>
      </div>

      <div
        ref={trackRef}
        className="film-track"
        style={{ '--film-stages': stages.length } as React.CSSProperties}
      >
        {/* One scroll target per stage, at the position where it is active. */}
        {stages.map((s, i) => (
          <div
            key={s.label}
            id={`hero-stage-${i + 1}`}
            className="film-marker"
            style={{ top: `calc(var(--film-seg) * ${i + 0.5})` }}
            aria-hidden="true"
          />
        ))}

        <div ref={paneRef} className={`film-pane ${styles.pane}`}>
          <div className={styles.sceneLabel}><span>Portlink in motion</span><span>0{stage + 1} / 0{stages.length}</span></div>
          <StageStack stage={stage} motionAllowed={motionAllowed} narrow={narrow} paused={paused} />

          {/* Real links, not decoration: a keyboard or switch user reaches stage
              two without scrolling to it, and the browser does the scrolling. */}
          <nav className="film-stages-nav" aria-label="Film stages">
            {stages.map((s, i) => (
              <a
                key={s.label}
                className="film-pill"
                href={`#hero-stage-${i + 1}`}
                aria-current={i === stage ? 'true' : undefined}
              >
                <span className="film-pill-dot" aria-hidden="true" />
                {s.label}
              </a>
            ))}
            {motionAllowed && <button type="button" className={`film-pill ${styles.pause}`} onClick={() => setPaused(!paused)} aria-label={paused ? 'Play product film' : 'Pause product film'}>
              {paused ? <Play size={15} aria-hidden="true" /> : <Pause size={15} aria-hidden="true" />}<span>{paused ? 'Play' : 'Pause'}</span>
            </button>}
          </nav>

          <p className="film-caption">{stages[stage].caption}</p>
        </div>
      </div>
    </section>
  )
}
