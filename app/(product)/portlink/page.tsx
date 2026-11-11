/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import type { Metadata } from 'next'
import AcquisitionOpening from '@/components/acquisition/AcquisitionOpening'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
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
                <h2>Plan each passage</h2>
              </div>
              <p className="pp-chapter-sub">
                Review the proposed route and the calls it connects. The example below follows Bergen, Florø, Ålesund and Molde. A changed arrival remains a proposal for the responsible team to review.
              </p>
            </div>

            <div className="pp-example" data-ui aria-label="Illustrative route detail">
              <p className="pp-note">Illustrative planning record · not a navigation chart</p>
              <h3>Summer 2028 · Proposed coastal passage</h3>
              <ol className="pp-route-stops">
                <li><strong>Bergen</strong><span>Proposed call · itinerary planner</span></li>
                <li><strong>Florø</strong><span>Passage review · marine operations</span></li>
                <li><strong>Ålesund</strong><span>Call window · awaiting review</span></li>
                <li><strong>Molde</strong><span>Next call · draft</span></li>
              </ol>
              <p>Owner: Itinerary planner. Review each call before confirming the voyage.</p>
            </div>
          </div>
        </section>

        {/* CHAPTER 4: Gangway Departure Sign-Off (kl. 17.30 on the Quay) */}
        <section className="pp-chapter pp-chapter--day" id="gangway-signoff">
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Review gangway sign-off</h2>
              </div>
              <p className="pp-chapter-sub">
                Compare the services recorded alongside before reviewing the final account. This illustrative departure record keeps quantities and the responsible people together.
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
                  <h3>Keep the departure record together</h3>
                  <p>Owner: Port agent, with the ship master reviewing the recorded quantities.</p>
                  <p>Illustrative example. Signature collection and final-account acceptance are separate decisions.</p>
                </div>
                <dl className="pp-example pp-record" data-ui aria-label="Illustrative gangway record">
                  <div><dt>Call</dt><dd>Bergen · Skolten North</dd></div>
                  <div><dt>Fresh water</dt><dd>180 t</dd></div>
                  <div><dt>Waste offload</dt><dd>6 m³</dd></div>
                  <div><dt>Tugs used</dt><dd>2 · no overtime</dd></div>
                  <div><dt>Review</dt><dd>Agent and master</dd></div>
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/* CHAPTER 5: PDA-to-FDA Final Account Reconciliation (kl. 21.00 Settlement) */}
        <section className="pp-chapter pp-chapter--day" id="pda-fda" style={{ paddingTop: 0 }}>
          <div className="pp-wrap">
            <div className="pp-chapter-intro">
              <div>
                <h2>Compare PDA and FDA</h2>
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
                <h2>Bring your next voyage</h2>
                <p className="pp-hero-sub">
                  Walk through your planning process with our team, from a future itinerary to the people preparing each call.
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
                <span className="pp-mono" style={{ color: '#5EEAD4', fontWeight: 600 }}>
                  Sibling Product · Embark by Portlink
                </span>
                <h3>Running tours?</h3>
                <p style={{ color: '#CBD5E1' }}>
                  Embark runs daily departures, boat and guide capacity, direct website bookings with Vipps and Stripe, for independent tour operations.
                </p>
                <div>
                  <a href="/embark/" className="pp-secondary-link" data-cta="crosslink-portlink-to-embark">
                    Explore Embark for Tour Operators →
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
