/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import AcquisitionOpening from '@/components/acquisition/AcquisitionOpening'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
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
                <h2>Prepare the departure team</h2>
              </div>
              <p className="pp-chapter-sub">
                Review the boat, guide and available capacity before departure. A shortage needs an operator decision; the example does not reassign guests automatically.
              </p>
            </div>

            <div className="pp-example" data-ui>
              <p className="pp-note">Illustrative operator record · Coastal kayaking</p>
              <h3>Prepare twelve places</h3>
              <dl className="pp-record">
                <div><dt>Owner</dt><dd>Tour operator</dd></div>
                <div><dt>Booked guests</dt><dd>12</dd></div>
                <div><dt>Available seats</dt><dd>12</dd></div>
                <div><dt>Guide</dt><dd>Assignment to review</dd></div>
              </dl>
              <p>Use the changed-departure example above to review a two-seat shortage.</p>
            </div>
          </div>
        </section>

        {/* CHAPTER 4: Paid Before Departure (Direct Web Widget, Vipps & Automated Invoicing) */}
        <section className="pp-chapter pp-chapter--embark-alt" id="paid-before">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Review the booking arrangement</h2>
              </div>
              <p className="pp-chapter-sub">
                Discuss the booking and payment setup your operation needs. An invoice request is not approval, and an unpaid booking must not be presented as settled.
              </p>
            </div>

            <div className="pp-example" data-ui>
              <p className="pp-note">Illustrative booking review · no payment is taken here</p>
              <h3>Keep the decision visible</h3>
              <dl className="pp-record">
                <div><dt>Owner</dt><dd>Tour operator</dd></div>
                <div><dt>Group request</dt><dd>Received</dd></div>
                <div><dt>Invoice arrangement</dt><dd>Awaiting approval</dd></div>
                <div><dt>Payment</dt><dd>Not confirmed</dd></div>
              </dl>
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
                <h2>Bring one of next season&apos;s tours.</h2>
                <p className="pp-hero-sub">
                  Walk through your departures, capacity and booking process with our team.
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
                <span className="pp-mono" style={{ color: '#5EEAD4', fontWeight: 600 }}>
                  Sibling Product · Portlink Maritime
                </span>
                <h3>Planning port calls?</h3>
                <p style={{ color: '#CBD5E1' }}>
                  Portlink connects cruise lines, port agents, shorex DMCs, and vessels on one shared port-call record from T-48h readiness to FDA settlement.
                </p>
                <div>
                  <a href="/portlink/" className="pp-secondary-link" data-cta="crosslink-embark-to-portlink">
                    Explore Portlink for Port Calls →
                  </a>
                </div>
              </div>
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
