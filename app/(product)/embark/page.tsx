import type { Metadata } from 'next'
import Link from 'next/link'
import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import ProductMotion from '@/components/product/ProductMotion'
import CheckIn from '@/components/product/CheckIn'
import { PRODUCT_PAGE_ROBOTS, DEMO_HREF, DEMO_LABEL } from '@/components/product/config'

const title = 'Embark: check in every guest by phone'
const description =
  "Embark runs the tour operator's day: bookings on your own site, today's departures, the guide's guest list and payment, in one place."

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/embark/' },
  robots: PRODUCT_PAGE_ROBOTS,
  openGraph: { ...ogDefaults, url: '/embark/', title, description },
  twitter: { ...twitterDefaults, title, description },
}

const DEPARTURES = [
  { t: 'kl. 10.00', tour: 'Sea kayak', guide: 'Guide: Ingrid', seats: 24, cap: 24, chip: 'On tour', tone: 'c-acc', today: true },
  { t: 'kl. 14.30', tour: 'Fjord cruise to Mostraumen', guide: 'Guide: Ola', seats: 36, cap: 50, chip: 'Scheduled', tone: 'c-ok', today: true },
  { t: 'Fri 09.00', tour: 'Glacier hike', guide: 'Guide: Ingrid', seats: 6, cap: 12, chip: 'Scheduled', tone: 'c-ok', today: false },
  { t: 'Fri 13.00', tour: 'Whale safari', guide: 'No guide yet', seats: 8, cap: 32, chip: 'Needs guide', tone: 'c-warn', today: false },
]

function Photo({ name, alt, sizes, priority = false }: { name: string; alt: string; sizes: string; priority?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- pre-sized webp pair; next/image is unoptimized on this site
    <img
      src={`/product/${name}-1600.webp`}
      srcSet={`/product/${name}-800.webp 800w, /product/${name}-1600.webp 1600w`}
      sizes={sizes}
      width={1600}
      height={1000}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      alt={alt}
    />
  )
}

