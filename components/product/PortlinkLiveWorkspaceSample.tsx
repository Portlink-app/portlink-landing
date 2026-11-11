'use client'

/**
 * Phase B.1 Interactive Free Sample for /portlink:
 *   1. <PortlinkLiveWorkspaceSample /> (Chapter 2: 4 seats x 4 call timeline stages)
 *   2. <PortlinkPdaFdaDiffSample /> (Chapter 5: PDA 412 380,00 kr → Signed Gangway -11 130,00 kr → FDA 401 250,00 kr)
 *
 * Enforces portlink-platform SECTION_VIS role gating (finance = cl + pa, programme = cl + dmc,
 * services = cl + pa; ship master sees Overview, Readiness, Tasks, Comms only).
 */
import { useState } from 'react'

export type PortlinkSeatId = 'cl' | 'pa' | 'dmc' | 'ship'
export type PortlinkStageId = 't48' | 'berth' | 'shorex' | 'settlement'

interface SeatConfig {
  id: PortlinkSeatId
  label: string
  org: string
  person: string
  roleBadge: string
  callout: string
  accessNote: string
}

const SEATS: SeatConfig[] = [
  {
    id: 'cl',
    label: 'Cruise Line Ops',
    org: 'Nordkyst Cruise Line',
    person: 'Henrik Lind (Fleet Ops)',
    roleBadge: 'Viewing as Nordkyst Cruise Line (All 7 tabs active)',
    callout: 'Full command across berth readiness, PDA/FDA finance, shorex programme, and port services.',
    accessNote: 'Cruise Line Ops owns the port call and sees every operational, shorex, and financial tab.',
  },
  {
    id: 'pa',
    label: 'Port Agent',
    org: 'Vestkyst Maritime Agency',
    person: 'Kari Nygård (Senior Boarding Agent)',
    roleBadge: 'Viewing as Vestkyst Maritime Agency (Finance & Services active; Programme gated)',
    callout: 'Coordinates pilotage, tugs, berth services, gangway departure sign-off, and PDA/FDA settlement.',
    accessNote: 'The Port Agent sees Finance and Services; Shorex Programme stays private to the Cruise Line and DMC.',
  },
  {
    id: 'dmc',
    label: 'Shorex DMC',
    org: 'Fjordhaven Shorex DMC',
    person: 'Ingrid Solheim (Shorex Director)',
    roleBadge: 'Viewing as Fjordhaven Shorex DMC (Programme active; Finance & Services gated)',
    callout: 'Manages 284 excursion guests, coach Staging on Skolten Quay, and Embark operator allocations.',
    accessNote: 'The Shorex DMC sees Programme, Readiness, Tasks, and Comms; port tariffs and PDA/FDA stay hidden.',
  },
  {
    id: 'ship',
    label: 'Ship Master',
    org: 'MS Aster Brisa',
    person: 'Capt. Magnus Vik (Master, IMO 9842114)',
    roleBadge: 'Viewing as MS Aster Brisa Bridge (Overview, Readiness, Tasks & Comms only)',
    callout: 'Reviews berth geometry, pilot boarding window, gangway consumption sign-off, and bridge comms.',
    accessNote: 'The Ship sees berth readiness, tasks, and gangway sign-off; commercial pricing and supplier boards stay off the bridge.',
  },
]

const SECTION_VIS: Record<'finance' | 'programme' | 'services', PortlinkSeatId[]> = {
  finance: ['cl', 'pa'],
  programme: ['cl', 'dmc'],
  services: ['cl', 'pa'],
}

const TABS: {
  id: string
  label: string
  gated?: 'finance' | 'programme' | 'services'
}[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'readiness', label: 'Readiness' },
  { id: 'finance', label: 'Finance', gated: 'finance' },
  { id: 'programme', label: 'Programme', gated: 'programme' },
  { id: 'services', label: 'Services', gated: 'services' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'comms', label: 'Comms' },
]

