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
import {
  ProductPersonalisationBar,
  ProductTopicBar,
} from '@/components/product/ProductPersonalisationBar'

export const metadata: Metadata = {
  title: 'Portlink: Every Port Call on One Record',
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
        {/* CHAPTER 1: Editorial-Report Asymmetric Masthead + Seam-Breaking 2x Retina D14 Stage */}
        <section className="pp-chapter pp-chapter--night pp-hero" id="overview">
          <div className="pp-wrap pp-hero-back-grid">
            <div className="pp-hero-front">
              <h1 tabIndex={-1} data-demo-focus-fallback>
                Every port call on one record.
              </h1>
              <p className="pp-hero-sub">
                For MS Aster Brisa at Bergen Skolten 3 (06.08.2026), cruise line ops, port agent, shorex DMC, and bridge crew coordinate 48-hour berth readiness, gangway sign-off, and final account settlement without email chains or version drift.
              </p>
              <div className="pp-hero-actions">
                <a href="/#access" className="pp-cta-btn" data-cta="demo-portlink-hero">
                  Book a 20-minute demo
                </a>
                <a
                  href="/start/?product=platform&audience=cruise"
                  className="pp-secondary-link"
                  data-cta="trial-platform-hero"
                >
                  Start my trial →
                </a>
                <a href="#live-record" className="pp-secondary-link">
                  Try the live 4-seat record ↓
                </a>
              </div>
            </div>

            <div className="pp-hero-stage-wrap">
              <div className="pp-stage-frame" data-gsap-step>
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

        {/* CHAPTER 2: Showcase — Output Index & Live 4-Seat Sheet + Make It Yours Toolbar */}
        <section className="pp-chapter pp-chapter--day pp-chapter--after-overhang" id="live-record">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Four seats. Role-scoped views.</h2>
              </div>
              <p className="pp-chapter-sub">
                Switch between Cruise Line Ops, Port Agent, Shorex DMC, and Ship Master to see how one database record enforces role privacy across every timestamp of the port call.
              </p>
            </div>

            <ProductPersonalisationBar defaultTopic="planning" />

            <PortlinkLiveWorkspaceSample />
          </div>
        </section>

        {/* CHAPTER 3: How-It-Works — Lines That Step Across + Full-Width Fairway Film */}
        <section className="pp-chapter pp-chapter--night" id="voyage-ais">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Route along official fairways.</h2>
              </div>
              <p className="pp-chapter-sub">
                Snap multi-port legs from Bergen to Floro, Stadlandet, Alesund, and Molde onto Kystverket Hovedled fairways on a survey-grade Norwegian nautical chart. When a berth window shifts, downstream port calls recalculate immediately.
              </p>
            </div>

            <div className="pp-staircase">
              <div className="pp-staircase-item pp-staircase-item--1" data-gsap-step>
                <strong className="pp-staircase-lead">First, snap 257,0 NM across four ports to Kystverket Hovedled fairways.</strong>
                <p className="pp-staircase-body">
                  Every passage leg between Bergen (NOBGO), Floro, Stadlandet, Alesund, and Molde routes through charted coastal lanes with zero land crossings.
                </p>
              </div>
              <div className="pp-staircase-item pp-staircase-item--2" data-gsap-step>
                <strong className="pp-staircase-lead">Then verify 120 fairway waypoints against 42,0 m minimum depth.</strong>
                <p className="pp-staircase-body">
                  Follow-water autorouting checks under-keel clearance and daylight arrival windows before marine operations locks the itinerary.
                </p>
              </div>
              <div className="pp-staircase-item pp-staircase-item--3" data-gsap-step>
                <strong className="pp-staircase-lead">Finally, scrub live vessel position, SOG/COG, and next-port ETA.</strong>
                <p className="pp-staircase-body">
                  Drag any timestamp along the voyage polyline to inspect real-time coordinates, sailed distance, and pilot boarding readiness.
                </p>
              </div>
            </div>

            <div className="pp-stage-frame" data-gsap-step>
              <Film
                src={PORTLINK_D14_ASSETS.ch3VoyageAis.filmBase}
                poster={PORTLINK_D14_ASSETS.ch3VoyageAis.desktop}
                alt={PORTLINK_D14_ASSETS.ch3VoyageAis.alt}
                width={PORTLINK_D14_ASSETS.ch3VoyageAis.width}
                height={PORTLINK_D14_ASSETS.ch3VoyageAis.height}
                className="pp-stage-img"
              />
            </div>

            <ProductTopicBar
              topicId="planning"
              title="Voyage & Berth Planning"
              summary="Keep the proposed itinerary, Kystverket Hovedled fairway route, and each team's review in view."
            />
          </div>
        </section>

        {/* CHAPTER 4: Quayside Verification & Gangway Departure Sign-Off */}
        <section className="pp-chapter pp-chapter--day" id="gangway-signoff">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Signed at the gangway at 17.30.</h2>
              </div>
              <p className="pp-chapter-sub">
                The port agent and the ship master verify water, waste, tugs, and pilotage alongside on the quay, then sign on the same screen at kl. 17.30 so no disputed quantities appear weeks later.
              </p>
            </div>

            <div className="pp-gangway-stage" data-gsap-step>
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
                      <strong>Pilotage and towage logged (kl. 07.15 to 08.00, 2 ASD tugs).</strong>
                      <p>
                        Zero tug overtime used alongside at Skolten Berth 3; recorded directly on the departure report before lines come in.
                      </p>
                    </div>
                    <div className="pp-gangway-clause">
                      <strong>Quayside services metered (180 t fresh water, 6 m³ MARPOL waste).</strong>
                      <p>
                        Six mooring lines fast kl. 07.52 and gangway cleared kl. 08.05, with hydrant meter #3 and waste receipt attached.
                      </p>
                    </div>
                    <div className="pp-gangway-clause">
                      <strong>Dual cryptographic sign-off (kl. 17.28 Agent, kl. 17.31 Master).</strong>
                      <p>
                        On-board signatures lock operational quantities and feed the Final Disbursement Account automatically.
                      </p>
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

            <ProductTopicBar
              topicId="coordination"
              title="Quayside Coordination & Sign-Off"
              summary="Follow the call into pilotage, tugs, quay services, shorex quotes, and dual on-board signatures."
            />
          </div>
        </section>

        {/* CHAPTER 5: PDA-to-FDA Final Account Reconciliation */}
        <section className="pp-chapter pp-chapter--day" id="pda-fda" style={{ paddingTop: 0 }}>
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Every invoice line is signed.</h2>
              </div>
              <p className="pp-chapter-sub">
                Compare Approved Proforma (412 380,00 kr), Signed Gangway Consumption (-11 130,00 kr unused tug overtime), and Final Account (401 250,00 kr) side by side.
              </p>
            </div>

            <PortlinkPdaFdaDiffSample />

            <ProductTopicBar
              topicId="accounts"
              title="PDA-to-FDA Disbursement Settlement"
              summary="Compare Approved Proforma (412 380,00 kr) with signed gangway consumption (-11 130,00 kr) and Final Account (401 250,00 kr)."
            />
          </div>
        </section>

        {/* CHAPTER 6: Inverted Conversion Close */}
        <section className="pp-chapter pp-chapter--night" id="demo">
          <div className="pp-wrap">
            <div className="pp-close-grid">
              <div>
                <h2>Load your next season live.</h2>
                <p className="pp-hero-sub">
                  In 20 minutes we load your port calls and walk through the live four-seat record with your operations team.
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

              <div className="pp-sibling-card" data-gsap-step>
                <h3>Running local tours or shorex?</h3>
                <p className="pp-sibling-body">
                  Embark by Portlink runs daily departures, boat and guide capacity, direct website bookings with Vipps and Stripe, and live Portlink cruise DMC allocations.
                </p>
                <div>
                  <a href="/embark/" className="pp-secondary-link" data-cta="crosslink-portlink-to-embark">
                    <img
                      src="/brand/embark-symbol-on-dark.svg"
                      alt=""
                      width={16}
                      height={16}
                      aria-hidden="true"
                      style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 8 }}
                    />
                    Explore Embark for Tour Operators →
                  </a>
                </div>
              </div>
            </div>

            <div className="pp-stage-frame" style={{ marginTop: '48px' }} data-gsap-step>
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

        <div id="product-consent" className="pp-wrap" />
      </main>

      <footer className="pp-footer">
        <div className="pp-wrap">
          <div className="pp-footer-inner">
            <div className="pp-footer-links">
              <a href="/">Portlink Home</a>
              <a href="/portlink/">Portlink (Port Calls)</a>
              <a href="/embark/">Embark (Shorex &amp; Tours)</a>
              <a href="/team/#mission">Team &amp; Ethos</a>
              <a href="/privacy/">Privacy</a>
              <a href="/contact/">Contact</a>
            </div>
            <p className="pp-footer-copy">
              Portlink AS · Oslo, Norway · Maritime port-call and shore-excursion operations.
            </p>
          </div>
          <svg
            viewBox="0 0 1200 170"
            className="pp-footer-wordmark"
            aria-hidden="true"
            focusable="false"
          >
            <text
              x="0"
              y="142"
              fill="currentColor"
              fontFamily="var(--pp-display)"
              fontWeight="700"
              fontSize="168"
              letterSpacing="-6"
            >
              PORTLINK
            </text>
          </svg>
        </div>
      </footer>
    </div>
  )
}
