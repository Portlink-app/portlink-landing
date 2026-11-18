'use client'
/* eslint-disable @next/next/no-img-element */

import Film from '@/components/clone/Film'
import { EMBARK_D14_ASSETS, PORTLINK_D14_ASSETS } from '@/components/product/d14Assets'
import {
  EmbarkCruiseTradeBridge,
  EmbarkQuayCheckInSample,
} from '@/components/product/EmbarkQuayCheckInSample'
import {
  PortlinkLiveWorkspaceSample,
  PortlinkPdaFdaDiffSample,
} from '@/components/product/PortlinkLiveWorkspaceSample'
import type { AcquisitionAudience, AcquisitionProduct } from '@/lib/acquisition-preferences'
import type { DemoRecord } from './journey-content'

/**
 * D14 Stage & Interactive Sample Fragment for the 6 topic routes and expandable <ProductDemo /> modal.
 * Replaces wireframe 4-row HTML text tables with the real 2x Retina D14 stages and interactive samples.
 */
export default function ProductFragment({
  product,
  audience,
  topic,
  record,
  reviewed,
}: {
  product: AcquisitionProduct
  audience: AcquisitionAudience
  topic: string
  record: DemoRecord
  reviewed: boolean
}) {
  return (
    <div className="pp-fragment-stage" data-ui data-reviewed={reviewed ? 'true' : 'false'}>
      {record.unavailable && (
        <div className="pp-role-banner" style={{ marginBottom: '20px' }} role="status">
          <div className="pp-role-banner-main">
            <span className="pp-role-dot" aria-hidden="true" />
            <strong>{record.title}</strong>
            <span className="pp-role-person">Role-scoped SECTION_VIS ({audience})</span>
          </div>
          <p className="pp-role-note">{record.unavailable}</p>
        </div>
      )}

      {product === 'platform' && topic === 'planning' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="pp-callout-strip">
            <div className="pp-callout-pill">
              <strong className="pp-mono">257,0 NM · 4 Ports</strong>
              <span className="pp-callout-pill-meta">Kystverket Hovedled Fairways</span>
              <span>Bergen (NOBGO) to Florø, Stadlandet, Ålesund, and Molde with 0 land crossings</span>
            </div>
            <div className="pp-callout-pill">
              <strong className="pp-mono">120 Fairway Waypoints</strong>
              <span className="pp-callout-pill-meta">Follow-Water Autorouting</span>
              <span>Snaps passage legs to official coastal lanes with 42,0 m minimum fairway depth</span>
            </div>
            <div className="pp-callout-pill">
              <strong className="pp-mono">SHIP AT Timeline · SOG / COG</strong>
              <span className="pp-callout-pill-meta">Voyage Position Scrubber</span>
              <span>Scrub any timestamp along the polyline to inspect live coordinates and next-port ETA</span>
            </div>
          </div>

          <div className="pp-stage-frame">
            <Film
              src={PORTLINK_D14_ASSETS.ch3VoyageAis.filmBase}
              poster={PORTLINK_D14_ASSETS.ch3VoyageAis.desktop}
              alt={PORTLINK_D14_ASSETS.ch3VoyageAis.alt}
              width={PORTLINK_D14_ASSETS.ch3VoyageAis.width}
              height={PORTLINK_D14_ASSETS.ch3VoyageAis.height}
              className="pp-stage-img"
            />
          </div>

          <PortlinkLiveWorkspaceSample />
        </div>
      )}

      {product === 'platform' && topic === 'coordination' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="pp-gangway-stage">
            <img
              src="/product/fjord-cruise-1600.webp"
              alt="Cruise vessel alongside a Norwegian fjord quay"
              width={1600}
              height={1067}
              loading="lazy"
              className="pp-gangway-back-img"
            />
            <div className="pp-gangway-back-scrim" aria-hidden="true" />

            <div className="pp-gangway-stage-grid">
              <div className="pp-gangway-stack">
                <div className="pp-callout-pill pp-callout-pill--dark">
                  <strong className="pp-mono">07.15 to 08.00 · 2 Tugs</strong>
                  <span className="pp-callout-pill-meta">Pilotage &amp; Towage</span>
                  <span>Zero tug overtime used alongside; logged directly on the departure report before lines come in.</span>
                </div>
                <div className="pp-callout-pill pp-callout-pill--dark">
                  <strong className="pp-mono">180 t Water · 6 m³ Waste</strong>
                  <span className="pp-callout-pill-meta">Quay Services Verified</span>
                  <span>Mooring 6 lines fast kl. 07.52; gangway cleared kl. 08.05; hydrant meter #3 and MARPOL receipt attached.</span>
                </div>
                <div className="pp-callout-pill pp-callout-pill--dark">
                  <strong className="pp-mono">17.28 Agent · 17.31 Master</strong>
                  <span className="pp-callout-pill-meta">Cryptographic Sign-Off</span>
                  <span>Dual on-board signatures lock operational quantities and feed the Final Disbursement Account automatically.</span>
                </div>
              </div>

              <div className="pp-gangway-phone-wrap">
                <div className="pp-upright-mobile-frame">
                  <img
                    src={PORTLINK_D14_ASSETS.ch4GangwaySignoff.mobile}
                    alt="Upright 2x Retina mobile capture of Portlink on-board gangway departure report with Port Agent and Ship Master signatures"
                    width={PORTLINK_D14_ASSETS.ch4GangwaySignoff.mobileWidth}
                    height={PORTLINK_D14_ASSETS.ch4GangwaySignoff.mobileHeight}
                    loading="lazy"
                    className="pp-stage-img"
                  />
                </div>
              </div>
            </div>
          </div>

          <PortlinkLiveWorkspaceSample />
        </div>
      )}

      {product === 'platform' && topic === 'accounts' && <PortlinkPdaFdaDiffSample />}

      {product === 'embark' && topic === 'departures' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="pp-callout-strip">
            <div className="pp-callout-pill">
              <strong className="pp-mono">RIB Havørn (12p) · MS Fjordsyn (24p)</strong>
              <span className="pp-callout-pill-meta">Vessel Quota Lock</span>
              <span>Shared hull inventory prevents overlapping departure overbooking</span>
            </div>
            <div className="pp-callout-pill">
              <strong className="pp-mono">STCW + NO / EN / DE</strong>
              <span className="pp-callout-pill-meta">Guide Qualifications</span>
              <span>Filter roster by high-speed craft certificate and guest language</span>
            </div>
            <div className="pp-callout-pill">
              <strong className="pp-mono">Action Required Flag</strong>
              <span className="pp-callout-pill-meta">Exception Alerts</span>
              <span>Departures missing a skipper or guide highlight 24 hours ahead</span>
            </div>
          </div>

          <div className="pp-stage-frame">
            <Film
              src={EMBARK_D14_ASSETS.ch3DispatchRoster.filmBase}
              poster={EMBARK_D14_ASSETS.ch3DispatchRoster.desktop}
              alt={EMBARK_D14_ASSETS.ch3DispatchRoster.alt}
              width={EMBARK_D14_ASSETS.ch3DispatchRoster.width}
              height={EMBARK_D14_ASSETS.ch3DispatchRoster.height}
              className="pp-stage-img"
            />
          </div>

          <div className="pp-stage-frame">
            <img
              src={EMBARK_D14_ASSETS.ch1Hero.desktop}
              alt={EMBARK_D14_ASSETS.ch1Hero.alt}
              width={EMBARK_D14_ASSETS.ch1Hero.width}
              height={EMBARK_D14_ASSETS.ch1Hero.height}
              loading="lazy"
              className="pp-stage-img"
            />
          </div>
        </div>
      )}

      {product === 'embark' && topic === 'capacity' && <EmbarkQuayCheckInSample />}

      {product === 'embark' && topic === 'bookings' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          <div className="pp-callout-strip">
            <div className="pp-callout-pill">
              <strong className="pp-mono">/w/fjordland · Live Seats</strong>
              <span className="pp-callout-pill-meta">Embeddable Web Widget</span>
              <span>Real-time seat availability on your own domain with zero OTA commission</span>
            </div>
            <div className="pp-callout-pill">
              <strong className="pp-mono">Vipps · Stripe · Apple Pay</strong>
              <span className="pp-callout-pill-meta">Instant Nordic &amp; Global Pay</span>
              <span>Payment confirmation attaches directly to the passenger manifest row</span>
            </div>
            <div className="pp-callout-pill">
              <strong className="pp-mono">Invoice #2048 · Settled 14d Prior</strong>
              <span className="pp-callout-pill-meta">Group &amp; DMC Invoicing</span>
              <span>Automated payment links and reminders for private charters and cruise groups</span>
            </div>
          </div>

          <div className="pp-stage-frame">
            <img
              src={EMBARK_D14_ASSETS.ch4WidgetInvoicing.desktop}
              alt={EMBARK_D14_ASSETS.ch4WidgetInvoicing.alt}
              width={EMBARK_D14_ASSETS.ch4WidgetInvoicing.width}
              height={EMBARK_D14_ASSETS.ch4WidgetInvoicing.height}
              loading="lazy"
              className="pp-stage-img"
            />
          </div>

          <EmbarkCruiseTradeBridge />
        </div>
      )}
    </div>
  )
}