interface StageRow {
  item: string
  detail: string
  ownerBySeat: Record<PortlinkSeatId, string>
  metric: string
  chip: string
  tone: 'ok' | 'warn' | 'bad' | 'info'
}

interface StageConfig {
  id: PortlinkStageId
  shortLabel: string
  clock: string
  headline: string
  subline: string
  activeTabBySeat: Record<PortlinkSeatId, string>
  readinessCount: number
  readinessLabel: string
  kpiPrimaryLabel: string
  kpiPrimaryValue: string
  kpiSecondaryLabel: string
  kpiSecondaryValue: string
  rows: StageRow[]
}

const STAGES: StageConfig[] = [
  {
    id: 't48',
    shortLabel: 'T-48h Readiness (5/7 arranged)',
    clock: 'T-48h · 04.08.2026 kl. 08.00',
    headline: '48-Hour Berth & Arrival Readiness',
    subline: 'Five of seven mandatory pre-arrival milestones confirmed; tugs due in 24 h and passenger manifest flagged.',
    activeTabBySeat: { cl: 'readiness', pa: 'readiness', dmc: 'readiness', ship: 'readiness' },
    readinessCount: 5,
    readinessLabel: '5 of 7 milestones arranged',
    kpiPrimaryLabel: 'Berth Assignment',
    kpiPrimaryValue: 'Skolten North (Berth 3)',
    kpiSecondaryLabel: 'Approved Proforma (PDA)',
    kpiSecondaryValue: '412 380,00 kr',
    rows: [
      {
        item: 'Port agent appointed',
        detail: 'Vestkyst Maritime Agency · Bergen NO BGO',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Vestkyst)', dmc: 'Vestkyst Agency', ship: 'Vestkyst Agency' },
        metric: '01.08.2026',
        chip: 'Done',
        tone: 'ok',
      },
      {
        item: 'Berth & bollard window confirmed',
        detail: 'Skolten North Berth 3 · Bollards 12 to 28 (245 m LOA)',
        ownerBySeat: { cl: 'Port via Agent', pa: 'You (Port Auth)', dmc: 'Port via Agent', ship: 'Bridge verified' },
        metric: 'kl. 08.00 to 18.00',
        chip: 'Confirmed',
        tone: 'ok',
      },
      {
        item: 'Proforma Disbursement Account (PDA)',
        detail: 'Tariff revision 2026-BGO-v2 · 5 cost categories',
        ownerBySeat: { cl: 'Approved by You', pa: 'Sent by You', dmc: 'Role-gated (CL/PA)', ship: 'Role-gated (CL/PA)' },
        metric: '412 380,00 kr',
        chip: 'Approved',
        tone: 'ok',
      },
      {
        item: 'SafeSeaNet & customs clearance',
        detail: 'NO BGO-2026-08411 · ISPS Level 1 declared',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Filed)', dmc: 'Vestkyst Agency', ship: 'Master signed' },
        metric: 'Ref #8411',
        chip: 'Filed',
        tone: 'ok',
      },
      {
        item: 'Pilotage boarding window',
        detail: 'Fedje VTS boarding point · 24,0 m air draft',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Booked)', dmc: 'Vestkyst Agency', ship: 'Bridge kl. 07.15' },
        metric: 'kl. 07.15 to 08.00',
        chip: 'Booked',
        tone: 'ok',
      },
      {
        item: 'Harbour tug escort (2 tugs)',
        detail: '2 x ASD tugs requested for arrival swing',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Action)', dmc: 'Vestkyst Agency', ship: 'Master requested' },
        metric: 'Due in 1 d',
        chip: 'Due in 1 d',
        tone: 'warn',
      },
      {
        item: 'Final guest & crew manifest upload',
        detail: '940 guests · 410 crew · FAL Form 5 & 6',
        ownerBySeat: { cl: 'You (Action)', pa: 'Nordkyst Line', dmc: 'Nordkyst Line', ship: 'Purser office' },
        metric: 'Overdue 1 d',
        chip: 'Overdue 1 d',
        tone: 'bad',
      },
    ],
  },
  {
    id: 'berth',
    shortLabel: '08.30 Berth & Services',
    clock: '06.08.2026 kl. 08.30 · Alongside Bergen',
    headline: 'Alongside Berth & Quayside Services Live',
    subline: 'All 7 readiness items complete; pilotage and mooring logged; fresh water and waste transfer active alongside.',
    activeTabBySeat: { cl: 'services', pa: 'services', dmc: 'overview', ship: 'overview' },
    readinessCount: 7,
    readinessLabel: '7 of 7 milestones arranged (All fast kl. 07.52)',
    kpiPrimaryLabel: 'Gangway Status',
    kpiPrimaryValue: 'Cleared kl. 08.05',
    kpiSecondaryLabel: 'Services Active',
    kpiSecondaryValue: '4 alongside',
    rows: [
      {
        item: 'Inbound pilotage completed',
        detail: 'Fedje VTS to Skolten North Berth 3 · Zero delay',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Logged)', dmc: 'Port Ops', ship: 'Master verified' },
        metric: 'kl. 07.15 to 08.00',
        chip: 'Completed',
        tone: 'ok',
      },
      {
        item: 'Towage arrival assistance',
        detail: '2 tugs used on arrival · 0 min overtime incurred',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Logged)', dmc: 'Role-gated (CL/PA)', ship: 'Bridge log' },
        metric: '2 tugs · 0 OT',
        chip: 'Logged',
        tone: 'ok',
      },
      {
        item: 'Mooring & line handling',
        detail: '6 lines fast on bollards 14 to 26 · Gangway rigged',
        ownerBySeat: { cl: 'Port via Agent', pa: 'You (Verified)', dmc: 'Port Ops', ship: 'Bosun & Deck' },
        metric: 'kl. 07.52',
        chip: 'All Fast',
        tone: 'ok',
      },
      {
        item: 'Fresh water bunkering (180 t)',
        detail: 'Quay hydrant manifold #3 · Flow rate 45 t/h',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Metered)', dmc: 'Role-gated (CL/PA)', ship: 'Chief Engineer' },
        metric: '180,0 t',
        chip: 'In Progress',
        tone: 'info',
      },
      {
        item: 'MARPOL waste & sludge offload',
        detail: '6 m³ segregated domestic & galley waste',
        ownerBySeat: { cl: 'Vestkyst Agency', pa: 'You (Scheduled)', dmc: 'Role-gated (CL/PA)', ship: 'Environmental Off.' },
        metric: '6,0 m³',
        chip: 'Alongside',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'shorex',
    shortLabel: '09.10 Shorex (284 pax)',
    clock: '06.08.2026 kl. 09.10 · First Dispatch Ashore',
    headline: 'Shore Excursion Dispatch & Embark Operator Sync',
    subline: '284 cruise guests dispatched across 3 excursions; live seat counts synced from local Embark operators.',
    activeTabBySeat: { cl: 'programme', pa: 'overview', dmc: 'programme', ship: 'tasks' },
    readinessCount: 7,
    readinessLabel: '284 of 300 shorex seats dispatched on quay',
    kpiPrimaryLabel: 'Shorex Dispatched',
    kpiPrimaryValue: '284 pax (3 tours)',
    kpiSecondaryLabel: 'Embark Trade Sync',
    kpiSecondaryValue: 'Live API v1',
    rows: [
      {
        item: 'Icefjord & Fjord RIB Safari',
        detail: 'Fjordland Adventures AS (Embark) · RIB Havørn · Guide Marte L.',
        ownerBySeat: { cl: 'Fjordhaven DMC', pa: 'Role-gated (CL/DMC)', dmc: 'You (Confirmed)', ship: 'Gangway A' },
        metric: '12 / 12 pax',
        chip: 'All Aboard',
        tone: 'ok',
      },
      {
        item: 'Mount Fløyen & Bryggen Heritage Walk',
        detail: 'Fjordland Adventures AS (Embark) · Coach #4 · Quay zone B',
        ownerBySeat: { cl: 'Fjordhaven DMC', pa: 'Role-gated (CL/DMC)', dmc: 'You (Dispatched)', ship: 'Gangway A' },
        metric: '48 / 48 pax',
        chip: 'On Tour',
        tone: 'ok',
      },
      {
        item: 'Mostraumen Fjord Sightseeing Catamaran',
        detail: 'Vestfjord Charter AS · Berth 2 transfer · Audio DE/EN/NO',
        ownerBySeat: { cl: 'Fjordhaven DMC', pa: 'Role-gated (CL/DMC)', dmc: 'You (Boarding)', ship: 'Gangway B' },
        metric: '224 / 240 pax',
        chip: 'Boarding',
        tone: 'info',
      },
      {
        item: 'All-aboard gangway backstop',
        detail: 'Ship security & DMC sweep before kl. 17.30 gangway up',
        ownerBySeat: { cl: 'Ship + DMC', pa: 'You (Quay sweep)', dmc: 'You (Headcount)', ship: 'Staff Captain' },
        metric: 'kl. 17.30',
        chip: 'Armed',
        tone: 'ok',
      },
    ],
  },
  {
    id: 'settlement',
    shortLabel: '21.00 PDA vs FDA Variance',
    clock: '06.08.2026 kl. 21.00 · Under Way to Geiranger',
    headline: 'Signed Departure Report Feeds Final Account (FDA)',
    subline: 'Port Agent signed kl. 17.28 and Master signed kl. 17.31; unused tug overtime (-11 130,00 kr) reconciles FDA to 401 250,00 kr.',
    activeTabBySeat: { cl: 'finance', pa: 'finance', dmc: 'comms', ship: 'comms' },
    readinessCount: 7,
    readinessLabel: 'Dual gangway signatures locked; FDA ready to settle',
    kpiPrimaryLabel: 'Approved PDA vs FDA',
    kpiPrimaryValue: '412 380,00 kr → 401 250,00 kr',
    kpiSecondaryLabel: 'Net Gangway Variance',
    kpiSecondaryValue: '-11 130,00 kr (-2,7%)',
    rows: [
      {
        item: 'Approved Proforma Disbursement (PDA)',
        detail: 'Pre-arrival baseline approved by Nordkyst Cruise Line',
        ownerBySeat: { cl: 'Approved by You', pa: 'Vestkyst Agency', dmc: 'Role-gated (CL/PA)', ship: 'Role-gated (CL/PA)' },
        metric: '412 380,00 kr',
        chip: 'Baseline',
        tone: 'info',
      },
      {
        item: 'Signed Gangway Departure Report',
        detail: 'Port Agent signed kl. 17.28 · Master signed kl. 17.31 on board',
        ownerBySeat: { cl: 'Verified', pa: 'Signed by You', dmc: 'Sailed kl. 18.00', ship: 'Signed by Master' },
        metric: '-11 130,00 kr',
        chip: 'Dual Signed',
        tone: 'ok',
      },
      {
        item: 'Towage overtime credit adjustment',
        detail: '2 tugs used within base window · 0 overtime hours billed',
        ownerBySeat: { cl: 'Auto-reconciled', pa: 'You (Adjusted)', dmc: 'Role-gated (CL/PA)', ship: 'Gangway log' },
        metric: '-11 130,00 kr',
        chip: 'Variance Flagged',
        tone: 'ok',
      },
      {
        item: 'Final Disbursement Account (FDA)',
        detail: 'Zero unverified line items · Ready for one-click settlement',
        ownerBySeat: { cl: 'Ready to Approve', pa: 'Issued by You', dmc: 'Role-gated (CL/PA)', ship: 'Closed' },
        metric: '401 250,00 kr',
        chip: 'Ready to Settle',
        tone: 'ok',
      },
    ],
  },
]

