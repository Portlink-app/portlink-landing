import Link from 'next/link'
import styles from './havn.module.css'

/**
 * The page frame for portlink.app/portlink+griegconnect. Server component, tokens only.
 * Two marks in the header on purpose: ours, and Grieg Connect's, because the page is about how
 * the two systems live side by side. The footer carries the trademark line that makes that
 * pairing honest: we are not affiliated with Grieg Connect, and the page says so.
 */
export default function HavnShell({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell} lang="nb">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" aria-label="Portlink" className={styles.brand}>
            <img src="/portlink-logo.png" alt="Portlink" className="logo-img" width={107} height={28} />
          </Link>
          <span className={styles.headerX} aria-hidden="true">×</span>
          <span className={styles.brandPort}>
            <img src="/havn/grieg-connect.png" alt="" width={22} height={22} />
            <span>Grieg Connect</span>
          </span>
          <a href="#sporsmal" className={styles.headerCta}>Til spørsmålene</a>
        </div>
      </header>
      <main id="main" tabIndex={-1}>{children}</main>
      <footer className={styles.footer}>
        <p>
          © {new Date().getFullYear()} Portlink AS, Oslo. <Link href="/">portlink.app</Link>
        </p>
        <p>
          Grieg Connect, Port, Port Community og Port GO er varemerker som tilhører Grieg Connect AS.
          Portlink er ikke tilknyttet Grieg Connect. Skjermbildene fra Grieg Connect er hentet fra
          griegconnect.com og vises kun for å forklare hvordan vi ser for oss at de to systemene kan
          leve sammen.
        </p>
      </footer>
    </div>
  )
}
