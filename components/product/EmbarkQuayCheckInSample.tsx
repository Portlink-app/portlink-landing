'use client'

/**
 * Phase B.2 Interactive Free Sample for /embark:
 *   1. <EmbarkQuayCheckInSample /> (Chapter 2: Quay Check-In 6/12 → 12/12, Boat/Guide Capacity Swap, Cruise DMC Allocation)
 *   2. <EmbarkCruiseTradeBridge /> (Chapter 5: Two-Sided Portlink DMC Request ⇄ Embark Operator Confirmation)
 */
import { useState } from 'react'

type BoatId = 'havorn' | 'fjordsyn'
type GuideId = 'marte' | 'erik'

interface BoatSpec {
  id: BoatId
  name: string
  capacity: number
  berth: string
  typeLabel: string
}

const BOATS: Record<BoatId, BoatSpec> = {
  havorn: {
    id: 'havorn',
    name: 'RIB Havørn',
    capacity: 12,
    berth: 'Pontoon B2 · Zachariasbryggen',
    typeLabel: '12-seat High-Speed RIB',
  },
  fjordsyn: {
    id: 'fjordsyn',
    name: 'MS Fjordsyn',
    capacity: 24,
    berth: 'Quay C1 · Torget Harbour',
    typeLabel: '24-seat Heated Fjord Cruiser',
  },
}

interface GuideSpec {
  id: GuideId
  name: string
  shortName: string
  langs: string
  cert: string
}

const GUIDES: Record<GuideId, GuideSpec> = {
  marte: {
    id: 'marte',
    name: 'Marte Lind',
    shortName: 'Marte L.',
    langs: 'NO / EN / DE',
    cert: 'STCW Crowd & High-Speed Craft',
  },
  erik: {
    id: 'erik',
    name: 'Erik Solberg',
    shortName: 'Erik S.',
    langs: 'NO / EN',
    cert: 'STCW Master <24m & Rescue',
  },
}

interface GuestRow {
  id: string
  label: string
  pax: number
  channel: string
  payment: string
  defaultChecked: boolean
}

const BASE_GUESTS: GuestRow[] = [
  {
    id: 'hansen',
    label: 'Hansen Party #74',
    pax: 4,
    channel: 'Direct Web (/w/fjordland)',
    payment: 'Paid 5 960,00 kr (Vipps)',
    defaultChecked: true,
  },
  {
    id: 'bergmann',
    label: 'Bergmann #81',
    pax: 2,
    channel: 'Direct Web (/w/fjordland)',
    payment: 'Paid 2 980,00 kr (Stripe)',
    defaultChecked: true,
  },
  {
    id: 'cruisepax104',
    label: 'Cruisepax #104 (MS Aster Brisa)',
    pax: 4,
    channel: 'Fjordhaven Shorex DMC',
    payment: 'Trade Voucher #BGO-104',
    defaultChecked: false,
  },
  {
    id: 'booking88',
    label: 'Direct Booking #88 (Lindqvist)',
    pax: 2,
    channel: 'Direct Web (/w/fjordland)',
    payment: 'Paid 2 980,00 kr (Vipps)',
    defaultChecked: false,
  },
]

const DMC_BLOCK_ROW: GuestRow = {
  id: 'dmc210',
  label: 'Fjordhaven DMC Block #210 (MS Aster Brisa)',
  pax: 12,
  channel: 'Portlink Trade API (Skolten Berth 3)',
  payment: 'Net Contract · 14 280,00 kr',
  defaultChecked: true,
}

