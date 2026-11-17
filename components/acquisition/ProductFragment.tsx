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
    <div className="pp-fragment-stage" data-reviewed={reviewed ? 'true' : 'false'}>
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
          <div className="pp-staircase">
            <div className="pp-staircase-item pp-staircase-item--1">
              <strong className="pp-staircase-lead">257,0 NM across four ports on Kystverket Hovedled fairways.</strong>
              <p className="pp-staircase-body">
                Bergen (NOBGO) to Floro, Stadlandet, Alesund, and Molde with 0 land crossings.
              </p>
            </div>
            <div className="pp-staircase-item pp-staircase-item--2">
              <strong className="pp-staircase-lead">120 fairway waypoints verified to 42,0 m minimum depth.</strong>
              <p className="pp-staircase-body">
                Snaps passage legs to official coastal lanes with daylight arrival checks.
              </p>
            </div>
            <div className="pp-staircase-item pp-staircase-item--3">
              <strong className="pp-staircase-lead">SHIP AT timeline with live SOG/COG vessel scrubber.</strong>
              <p className="pp-staircase-body">
                Scrub any timestamp along the polyline to inspect live coordinates and next-port ETA.
              </p>
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
            <div className="pp-gangway-stage-grid">
              <div className="pp-gangway-editorial">
                <div className="pp-gangway-photo-frame">
                  <img
                    src="/product/fjord-cruise-1600.webp"
                    alt="Cruise vessel alongside a Norwegian fjord quay"
                    width={1600}
                    height={1067}
                    loading="lazy"
                    className="pp-gangway-photo"
                  />
                </div>
                <div className="pp-gangway-clauses">
                  <div className="pp-gangway-clause">
                    <strong>Pilotage &amp; Towage (07.15 to 08.00 · 2 Tugs).</strong>
                    <p>Zero tug overtime used alongside; logged directly on the departure report before lines come in.</p>
                  </div>
                  <div className="pp-gangway-clause">
                    <strong>Quay Services Verified (180 t Water · 6 m³ Waste).</strong>
                    <p>Mooring 6 lines fast kl. 07.52; gangway cleared kl. 08.05; hydrant meter #3 and MARPOL receipt attached.</p>
                  </div>
                  <div className="pp-gangway-clause">
                    <strong>Cryptographic Sign-Off (17.28 Agent · 17.31 Master).</strong>
                    <p>Dual on-board signatures lock operational quantities and feed the Final Disbursement Account automatically.</p>
                  </div>
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
          <div className="pp-staircase">
            <div className="pp-staircase-item pp-staircase-item--1">
              <strong className="pp-staircase-lead">Vessel Quota Lock: RIB Havorn (12p) &amp; MS Fjordsyn (24p).</strong>
              <p className="pp-staircase-body">Shared hull inventory prevents overlapping departure overbooking.</p>
            </div>
            <div className="pp-staircase-item pp-staircase-item--2">
              <strong className="pp-staircase-lead">Guide Qualifications: STCW + NO / EN / DE.</strong>
              <p className="pp-staircase-body">Filter roster by high-speed craft certificate and guest language.</p>
            </div>
            <div className="pp-staircase-item pp-staircase-item--3">
              <strong className="pp-staircase-lead">Exception Alerts: Action Required Flag.</strong>
              <p className="pp-staircase-body">Departures missing a skipper or guide highlight 24 hours ahead.</p>
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
          <div className="pp-split-ledger">
            <div className="pp-split-clauses">
              <div className="pp-split-clause">
                <strong>Embeddable Web Widget (/w/fjordland · Live Seats).</strong>
                <p>Real-time seat availability on your own domain with zero OTA commission.</p>
              </div>
              <div className="pp-split-clause">
                <strong>Instant Nordic &amp; Global Pay (Vipps · Stripe · Apple Pay).</strong>
                <p>Payment confirmation attaches directly to the passenger manifest row.</p>
              </div>
              <div className="pp-split-clause">
                <strong>Group &amp; DMC Invoicing (Invoice #2048 · Settled 14d Prior).</strong>
                <p>Automated payment links and reminders for private charters and cruise groups.</p>
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
          </div>

          <EmbarkCruiseTradeBridge />
        </div>
      )}
    </div>
  )
}
