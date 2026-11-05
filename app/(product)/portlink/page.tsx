import type { Metadata } from 'next'
import Link from 'next/link'
import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import ProductMotion from '@/components/product/ProductMotion'
import RoleLens from '@/components/product/RoleLens'
import { PRODUCT_PAGE_ROBOTS, DEMO_HREF, DEMO_LABEL } from '@/components/product/config'

const title = 'Portlink: run the port call from one record'
const description =
  'Cruise line, port agent, DMC and ship work in the same port-call record: readiness, tours, the departure report and the final account, each seeing their part.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/portlink/' },
  robots: PRODUCT_PAGE_ROBOTS,
  openGraph: { ...ogDefaults, url: '/portlink/', title, description },
  twitter: { ...twitterDefaults, title, description },
}

const READY = [
  { item: 'Agent appointed', owner: 'you', chip: 'Done', tone: 'c-ok' },
  { item: 'Berth', owner: 'port via agent', chip: 'Confirmed', tone: 'c-ok' },
  { item: 'PDA sent', owner: 'agent', chip: 'Sent', tone: 'c-ok' },
  { item: 'Clearance filed', owner: 'agent', chip: 'Filed', tone: 'c-ok' },
  { item: 'Pilot booked', owner: 'agent', chip: 'Booked', tone: 'c-ok' },
  { item: 'Tugs booked', owner: 'agent', chip: 'Due in 1 d', tone: 'c-warn' },
  { item: 'Documents uploaded', owner: 'you', chip: 'Overdue 1 d', tone: 'c-bad' },
]

function Meter({ done, of }: { done: number; of: number }) {
  return (
    <div className="meter" role="img" aria-label={`${done} of ${of} arranged`}>
      {Array.from({ length: of }, (_, i) => <i key={i} className={i < done ? 'd' : undefined} />)}
    </div>
  )
}

