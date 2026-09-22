import styles from './havn.module.css'

/**
 * Module for module: what Grieg Connect's platform does, as griegconnect.com describes it on
 * 22.09.2026, against what Portlink does on the other side of the quay. Three honest answers per
 * row: what we connect to, what we already do ourselves, and what we will never build. The last
 * column is written so a port operator can disagree with it, which is the point of the page.
 *
 * ⛔ THE MIDDLE COLUMN IS THEIR DESCRIPTION, NOT OURS. Every phrase there is taken from
 * griegconnect.com/port and its module pages. Do not add a capability to a Grieg Connect module
 * that their own site does not name.
 */
const ROWS: { module: string; theirs: string; ours: string; kind: 'bro' | 'vaart' | 'aldri' }[] = [
  {
    module: 'Port',
    theirs: 'Anløpet fra planlegging til faktura: kaiplan, tjenester, last, statistikk.',
    ours: 'Det delte anløpet for rederi, agent og turoperatør. Kaiforespørsel, ETA og klarhet er det vi ville sendt over.',
    kind: 'bro',
  },
  {
    module: 'Port Community',
    theirs: 'Webportal der agenter og terminaler ber om kai, bestiller tjenester og chatter med havna.',
    ours: 'Samme handling, men fra agentens eget arbeidsbord, med rederiets seilingsplan og DMC-en i samme anløp.',
    kind: 'bro',
  },
  {
    module: 'Port GO',
    theirs: 'Mobilapp for kaifolk: arbeidsordre, tjenester, ressursplan.',
    ours: 'Arbeidet på kaia er havnas.',
    kind: 'aldri',
  },
  {
    module: 'Port Security',
    theirs: 'ISPS, adgang, selvbetjente adgangsforespørsler.',
    ours: 'ISPS-nivå og klarering er punkter i vår klarhetsliste. Statusen ville kommet fra dere.',
    kind: 'bro',
  },
  {
    module: 'Port GIS',
    theirs: 'Kartbasert oversikt over havnas eiendeler og aktivitet.',
    ours: 'Vi tegner vårt eget sjøkart for seilingsplanen. Havnas eiendeler hører hjemme hos dere.',
    kind: 'vaart',
  },
  {
    module: 'Port Resource Planning',
    theirs: 'Personell og maskiner koblet til arbeidsordre.',
    ours: 'Havnas egen bemanning og maskinpark.',
    kind: 'aldri',
  },
  {
    module: 'Port BI',
    theirs: 'Dashbord og analyse av havnedriften.',
    ours: 'Rapporter på anløps- og seilingsnivå for rederi og agent. Ikke havnas tall.',
    kind: 'vaart',
  },
  {
    module: 'Port API',
    theirs: 'Sanntidsdata til ERP, BI og nasjonal rapportering.',
    ours: 'Der en integrasjon ville gått. Spørsmål 20 handler om dette.',
    kind: 'bro',
  },
]

const KIND: Record<typeof ROWS[number]['kind'], string> = {
  bro: 'Kobling',
  vaart: 'Vår side',
  aldri: 'Bygger vi ikke',
}

export default function Modulkart() {
  return (
    <section id="moduler" className={styles.moduler} aria-labelledby="moduler-title">
      <div className={styles.modulerInner}>
        <div className={styles.modulerHeading}>
          <span className={styles.eyebrow}>Modul for modul</span>
          <h2 id="moduler-title">Hva Grieg Connect gjør, og hva vi gjør ved siden av.</h2>
          <p>Den midterste kolonnen er Grieg Connects egen beskrivelse fra griegconnect.com. Den siste er vår. Rett oss gjerne.</p>
        </div>
        <div className={styles.modulerTableWrap}>
          <table className={styles.modulerTable}>
            <thead>
              <tr>
                <th scope="col">Grieg Connect</th>
                <th scope="col">Slik de beskriver det</th>
                <th scope="col">Portlink</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.module}>
                  <th scope="row">{r.module}</th>
                  <td>{r.theirs}</td>
                  <td>
                    <span className={styles.kind} data-kind={r.kind}>{KIND[r.kind]}</span>
                    {r.ours}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
