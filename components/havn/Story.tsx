'use client'

import { useEffect, useRef, useState } from 'react'
import { useReveal } from '@/hooks/useReveal'
import styles from './havn.module.css'

/**
 * Real product evidence, one screen per chapter. On a wide screen the text scrolls past a
 * sticky frame that swaps to the active chapter (the Aceternity sticky-scroll shape, rebuilt on
 * the DS rather than imported with its Tailwind skin). On a phone each chapter is text over its
 * own frame, in order, because sticky panels fight the scroll on small screens.
 *
 * Every image is a screenshot of the running application. Nothing here is drawn to look like one.
 */
const CHAPTERS = [
  {
    id: 'anlop',
    label: 'Anløpet',
    title: 'Ett anløp, alle roller.',
    body: 'Rederi, agent, DMC og skip arbeider på det samme anløpet. Status, hvem som har neste steg, hva som er endret og hva som gjenstår ligger på anløpet, ikke i en e-posttråd.',
    detail: 'Her ville en bekreftelse fra havna landet.',
    src: '/havn/app-portcall.jpg',
    alt: 'Portlink: et anløp med status, roller, klarhet og endringer',
  },
  {
    id: 'kostnad',
    label: 'Kostnadene',
    title: 'En PDA som kan møte fakturaen.',
    body: 'Agentens kostnadsestimater ligger på anløpet: venter på godkjenning, forfalt, gjort opp. Bak hver PDA er linjer med kode og synlighet per rolle, ikke et vedlegg. Havnas tjenester kunne vært de samme linjene.',
    detail: 'Spørsmål 11 handler om akkurat dette.',
    src: '/havn/app-pda.jpg',
    alt: 'Portlink: kostnadsestimat for et anløp, linje for linje',
  },
  {
    id: 'plan',
    label: 'Seilingsplanen',
    title: 'Hele flåten på ett brett.',
    body: 'Hvert skip, hver dag, hver kai, side om side. To anløp som vil ha samme kai samtidig markeres i planen, ikke oppdages på kaia.',
    detail: 'Havnas kaiplan er den andre halvdelen av det bildet.',
    src: '/havn/app-voyage.jpg',
    alt: 'Portlink: seilingsplan med anløp og markert kaikonflikt',
  },
  {
    id: 'kart',
    label: 'Kartet',
    title: 'Kristiansund havn på vårt eget sjøkart.',
    body: 'Kristiansund tegnet på Portlinks eget sjøkart: Storkaia, Vågakaia og hurtigbåtterminalen, med dybder, sektorlys og leder fra Kystverket. Ingen leverandørkart, ingen vannmerker.',
    detail: 'Kartet er vårt eget og ligger under hele plattformen. Havna trenger ikke et nytt kart, men rederiet og agenten planlegger anløpet på det.',
    src: '/havn/kristiansund-chart.jpg',
    alt: 'Kristiansund havn på Portlinks eget sjøkart, med Storkaia, Vågakaia, sektorlys og dybder',
  },
]

const PORT_SHOTS = [
  { src: '/havn/port-quay-timeline.png', alt: 'Grieg Connect: grafisk kaiplan', caption: 'Kaiplanen i Grieg Connect' },
  { src: '/havn/port-calls-list.png', alt: 'Grieg Connect: anløpslisten', caption: 'Anløpslisten i Grieg Connect' },
]

export default function Story() {
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const reveal = useReveal(0.01)

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (!visible) return
        const idx = refs.current.indexOf(visible.target as HTMLDivElement)
        if (idx >= 0) setActive(idx)
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] },
    )
    refs.current.forEach((el) => el && io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <section id="bevis" className={styles.story} aria-labelledby="bevis-title" ref={reveal}>
      <div className={styles.storyInner}>
        <div className={styles.storyHeading}>
          <span className={styles.eyebrow}>Vår side av kaia, som den er i dag</span>
          <h2 id="bevis-title">Ikke en skisse. Ekte skjermbilder fra plattformen.</h2>
        </div>

        <div className={styles.storyGrid}>
          <div className={styles.storyText}>
            {CHAPTERS.map((c, i) => (
              <div
                key={c.id}
                ref={(el) => { refs.current[i] = el }}
                className={styles.chapter}
                data-active={active === i}
              >
                <span className={styles.chapterLabel}>{String(i + 1).padStart(2, '0')} · {c.label}</span>
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <p className={styles.chapterDetail}>{c.detail}</p>
                <figure className={styles.chapterFigure}>
                  <img src={c.src} alt={c.alt} loading="lazy" />
                </figure>
              </div>
            ))}
          </div>
          <div className={styles.storySticky} aria-hidden="true">
            <div className={styles.frame}>
              {CHAPTERS.map((c, i) => (
                <img key={c.id} src={c.src} alt="" data-active={active === i} loading={i === 0 ? 'eager' : 'lazy'} />
              ))}
            </div>
          </div>
        </div>

        <div className={styles.portSide}>
          <div className={styles.portSideHeading}>
            <span className={styles.eyebrow}>Deres side av kaia</span>
            <h3>Dette bygger vi ikke.</h3>
            <p>Grieg Connect gjør dette allerede, i mer enn 85 nordiske havner. Vi vil koble oss på det, ikke konkurrere med det.</p>
          </div>
          <div className={styles.portShots}>
            {PORT_SHOTS.map((s) => (
              <figure key={s.src} className="reveal">
                <img src={s.src} alt={s.alt} loading="lazy" />
                <figcaption>{s.caption} <span>griegconnect.com</span></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
