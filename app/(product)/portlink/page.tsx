/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import Film from '@/components/clone/Film'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import { PORTLINK_D14_ASSETS } from '@/components/product/d14Assets'
import ProductHeader from '@/components/product/ProductHeader'
import {
  PortlinkLiveWorkspaceSample,
  PortlinkPdaFdaDiffSample,
} from '@/components/product/PortlinkLiveWorkspaceSample'

export const metadata: Metadata = {
  title: 'Portlink: Run Every Port Call from One Shared Record',
  description:
    'Cruise lines, port agents, shorex DMCs, and vessels coordinate berth readiness, live AIS voyages, gangway departure sign-off, and PDA-to-FDA settlement in one shared record.',
  alternates: { canonical: '/portlink/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function PortlinkProductPage() {
  return (
    <div className="pp pp--portlink">
      <ProductHeader product="portlink" tone="dark" />

      <main id="main">
        {/* CHAPTER 1: Three-Layer Mirror Hero (0 ms Instant Text + Back Layer Photo + 140px Bottom Seam Overhang) */}
        <section className="pp-chapter pp-chapter--night pp-hero" id="overview">
          <div className="pp-hero-back" aria-hidden="true">
            <div className="pp-hero-back-scrim pp-hero-back-scrim--dark" />
          </div>

          <div className="pp-wrap pp-hero-back-grid">
            <div className="pp-hero-front">
              <div className="pp-chapter-tag">
                <span>Portlink Maritime Operations</span>
                <span aria-hidden="true">·</span>
                <span>MS Aster Brisa · Bergen Skolten 3 · 06.08.2026</span>
              </div>
              <h1>Run every port call from one shared record.</h1>
              <p className="pp-hero-sub">
                From 48-hour berth readiness to gangway sign-off and final account settlement, without email chains or version drift.
              </p>
              <div className="pp-hero-actions">
                <a href="/#access" className="pp-cta-btn" data-cta="demo-portlink-hero">
                  Book a 20-minute demo
                </a>
                <a href="#live-record" className="pp-secondary-link">
                  Try the live 4-seat record ↓
                </a>
              </div>
            </div>

            <div className="pp-hero-stage-wrap">
              {/* Front Layer: Floating Role Callout Pills */}
              <div className="pp-callout-strip">
                <div className="pp-callout-pill">
                  <span className="pp-callout-pill-kicker">Seat 1 · Cruise Line Ops</span>
                  <strong>Nordkyst Cruise Line</strong>
                  <span>All 7 tabs active: Overview, Readiness, Finance, Programme, Services, Tasks, Comms</span>
                </div>
                <div className="pp-callout-pill">
                  <span className="pp-callout-pill-kicker">Seat 2 · Port Agent</span>
                  <strong>Vestkyst Maritime Agency</strong>
                  <span>Pilotage kl. 07.15, 2 tugs, berth services, and PDA/FDA settlement</span>
                </div>
                <div className="pp-callout-pill">
                  <span className="pp-callout-pill-kicker">Seat 3 &amp; 4 · Shorex DMC &amp; Ship</span>
                  <strong>Fjordhaven DMC + MS Aster Brisa</strong>
                  <span>284 shorex guests synced via Embark; gangway sign-off on board</span>
                </div>
              </div>

              {/* Middle Layer: 2x Retina D14 Port-Call Readiness Stage overhanging bottom seam by 140px */}
              <div className="pp-stage-frame">
                <img
                  src={PORTLINK_D14_ASSETS.ch1Hero.desktop}
                  alt={PORTLINK_D14_ASSETS.ch1Hero.alt}
                  width={PORTLINK_D14_ASSETS.ch1Hero.width}
                  height={PORTLINK_D14_ASSETS.ch1Hero.height}
                  decoding="async"
                  className="pp-stage-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 2: The Interactive Free Sample (4 Seats x 4 Call Timestamps) */}
        <section className="pp-chapter pp-chapter--day pp-chapter--after-overhang" id="live-record">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 02 · Interactive Free Sample</span>
                  <span aria-hidden="true">·</span>
                  <span>Role-Scoped SECTION_VIS</span>
                </div>
                <h2>Four seats on the call. Each sees only its own job.</h2>
              </div>
              <p className="pp-chapter-sub">
                Switch between Cruise Line Ops, Port Agent, Shorex DMC, and Ship Master to see how one database record enforces role privacy across every timestamp of the port call.
              </p>
            </div>

            <PortlinkLiveWorkspaceSample />
          </div>
        </section>

        {/* CHAPTER 3: Voyage Planner & Live AIS Fleet Stage */}
        <section className="pp-chapter pp-chapter--night" id="voyage-ais">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 03 · Voyage &amp; Live AIS</span>
                  <span aria-hidden="true">·</span>
                  <span>Bergen → Geiranger → Ålesund → Tromsø</span>
                </div>
                <h2>Plan the season itinerary and track every hull live.</h2>
              </div>
              <p className="pp-chapter-sub">
                Calculate sea-lane leg distances, ECA fuel windows, and live Norwegian AIS positions in one voyage workspace. When a berth window shifts, downstream port calls recalculate immediately.
              </p>
            </div>

            <div className="pp-callout-strip">
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Norwegian Coastal Leg</span>
                <strong className="pp-mono">382 NM · 14,2 kn</strong>
                <span>Bergen Skolten 3 to Geiranger Anchorage &amp; Ålesund Prestebrygga</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Fuel &amp; ECA Boundary</span>
                <strong className="pp-mono">0,10% Sulphur ECA</strong>
                <span>Automated MGO consumption window and berth arrival slack calculation</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Live Telemetry Feed</span>
                <strong className="pp-mono">AIS + Pilot Boarding</strong>
                <span>Real-time hull position, SOG/COG telemetry, and VTS pilot boarding ETA</span>
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
                  Embark runs daily departures, boat and guide capacity, direct website bookings with Vipps and Stripe, and live Portlink cruise DMC allocations.
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
