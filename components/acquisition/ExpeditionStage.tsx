'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from 'react'
import { EMBARK_D14_ASSETS, PORTLINK_D14_ASSETS } from '@/components/product/d14Assets'
import styles from './AcquisitionOpening.module.css'

export type ExpeditionRole = 'cruise' | 'agent' | 'dmc' | 'operator'
export type ExpeditionProduct = 'platform' | 'embark'

export interface ExpeditionStateItem {
  id: string
  label: string
  owner: string
  title: string
  body: string
  status: string
  record: string
  rows: [string, string][]
}

interface StageVisualConfig {
  surfaceLabel: string
  surfaceTag: string
  imgSrc: string
  imgAlt: string
  imgWidth: number
  imgHeight: number
  cropTransform: string
  activeNodes: string[]
  routeFrom: [number, number]
  routeTo: [number, number]
  routeControl: [number, number]
  signalTone: 'teal' | 'amber' | 'copper'
  actorStates: Record<string, { badge: string; tone: 'active' | 'pending' | 'confirmed' | 'muted' }>
  telemetryStrip: [string, string, string][]
}

export function getStageVisualConfig(
  product: ExpeditionProduct,
  stateId: string,
): StageVisualConfig {
  if (product === 'embark') {
    if (stateId === 'change') {
      return {
        surfaceLabel: 'Embark D14 · Fleet & Capacity Lock',
        surfaceTag: '10 seats available · 12 booked (2 unresolved)',
        imgSrc: EMBARK_D14_ASSETS.ch3DispatchRoster.desktop,
        imgAlt: EMBARK_D14_ASSETS.ch3DispatchRoster.alt,
        imgWidth: EMBARK_D14_ASSETS.ch3DispatchRoster.width,
        imgHeight: EMBARK_D14_ASSETS.ch3DispatchRoster.height,
        cropTransform: 'none',
        activeNodes: ['operator', 'guide'],
        routeFrom: [585, 268],
        routeTo: [728, 204],
        routeControl: [660, 185],
        signalTone: 'amber',
        actorStates: {
          operator: { badge: 'Capacity 10 / 12', tone: 'pending' },
          guide: { badge: '2 unresolved guests', tone: 'pending' },
        },
        telemetryStrip: [
          ['Vessel Assignment', 'RIB Havørn (10 seats)', 'Shortfall flagged'],
          ['Booked Manifest', '12 direct guests', '2 need decision'],
          ['Auto-Reallocation', 'Disabled by rule', 'Human owner required'],
        ],
      }
    }
    if (stateId === 'resolve') {
      return {
        surfaceLabel: 'Embark D14 · Direct Web & Group Settlement',
        surfaceTag: 'Human decision required · No auto-reallocation',
        imgSrc: EMBARK_D14_ASSETS.ch4WidgetInvoicing.desktop,
        imgAlt: EMBARK_D14_ASSETS.ch4WidgetInvoicing.alt,
        imgWidth: EMBARK_D14_ASSETS.ch4WidgetInvoicing.width,
        imgHeight: EMBARK_D14_ASSETS.ch4WidgetInvoicing.height,
        cropTransform: 'none',
        activeNodes: ['operator', 'guide'],
        routeFrom: [728, 204],
        routeTo: [585, 268],
        routeControl: [660, 185],
        signalTone: 'copper',
        actorStates: {
          operator: { badge: 'Reviewing options', tone: 'active' },
          guide: { badge: 'Briefing pending', tone: 'pending' },
        },
        telemetryStrip: [
          ['Capacity Review', 'Operator open', 'Swap or split group'],
          ['Guide Briefing', 'Marte L. (NO/EN/DE)', 'Awaiting confirmation'],
          ['Workspace Scope', 'Standalone Embark', 'Platform not required'],
        ],
      }
    }
    return {
      surfaceLabel: 'Embark D14 · Daily Departures & Quay Manifest',
      surfaceTag: 'RIB Havørn · 12 of 12 seats ready',
      imgSrc: EMBARK_D14_ASSETS.ch1Hero.desktop,
      imgAlt: EMBARK_D14_ASSETS.ch1Hero.alt,
      imgWidth: EMBARK_D14_ASSETS.ch1Hero.width,
      imgHeight: EMBARK_D14_ASSETS.ch1Hero.height,
      cropTransform: 'none',
      activeNodes: ['operator', 'guide'],
      routeFrom: [585, 268],
      routeTo: [728, 204],
      routeControl: [660, 210],
      signalTone: 'copper',
      actorStates: {
        operator: { badge: '10.00 Planned', tone: 'confirmed' },
        guide: { badge: 'Marte L. assigned', tone: 'confirmed' },
      },
      telemetryStrip: [
        ['Departure Slot', 'kl. 10.00 Pontoon B2', '12 / 12 seats matched'],
        ['Certified Skipper', 'Marte L. (STCW)', 'Conflict lock active'],
        ['Direct Checkout', 'Vipps & Stripe', 'Manifest synced'],
      ],
    }
  }

  if (stateId === 'review') {
    return {
      surfaceLabel: 'Platform D14 · Multi-Team Itinerary Review',
      surfaceTag: 'Marine ops in review · Shorex & Commercial waiting',
      imgSrc: PORTLINK_D14_ASSETS.ch6Deployment.desktop,
      imgAlt: PORTLINK_D14_ASSETS.ch6Deployment.alt,
      imgWidth: PORTLINK_D14_ASSETS.ch6Deployment.width,
      imgHeight: PORTLINK_D14_ASSETS.ch6Deployment.height,
      cropTransform: 'none',
      activeNodes: ['planner', 'ship', 'agent'],
      routeFrom: [172, 102],
      routeTo: [485, 184],
      routeControl: [330, 112],
      signalTone: 'amber',
      actorStates: {
        planner: { badge: 'Marine ops review', tone: 'active' },
        ship: { badge: 'Feasibility check', tone: 'pending' },
        agent: { badge: 'Not requested yet', tone: 'muted' },
        dmc: { badge: 'Waiting for sign-off', tone: 'muted' },
      },
      telemetryStrip: [
        ['Sign-Off Stage', '02 Marine Operations', 'In review'],
        ['Downstream Gates', 'Shorex & Commercial', 'Waiting in sequence'],
        ['Port Commitment', 'Skolten Berth 3', 'Not requested yet'],
      ],
    }
  }

  if (stateId === 'request') {
    return {
      surfaceLabel: 'Platform D14 · Call Record & Shorex Request',
      surfaceTag: '12 guests · Quote pending with Fjordhaven DMC',
      imgSrc: PORTLINK_D14_ASSETS.ch1Hero.desktop,
      imgAlt: PORTLINK_D14_ASSETS.ch1Hero.alt,
      imgWidth: PORTLINK_D14_ASSETS.ch1Hero.width,
      imgHeight: PORTLINK_D14_ASSETS.ch1Hero.height,
      cropTransform: 'none',
      activeNodes: ['planner', 'agent', 'dmc'],
      routeFrom: [485, 184],
      routeTo: [682, 234],
      routeControl: [585, 168],
      signalTone: 'amber',
      actorStates: {
        planner: { badge: 'Quote requested', tone: 'active' },
        ship: { badge: 'Assigned · 2028', tone: 'confirmed' },
        agent: { badge: 'Berth 3 window', tone: 'confirmed' },
        dmc: { badge: 'Quote pending', tone: 'pending' },
      },
      telemetryStrip: [
        ['Call Record', 'Bergen · Skolten 3', 'Shared context active'],
        ['Shorex Request', '12 guests · Coastal', 'Sent to Fjordhaven DMC'],
        ['Commitment State', 'Quote pending', 'Not a confirmed booking'],
      ],
    }
  }

  if (stateId === 'commit') {
    return {
      surfaceLabel: 'Platform D14 · Accepted Quote & Call Readiness',
      surfaceTag: 'Quote accepted into booking · Shared record updated',
      imgSrc: PORTLINK_D14_ASSETS.ch1Hero.desktop,
      imgAlt: PORTLINK_D14_ASSETS.ch1Hero.alt,
      imgWidth: PORTLINK_D14_ASSETS.ch1Hero.width,
      imgHeight: PORTLINK_D14_ASSETS.ch1Hero.height,
      cropTransform: 'none',
      activeNodes: ['planner', 'ship', 'agent', 'dmc'],
      routeFrom: [682, 234],
      routeTo: [262, 232],
      routeControl: [465, 290],
      signalTone: 'teal',
      actorStates: {
        planner: { badge: 'Booking created', tone: 'confirmed' },
        ship: { badge: 'MS Aster Brisa', tone: 'confirmed' },
        agent: { badge: 'Skolten Berth 3', tone: 'confirmed' },
        dmc: { badge: 'Quote accepted', tone: 'confirmed' },
      },
      telemetryStrip: [
        ['DMC Quote', 'Accepted by Line', 'Booking record created'],
        ['Port Readiness', '5 of 7 arranged', 'PDA 412 380,00 kr'],
        ['Role Privacy', 'SECTION_VIS enforced', '4 seats on 1 record'],
      ],
    }
  }

  return {
    surfaceLabel: 'Platform D14 · Voyage & Fairway Planner',
    surfaceTag: 'Summer 2028 · Draft itinerary · 257,0 NM fairway',
    imgSrc: PORTLINK_D14_ASSETS.ch3VoyageAis.desktop,
    imgAlt: PORTLINK_D14_ASSETS.ch3VoyageAis.alt,
    imgWidth: PORTLINK_D14_ASSETS.ch3VoyageAis.width,
    imgHeight: PORTLINK_D14_ASSETS.ch3VoyageAis.height,
    cropTransform: 'none',
    activeNodes: ['planner', 'ship'],
    routeFrom: [172, 102],
    routeTo: [262, 232],
    routeControl: [198, 168],
    signalTone: 'teal',
    actorStates: {
      planner: { badge: 'Draft · Summer 2028', tone: 'active' },
      ship: { badge: 'MS Aster Brisa', tone: 'active' },
      agent: { badge: 'Berth to arrange', tone: 'muted' },
      dmc: { badge: 'No request yet', tone: 'muted' },
    },
    telemetryStrip: [
      ['Planning Horizon', 'Summer 2028 Draft', 'Years before sailing'],
      ['Kystverket Fairway', '257,0 NM · 42,0 m UKC', '0 land crossings'],
      ['Assigned Vessel', 'MS Aster Brisa', 'Proposed Bergen call'],
    ],
  }
}

