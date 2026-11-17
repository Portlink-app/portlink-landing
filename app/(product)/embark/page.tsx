/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import Film from '@/components/clone/Film'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import { EMBARK_D14_ASSETS } from '@/components/product/d14Assets'
import {
  EmbarkCruiseTradeBridge,
  EmbarkQuayCheckInSample,
} from '@/components/product/EmbarkQuayCheckInSample'
import ProductHeader from '@/components/product/ProductHeader'
import {
  ProductPersonalisationBar,
  ProductTopicBar,
} from '@/components/product/ProductPersonalisationBar'

export const metadata: Metadata = {
  title: 'Embark by Portlink: Fill the Boat, Check In on Pier',
  description:
    'Embark runs daily departures, boat and guide capacity, online bookings with Vipps and Stripe, and Portlink cruise DMC allocations in one operational schedule.',
  alternates: { canonical: '/embark/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function EmbarkProductPage() {
  return (
    <div className="pp pp--embark">
      <ProductHeader product="embark" tone="light" />

      <main id="main">
        {/* CHAPTER 1: Editorial-Report Asymmetric Masthead + Seam-Breaking 2x Retina D14 Stage */}
        <section className="pp-chapter pp-chapter--embark-day pp-hero" id="hero">
          <span id="overview" aria-hidden="true" />

          <div className="pp-wrap pp-hero-back-grid">
            <div className="pp-hero-front">
              <img
                src="/brand/embark-lockup.svg"
                alt="Embark by Portlink"
                width={168}
                height={39}
                style={{ display: 'block', marginBottom: '20px' }}
              />
              <h1 tabIndex={-1} data-demo-focus-fallback>
                Fill the boat. Check in on pier.
              </h1>
              <p className="pp-hero-sub">
                For Fjordland Adventures AS in Bergen and Geiranger, Embark runs daily departures, RIB and cruiser capacity locks, direct Vipps and Stripe web bookings, and Portlink cruise DMC allocations in one operational schedule.
              </p>
              <div className="pp-hero-actions">
                <a href="/#access" className="pp-cta-btn" data-cta="demo-embark-hero">
                  Book a 20-minute demo
                </a>
                <a
                  href="/start/?product=embark&audience=operator"
                  className="pp-secondary-link pp-secondary-link--light"
                  data-cta="trial-embark-hero"
                >
                  Start my trial →
                </a>
                <a href="#quay-checkin" className="pp-secondary-link pp-secondary-link--light">
                  Try live quay check-in ↓
                </a>
              </div>
            </div>

            <div className="pp-hero-stage-wrap">
              <div className="pp-stage-frame" data-gsap-step>
                <img
                  src={EMBARK_D14_ASSETS.ch1Hero.desktop}
                  alt={EMBARK_D14_ASSETS.ch1Hero.alt}
                  width={EMBARK_D14_ASSETS.ch1Hero.width}
                  height={EMBARK_D14_ASSETS.ch1Hero.height}
                  decoding="async"
                  className="pp-stage-img"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 2: Showcase — Live Quay Check-In & Capacity Swap + Make It Yours Toolbar */}
        <section className="pp-chapter pp-chapter--embark-alt pp-chapter--after-overhang" id="quay-checkin">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Board guests and swap boats live.</h2>
              </div>
              <p className="pp-chapter-sub">
                Tap a guest group to board them on RIB Havorn at Zachariasbryggen, swap in MS Fjordsyn for 12 extra seats, or accept an incoming cruise DMC request from MS Aster Brisa.
              </p>
            </div>

            <ProductPersonalisationBar defaultTopic="capacity" />

            <EmbarkQuayCheckInSample />

            <ProductTopicBar
              topicId="capacity"
              title="Live Capacity & Quay Check-In"
              summary="See boat capacity changes, resolve guest seat shortages, and check passengers in on the pier."
            />
          </div>
        </section>

        {/* CHAPTER 3: How-It-Works — Lines That Step Across + Full-Width Dispatch Film */}
        <section className="pp-chapter pp-chapter--embark-day" id="dispatch">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Every boat and guide assigned.</h2>
              </div>
              <p className="pp-chapter-sub">
                Assign boats, high-speed craft skippers, and language-matched guides with automatic conflict locking across every departure. Unassigned departures surface an immediate action alert before the morning briefing.
              </p>
            </div>

            <div className="pp-staircase">
              <div className="pp-staircase-item pp-staircase-item--1" data-gsap-step>
                <strong className="pp-staircase-lead">First, lock shared hull capacity across RIB Havorn (12p) and MS Fjordsyn (24p).</strong>
                <p className="pp-staircase-body">
                  Shared vessel inventory prevents overlapping departures from overbooking the same boat or pontoon berth.
                </p>
              </div>
              <div className="pp-staircase-item pp-staircase-item--2" data-gsap-step>
                <strong className="pp-staircase-lead">Then match STCW skippers and NO, EN, and DE guides to each departure.</strong>
                <p className="pp-staircase-body">
                  Filter the roster by high-speed craft certificate, crowd management qualification, and booked guest language.
                </p>
              </div>
              <div className="pp-staircase-item pp-staircase-item--3" data-gsap-step>
                <strong className="pp-staircase-lead">Finally, clear unassigned departure alerts 24 hours before cast-off.</strong>
                <p className="pp-staircase-body">
                  Any departure missing a skipper, guide, or sufficient seat quota stays flagged until an operator resolves it.
                </p>
              </div>
            </div>

            <div className="pp-stage-frame" data-gsap-step>
              <Film
                src={EMBARK_D14_ASSETS.ch3DispatchRoster.filmBase}
                poster={EMBARK_D14_ASSETS.ch3DispatchRoster.desktop}
                alt={EMBARK_D14_ASSETS.ch3DispatchRoster.alt}
                width={EMBARK_D14_ASSETS.ch3DispatchRoster.width}
                height={EMBARK_D14_ASSETS.ch3DispatchRoster.height}
                className="pp-stage-img"
              />
            </div>

            <ProductTopicBar
              topicId="departures"
              title="Departures & Guide Roster"
              summary="Bring booked guests, vessel quota locks, and STCW/language-matched guides together."
            />
          </div>
        </section>

        {/* CHAPTER 4: Split Editorial Settlement Ledger + 2x Retina Web Widget & Invoicing Stage */}
        <section className="pp-chapter pp-chapter--embark-alt" id="paid-before">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Paid before departure via Vipps.</h2>
              </div>
              <p className="pp-chapter-sub">
                Guests book in 30 seconds on your website widget while cruise DMCs and charter groups settle via automated invoice links with due-date tracking.
              </p>
            </div>

            <div className="pp-split-ledger">
              <div className="pp-split-clauses" data-gsap-step>
                <div className="pp-split-clause">
                  <strong>Embeddable web widget (/w/fjordland) with live seat lock.</strong>
                  <p>
                    Publish real-time seat availability directly on your own domain with zero OTA commission and instant manifest creation.
                  </p>
                </div>
                <div className="pp-split-clause">
                  <strong>Instant Nordic and international checkout (Vipps, Stripe, Apple Pay).</strong>
                  <p>
                    Every payment confirmation attaches directly to the passenger manifest row before the guest reaches Zachariasbryggen.
                  </p>
                </div>
                <div className="pp-split-clause">
                  <strong>Automated group and DMC invoicing (Invoice #2048 settled 14d prior).</strong>
                  <p>
                    Send hosted payment links and scheduled due-date reminders for private charters and cruise shorex allocations.
                  </p>
                </div>
              </div>

              <div className="pp-stage-frame" data-gsap-step>
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

            <ProductTopicBar
              topicId="bookings"
              title="Direct Bookings & Group Settlement"
              summary="Keep web widget payments, cruise DMC allocations, and group invoice arrangements explicit."
            />
          </div>
        </section>

        {/* CHAPTER 5: The Portlink Cruise-Trade Bridge */}
        <section className="pp-chapter pp-chapter--embark-day" id="cruise-bridge">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Synced with cruise lines live.</h2>
              </div>
              <p className="pp-chapter-sub">
                Confirm a shore-excursion seat request in Embark and watch the ship&apos;s port-call programme in Portlink update automatically with zero spreadsheets.
              </p>
            </div>

            <EmbarkCruiseTradeBridge />
          </div>
        </section>

        {/* CHAPTER 6: Inverted Conversion Close */}
        <section className="pp-chapter pp-chapter--embark-night" id="demo">
          <div className="pp-wrap">
            <div className="pp-close-grid">
              <div>
                <img
                  src="/brand/embark-lockup-on-dark.svg"
                  alt="Embark by Portlink"
                  width={154}
                  height={36}
                  style={{ display: 'block', marginBottom: '20px' }}
                />
                <h2>Bring one tour for next season.</h2>
                <p className="pp-hero-sub">
                  In 20 minutes we load your departures, boats, and booking widget live so your guides can test quay check-in on their own phones.
                </p>
                <div className="pp-hero-actions">
                  <a href="/#access" className="pp-cta-btn" data-cta="demo-embark-close">
                    Book a 20-minute demo
                  </a>
                  <a href="/contact/" className="pp-secondary-link">
                    Talk to our team
                  </a>
                </div>
              </div>

              <div className="pp-sibling-card" data-gsap-step>
                <h3>Managing cruise port calls?</h3>
                <p className="pp-sibling-body">
                  Portlink Maritime connects cruise lines, port agents, shorex DMCs, and vessels on one shared port-call record from T-48h readiness to FDA settlement.
                </p>
                <div>
                  <a href="/portlink/" className="pp-secondary-link" data-cta="crosslink-embark-to-portlink">
                    Explore Portlink for Port Calls →
                  </a>
                </div>
              </div>
            </div>

            <div className="pp-stage-frame" style={{ marginTop: '48px' }} data-gsap-step>
              <img
                src={EMBARK_D14_ASSETS.ch6OperatorOverview.desktop}
                alt={EMBARK_D14_ASSETS.ch6OperatorOverview.alt}
                width={EMBARK_D14_ASSETS.ch6OperatorOverview.width}
                height={EMBARK_D14_ASSETS.ch6OperatorOverview.height}
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
              <a href="/embark/">Embark (Shorex &amp; Tours)</a>
              <a href="/portlink/">Portlink (Port Calls)</a>
              <a href="/team/#mission">Team &amp; Ethos</a>
              <a href="/privacy/">Privacy</a>
              <a href="/contact/">Contact</a>
            </div>
            <p className="pp-footer-copy">
              Portlink AS · Oslo, Norway · Embark tour operator dispatch, booking, and cruise-trade platform.
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
              fontSize="188"
              letterSpacing="-6"
            >
              EMBARK
            </text>
          </svg>
        </div>
      </footer>
    </div>
  )
}
