'use client'

import { useRef } from 'react'
import { useReveal } from '@/hooks/useReveal'
import { Anchor, Compass, Ship } from 'lucide-react'
import AnimatedBeam from './AnimatedBeam'
import styles from './havn.module.css'

/**
 * Two systems, one port call. The diagram is the site's own language (EcosystemSection: navy
 * ground, hairline nodes, a record in the middle) with the beam adapted from MagicUI, because
 * the point of this page is direction of travel: who sends what to whom, and where it lands.
 *
 * Left: the three parties Portlink already serves. Middle: the shared call. Right: Port, the
 * port's own system. Every handshake below is a proposal, and the copy says so. Nothing here
 * claims an integration that exists.
 */
const HANDSHAKES = [
  {
    title: 'Kaiforespørsel og bekreftelse',
    body: 'Agenten ber om kai i Portlink. Havna svarer i Grieg Connect, slik den gjør i dag. Svaret lander i det delte anløpet, så rederiet og DMC-en ser det samme øyeblikk.',
  },
  {
    title: 'ETA begge veier',
    body: 'En ny ETA hos rederiet når havna før noen må ringe. En endring i kaiplanen når agenten og bussene like fort.',
  },
  {
    title: 'Tjenester og fakturagrunnlag',
    body: 'Los, taubåt, vann og avfall bestilles én gang. De samme tallene ligger i agentens PDA og i havnas faktura, så fakturaen ikke må bestrides i etterkant.',
  },
  {
    title: 'Klar før ankomst',
    body: 'ISPS-nivå, avfallsmelding og mannskapsliste samlet ett sted, så havna ser hva som mangler dagen før, ikke den morgenen skipet kommer.',
  },
]

export default function Coexist() {
  const container = useRef<HTMLDivElement>(null)
  const cruise = useRef<HTMLDivElement>(null)
  const agent = useRef<HTMLDivElement>(null)
  const dmc = useRef<HTMLDivElement>(null)
  const hub = useRef<HTMLDivElement>(null)
  const port = useRef<HTMLDivElement>(null)
  // Threshold near zero: on a phone this section is several screens tall, and the hook's default
  // 8 % of a 3000 px section is 240 px of it on screen before anything appears.
  const reveal = useReveal(0.01)

  return (
    <section id="sammen" className={styles.coexist} aria-labelledby="sammen-title" ref={reveal}>
      <div className={styles.coexistInner}>
        <div className={styles.coexistHeading}>
          <div>
            <span className={styles.eyebrowInverted}>Slik ser vi det for oss</span>
            <h2 id="sammen-title">To systemer.<br />Ett anløp.</h2>
          </div>
          <p>
            Grieg Connect eier kaiplanen, fakturaen, ISPS og meldingen til SafeSeaNet. Portlink eier det
            delte anløpet mellom rederi, agent og turoperatør. I dag møtes de to i en e-post. Vi tror
            de bør møtes i en integrasjon.
          </p>
        </div>

        <div className={styles.diagram} ref={container}>
          <div className={styles.diagramGrid} aria-hidden="true" />

          <div className={styles.parties}>
            <div className={styles.node} ref={cruise}>
              <Ship size={20} strokeWidth={1.5} aria-hidden="true" />
              <strong>Cruiselinje / rederi</strong>
              <span>Seilingsplan, ETA, ønsket kai</span>
            </div>
            <div className={styles.node} ref={agent}>
              <Anchor size={20} strokeWidth={1.5} aria-hidden="true" />
              <strong>Havneagent</strong>
              <span>Kaiforespørsel, tjenester, PDA</span>
            </div>
            <div className={styles.node} ref={dmc}>
              <Compass size={20} strokeWidth={1.5} aria-hidden="true" />
              <strong>DMC / turoperatør</strong>
              <span>Busser, guider, passasjertall</span>
            </div>
          </div>

          <div className={styles.hub} ref={hub}>
            <img src="/portlink-logo.png" alt="Portlink" width={96} height={25} className={styles.hubLogo} />
            <strong>Ett delt anløp</strong>
            <span className={styles.hubCaption}>Samme record for alle roller</span>
            <dl>
              <div><dt>ETA</dt><dd>Én verdi, synlig for alle</dd></div>
              <div><dt>Kai</dt><dd>Forespurt, bekreftet, endret</dd></div>
              <div><dt>Klar</dt><dd>Hva som mangler før ankomst</dd></div>
              <div><dt>PDA</dt><dd>Kostnadene, linje for linje</dd></div>
            </dl>
          </div>

          <div className={`${styles.node} ${styles.portNode}`} ref={port}>
            <img src="/havn/grieg-connect.png" alt="" width={28} height={28} />
            <strong>Grieg Connect</strong>
            <span>Havnas eget system</span>
            <ul>
              <li>Kaiplan og liggetid</li>
              <li>Tjenester og arbeidsordre</li>
              <li>ISPS og adgang</li>
              <li>Faktura via Visma</li>
              <li>SafeSeaNet</li>
            </ul>
          </div>

          <AnimatedBeam containerRef={container} fromRef={cruise} toRef={hub} duration={3.2} delay={0} />
          <AnimatedBeam containerRef={container} fromRef={agent} toRef={hub} duration={3.2} delay={1.1} />
          <AnimatedBeam containerRef={container} fromRef={dmc} toRef={hub} duration={3.2} delay={2.2} />
          <AnimatedBeam containerRef={container} fromRef={hub} toRef={port} duration={3.2} delay={0.6} offset={-10} />
          <AnimatedBeam containerRef={container} fromRef={hub} toRef={port} duration={3.2} delay={2.4} reverse offset={10} />
        </div>

        <p className={styles.diagramLegend}><strong>Linjene er et forslag.</strong> Ingen av dem er bygget ennå. Det er derfor vi spør.</p>

        <div className={styles.handshakes}>
          {HANDSHAKES.map((h, i) => (
            <div key={h.title} className={`${styles.handshake} reveal`}>
              <span className={styles.handshakeNumber}>{String(i + 1).padStart(2, '0')}</span>
              <h3>{h.title}</h3>
              <p>{h.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