export default function EmbarkPage() {
  return (
    <div className="pp" id="pp-embark">
      <header className="hero-photo" id="f-hero">
        <Photo name="sea-kayak" alt="Sea kayaks pulled up on a rocky shore beside calm water" sizes="100vw" priority />
        <div className="wrap top">
          <div className="bar">
            <a className="mark" href="/embark/">Embark <span>by Portlink</span></a>
            <nav aria-label="Page">
              <a href="#f-board">Departures</a>
              <a href="#f-pay">Bookings and payment</a>
              <a href="#f-dmc">Cruise requests</a>
            </nav>
            <a className="btn" href={DEMO_HREF} data-cta="demo-embark-nav">{DEMO_LABEL}</a>
          </div>
          <div className="grid" id="main">
            <div className="copy">
              <h1>Check in every guest by phone</h1>
              <p className="lede">Embark runs the tour operator&apos;s day: bookings on your own site, today&apos;s departures, the guide&apos;s guest list and payment, in one place.</p>
              <div className="actions">
                <a className="btn" href={DEMO_HREF} data-cta="demo-embark-hero">{DEMO_LABEL}</a>
                <a className="link" href="#f-board" data-cta="explore-embark-hero">See today&apos;s departures</a>
              </div>
            </div>
            <div className="ph">
              <CheckIn />
            </div>
          </div>
        </div>
      </header>

      <main>
        <section className="ch board" id="f-board" aria-labelledby="h-board">
          <div className="wrap grid split-5">
            <div className="copy">
              <h2 id="h-board">Seats and guides for today</h2>
              <p className="body">Every departure shows how full it is and who guides it. Today&apos;s trips sit on top, and a full boat closes itself on your booking page.</p>
            </div>
            <div className="frag" data-ui>
              <div className="hd"><b>Departures</b><span className="meta">Thu 21 May · 2 today</span></div>
              {DEPARTURES.map((d) => (
                <div className={`dep${d.today ? ' today' : ''}`} key={d.t}>
                  <span className="t">{d.t}</span>
                  <span>{d.tour}<span className="sub">{d.guide}</span></span>
                  <span className="o">
                    <span className="bar8" role="img" aria-label={`${d.seats} of ${d.cap} seats booked`}><i style={{ width: `${Math.round((d.seats / d.cap) * 100)}%` }} /></span>
                    <span className="sub">{d.seats} of {d.cap}</span>
                  </span>
                  <span className={`chip ${d.tone}`}>{d.chip}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="ch strip f-day" id="f-pay" aria-labelledby="h-pay">
          <div className="wrap grid">
            <div className="pics">
              <Photo name="whale-safari" alt="Whale tail rising from dark sea" sizes="(max-width: 1024px) 60vw, 34vw" />
              <Photo name="glacier-hike" alt="Hikers roped together on a glacier" sizes="(max-width: 1024px) 40vw, 26vw" />
            </div>
            <div className="copy">
              <h2 id="h-pay">Paid before the day</h2>
              <p className="body">Guests book and pay in the widget on your own website. Groups get an invoice with a reminder, and Vipps, card and bank payments land on the booking.</p>
              <div className="frag" data-ui>
                <div className="row three"><span>Invoice 2026-118, Okafor group</span><span className="o">3 900 kr</span><span className="chip c-ok">Paid</span></div>
                <div className="row three"><span>Invoice 2026-121, Müller</span><span className="o">5 200 kr</span><span className="chip c-warn">Reminder sent</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className="ch dmc f-dusk" id="f-dmc" aria-labelledby="h-dmc">
          <div className="wrap grid">
            <div className="copy">
              <h2 id="h-dmc">Cruise DMCs find you by port</h2>
              <p className="body">Switch it on and DMCs in Portlink see your company and tours in the ports you serve, and ask you for terms. Prices are only ever on request.</p>
            </div>
            <div className="frag" data-ui>
              <div className="hd" style={{ justifyContent: 'space-between' }}><b>Visible to DMCs in Portlink</b><span className="switch" role="img" aria-label="On" /></div>
              <p className="sub" style={{ padding: '0 26px 14px' }}>6 tours visible · seen by 4 DMCs in the last 30 days</p>
              <div className="ports">{['Bergen', 'Flåm', 'Olden', 'Ålesund'].map((p) => <span className="chip c-mute" key={p}>{p}</span>)}</div>
              <div className="row"><span>Request from Fjordland DMC<span className="sub" style={{ display: 'block' }}>Nordkyst at Bergen, 22 May · 40 guests</span></span><span className="o">Nobody owns this request yet</span><span className="chip c-acc">Take it</span></div>
            </div>
          </div>
        </section>

        <section className="ch close f-night" id="demo" aria-labelledby="h-close">
          <div className="wrap grid">
            <div className="copy">
              <h2 id="h-close">Run next Thursday in Embark</h2>
              <p className="body">We load your tours and one week of departures, and your guide checks in a test group on their own phone.</p>
              <div className="actions">
                <a className="btn" href={DEMO_HREF} data-cta="demo-embark-close">{DEMO_LABEL}</a>
                <a className="link" href="/portlink/" data-cta="portlink-embark-close">Cruise line or agent? Portlink</a>
              </div>
            </div>
          </div>
          <footer className="wrap foot">
            <nav className="footnav" aria-label="Footer">
              <a href="/contact/">Contact</a>
              <a href="/privacy/">Privacy</a>
              <a href="/portlink/">Portlink</a>
              <Link href="/">Portlink AS</Link>
            </nav>
            <p className="name" aria-hidden="true">Embark</p>
            <p className="credit">Photos: Brandon McDonald, Francesco Ungaro, Colin + Meg, Unsplash licence. Names, tours and amounts are sample data.</p>
          </footer>
        </section>
      </main>
      <ProductMotion rootId="pp-embark" />
    </div>
  )
}
