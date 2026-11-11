/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import Film from '@/components/clone/Film'
import AcquisitionOpening from '@/components/acquisition/AcquisitionOpening'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import { PORTLINK_D14_ASSETS } from '@/components/product/d14Assets'
import ProductHeader from '@/components/product/ProductHeader'
import {
  PortlinkPdaFdaDiffSample,
} from '@/components/product/PortlinkLiveWorkspaceSample'

export const metadata: Metadata = {
  title: 'Platform by Portlink: Plan the Whole Voyage',
  description:
    'Cruise lines, port agents, shorex DMCs, and vessels coordinate berth readiness, fairway voyage routing, gangway departure sign-off, and PDA-to-FDA settlement in one shared record.',
  alternates: { canonical: '/portlink/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function PortlinkProductPage() {
  return (
    <div className="pp pp--portlink">
      <ProductHeader product="portlink" tone="dark" />

      <main id="main">
        <AcquisitionOpening page="platform" />

        {/* CHAPTER 3: Voyage & Nautical Chart Stage (RouteEditor + VoyageMap + Kystverket Fairways) */}
        <section className="pp-chapter pp-chapter--night" id="voyage-ais">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 03 · Voyage &amp; Nautical Chart</span>
                  <span aria-hidden="true">·</span>
                  <span>Bergen → Florø → Ålesund → Molde</span>
                </div>
                <h2>Route along Norwegian fairways and scrub every passage window.</h2>
              </div>
              <p className="pp-chapter-sub">
                Snap multi-port legs to Kystverket Hovedled fairways on a survey-grade Norwegian nautical chart, verify daylight arrival windows, and scrub vessel position across the entire voyage. When a berth window shifts, downstream port calls recalculate immediately.
              </p>
            </div>

            <div className="pp-callout-strip">
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Kystverket Hovedled Fairways</span>
                <strong className="pp-mono">257,0 NM · 4 Ports</strong>
                <span>Bergen (NOBGO) to Florø, Stadlandet, Ålesund, and Molde with 0 land crossings</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Follow-Water Autorouting</span>
                <strong className="pp-mono">120 Fairway Waypoints</strong>
                <span>Snaps passage legs to official coastal lanes with 42,0 m minimum fairway depth and daylight arrival checks</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Voyage Position Scrubber</span>
                <strong className="pp-mono">SHIP AT Timeline · SOG / COG</strong>
                <span>Scrub any timestamp along the polyline to inspect live coordinates, sailed distance, and next-port ETA</span>
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
          </div>
        </section>

        {/* CHAPTER 4: Gangway Departure Sign-Off (kl. 17.30 on the Quay) */}
        <section className="pp-chapter pp-chapter--day" id="gangway-signoff">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 04 · Quayside Verification</span>
                  <span aria-hidden="true">·</span>
                  <span>kl. 17.30 All Aboard</span>
                </div>
                <h2>Signed on one phone at the gangway before cast-off.</h2>
              </div>
              <p className="pp-chapter-sub">
                The port agent and the ship master verify water, waste, tugs, and pilotage alongside, then sign on the same screen at kl. 17.30 so no disputed quantities appear weeks later.
              </p>
            </div>

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
                    <span className="pp-callout-pill-kicker">Pilotage &amp; Towage</span>
                    <strong className="pp-mono">07.15 to 08.00 · 2 Tugs</strong>
                    <span>Zero tug overtime used alongside; logged directly on the departure report before lines come in.</span>
                  </div>
                  <div className="pp-callout-pill pp-callout-pill--dark">
                    <span className="pp-callout-pill-kicker">Quay Services Verified</span>
                    <strong className="pp-mono">180 t Water · 6 m³ Waste</strong>
                    <span>Mooring 6 lines fast kl. 07.52; gangway cleared kl. 08.05; hydrant meter #3 and MARPOL receipt attached.</span>
                  </div>
                  <div className="pp-callout-pill pp-callout-pill--dark">
                    <span className="pp-callout-pill-kicker">Cryptographic Sign-Off</span>
                    <strong className="pp-mono">17.28 Agent · 17.31 Master</strong>
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
          </div>
        </section>

        {/* CHAPTER 5: PDA-to-FDA Final Account Reconciliation (kl. 21.00 Settlement) */}
        <section className="pp-chapter pp-chapter--day" id="pda-fda" style={{ paddingTop: 0 }}>
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 05 · Disbursement Settlement</span>
                  <span aria-hidden="true">·</span>
                  <span>kl. 21.00 Under Way</span>
                </div>
                <h2>Every final invoice line links to a signed timestamp.</h2>
              </div>
              <p className="pp-chapter-sub">
                Compare Approved Proforma (412 380,00 kr), Signed Gangway Consumption (-11 130,00 kr unused tug overtime), and Final Account (401 250,00 kr) side by side.
              </p>
            </div>

            <PortlinkPdaFdaDiffSample />
          </div>
        </section>

        {/* CHAPTER 6: High-Contrast Conversion Close */}
        <section className="pp-chapter pp-chapter--night" id="demo">
          <div className="pp-wrap">
            <div className="pp-close-grid">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 06 · Live Season Onboarding</span>
                  <span aria-hidden="true">·</span>
                  <span>20-Minute Walkthrough</span>
                </div>
                <h2>Bring your next port call or season schedule.</h2>
                <p className="pp-hero-sub">
                  In 20 minutes we load your ports and walk through the live 4-seat record with your team.
                </p>
                <div className="pp-hero-actions">
                  <a href="/#access" className="pp-cta-btn" data-cta="demo-portlink-close">
                    Book a 20-minute demo
                  </a>
                  <a href="/contact/" className="pp-secondary-link">
                    Talk to operations
                  </a>
                </div>
              </div>

              <div className="pp-sibling-card">
                <span className="pp-mono" style={{ fontSize: '12.5px', color: '#5EEAD4', fontWeight: 600 }}>
                  Sibling Product · Embark by Portlink
                </span>
                <h3>Running shore excursions, RIB safaris, or local tours?</h3>
                <p style={{ color: '#CBD5E1', fontSize: '15.5px' }}>
                  Embark runs daily departures, boat and guide capacity, direct website bookings with Vipps and Stripe, for independent tour operations.
                </p>
                <div>
                  <a href="/embark/" className="pp-secondary-link" data-cta="crosslink-portlink-to-embark">
                    Explore Embark for Tour Operators →
                  </a>
                </div>
              </div>
            </div>

            <div className="pp-stage-frame" style={{ marginTop: '48px' }}>
              <img
                src={PORTLINK_D14_ASSETS.ch6Deployment.desktop}
                alt={PORTLINK_D14_ASSETS.ch6Deployment.alt}
                width={PORTLINK_D14_ASSETS.ch6Deployment.width}
                height={PORTLINK_D14_ASSETS.ch6Deployment.height}
                loading="lazy"
                className="pp-stage-img"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="pp-footer">
        <div className="pp-wrap pp-footer-inner">
          <div className="pp-footer-links">
            <a href="/">Portlink Home</a>
            <a href="/portlink/">Portlink (Port Calls)</a>
            <a href="/embark/">Embark (Shorex &amp; Tours)</a>
            <a href="/team/">Team</a>
            <a href="/privacy/">Privacy</a>
            <a href="/contact/">Contact</a>
          </div>
          <p className="pp-footer-copy">
            Portlink AS · Oslo, Norway · Maritime port-call and shore-excursion operations.
          </p>
        </div>
      </footer>
    </div>
  )
}