export function PortlinkLiveWorkspaceSample() {
  const [seatId, setSeatId] = useState<PortlinkSeatId>('pa')
  const [stageId, setStageId] = useState<PortlinkStageId>('t48')

  const seat = SEATS.find((s) => s.id === seatId) ?? SEATS[1]
  const stage = STAGES.find((st) => st.id === stageId) ?? STAGES[0]
  const activeTabId = stage.activeTabBySeat[seatId]

  return (
    <div className="pp-sample-shell" data-testid="portlink-live-workspace-sample">
      {/* Top interactive controls bar */}
      <div className="pp-sample-controls">
        <div className="pp-control-block">
          <span className="pp-control-label">1. Choose your seat (role-scoped SECTION_VIS)</span>
          <div className="pp-segmented" role="group" aria-label="Choose your seat">
            {SEATS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={`pp-seg-btn ${seatId === s.id ? 'is-active' : ''}`}
                aria-pressed={seatId === s.id}
                onClick={() => setSeatId(s.id)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pp-control-block">
          <span className="pp-control-label">2. Scrub the port-call timeline</span>
          <div className="pp-segmented pp-segmented--timeline" role="group" aria-label="Scrub the call timeline">
            {STAGES.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`pp-seg-btn ${stageId === st.id ? 'is-active' : ''}`}
                aria-pressed={stageId === st.id}
                onClick={() => setStageId(st.id)}
              >
                {st.shortLabel}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Role context banner */}
      <div className="pp-role-banner" aria-live="polite">
        <div className="pp-role-banner-main">
          <span className="pp-role-dot" aria-hidden="true" />
          <strong>{seat.roleBadge}</strong>
          <span className="pp-role-person">{seat.person}</span>
        </div>
        <p className="pp-role-note">{seat.accessNote}</p>
      </div>

      {/* Full-width interactive D14 4-seat workspace */}
      <div className="pp-ui-card" data-ui>
        <div className="pp-ui-hd">
          <div>
            <div className="pp-ui-meta">
              <span className="pp-mono">MS Aster Brisa · IMO 9842114</span>
              <span className="pp-sep" aria-hidden="true">·</span>
              <span className="pp-mono">Bergen, Skolten North (Berth 3)</span>
            </div>
            <h3 className="pp-ui-title">{stage.headline}</h3>
          </div>
          <div className="pp-ui-clock-badge pp-mono">{stage.clock}</div>
        </div>

        {/* SECTION_VIS Tab Bar */}
        <div className="pp-ui-tabs" role="list" aria-label="Port call record sections">
          {TABS.map((t) => {
            const isGated = t.gated ? !SECTION_VIS[t.gated].includes(seatId) : false
            const isActive = !isGated && t.id === activeTabId
            return (
              <span
                key={t.id}
                role="listitem"
                className={`pp-ui-tab ${isActive ? 'is-active' : ''} ${isGated ? 'is-gated' : ''}`}
              >
                {t.label}
                {isGated ? <span className="sr-only"> (hidden for {seat.label})</span> : null}
              </span>
            )
          })}
        </div>

        {/* Readiness meter & summary */}
        <div className="pp-ui-summary-strip">
          <div className="pp-ui-meter-wrap">
            <div className="pp-ui-meter-top">
              <span className="pp-ui-meter-label">{stage.readinessLabel}</span>
              <span className="pp-mono pp-ui-meter-frac">{stage.readinessCount}/7</span>
            </div>
            <div className="pp-ui-meter" aria-hidden="true">
              {[0, 1, 2, 3, 4, 5, 6].map((idx) => (
                <i key={idx} className={idx < stage.readinessCount ? 'is-filled' : ''} />
              ))}
            </div>
          </div>
          <div className="pp-ui-kpis">
            <div className="pp-ui-kpi">
              <span className="pp-ui-kpi-label">{stage.kpiPrimaryLabel}</span>
              <strong className="pp-mono pp-ui-kpi-val">{stage.kpiPrimaryValue}</strong>
            </div>
            <div className="pp-ui-kpi">
              <span className="pp-ui-kpi-label">{stage.kpiSecondaryLabel}</span>
              <strong className="pp-mono pp-ui-kpi-val">{stage.kpiSecondaryValue}</strong>
            </div>
          </div>
        </div>

        {/* Operational rows */}
        <div className="pp-ui-rows">
          {stage.rows.map((r) => (
            <div className="pp-ui-row" key={r.item}>
              <div className="pp-ui-row-main">
                <strong className="pp-ui-row-title">{r.item}</strong>
                <span className="pp-ui-row-sub">{r.detail}</span>
              </div>
              <span className="pp-ui-row-owner">{r.ownerBySeat[seatId]}</span>
              <span className="pp-mono pp-ui-row-metric">{r.metric}</span>
              <span className={`pp-chip pp-chip--${r.tone}`}>{r.chip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

type DiffStageId = 'pda' | 'gangway' | 'fda'

interface LedgerLine {
  code: string
  item: string
  basis: string
  pdaAmount: string
  gangwayNote: string
  fdaAmount: string
  delta: string
  hasVariance?: boolean
}

const LEDGER_LINES: LedgerLine[] = [
  {
    code: 'BGO-101',
    item: 'Harbour, Quay & ISPS Passenger Dues',
    basis: '86 400 GT · 940 guests · Berth 3 (10 h)',
    pdaAmount: '148 200,00 kr',
    gangwayNote: 'Verified alongside kl. 08.00 to 18.00',
    fdaAmount: '148 200,00 kr',
    delta: '0,00 kr',
  },
  {
    code: 'BGO-204',
    item: 'Inbound & Outbound Pilotage (Fedje VTS)',
    basis: 'Pilot boarding kl. 07.15 · Sailing kl. 18.00',
    pdaAmount: '86 400,00 kr',
    gangwayNote: 'Pilot signed kl. 08.00 & kl. 18.00',
    fdaAmount: '86 400,00 kr',
    delta: '0,00 kr',
  },
  {
    code: 'BGO-308',
    item: 'Harbour Towage & Tug Escort (2 ASD Tugs)',
    basis: 'PDA included 1,5 h overtime buffer',
    pdaAmount: '103 130,00 kr',
    gangwayNote: '2 tugs used · 0 overtime (signed kl. 17.28)',
    fdaAmount: '92 000,00 kr',
    delta: '-11 130,00 kr',
    hasVariance: true,
  },
  {
    code: 'BGO-412',
    item: 'Mooring & Gangway Line Handling',
    basis: '6 lines in / 6 lines out · Skolten North',
    pdaAmount: '34 650,00 kr',
    gangwayNote: '6 lines verified by Master kl. 17.31',
    fdaAmount: '34 650,00 kr',
    delta: '0,00 kr',
  },
  {
    code: 'BGO-519',
    item: 'Fresh Water (180 t) & Waste Offload (6 m³)',
    basis: 'Hydrant meter #3 + MARPOL receipt',
    pdaAmount: '40 000,00 kr',
    gangwayNote: '180 t + 6 m³ signed on board kl. 17.31',
    fdaAmount: '40 000,00 kr',
    delta: '0,00 kr',
  },
]

export function PortlinkPdaFdaDiffSample() {
  const [diffMode, setDiffMode] = useState<DiffStageId>('fda')

  return (
    <div className="pp-diff-shell" data-testid="portlink-pda-fda-diff">
      {/* Three-card interactive ledger selector */}
      <div className="pp-diff-cards" role="group" aria-label="Select disbursement account stage">
        <button
          type="button"
          className={`pp-diff-card ${diffMode === 'pda' ? 'is-active' : ''}`}
          aria-pressed={diffMode === 'pda'}
          onClick={() => setDiffMode('pda')}
        >
          <div className="pp-diff-card-top">
            <span className="pp-diff-step">1. Approved Proforma (PDA)</span>
            <span className="pp-chip pp-chip--info">T-48h Approved</span>
          </div>
          <div className="pp-diff-amount">412 380,00 kr</div>
          <p className="pp-diff-sub">Pre-arrival estimate approved by Nordkyst Cruise Line before berth confirmation.</p>
        </button>

        <button
          type="button"
          className={`pp-diff-card ${diffMode === 'gangway' ? 'is-active' : ''}`}
          aria-pressed={diffMode === 'gangway'}
          onClick={() => setDiffMode('gangway')}
        >
          <div className="pp-diff-card-top">
            <span className="pp-diff-step">2. Signed Gangway Consumption</span>
            <span className="pp-chip pp-chip--ok">Dual Signed kl. 17.31</span>
          </div>
          <div className="pp-diff-amount pp-diff-amount--delta">-11 130,00 kr</div>
          <p className="pp-diff-sub">Tug overtime buffer unused alongside; signed on board by Agent (17.28) and Master (17.31).</p>
        </button>

        <button
          type="button"
          className={`pp-diff-card ${diffMode === 'fda' ? 'is-active' : ''}`}
          aria-pressed={diffMode === 'fda'}
          onClick={() => setDiffMode('fda')}
        >
          <div className="pp-diff-card-top">
            <span className="pp-diff-step">3. Final Disbursement Account (FDA)</span>
            <span className="pp-chip pp-chip--ok">Ready to Settle</span>
          </div>
          <div className="pp-diff-amount">401 250,00 kr</div>
          <p className="pp-diff-sub">This example subtracts unused tug overtime from the approved estimate.</p>
        </button>
      </div>

      {/* Line-by-line reconciliation table */}
      <div className="pp-ui-card pp-diff-table-card" data-ui>
        <div className="pp-ui-hd">
          <div>
            <span className="pp-ui-meta pp-mono">Illustrative ledger · Call BGO-2026-0806 · MS Aster Brisa</span>
            <h3 className="pp-ui-title">
              {diffMode === 'pda' && 'Approved estimate'}
              {diffMode === 'gangway' && 'Departure adjustment'}
              {diffMode === 'fda' && 'Final account'}
            </h3>
          </div>
          <span className="pp-chip pp-chip--ok">Example variance: 1 line</span>
        </div>

        <p className="pp-scroll-help" id="ledger-scroll-help">Scroll horizontally to review every column. Keyboard: focus the table region, then use the arrow keys.</p>
        <div className="pp-table-scroll" role="region" aria-label="Illustrative disbursement ledger" aria-describedby="ledger-scroll-help" tabIndex={0}>
          <table className="pp-ledger-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Service &amp; Tariff Line</th>
                <th className="is-num">Approved PDA</th>
                <th>Signed Gangway Proof</th>
                <th className="is-num">Variance</th>
                <th className="is-num">Final FDA</th>
              </tr>
            </thead>
            <tbody>
              {LEDGER_LINES.map((line) => (
                <tr key={line.code} className={line.hasVariance ? 'is-variance-row' : ''}>
                  <td className="pp-mono">{line.code}</td>
                  <td>
                    <strong>{line.item}</strong>
                    <span className="pp-table-sub">{line.basis}</span>
                  </td>
                  <td className="pp-mono is-num">{line.pdaAmount}</td>
                  <td>
                    <span className="pp-table-proof">{line.gangwayNote}</span>
                  </td>
                  <td className={`pp-mono is-num ${line.hasVariance ? 'is-credit' : ''}`}>{line.delta}</td>
                  <td className="pp-mono is-num">
                    <strong>{line.fdaAmount}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={2}>
                  <strong>Total Port Call Settlement (NOK)</strong>
                </td>
                <td className="pp-mono is-num">412 380,00 kr</td>
                <td>Signed by Port Agent (17.28) &amp; Ship Master (17.31)</td>
                <td className="pp-mono is-num is-credit">-11 130,00 kr</td>
                <td className="pp-mono is-num">
                  <strong>401 250,00 kr</strong>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )
}
