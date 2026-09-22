import { ArrowDown, ArrowUpRight } from 'lucide-react'
import styles from './havn.module.css'

/**
 * The opening, in the homepage's own composition (components/film/FilmHero.tsx): an eyebrow row
 * on a hairline, the statement left and the argument right, a mono lead line. Same grid, same
 * scale, so this page reads as a page of portlink.app and not a form someone attached to it.
 *
 * No film here (Kris, 22.09.2026): the page goes straight from the statement into the diagram,
 * and the product evidence, including their own harbour on our chart, sits in the story below.
 * No numbers, no customer names, no claim about Grieg Connect we did not read on griegconnect.com.
 */
export default function HavnHero() {
  return (
    <section className={styles.hero} aria-labelledby="havn-title">
      <div className={styles.heroIntro}>
        <div className={styles.heroEyebrow}>
          <span className="section-eyebrow">Til dere som bruker Grieg Connect hver dag</span>
          <span>Portlink × Grieg Connect</span>
        </div>
        <div className={styles.heroGrid}>
          <h1 id="havn-title">Havna har Grieg Connect.<br />Resten av anløpet har <span style={{ whiteSpace: 'nowrap' }}>e-post</span>.</h1>
          <div className={styles.heroAside}>
            <p>Grieg Connect er havnas system, og det skal det være.</p>
            <p>
              Portlink er det som skjer på den andre siden av kaia: rederiet, agenten, cruiselinjen og
              turoperatøren som i dag koordinerer det samme anløpet i innboksen og på telefon. Vi vil at
              de to systemene skal snakke sammen. Før vi bygger den koblingen vil vi forstå hverdagen
              fra havnas side.
            </p>
            <div className={styles.heroActions}>
              <a href="#sporsmal" className={styles.heroPrimary}>Svar på spørsmålene <ArrowUpRight size={17} aria-hidden="true" /></a>
              <a href="#sammen" className={styles.heroSecondary}>Se hvordan vi ser det for oss <ArrowDown size={16} aria-hidden="true" /></a>
            </div>
          </div>
        </div>
        <div className={styles.heroLead}>
          <span>23 spørsmål. Svarene lagres underveis og sendes til oss med én knapp.</span>
          <span>Slik ser vi det for oss <ArrowDown size={13} aria-hidden="true" /></span>
        </div>
      </div>
    </section>
  )
}