export const ITINERARY_SIGNOFF_RAIL = [
  'Draft',
  'Marine ops review',
  'Shorex review',
  'Commercial review',
  'Published',
]

export default function ExpeditionStage({
  page,
  product,
  role,
  state,
  index,
  motion,
  onSelectRole,
  onSelectStep,
  statesCount,
}: {
  page: 'company' | ExpeditionProduct
  product: ExpeditionProduct
  role: ExpeditionRole
  state: ExpeditionStateItem
  index: number
  motion: boolean
  onSelectRole: (next: ExpeditionRole) => void
  onSelectStep: (next: number) => void
  statesCount: number
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const stageConfig = getStageVisualConfig(product, state.id)
  const changedCapacity = product === 'embark' && index > 0

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let rafId = 0
    let inView = true
    let phase = 0

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = 880
    const height = 430
    canvas.width = width * dpr
    canvas.height = height * dpr

    const [x0, y0] = stageConfig.routeFrom
    const [cx, cy] = stageConfig.routeControl
    const [x1, y1] = stageConfig.routeTo

    const signalColor =
      stageConfig.signalTone === 'amber'
        ? '#f59e0b'
        : stageConfig.signalTone === 'copper'
          ? '#ea580c'
          : '#14b8a6'

    function drawFrame(t: number) {
      if (!ctx) return
      ctx.save()
      ctx.scale(dpr, dpr)
      ctx.clearRect(0, 0, width, height)

      // Bathymetric sonar rings in the fjord basin
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)'
      ctx.lineWidth = 1
      for (let r = 1; r <= 4; r++) {
        ctx.beginPath()
        ctx.ellipse(400, 265, r * 74, r * 32, -0.12, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Fairway current streamlines along the approach channel
      for (let i = 0; i < 6; i++) {
        const offset = (t * 0.4 + i * 0.17) % 1
        const px = 95 + offset * 620
        const py = 290 - Math.sin(offset * Math.PI) * 52 + (i % 2 === 0 ? 10 : -10)
        ctx.fillStyle = 'rgba(94, 234, 212, 0.22)'
        ctx.beginPath()
        ctx.arc(px, py, 2.2, 0, Math.PI * 2)
        ctx.fill()
      }

      // Active Bezier signal pulse between communicating actors
      const pulseT = motion ? t % 1 : 0.62
      const inv = 1 - pulseT
      const bx = inv * inv * x0 + 2 * inv * pulseT * cx + pulseT * pulseT * x1
      const by = inv * inv * y0 + 2 * inv * pulseT * cy + pulseT * pulseT * y1

      ctx.strokeStyle = signalColor
      ctx.lineWidth = 2.4
      ctx.setLineDash([7, 5])
      ctx.lineDashOffset = -t * 36
      ctx.beginPath()
      ctx.moveTo(x0, y0)
      ctx.quadraticCurveTo(cx, cy, x1, y1)
      ctx.stroke()
      ctx.setLineDash([])

      // Glowing packet halo at (bx, by)
      const grad = ctx.createRadialGradient(bx, by, 2, bx, by, 22)
      grad.addColorStop(0, signalColor)
      grad.addColorStop(1, 'rgba(20, 184, 166, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(bx, by, 22, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = '#ffffff'
      ctx.beginPath()
      ctx.arc(bx, by, 4.2, 0, Math.PI * 2)
      ctx.fill()

      ctx.restore()
    }

    drawFrame(0.62)
    if (!motion) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting
      },
      { threshold: 0.05 },
    )
    observer.observe(canvas)

    let lastTime = performance.now()
    function tick(now: number) {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      if (inView && !document.hidden) {
        phase = (phase + dt * 0.45) % 1
        drawFrame(phase)
      }
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)

    return () => {
      observer.disconnect()
      window.cancelAnimationFrame(rafId)
    }
  }, [
    motion,
    stageConfig.routeFrom,
    stageConfig.routeControl,
    stageConfig.routeTo,
    stageConfig.signalTone,
  ])

  return (
    <div className={styles.stage} data-scene={product} data-chapter={state.id} data-role={role}>
      {/* Left Column: Isometric Greenland / Norwegian Fairway Spatial Cutaway */}
      <div className={styles.spatialViewport}>
        <div className={styles.spatialHudTop}>
          <span className={styles.spatialCoords}>
            {product === 'embark'
              ? 'FJORDLAND OPERATOR STAGE · PONTOON B2 · 60°23′N 005°19′E'
              : 'EXPEDITION FAIRWAY CUTAWAY · 69°13′N 051°06′W → BERGEN SKOLTEN 3'}
          </span>
          <span className={styles.spatialStepBadge} data-tone={stageConfig.signalTone}>
            Step 0{index + 1} / 0{statesCount} · {state.status}
          </span>
        </div>

        <div className={styles.isometricFrame} data-focus={state.id}>
          <div className={styles.isometricVisualWrap}>
            <canvas ref={canvasRef} className={styles.bathymetryCanvas} aria-hidden="true" />

            <svg viewBox="0 0 880 430" className={styles.isometricSvg} aria-hidden="true">
              <defs>
                <linearGradient id="pl-sea-surface" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#091d30" />
                  <stop offset="55%" stopColor="#0f2c46" />
                  <stop offset="100%" stopColor="#163f61" />
                </linearGradient>
                <linearGradient id="pl-cutaway-left" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0a1c2e" />
                  <stop offset="100%" stopColor="#13324f" />
                </linearGradient>
                <linearGradient id="pl-cutaway-right" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#173a59" />
                  <stop offset="100%" stopColor="#0c2033" />
                </linearGradient>
                <linearGradient id="pl-ridge-main" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#486a8c" />
                  <stop offset="48%" stopColor="#254261" />
                  <stop offset="100%" stopColor="#12273d" />
                </linearGradient>
                <linearGradient id="pl-ridge-shadow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#1e3650" />
                  <stop offset="100%" stopColor="#0c1c2c" />
                </linearGradient>
                <linearGradient id="pl-quay-deck" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#315270" />
                  <stop offset="100%" stopColor="#1e3752" />
                </linearGradient>
              </defs>

              {/* Subtle Nautical Chart Graticule Lines in Upper Horizon */}
              <g stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1">
                <line x1="0" y1="54" x2="880" y2="54" />
                <line x1="0" y1="114" x2="880" y2="114" />
                <line x1="220" y1="0" x2="220" y2="430" />
                <line x1="450" y1="0" x2="450" y2="430" />
                <line x1="680" y1="0" x2="680" y2="430" />
              </g>

              {/* 1. Isometric Cutaway Bathymetric Slab */}
              <polygon
                points="36,245 450,95 844,230 430,382"
                fill="url(#pl-sea-surface)"
                stroke="#2e5c85"
                strokeWidth="1.5"
              />
              {/* Left cutaway geological wall */}
              <polygon
                points="36,245 430,382 430,418 36,282"
                fill="url(#pl-cutaway-left)"
                stroke="#234869"
                strokeWidth="1"
              />
              {/* Right cutaway geological wall */}
              <polygon
                points="430,382 844,230 844,266 430,418"
                fill="url(#pl-cutaway-right)"
                stroke="#234869"
                strokeWidth="1"
              />

              {/* Bathymetric depth contour lines inside the water basin */}
              <path
                d="M 108,252 Q 290,198 440,250 T 730,242"
                fill="none"
                stroke="#295d87"
                strokeWidth="1.2"
                strokeDasharray="5 6"
              />
              <path
                d="M 152,282 Q 330,232 470,284 T 695,270"
                fill="none"
                stroke="#316d9c"
                strokeWidth="1.2"
                strokeDasharray="4 5"
              />

              {/* 2. Low-Poly Isometric Greenland / Fjord Mountain Relief */}
              <g className={styles.terrainGroup}>
                {/* Back-left glacier massif */}
                <polygon points="95,222 218,64 338,172 212,230" fill="url(#pl-ridge-main)" />
                <polygon points="218,64 278,102 338,172 212,230" fill="url(#pl-ridge-shadow)" />
                <polygon points="218,64 180,112 214,124 252,88" fill="#e0f2fe" fillOpacity="0.88" />

                {/* Central fjord saddle & headland */}
                <polygon points="292,178 428,36 558,154 418,206" fill="url(#pl-ridge-main)" />
                <polygon points="428,36 500,86 558,154 418,206" fill="url(#pl-ridge-shadow)" />
                <polygon points="428,36 390,82 430,96 470,64" fill="#f1f5f9" fillOpacity="0.92" />

                {/* East harbour ridge behind Quay & DMC */}
                <polygon points="508,160 642,58 778,186 618,224" fill="url(#pl-ridge-main)" />
                <polygon points="642,58 716,114 778,186 618,224" fill="url(#pl-ridge-shadow)" />
                <polygon points="642,58 606,96 644,110 680,86" fill="#e0f2fe" fillOpacity="0.84" />
              </g>

              {/* Floating tabular icebergs in outer approach bay */}
              <g opacity="0.92">
                <polygon points="118,274 148,262 168,272 138,284" fill="#e0f2fe" />
                <polygon points="118,274 138,284 138,292 118,282" fill="#7dd3fc" />
                <polygon points="138,284 168,272 168,280 138,292" fill="#38bdf8" />
              </g>

              {/* 3. Skolten North Berth 3 & Fjordhaven Quay Platform (Isometric Pier) */}
              <g className={styles.quayGroup}>
                <polygon
                  points="422,192 548,148 808,232 678,286"
                  fill="url(#pl-quay-deck)"
                  stroke="#5882a8"
                  strokeWidth="1.5"
                />
                <polygon
                  points="422,192 678,286 678,304 422,210"
                  fill="#12283d"
                  stroke="#3d6387"
                  strokeWidth="1"
                />
                {[0, 1, 2, 3, 4].map((b) => (
                  <circle key={b} cx={450 + b * 46} cy={200 + b * 17} r="3.4" fill="#cbd5e1" />
                ))}

                {/* Port Agent Harbour Terminal Building (Node: agent at 485,184) */}
                <g transform="translate(465, 146)">
                  <polygon
                    points="0,18 36,4 72,18 36,32"
                    fill="#38bdf8"
                    fillOpacity="0.34"
                    stroke="#7dd3fc"
                    strokeWidth="1.5"
                  />
                  <polygon points="0,18 36,32 36,54 0,40" fill="#183857" stroke="#38bdf8" strokeWidth="1.1" />
                  <polygon points="36,32 72,18 72,40 36,54" fill="#10273f" stroke="#38bdf8" strokeWidth="1.1" />
                </g>

                {/* Shorex DMC Coordination Pavilion & Coach Bay (Node: dmc at 682,234) */}
                <g transform="translate(642, 188)">
                  <polygon
                    points="0,16 42,0 82,16 40,32"
                    fill="#2dd4bf"
                    fillOpacity="0.34"
                    stroke="#5eead4"
                    strokeWidth="1.5"
                  />
                  <polygon points="0,16 40,32 40,50 0,34" fill="#184254" stroke="#2dd4bf" strokeWidth="1.1" />
                  <polygon points="40,32 82,16 82,34 40,50" fill="#112f3d" stroke="#2dd4bf" strokeWidth="1.1" />
                </g>

                {/* Tour Operator Pontoon B2 & RIB Havørn (Nodes: operator + guide) */}
                <g transform="translate(548, 254)">
                  <polygon
                    points="0,14 58,-6 96,10 38,30"
                    fill="#234363"
                    stroke="#fb923c"
                    strokeWidth="1.6"
                  />
                  <polygon
                    points="42,28 88,12 106,18 60,36"
                    fill="#ea580c"
                    stroke="#fed7aa"
                    strokeWidth="1.5"
                  />
                </g>
              </g>

              {/* 4. Kystverket Fairway Approach Spline & Waypoint Buoys */}
              <path
                d="M 92,290 C 175,268 245,246 335,228 C 390,218 425,208 455,198"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeDasharray="6 6"
                opacity="0.82"
              />
              <circle cx="155" cy="272" r="4.5" fill="#14b8a6" stroke="#08131f" strokeWidth="1.5" />
              <circle cx="335" cy="228" r="4.5" fill="#14b8a6" stroke="#08131f" strokeWidth="1.5" />

              {/* 5. Expedition Cruise Vessel MS Aster Brisa (Node: ship at 262,232) */}
              <g transform="translate(205, 198)">
                <path d="M -42,42 L 8,26 L -28,54 Z" fill="rgba(56, 189, 248, 0.24)" />
                <polygon
                  points="0,28 88,2 120,8 104,22 18,46"
                  fill="#12314f"
                  stroke="#7dd3fc"
                  strokeWidth="1.8"
                />
                <polygon
                  points="16,20 80,2 98,7 34,26"
                  fill="#f8fafc"
                  stroke="#cbd5e1"
                  strokeWidth="1.1"
                />
                <polygon points="58,0 84,-7 92,-2 66,6" fill="#38bdf8" />
                <rect x="34" y="16" width="11" height="4.5" rx="2" transform="rotate(-16 34 16)" fill="#f97316" />
                <rect x="50" y="11" width="11" height="4.5" rx="2" transform="rotate(-16 50 11)" fill="#f97316" />
              </g>

              {/* 6. Itinerary Planner Elevated Route Projection Table (Node: planner at 172,102) */}
              <g transform="translate(108, 66)">
                <polygon
                  points="0,24 68,0 132,22 64,46"
                  fill="rgba(20, 184, 166, 0.32)"
                  stroke="#5eead4"
                  strokeWidth="1.8"
                />
                <line
                  x1="66"
                  y1="46"
                  x2="148"
                  y2="152"
                  stroke="#5eead4"
                  strokeWidth="1.4"
                  strokeDasharray="4 4"
                />
                <circle cx="66" cy="23" r="4.5" fill="#5eead4" />
              </g>

              {/* 7. Passive Network Handoff Arcs between All Actors */}
              <path
                d="M 172,102 Q 198,168 262,232"
                fill="none"
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M 262,232 Q 368,184 485,184"
                fill="none"
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M 485,184 Q 585,168 682,234"
                fill="none"
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="1.5"
              />
              <path
                d="M 682,234 Q 640,268 585,268"
                fill="none"
                stroke="rgba(148, 163, 184, 0.4)"
                strokeWidth="1.5"
              />

              {/* Cutaway geological depth labels positioned in clear water/strata */}
              <text x="275" y="348" fill="#cbd5e1" fontSize="12" fontFamily="monospace">
                FAIRWAY 42,0 m · 0 LAND HITS
              </text>
              <text x="275" y="366" fill="#cbd5e1" fontSize="12" fontFamily="monospace">
                SKOLTEN / DISKO BASIN CUTAWAY
              </text>
            </svg>
          </div>

          {/* Accessible Interactive Actor Pins over the Isometric Stage */}
          <div
            className={styles.actors}
            role="group"
            aria-label={
              product === 'embark'
                ? 'Independent tour operation actors'
                : 'Connected voyage and port-call organisations'
            }
          >
            {product === 'platform' ? (
              <>
                <button
                  type="button"
                  className={`${styles.actorPin} ${styles.plannerPin}`}
                  data-selected={role === 'cruise' && index === 0}
                  data-tone={stageConfig.actorStates.planner?.tone ?? 'active'}
                  onClick={() => {
                    onSelectRole('cruise')
                    onSelectStep(0)
                  }}
                >
                  <span className={styles.actorRole}>01 · Itinerary planner</span>
                  <strong>Nordkyst Cruise Line</strong>
                  <span className={styles.actorBadge}>
                    {stageConfig.actorStates.planner?.badge}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.actorPin} ${styles.ship}`}
                  data-selected={role === 'cruise' && index === 1}
                  data-tone={stageConfig.actorStates.ship?.tone ?? 'confirmed'}
                  onClick={() => {
                    onSelectRole('cruise')
                    onSelectStep(1)
                  }}
                >
                  <span className={styles.actorRole}>02 · Assigned vessel</span>
                  <strong>MS Aster Brisa</strong>
                  <span className={styles.actorBadge}>
                    {stageConfig.actorStates.ship?.badge}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.actorPin} ${styles.agent}`}
                  data-selected={role === 'agent'}
                  data-tone={stageConfig.actorStates.agent?.tone ?? 'confirmed'}
                  onClick={() => {
                    onSelectRole('agent')
                    onSelectStep(2)
                  }}
                >
                  <span className={styles.actorRole}>03 · Port agent</span>
                  <strong>Vestkyst Agency · Berth 3</strong>
                  <span className={styles.actorBadge}>
                    {stageConfig.actorStates.agent?.badge}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.actorPin} ${styles.dmc}`}
                  data-selected={role === 'dmc'}
                  data-tone={stageConfig.actorStates.dmc?.tone ?? 'pending'}
                  onClick={() => {
                    onSelectRole('dmc')
                    onSelectStep(2)
                  }}
                >
                  <span className={styles.actorRole}>04 · Shorex DMC</span>
                  <strong>Fjordhaven DMC · Quay</strong>
                  <span className={styles.actorBadge}>
                    {stageConfig.actorStates.dmc?.badge}
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={`${styles.actorPin} ${styles.operator}`}
                  data-selected={index === 0 || index === 2}
                  data-tone={stageConfig.actorStates.operator?.tone ?? 'active'}
                  onClick={() => onSelectStep(0)}
                >
                  <span className={styles.actorRole}>01 · Tour operator</span>
                  <strong>Fjordland Adventures · RIB Havørn</strong>
                  <span className={styles.actorBadge}>
                    {stageConfig.actorStates.operator?.badge}
                  </span>
                </button>

                <button
                  type="button"
                  className={`${styles.actorPin} ${styles.guide}`}
                  data-selected={index === 1}
                  data-tone={stageConfig.actorStates.guide?.tone ?? 'pending'}
                  onClick={() => onSelectStep(1)}
                >
                  <span className={styles.actorRole}>02 · Certified guide</span>
                  <strong>Pier B2 · Quay Check-In</strong>
                  <span className={styles.actorBadge}>
                    {stageConfig.actorStates.guide?.badge}
                  </span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Spatial Telemetry Strip (closes the vertical rhythm inside the left column) */}
        <div className={styles.telemetryGrid} aria-label="Stage handoff telemetry">
          {stageConfig.telemetryStrip.map(([kicker, value, note]) => (
            <div key={kicker} className={styles.telemetryCell}>
              <span className={styles.telemetryKicker}>{kicker}</span>
              <strong className={styles.telemetryVal}>{value}</strong>
              <span className={styles.telemetryNote}>{note}</span>
            </div>
          ))}
        </div>

        <div className={styles.spatialFooterBar}>
          <p className={styles.sceneNote}>
            Illustrative Greenland &amp; Bergen Skolten 3 expedition model.{' '}
            {product === 'platform'
              ? 'Each step connects the planner, vessel, port agent and DMC to a real D14 surface.'
              : 'Independent Embark tour operation; Platform is not required.'}{' '}
            No live booking.
          </p>
        </div>
      </div>

      {/* Right Column: Coupled 2x Retina D14 UI Close-Up & Live Record Inspector */}
      <div className={styles.panel} id="discovery-proof" data-scene-record>
        <div className={styles.d14PreviewFrame}>
          <div className={styles.d14PreviewHeader}>
            <span className={styles.d14SurfaceName}>{stageConfig.surfaceLabel}</span>
            <span className={styles.d14SurfaceBadge} data-tone={stageConfig.signalTone}>
              {stageConfig.surfaceTag}
            </span>
          </div>
          <div className={styles.d14ImageViewport}>
            <img
              src={stageConfig.imgSrc}
              alt={stageConfig.imgAlt}
              width={stageConfig.imgWidth}
              height={stageConfig.imgHeight}
              loading="eager"
              fetchPriority="high"
              decoding="sync"
              className={styles.d14CloseUpImg}
              style={{ transform: motion ? stageConfig.cropTransform : 'none' }}
            />
          </div>
        </div>

        <div className={styles.panelBody}>
          <div className={styles.panelMetaRow}>
            <p className={styles.record}>{state.record}</p>
            <p className={styles.owner}>Owner: {state.owner}</p>
          </div>
          <h2>{state.status}</h2>

          {product === 'platform' && (
            <div className={styles.itinerary} aria-label="Future itinerary context">
              <span>
                Planning horizon <b>Summer 2028</b>
              </span>
              <span>
                Northern coast <b>Bergen Skolten 3</b>
              </span>
            </div>
          )}

          {product === 'platform' && (
            <div className={styles.signoffRailWrap} aria-label="Itinerary sign-off order">
              <span className={styles.railLabel}>
                Platform sign-off sequence (separate from port confirmation):
              </span>
              <ol className={styles.signoffRail}>
                {ITINERARY_SIGNOFF_RAIL.map((stepName, i) => (
                  <li
                    key={stepName}
                    data-state={
                      i === Math.min(index, 2)
                        ? 'current'
                        : i < Math.min(index, 2)
                          ? 'done'
                          : 'upcoming'
                    }
                  >
                    {stepName}
                  </li>
                ))}
              </ol>
            </div>
          )}

          {product === 'embark' && (
            <div className={styles.capacity}>
              <p>
                {changedCapacity
                  ? '10 seats available · 12 booked guests'
                  : '12 seats available · 12 booked guests'}
              </p>
              <div className={styles.places} aria-hidden="true">
                {Array.from({ length: 12 }, (_, seat) => (
                  <span key={seat} data-unresolved={changedCapacity && seat >= 10}>
                    {seat + 1}
                  </span>
                ))}
              </div>
              <p>
                {changedCapacity
                  ? '2 unresolved guests stay flagged for a human decision. No automatic reassignment.'
                  : 'Guide assigned. Capacity remains the operator’s responsibility.'}
              </p>
            </div>
          )}

          <dl>
            {state.rows.map(([name, value]) => (
              <div key={name}>
                <dt>{name}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>

          <p className={styles.sceneExplanation}>
            <strong>{state.title}.</strong> {state.body}
          </p>

          <div className={styles.panelActions}>
            <div className={styles.controls}>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onSelectStep(index - 1)}
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => onSelectStep(index === statesCount - 1 ? 0 : index + 1)}
              >
                {index === statesCount - 1 ? 'Replay' : 'Next chapter'}
              </button>
            </div>
            <a
              href={
                page === 'company'
                  ? product === 'embark'
                    ? '/embark/'
                    : '/portlink/'
                  : '#discovery-workflow'
              }
              className={styles.panelPrimaryLink}
            >
              {page === 'company'
                ? product === 'embark'
                  ? 'Explore full Embark D14 tour chapters'
                  : 'Explore full Platform D14 port-call chapters'
                : 'Inspect step-by-step workflow proof'}{' '}
              →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
