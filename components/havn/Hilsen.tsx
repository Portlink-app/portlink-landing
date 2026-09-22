import { founders } from '@/components/sections/team-members'
import styles from './havn.module.css'

/**
 * The two people behind the page, with the photos the team page already uses. Names, roles and
 * the one-line summaries come from components/sections/team-members.ts, the single fact set for
 * the team on this site, so nothing here can contradict /team. The greeting itself is the only
 * copy that is new, and it says only what is true: we met at Seatrade, we read what you send.
 */
export default function Hilsen() {
  return (
    <section className={styles.hilsen} aria-labelledby="hilsen-title">
      <div className={styles.hilsenInner}>
        <div className={styles.hilsenCopy}>
          <span className={styles.eyebrow}>Fra oss to</span>
          <h2 id="hilsen-title">Takk for at dere tar dere tid.</h2>
          <p>
            Denne siden er oppfølgingen etter Seatrade. Svarene går rett til oss to og er med på å
            bestemme hva vi bygger videre. Vi setter stor pris på at dere deler erfaringene deres.
          </p>
          <p className={styles.hilsenSign}>Kris og David, Portlink</p>
        </div>
        <ul className={styles.founders}>
          {founders.map((f) => (
            <li key={f.name}>
              <img src={f.photo} alt={f.name} width={88} height={88} loading="lazy" />
              <strong>{f.name}</strong>
              <span>{f.name.startsWith('Kris') ? 'Ti år i cruiserederi med anløp, seilingsplaner og nautisk planlegging, de siste årene i ledelsen for deployment og havneoperasjoner.' : 'Seksten år med digitale tjenester hos Volkswagen Møller Bilfinans, Telenor og Nortura.'}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