export function EmbarkQuayCheckInSample() {
  const [boatId, setBoatId] = useState<BoatId>('havorn')
  const [guideId, setGuideId] = useState<GuideId>('marte')
  const [dmcAccepted, setDmcAccepted] = useState<boolean>(false)
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({
    hansen: true,
    bergmann: true,
    cruisepax104: false,
    booking88: false,
    dmc210: true,
  })

  const activeRows = dmcAccepted ? [...BASE_GUESTS, DMC_BLOCK_ROW] : BASE_GUESTS
  const boat = BOATS[boatId]
  const guide = GUIDES[guideId]

  const bookedSeats = activeRows.reduce((sum, r) => sum + r.pax, 0)
  const aboardSeats = activeRows.reduce((sum, r) => sum + (checkedMap[r.id] ? r.pax : 0), 0)
  const remainingCheckIn = bookedSeats - aboardSeats
  const openQuota = Math.max(0, boat.capacity - bookedSeats)
  const allAboard = aboardSeats === bookedSeats && bookedSeats > 0
  const progressPct = Math.min(100, Math.round((aboardSeats / boat.capacity) * 100))

  function toggleRow(id: string) {
    setCheckedMap((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function checkInNext() {
    const nextUnchecked = activeRows.find((r) => !checkedMap[r.id])
    if (nextUnchecked) {
      setCheckedMap((prev) => ({ ...prev, [nextUnchecked.id]: true }))
    }
  }

  function checkInAll() {
    const next: Record<string, boolean> = {}
    for (const r of activeRows) next[r.id] = true
    setCheckedMap(next)
  }

  function handleBoatChange(nextBoat: BoatId) {
    setBoatId(nextBoat)
    if (nextBoat === 'havorn' && dmcAccepted) {
      setDmcAccepted(false)
    }
  }

  function handleToggleDmc() {
    const next = !dmcAccepted
    setDmcAccepted(next)
    if (next && boatId === 'havorn') {
      setBoatId('fjordsyn')
    }
  }

  return (
    <div className="pp-sample-shell" data-testid="embark-quay-checkin-sample">
      {/* Interactive controls bar */}
      <div className="pp-sample-controls">
        <div className="pp-control-block">
          <span className="pp-control-label">1. Assign vessel (live capacity &amp; conflict lock)</span>
          <div className="pp-segmented" role="group" aria-label="Assign vessel">
            <button
              type="button"
              className={`pp-seg-btn ${boatId === 'havorn' ? 'is-active' : ''}`}
              aria-pressed={boatId === 'havorn'}
              onClick={() => handleBoatChange('havorn')}
            >
              RIB Havørn (12 seats)
            </button>
            <button
              type="button"
              className={`pp-seg-btn ${boatId === 'fjordsyn' ? 'is-active' : ''}`}
              aria-pressed={boatId === 'fjordsyn'}
              onClick={() => handleBoatChange('fjordsyn')}
            >
              MS Fjordsyn (24 seats)
            </button>
          </div>
        </div>

        <div className="pp-control-block">
          <span className="pp-control-label">2. Assign certified guide</span>
          <div className="pp-segmented" role="group" aria-label="Assign guide">
            <button
              type="button"
              className={`pp-seg-btn ${guideId === 'marte' ? 'is-active' : ''}`}
              aria-pressed={guideId === 'marte'}
              onClick={() => setGuideId('marte')}
            >
              Marte Lind (NO / EN / DE)
            </button>
            <button
              type="button"
              className={`pp-seg-btn ${guideId === 'erik' ? 'is-active' : ''}`}
              aria-pressed={guideId === 'erik'}
              onClick={() => setGuideId('erik')}
            >
              Erik Solberg (NO / EN)
            </button>
          </div>
        </div>

        <div className="pp-control-block">
          <span className="pp-control-label">3. Incoming Portlink DMC allocation</span>
          <button
            type="button"
            className={`pp-dmc-toggle-btn ${dmcAccepted ? 'is-active' : ''}`}
            aria-pressed={dmcAccepted}
            onClick={handleToggleDmc}
          >
            <span className="pp-dmc-dot" aria-hidden="true" />
            <span>
              {dmcAccepted
                ? 'Accepted: MS Aster Brisa (+12 cruise guests on MS Fjordsyn)'
                : 'Accept MS Aster Brisa DMC allocation (+12 cruise guests)'}
            </span>
          </button>
        </div>
      </div>

      {/* Main split stage: Left Dispatch & Manifest Console, Right Guide's On-Tour Phone */}
      <div className="pp-embark-sample-grid">
        <div className="pp-ui-card" data-ui>
          <div className="pp-ui-hd">
            <div>
              <div className="pp-ui-meta">
                <span className="pp-mono">06.08.2026 kl. 10.00</span>
                <span className="pp-sep" aria-hidden="true">·</span>
                <span>{boat.berth}</span>
              </div>
              <h3 className="pp-ui-title">10.00 Icefjord &amp; Fjord RIB Safari</h3>
            </div>
            <span className={`pp-chip ${allAboard ? 'pp-chip--ok' : 'pp-chip--info'}`}>
              {allAboard ? `${aboardSeats}/${boat.capacity} Aboard · Ready to Cast Off` : `${aboardSeats} of ${bookedSeats} Checked In`}
            </span>
          </div>

          {/* Vessel, Guide & Quota Strip */}
          <div className="pp-ui-summary-strip">
            <div className="pp-ui-meter-wrap">
              <div className="pp-ui-meter-top">
                <span className="pp-ui-meter-label">
                  Live Quay Boarding ({aboardSeats} aboard · {bookedSeats} booked · {openQuota} open seats)
                </span>
                <span className="pp-mono pp-ui-meter-frac">
                  {aboardSeats}/{boat.capacity} seats
                </span>
              </div>
              <div className="pp-progress-bar" aria-hidden="true">
                <span className="pp-progress-fill" style={{ width: `${progressPct}%` }} />
              </div>
            </div>
            <div className="pp-ui-kpis">
              <div className="pp-ui-kpi">
                <span className="pp-ui-kpi-label">Assigned Vessel</span>
                <strong className="pp-mono pp-ui-kpi-val">
                  {boat.name} ({boat.capacity}p)
                </strong>
              </div>
              <div className="pp-ui-kpi">
                <span className="pp-ui-kpi-label">Assigned Guide ({guide.langs})</span>
                <strong className="pp-ui-kpi-val">{guide.name}</strong>
              </div>
            </div>
          </div>

          {/* Interactive Passenger Manifest Rows */}
          <div className="pp-ui-rows">
            {activeRows.map((row) => {
              const isChecked = Boolean(checkedMap[row.id])
              return (
                <div className={`pp-ui-row pp-ui-row--manifest ${isChecked ? 'is-checked' : ''}`} key={row.id}>
                  <div className="pp-ui-row-main">
                    <strong className="pp-ui-row-title">{row.label}</strong>
                    <span className="pp-ui-row-sub">
                      {row.channel} · {row.payment}
                    </span>
                  </div>
                  <span className="pp-mono pp-ui-row-metric">{row.pax} guests</span>
                  <button
                    type="button"
                    className={`pp-checkin-btn ${isChecked ? 'is-checked' : ''}`}
                    aria-pressed={isChecked}
                    onClick={() => toggleRow(row.id)}
                  >
                    {isChecked ? 'Aboard ✓' : `Check in (+${row.pax})`}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="pp-ui-footer-bar">
            <span className="pp-ui-footer-note">
              Offline-ready on the quay: changes sync immediately to the dispatch board and Portlink DMC record.
            </span>
            <div className="pp-ui-footer-actions">
              <button
                type="button"
                className="pp-action-secondary"
                disabled={remainingCheckIn === 0}
                onClick={checkInNext}
              >
                Scan QR ticket
              </button>
              <button
                type="button"
                className="pp-action-primary"
                disabled={remainingCheckIn === 0}
                onClick={checkInAll}
              >
                {remainingCheckIn > 0 ? `Check in remaining ${remainingCheckIn} guests` : 'All guests aboard'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Upright Guide's On-Tour Phone (zero 3D tilt) */}
        <div className="pp-phone-column">
          <div className="pp-phone-shell" aria-label="Guide on-tour mobile check-in preview">
            <div className="pp-phone-notch" aria-hidden="true" />
            <div className="pp-phone-screen" data-ui>
              <div className="pp-phone-top">
                <span className="pp-mono pp-phone-time">kl. 09.54 · Offline Sync Ready</span>
                <span className="pp-phone-guide">Guide: {guide.shortName}</span>
              </div>
              <div className="pp-phone-title-block">
                <strong>10.00 RIB Safari</strong>
                <span>
                  {boat.name} · {guide.langs}
                </span>
              </div>
              <div className="pp-phone-counter" aria-live="polite">
                <span className="pp-mono pp-phone-count-num">{aboardSeats}</span>
                <span className="pp-phone-count-sub">
                  {' '}of {bookedSeats} aboard ({boat.capacity} cap)
                </span>
              </div>
              <div className="pp-phone-list">
                {activeRows.map((row) => {
                  const isChecked = Boolean(checkedMap[row.id])
                  return (
                    <button
                      key={row.id}
                      type="button"
                      className={`pp-phone-guest-btn ${isChecked ? 'is-checked' : ''}`}
                      aria-pressed={isChecked}
                      onClick={() => toggleRow(row.id)}
                    >
                      <span className="pp-phone-guest-info">
                        <strong>{row.label}</strong>
                        <small>
                          {row.pax} pax · {row.channel}
                        </small>
                      </span>
                      <span className="pp-phone-tick" aria-hidden="true">
                        {isChecked ? '✓' : '+'}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="pp-phone-bottom">
                <button
                  type="button"
                  className="pp-phone-cta"
                  disabled={remainingCheckIn === 0}
                  onClick={checkInAll}
                >
                  {remainingCheckIn > 0 ? `Check in all (${remainingCheckIn} left)` : '100% Aboard · Ready to Cast Off'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function EmbarkCruiseTradeBridge() {
  const [confirmed, setConfirmed] = useState<boolean>(true)

  return (
    <div className="pp-bridge-shell" data-testid="embark-cruise-trade-bridge">
      <div className="pp-bridge-controls">
        <span className="pp-control-label">Simulate live Portlink-to-Embark trade sync (api/trade/v1/requests)</span>
        <div className="pp-segmented" role="group" aria-label="Trade request state">
          <button
            type="button"
            className={`pp-seg-btn ${!confirmed ? 'is-active' : ''}`}
            aria-pressed={!confirmed}
            onClick={() => setConfirmed(false)}
          >
            1. Incoming DMC Request (Pending)
          </button>
          <button
            type="button"
            className={`pp-seg-btn ${confirmed ? 'is-active' : ''}`}
            aria-pressed={confirmed}
            onClick={() => setConfirmed(true)}
          >
            2. Confirmed &amp; Synced to Portlink Call
          </button>
        </div>
      </div>

      <div className="pp-bridge-grid">
        {/* Left Card: Shorex DMC in Portlink */}
        <div className="pp-ui-card pp-bridge-card" data-ui>
          <div className="pp-ui-hd">
            <div>
              <span className="pp-ui-meta pp-mono">Side A · Shorex DMC in Portlink</span>
              <h3 className="pp-ui-title">Fjordhaven Shorex DMC · Bergen Call</h3>
            </div>
            <span className={`pp-chip ${confirmed ? 'pp-chip--ok' : 'pp-chip--warn'}`}>
              {confirmed ? 'Programme Confirmed' : 'Awaiting Operator'}
            </span>
          </div>
          <div className="pp-ui-rows">
            <div className="pp-ui-row">
              <div className="pp-ui-row-main">
                <strong className="pp-ui-row-title">Vessel &amp; Berth Arrival</strong>
                <span className="pp-ui-row-sub">MS Aster Brisa (IMO 9842114) · Skolten North Berth 3</span>
              </div>
              <span className="pp-mono pp-ui-row-metric">06.08.2026 kl. 08.00</span>
            </div>
            <div className="pp-ui-row">
              <div className="pp-ui-row-main">
                <strong className="pp-ui-row-title">09.30 Mount Fløyen &amp; Bryggen Walk</strong>
                <span className="pp-ui-row-sub">Coach #4 + Certified Guide (DE / EN)</span>
              </div>
              <span className="pp-mono pp-ui-row-metric">48 seats</span>
              <span className={`pp-chip ${confirmed ? 'pp-chip--ok' : 'pp-chip--warn'}`}>
                {confirmed ? 'Locked' : 'Requested'}
              </span>
            </div>
            <div className="pp-ui-row">
              <div className="pp-ui-row-main">
                <strong className="pp-ui-row-title">10.00 Icefjord &amp; Fjord RIB Safari</strong>
                <span className="pp-ui-row-sub">High-speed fjord run · Zachariasbryggen</span>
              </div>
              <span className="pp-mono pp-ui-row-metric">12 seats</span>
              <span className={`pp-chip ${confirmed ? 'pp-chip--ok' : 'pp-chip--warn'}`}>
                {confirmed ? 'Locked' : 'Requested'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Card: Tour Operator in Embark */}
        <div className="pp-ui-card pp-bridge-card" data-ui>
          <div className="pp-ui-hd">
            <div>
              <span className="pp-ui-meta pp-mono">Side B · Local Tour Operator in Embark</span>
              <h3 className="pp-ui-title">Fjordland Adventures AS · Trade Inbox</h3>
            </div>
            <span className="pp-chip pp-chip--info">Visible in Bergen · Flåm · Ålesund</span>
          </div>
          <div className="pp-ui-rows">
            <div className="pp-ui-row">
              <div className="pp-ui-row-main">
                <strong className="pp-ui-row-title">Trade Request #TR-2026-806</strong>
                <span className="pp-ui-row-sub">From Fjordhaven Shorex DMC · 60 seats total across 2 departures</span>
              </div>
              <span className="pp-mono pp-ui-row-metric">60 000,00 kr net</span>
            </div>
            <div className="pp-ui-row">
              <div className="pp-ui-row-main">
                <strong className="pp-ui-row-title">Resource &amp; Guide Allocation</strong>
                <span className="pp-ui-row-sub">MS Fjordsyn + Coach #4 · Guides Marte L. &amp; Erik S.</span>
              </div>
              <span className={`pp-chip ${confirmed ? 'pp-chip--ok' : 'pp-chip--info'}`}>
                {confirmed ? 'Quota Reserved' : 'Available'}
              </span>
            </div>
          </div>
          <div className="pp-ui-footer-bar">
            <span className="pp-ui-footer-note">
              {confirmed
                ? 'Synced to Portlink call BGO-2026-0806 and deducted from public web widget inventory.'
                : 'Prices are only ever shared on request; confirming locks quota on your departure board.'}
            </span>
            <button
              type="button"
              className="pp-action-primary"
              onClick={() => setConfirmed((v) => !v)}
            >
              {confirmed ? 'Confirmed & Synced ✓ (Click to reset)' : 'Confirm allocation & pricing'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