export default function PortlinkPage() {
  return (
    <div className="pp" id="pp-portlink">
      <header className="p-hero" id="f-hero">
        <div className="wrap">
          <div className="bar">
            <Link className="mark" href="/">Portlink</Link>
            <nav aria-label="Page">
              <a href="#f-ready">Port calls</a>
              <a href="#f-lens">Who sees what</a>
              <a href="#f-money">Finance</a>
              <a href="/embark/">Embark</a>
            </nav>
            <a className="btn" href={DEMO_HREF} data-cta="demo-portlink-nav">{DEMO_LABEL}</a>
          </div>
          <div className="grid" id="main">
            <div className="copy">
              <h1>Run the port call from one record</h1>
              <p className="lede">Cruise line, port agent, DMC and ship work in the same record: berth, pilot, tours and the final account, each seeing their part.</p>
              <div className="actions">
                <a className="btn" href={DEMO_HREF} data-cta="demo-portlink-hero">{DEMO_LABEL}</a>
                <a className="link" href="#f-lens" data-cta="explore-portlink-hero">See who sees what</a>
              </div>
            </div>
            <div className="rec" data-ui>
              <div className="hd"><b>Nordkyst at Bergen</b><span className="meta">Skolten 3 · Fri 22 May · ETA kl. 07.40 · ETD kl. 17.30</span></div>
              <div className="tabs" aria-hidden="true">
                {['Overview', 'Readiness', 'Finance', 'Programme', 'Services', 'Tasks', 'Comms'].map((t, i) => (
                  <span key={t} className={i === 0 ? 'on' : undefined}>{t}</span>
                ))}
              </div>
              <div className="hd" style={{ paddingTop: 20 }}><span className="fig">Arrives in 2 days</span></div>
              <Meter done={5} of={7} />
              {[READY[0], READY[1], READY[2], READY[5], { ...READY[6], chip: 'Overdue' }].map((r) => (
                <div className="row" key={r.item}><span>{r.item}</span><span className="o">{r.item === 'Agent appointed' ? 'Vestkyst Agency' : r.owner}</span><span className={`chip ${r.tone}`}>{r.chip}</span></div>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="ch" id="f-ready" aria-labelledby="h-ready">
          <div className="wrap grid split-6">
            <div className="copy">
              <h2 id="h-ready">Seven things before arrival</h2>
              <p className="body">Agent, berth, PDA, clearance, pilot, tugs and documents. Each has an owner and a due day, so nobody chases an email thread to find out if the pilot is booked.</p>
              <div className="clockwrap"><p className="clock">48 h</p><p className="clockcap">Before arrival</p></div>
            </div>
            <div className="frag" data-ui>
              <div className="hd"><b>What has to happen before 22 May</b><span className="meta">5 of 7 arranged</span></div>
              <Meter done={5} of={7} />
              {READY.map((r) => (
                <div className="row" key={r.item}><span>{r.item}</span><span className="o">{r.owner}</span><span className={`chip ${r.tone}`}>{r.chip}</span></div>
              ))}
              <div className="who">
                <div><b>Cruise line</b>Nordkyst Line</div>
                <div><b>Agent</b>Vestkyst Agency</div>
                <div><b>DMC</b>Fjordland DMC</div>
                <div><b>Ship</b>MS Nordkyst</div>
              </div>
            </div>
          </div>
        </section>

        <section className="ch f-day" id="f-lens" aria-label="Each seat sees its own record">
          <RoleLens />
        </section>

        <section className="ch tours" id="f-tours" aria-labelledby="h-tours">
          <div className="wrap grid">
            <div className="pic">
              {/* eslint-disable-next-line @next/next/no-img-element -- static export of a pre-sized webp; next/image is unoptimized on this site */}
              <img
                src="/product/fjord-cruise-1600.webp"
                srcSet="/product/fjord-cruise-800.webp 800w, /product/fjord-cruise-1600.webp 1600w"
                sizes="(max-width: 1024px) 100vw, 50vw"
                width={1600}
                height={1000}
                loading="lazy"
                decoding="async"
                alt="Tour boat on a Norwegian fjord below steep green mountains"
              />
            </div>
            <div className="copy">
              <h2 id="h-tours">Tours agreed with the operator</h2>
              <p className="body">The DMC finds tour operators by port and asks for terms in Embark. The programme lands on the call, with seats and guides, and the cruise line signs it off.</p>
              <div className="clockwrap"><p className="clock">09.10</p><p className="clockcap">First tour ashore</p></div>
              <div className="frag" data-ui>
                <div className="row"><span>Fjord cruise to Mostraumen</span><span className="o">Fjordland DMC</span><span className="chip c-ok">Signed</span></div>
                <div className="row"><span>Bergen on foot</span><span className="o">Fjordland DMC</span><span className="chip c-warn">In review</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="ch sign f-dusk" id="f-sign" aria-labelledby="h-sign">
          <div className="wrap grid">
            <div className="copy">
              <h2 id="h-sign">Signed at the table, then sailed</h2>
              <p className="body">The agent and the purser go through what was used alongside on one phone. The agent signs, then the ship signs, and the report feeds the final account.</p>
              <div className="clockwrap"><p className="clock">17.30</p><p className="clockcap">All aboard</p></div>
            </div>
            <div className="ph">
              <div className="phone">
                <div data-ui>
                  <div className="hd"><b>Departure report</b></div>
                  {['Fresh water, 180 t', 'Waste, 6 m³', 'Tugs, 2 × in', 'Line handling'].map((l) => (
                    <div className="row two" key={l}><span>{l}</span><span className="chip c-mute">Used</span></div>
                  ))}
                  <div className="sig">
                    <div className="line">
                      <svg width="150" height="34" viewBox="0 0 150 34" aria-hidden="true"><path d="M2 26c10-14 18-22 24-10s4 14 12 2 12-16 18-6 6 12 16 0 14-8 22-2 18 4 30-4" fill="none" stroke="#131313" strokeWidth="2.2" strokeLinecap="round" /></svg>
                    </div>
                    <span className="sub">Agent, Vestkyst Agency · signed kl. 17.12</span>
                  </div>
                  <div className="sig"><div className="line" /><span className="sub">Ship, purser · waiting</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="ch f-night" id="f-money" aria-labelledby="h-money">
          <div className="wrap grid split-5">
            <div className="copy">
              <h2 id="h-money">See the gap before the invoice</h2>
              <p className="body">The proforma, what was used alongside and the final disbursement account sit side by side on the call. On this call the final account came in 11 130 kr under the estimate, and everyone can see why.</p>
              <div className="clockwrap"><p className="clock">21.00</p><p className="clockcap">Under way to Ålesund</p></div>
            </div>
            <div className="frag" data-ui>
              <div className="hd"><b>Money on this call</b></div>
              <div className="ledger">
                <div><span className="k">PDA</span><p className="fig">412 380 kr</p><span className="chip c-ok">Approved</span><p className="sub">Proforma estimate</p></div>
                <div><span className="k">Departure report</span><p className="fig">398 910 kr</p><span className="chip c-ok">Signed</span><p className="sub">What was used alongside</p></div>
                <div><span className="k">FDA</span><p className="fig">401 250 kr</p><span className="chip c-acc">Sent</span><p className="sub">Final disbursement account</p></div>
              </div>
              <div className="diff"><span>FDA against PDA</span><span className="fig">−11 130 kr</span></div>
            </div>
          </div>
          <div className="wrap grid bridge" id="demo">
            <div className="copy">
              <h2>Try it on your next season</h2>
              <p className="body">Bring one real port call. We set it up with your agent and show each seat its own record in 20 minutes.</p>
              <div className="actions">
                <a className="btn" href={DEMO_HREF} data-cta="demo-portlink-close">{DEMO_LABEL}</a>
                <a className="link" href="/embark/" data-cta="embark-portlink-close">Tour operator? Embark</a>
              </div>
            </div>
          </div>
          <footer className="wrap foot">
            <nav className="footnav" aria-label="Footer">
              <a href="/contact/">Contact</a>
              <a href="/privacy/">Privacy</a>
              <a href="/embark/">Embark</a>
              <Link href="/">Portlink AS</Link>
            </nav>
            <p className="name" aria-hidden="true">Portlink</p>
            <p className="credit">Photo: Pascal Debrunner, Unsplash licence. Vessel, line, agency and amounts are sample data.</p>
          </footer>
        </section>
      </main>
      <ProductMotion rootId="pp-portlink" />
    </div>
  )
}
