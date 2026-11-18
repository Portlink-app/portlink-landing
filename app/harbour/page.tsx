import type { Metadata } from 'next'
import PageNav from '@/components/PageNav'
import MotionProvider from '@/components/MotionProvider'
import ContactForm from '@/components/contact/ContactForm'
import Footer from '@/components/sections/Footer'
import HarbourStage from '@/components/harbour/HarbourStage'
import { PRODUCTS, SHOTS } from '@/components/harbour/script'
import styles from '@/components/harbour/harbour.module.css'
import '@/components/harbour/harbour-tokens.css'

const title = 'One Harbour · Portlink'

/* Unlisted until the founders decide where it lives (DIRECTION.md Q7): noindex, and absent from
   sitemap.ts. No openGraph: a page nobody should share needs no card. */
export const metadata: Metadata = {
  title,
  robots: { index: false, follow: false },
}

const stills = SHOTS.filter((s) => s.staged && s.heading)
const products = SHOTS.find((s) => s.id === 'S13')
const session = SHOTS.find((s) => s.id === 'S14')

/**
 * The reduced-motion stills page, and the server markup (DIRECTION.md section 2, rule 4): every
 * stop is a normal section with its heading and the copy lines of section 4. The film is only its
 * camera: HarbourStage swaps these sections for the sticky stage once motion is answered yes.
 *
 * ⛔ TEXT ONLY WHERE NO CAPTURE EXISTS. The real captures (P1 to P12) are WP3. Until they land,
 * nothing here draws mock UI, a placeholder image or a picsum URL. A stop without a real capture
 * is removed, never mocked.
 */
export default function HarbourPage() {
  return (
    <>
      <PageNav />
      <main id="main" tabIndex={-1} data-surface="harbour">
        <HarbourStage>
          {stills.map((s) => (
            <section key={s.id} id={`harbour-${s.id.toLowerCase()}`} className={styles.still}>
              <div className={styles.stillInner}>
                <p className={styles.role}>{s.role}</p>
                {s.id === 'S0' ? <h1 className={styles.h1}>{s.heading}</h1> : <h2 className={styles.h2}>{s.heading}</h2>}
                {s.line ? <p className={styles.line}>{s.line}</p> : null}
                {s.id === 'S0' ? (
                  <div className={styles.actions}>
                    <a className={styles.btn} href={`#harbour-${stills[1].id.toLowerCase()}`}>
                      Follow the call
                    </a>
                    <a className={styles.btnGhost} href="#session">
                      Book a working session
                    </a>
                  </div>
                ) : null}
              </div>
            </section>
          ))}
        </HarbourStage>

        <section id="harbour-s13" className={styles.still}>
          <div className={styles.stillInner}>
            <h2 className={styles.h2}>{products?.heading}</h2>
            <div className={styles.products}>
              {PRODUCTS.map((p) => (
                <div key={p.name}>
                  <h3 className={styles.productName}>
                    <a href={p.href}>{p.name}</a>
                  </h3>
                  <p className={styles.line}>{p.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="session" className={styles.still}>
          <div className={styles.sessionGrid}>
            <div>
              <h2 className={styles.h2}>{session?.heading}</h2>
              <p className={styles.line}>{session?.line}</p>
            </div>
            <MotionProvider>
              <ContactForm intent="pilot" />
            </MotionProvider>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
