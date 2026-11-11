/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import Film from '@/components/clone/Film'
import AcquisitionOpening from '@/components/acquisition/AcquisitionOpening'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import { EMBARK_D14_ASSETS } from '@/components/product/d14Assets'
import ProductHeader from '@/components/product/ProductHeader'

export const metadata: Metadata = {
  title: 'Embark by Portlink: Keep Departures Ready',
  description:
    'Embark runs daily departures, boat and guide capacity, online bookings with Vipps and Stripe, in an independent tour operator workspace.',
  alternates: { canonical: '/embark/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function EmbarkProductPage() {
  return (
    <div className="pp pp--embark">
      <ProductHeader product="embark" tone="light" />

      <main id="main">
        <AcquisitionOpening page="embark" />

        {/* CHAPTER 3: Departures, Fleet & Guide Roster Stage */}
        <section className="pp-chapter pp-chapter--embark-day" id="dispatch">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 03 · Dispatch &amp; Guide Roster</span>
                  <span aria-hidden="true">·</span>
                  <span>NO / EN / DE Language Matching</span>
                </div>
                <h2>Know which boat is going and which guide holds the keys.</h2>
              </div>
              <p className="pp-chapter-sub">
                Assign boats, high-speed craft skippers, and language-matched guides with automatic conflict locking across every departure. Unassigned departures surface an immediate action alert before the morning briefing.
              </p>
            </div>

            <div className="pp-callout-strip">
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Vessel Quota Lock</span>
                <strong className="pp-mono">RIB Havørn (12p) · MS Fjordsyn (24p)</strong>
                <span>Shared hull inventory prevents overlapping departure overbooking</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Guide Qualifications</span>
                <strong className="pp-mono">STCW + NO / EN / DE</strong>
                <span>Filter roster by high-speed craft certificate and guest language</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Exception Alerts</span>
                <strong className="pp-mono">Action Required Flag</strong>
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
          </div>
        </section>

        {/* CHAPTER 4: Paid Before Departure (Direct Web Widget, Vipps & Automated Invoicing) */}
        <section className="pp-chapter pp-chapter--embark-alt" id="paid-before">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 04 · Direct Booking &amp; Settlement</span>
                  <span aria-hidden="true">·</span>
                  <span>/w/fjordland + Automated Invoices</span>
                </div>
                <h2>Paid before departure by Vipps, card, or group invoice.</h2>
              </div>
              <p className="pp-chapter-sub">
                Guests book in 30 seconds on your website widget while cruise DMCs and charter groups settle via automated invoice links with due-date tracking.
              </p>
            </div>

            <div className="pp-callout-strip">
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Embeddable Web Widget</span>
                <strong className="pp-mono">/w/fjordland · Live Seats</strong>
                <span>Real-time seat availability on your own domain with zero OTA commission</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Instant Nordic &amp; Global Pay</span>
                <strong className="pp-mono">Vipps · Stripe · Apple Pay</strong>
                <span>Payment confirmation attaches directly to the passenger manifest row</span>
              </div>
              <div className="pp-callout-pill">
                <span className="pp-callout-pill-kicker">Group &amp; DMC Invoicing</span>
                <strong className="pp-mono">Invoice #2048 · Settled 14d Prior</strong>
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
          </div>
        </section>

        <section className="pp-chapter pp-chapter--embark-day" id="cruise-bridge">
          <div className="pp-wrap"><h2>Tour operations have their own workspace.</h2>
            <p className="pp-chapter-sub">Embark works independently of Platform. For cruise-line itinerary planning and DMC shore requests, explore Platform.</p>
            <a href="/portlink/" className="pp-secondary-link pp-secondary-link--light">Explore Platform →</a>
          </div>
        </section>

        {/* CHAPTER 6: Conversion Close & Clean Nordic Footer */}
        <section className="pp-chapter pp-chapter--embark-night" id="demo">
          <div className="pp-wrap">
            <div className="pp-close-grid">
              <div>
                <div className="pp-chapter-tag">
                  <span>Chapter 06 · Ready for Next Season</span>
                  <span aria-hidden="true">·</span>
                  <span>20-Minute Live Setup</span>
                </div>
                <h2>Bring one of next season&apos;s tours.</h2>
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

              <div className="pp-sibling-card">
                <span className="pp-mono" style={{ fontSize: '12.5px', color: '#5EEAD4', fontWeight: 600 }}>
                  Sibling Product · Portlink Maritime
                </span>
                <h3>Managing cruise port calls, berth readiness, or agency disbursements?</h3>
                <p style={{ color: '#CBD5E1', fontSize: '15.5px' }}>
                  Portlink connects cruise lines, port agents, shorex DMCs, and vessels on one shared port-call record from T-48h readiness to FDA settlement.
                </p>
                <div>
                  <a href="/portlink/" className="pp-secondary-link" data-cta="crosslink-embark-to-portlink">
                    Explore Portlink for Port Calls →
                  </a>
                </div>
              </div>
            </div>

            <div className="pp-stage-frame" style={{ marginTop: '48px' }}>
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
      </main>

      <footer className="pp-footer">
        <div className="pp-wrap pp-footer-inner">
          <div className="pp-footer-links">
            <a href="/">Portlink Home</a>
            <a href="/embark/">Embark (Shorex &amp; Tours)</a>
            <a href="/portlink/">Portlink (Port Calls)</a>
            <a href="/team/">Team</a>
            <a href="/privacy/">Privacy</a>
            <a href="/contact/">Contact</a>
          </div>
          <p className="pp-footer-copy">
            Portlink AS · Oslo, Norway · Embark tour operator dispatch, booking, and cruise-trade platform.
          </p>
        </div>
      </footer>
    </div>
  )
}
