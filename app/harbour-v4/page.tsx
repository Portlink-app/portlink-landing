import type { Metadata } from 'next'
import Link from 'next/link'
import HarbourV4Stage, {
  CapturePictureV4,
  HarbourV4PilotForm,
  RoleSwitcherV4,
} from '@/components/harbour/v4/HarbourV4Stage'
import { BEATS_V4, PRODUCTS_V4 } from '@/components/harbour/v4/scriptV4'
import styles from '@/components/harbour/v4/harbour-v4.module.css'
import '@/components/harbour/harbour-tokens.css'

export const metadata: Metadata = {
  title: 'One Harbour v4 · Portlink',
  description:
    'One shared record per port call across the cruise line, the port agent, the DMC and the tour operator.',
  robots: { index: false, follow: false },
}

const heroBeat = BEATS_V4[0]
const storyBeats = BEATS_V4.slice(1)

export default function HarbourV4Page() {
  return (
    <div className={styles.page}>
      <header className={styles.topHeader}>
        <div className={`${styles.container} ${styles.topBar}`}>
          <Link href="/" className={styles.topBrand}>
            Portlink
          </Link>
          <nav className={styles.topNav} aria-label="Harbour v4 navigation">
            <a href={`#beat-${storyBeats[0].id}`} className={styles.topLink}>
              Voyage &amp; call
            </a>
            <a href="#roles" className={styles.topLink}>
              By role
            </a>
            <a href="#products" className={styles.topLink}>
              Products
            </a>
            <a href="#ports" className={styles.topLink}>
              Ports &amp; terminals
            </a>
            <a href="#session" className={styles.topCta}>
              Get your free setup
            </a>
          </nav>
        </div>
      </header>
      <main id="main" tabIndex={-1} data-surface="harbour-v4">
        {/* Hero section (Beat 0): passes Cold Hero Gate at 1440, 1280, 390 */}
        <section id="beat-b00" className={styles.heroSection}>
          <div className={styles.container}>
            <div className={styles.heroGrid}>
              <div className={styles.revealItem} data-reveal="true">
                <h1 className={styles.h1} data-reveal="true">{heroBeat.heading}</h1>
                <p className={styles.lead} data-reveal="true">{heroBeat.lead}</p>
                <p className={styles.body}>{heroBeat.body}</p>
                <div className={styles.actions} data-reveal="true">
                  <a className={styles.btnPrimary} href="#session">
                    Get your free setup
                  </a>
                  <a className={styles.btnSecondary} href={`#beat-${storyBeats[0].id}`}>
                    Follow the call
                  </a>
                </div>
              </div>

              <div className={styles.heroVisual}>
                <div className={`${styles.stageCard} ${styles.revealItem}`} data-reveal="true">
                  <img
                    src="/media/harbour-v4/d/b00/plate_0001.avif"
                    alt="150 m expedition cruise vessel moored alongside a Norwegian quay with fjord mountains behind"
                    width={1440}
                    height={810}
                    fetchPriority="high"
                    className={styles.plateImg}
                  />
                </div>
                <div className={styles.revealItem} data-reveal="true">
                  <CapturePictureV4 id="P01" loading="eager" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Live WebGL2 water + FramePlayer canvas scrubber stage */}
        <HarbourV4Stage />

        {/* Beats 1 to 6: each beat carries its rendered 3D object and its real product capture >= 55% viewport */}
        {storyBeats.map((beat, idx) => (
          <section
            key={beat.id}
            id={`beat-${beat.id}`}
            className={idx % 2 === 0 ? styles.beatSection : styles.beatSectionAlt}
          >
            <div className={styles.container}>
              <div className={styles.beatGrid}>
                <div className={styles.revealItem} data-reveal="true">
                  <h2 className={styles.h2} data-reveal="true">{beat.heading}</h2>
                  <p className={styles.lead}>{beat.lead}</p>
                  <p className={styles.body}>{beat.body}</p>
                  <div className={styles.actions} data-reveal="true">
                    <a className={styles.btnPrimary} href="#session">
                      Get your free setup
                    </a>
                    <a className={styles.btnSecondary} href="#roles">
                      Switch desk role
                    </a>
                  </div>
                </div>

                <div className={styles.beatVisualStack}>
                  <div className={`${styles.stageCard} ${styles.revealItem}`} data-reveal="true">
                    <img
                      src={`/media/harbour-v4/d/${beat.id}/plate_0001.avif`}
                      alt={`${beat.label}: ${beat.heading}`}
                      width={1440}
                      height={810}
                      loading="eager"
                      decoding="async"
                      className={styles.plateImg}
                    />
                  </div>

                  <div className={styles.revealItem} data-reveal="true">
                    <CapturePictureV4 id={beat.primaryCapture} />
                  </div>

                  {beat.insetCaptures.length > 0 ? (
                    <div className={styles.insetGrid}>
                      {beat.insetCaptures.map((cid) => (
                        <div key={cid} className={styles.revealItem} data-reveal="true">
                          <CapturePictureV4 id={cid} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Beat 7a: Role switcher across Cruise line, Port agent, DMC, Tour operator and Wheelhouse */}
        <section id="roles" className={styles.mistSection}>
          <div className={styles.container}>
            <RoleSwitcherV4 />
          </div>
        </section>

        {/* Beat 7b: Three products, one company (Portlink Platform, Embark, Wheelhouse) */}
        <section id="products" className={styles.mistSectionAlt}>
          <div className={styles.container}>
            <div className={styles.revealItem} data-reveal="true">
              <h2 className={styles.h2}>Three products, one company.</h2>
              <p className={styles.leadMist}>
                Portlink Platform, Embark and Wheelhouse share one engineering foundation and serve each side of the port call.
              </p>
            </div>

            <div className={styles.productsStack}>
              {PRODUCTS_V4.map((prod) => (
                <article key={prod.name} className={`${styles.productRow} ${styles.revealItem}`} data-reveal="true">
                  <div>
                    <h3 className={styles.h3}>
                      <a href={prod.href} className={styles.productLink}>
                        {prod.name}
                      </a>
                    </h3>
                    <p className={styles.leadMist}>{prod.lead}</p>
                    <p className={styles.bodyMist}>{prod.detail}</p>
                  </div>
                  <CapturePictureV4 id={prod.captureId} mist />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Beat 7c: For ports and terminals (ONE_HARBOUR_PLAN_FABLE.md §G item 1) */}
        <section id="ports" className={styles.mistSection}>
          <div className={styles.container}>
            <div className={styles.portsGrid}>
              <div className={styles.revealItem} data-reveal="true">
                <h2 className={styles.h2}>For ports and terminals.</h2>
                <p className={styles.leadMist}>
                  Tell us what your port needs. We will show what Portlink already does for you.
                </p>
                <p className={styles.bodyMist}>
                  We connect with port and terminal workflows rather than competing with your port management system. Choose Port or terminal in the setup form below to start a conversation.
                </p>
              </div>
              <div className={`${styles.portsPanel} ${styles.revealItem}`} data-reveal="true">
                <h3 className={styles.h3}>DMC workspace in use with Vela Nordic.</h3>
                <p className={styles.bodyMist}>
                  Destination management teams coordinate shore excursion intake on the shared call record and connect with local boat and activity operators through Embark Trade API v1.
                </p>
                <div className={styles.actions}>
                  <a className={styles.btnMistPrimary} href="#session">
                    Get your free setup
                  </a>
                  <a className={styles.btnPrimary} href="/portlink+griegconnect/">
                    Port integration notes
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beat 8: Conversion CTA (ONE_HARBOUR_PLAN_FABLE.md §G item 11) */}
        <section id="session" className={styles.mistSectionAlt}>
          <div className={styles.container}>
            <div className={styles.sessionGrid}>
              <div className={styles.revealItem} data-reveal="true">
                <h2 className={styles.h2}>Try Portlink for 30 days.</h2>
                <p className={styles.leadMist}>
                  We set up your account for free. Try Portlink for 30 days. Contact us now.
                </p>
                <p className={styles.bodyMist}>
                  Whether you plan expedition itineraries, handle calls as a port agent, coordinate shore excursions as a DMC, run tour boats in Embark, or manage port operations, we configure your workspace around a real port call.
                </p>
              </div>
              <HarbourV4PilotForm />
            </div>
          </div>
        </section>
        <div id="product-consent" style={{ display: 'none' }} aria-hidden="true" />
      </main>
      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <p className={styles.footerBrand}>Portlink</p>
              <p className={styles.body}>
                The port call platform connecting cruise lines, port agents, DMCs, tour operators and vessels around one shared record.
              </p>
            </div>
            <nav aria-label="Products">
              <h2 className={styles.footerHeading}>Products</h2>
              <ul className={styles.footerList}>
                <li>
                  <Link href="/portlink/" className={styles.footerLink}>
                    Portlink Platform
                  </Link>
                </li>
                <li>
                  <Link href="/embark/" className={styles.footerLink}>
                    Embark
                  </Link>
                </li>
                <li>
                  <Link href="/portlink+griegconnect/" className={styles.footerLink}>
                    Ports &amp; terminals
                  </Link>
                </li>
              </ul>
            </nav>
            <nav aria-label="Company">
              <h2 className={styles.footerHeading}>Company</h2>
              <ul className={styles.footerList}>
                <li>
                  <Link href="/team/" className={styles.footerLink}>
                    Team
                  </Link>
                </li>
                <li>
                  <Link href="/contact/" className={styles.footerLink}>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy/" className={styles.footerLink}>
                    Privacy
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className={styles.footerLegal}>
            <span>Portlink AS · Oslo, Norway</span>
            <span>One Harbour v4</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
