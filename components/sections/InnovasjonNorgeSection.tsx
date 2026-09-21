'use client'

import Link from 'next/link'
import { useReveal } from '@/hooks/useReveal'

/* The page Innovasjon Norge is pointed at from the Oppstartstilskudd 1 application.
 *
 * The portal field it answers asks, verbatim: "Last opp dokumenter som viser det unike ved
 * løsningen. Det kan være skisser, konkurranseanalyse eller mer informasjon om løsningen." So the
 * three blocks below are not marketing sections, they are that field's three named answers, in
 * that order: what is unique, the competitor comparison, and more about the solution.
 *
 * ⛔ EVERY CLAIM HERE MUST MATCH THE SUBMITTED APPLICATION WORD FOR WORD IN SUBSTANCE. A caseworker
 * reads both. Specifically: no industry contact is ever a customer, an active pilot or a committed
 * buyer; the prototype is self-financed and not a commercially launched service; market acceptance
 * is "nei" and is what the project is meant to document. If the application changes, this page
 * changes in the same pass.
 *
 * Norwegian, on an otherwise English site, on purpose: the reader is a Norwegian public body and
 * the application, the budget and the næringsfaglige vurdering are all Norwegian.
 */

const unique = [
  {
    title: 'Ett nøytralt lag mellom tre selskaper',
    body:
      'Dagens verktøy er avgrenset til én organisasjon eller én arbeidsflyt. Portlink er et felles lag mellom rederi, havneagent og destinasjonsselskap, der hver part beholder sine egne roller og tilganger, men arbeider mot den samme anløpsposten.',
  },
  {
    title: 'Kommersielle anløpsdata, ikke bare fartøysbevegelser',
    body:
      'Bransjestandarden for port call-data beskriver skipets bevegelser. Portlink dekker laget over: oppgaver, dokumenter, kostnader, aktiviteter på land og avvik, altså det partene faktisk krangler om i dagene før et anløp.',
  },
  {
    title: 'Sporbar kilde for hver opplysning',
    body:
      'Felt og kildeformater oversettes til én anløpspost uten å skjule hvor opplysningen kom fra. Det er forskjellen på et felles bilde og et felles bilde du tør å stole på når to parter er uenige.',
  },
  {
    title: 'Assistert innlesing med mennesket i beslutningen',
    body:
      'E-post, regneark og dokumenter skal kunne leses inn maskinelt, men foreslåtte verdier må bekreftes av et menneske før de gjelder. Prosjektet skal avklare nettopp hvor den grensen skal gå.',
  },
]

const alternatives = [
  {
    name: 'E-post og Excel',
    today: 'Det praktiske integrasjonslaget i dag',
    gap: 'Ingen sporbarhet, ingen felles versjon, ingen varsling når noe mangler eller kolliderer',
  },
  {
    name: 'MXP / MXP365',
    today: 'Bredt maritimt forretningssystem',
    gap: 'Organisasjonsinternt. Løser ikke koordineringen mellom tre uavhengige selskaper om samme anløp',
  },
  {
    name: 'ShorexFlow, Tap2Tour',
    today: 'Landprogram og utflukter',
    gap: 'Dekker én del av anløpet, ikke planer, dokumenter, kostnader og avvik samlet',
  },
  {
    name: 'Rederi- og leverandørportaler',
    today: 'Én aktørs eget vindu inn',
    gap: 'Hver motpart må lære et nytt system per kunde. Ingen nøytral part eier helheten',
  },
  {
    name: 'DCSA port call-standard',
    today: 'Standard for fartøysbevegelser',
    gap: 'Et annet lag enn kommersiell koordinering. Komplementær, ikke konkurrent',
  },
]

const clarify = [
  'En kommersiell datamodell som oversetter felt og kildeformater til én anløpspost uten å skjule kilden.',
  'Assistert innlesing av e-post, regneark og dokumenter, der foreslåtte verdier bekreftes av et menneske.',
  'Regler for å oppdage manglende, motstridende eller for sen informasjon.',
  'Integrasjonsbehov, kundeseparasjon, tilgangsstyring, revisjonslogg, personvern og informasjonssikkerhet.',
]

const status = [
  ['Selskap', 'Portlink AS, org.nr. 937 347 553, stiftet 16.02.2026'],
  ['Eiere', 'Bakke & Co AS, Keelstone AS og Handberg Holding ApS med en tredjedel hver'],
  ['Kundeinntekter', 'Ingen'],
  ['Offentlig tilskudd', 'Ingen mottatt'],
  ['Markedsaksept', 'Ikke dokumentert. Ingen betaling, signert pilotavtale, intensjonsavtale eller operativ kundebruk'],
  [
    'Modenhet',
    'BRL 3 og TRL 3. Konseptbevis foreligger som en egenfinansiert prototype. Teknologien er ikke systematisk validert, ikke testet under simulerte eller reelle driftsbetingelser, og ikke kommersielt lansert',
  ],
  ['Grunnlag så langt', 'Fem kvalitative intervjuer på tvers av fire roller, og tidlig tilbakemelding på prototypen'],
]

const wrap: React.CSSProperties = { maxWidth: '900px', margin: '0 auto', padding: '0 24px' }
const h2: React.CSSProperties = {
  fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
  fontWeight: 600,
  letterSpacing: '-0.02em',
  marginBottom: '16px',
}
const lead: React.CSSProperties = { fontSize: '17px', lineHeight: 1.7, color: 'var(--text-muted)' }

export default function InnovasjonNorgeSection() {
  const sectionRef = useReveal()

  return (
    <section ref={sectionRef} style={{ padding: 'clamp(56px, 8vw, 96px) 0' }}>
      <div style={wrap}>
        <p
          className="reveal"
          style={{
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--brand)',
            marginBottom: '12px',
          }}
        >
          Til Innovasjon Norge
        </p>
        <h1
          className="reveal"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.25rem)',
            fontWeight: 600,
            letterSpacing: '-0.03em',
            lineHeight: 1.1,
            marginBottom: '20px',
          }}
        >
          Det unike ved løsningen
        </h1>
        <p className="reveal" style={{ ...lead, fontSize: '19px' }}>
          Denne siden hører til Portlink AS sin søknad om Oppstartstilskudd 1. Den svarer på feltet
          om hva som er unikt ved løsningen, med konkurranseanalysen og mer informasjon om
          løsningen samlet ett sted. Forsiden på{' '}
          <Link href="/" style={{ color: 'var(--brand)' }}>
            portlink.app
          </Link>{' '}
          viser produktet slik bransjen møter det.
        </p>

        <div
          className="reveal"
          style={{
            marginTop: '28px',
            padding: '18px 20px',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            background: 'var(--color-surface-sunken, transparent)',
            fontSize: '15px',
            lineHeight: 1.65,
            color: 'var(--text-muted)',
          }}
        >
          <strong style={{ color: 'var(--text-primary)' }}>Kort om problemet.</strong> Rederi,
          havneagent og destinasjonsselskap er avhengige av de samme datoene, driftsopplysningene,
          dokumentene og kostnadene, men arbeider i ulike selskaper og systemer. Intervjuene våre
          viser gjentatt dobbeltregistrering, svak sporbarhet, tapt kontekst mellom sesonger og sen
          oppdagelse av operative konflikter. E-post og regneark blir det praktiske
          integrasjonslaget, og resultatet er unødvendig arbeid, motstridende versjoner og kortere
          tid til å rette feil før ankomst.
        </div>
      </div>

      <div style={{ ...wrap, marginTop: 'clamp(48px, 7vw, 80px)' }}>
        <h2 className="reveal" style={h2}>
          1. Hva som er nytt
        </h2>
        <p className="reveal" style={{ ...lead, marginBottom: '28px' }}>
          Nyhetsverdien er ikke at maritim programvare mangler. Den er at ingen av dagens verktøy er
          et nøytralt, cruisespesifikt kommersielt samhandlingslag mellom de tre partene som må bli
          enige om det samme anløpet. Kombinasjonen under er det prosjektet skal teste om gir
          målbar verdi.
        </p>
        <div style={{ display: 'grid', gap: '16px' }}>
          {unique.map((item) => (
            <div
              key={item.title}
              className="reveal"
              style={{
                padding: '20px 22px',
                border: '1px solid var(--border)',
                borderRadius: '12px',
              }}
            >
              <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '8px' }}>{item.title}</div>
              <p style={{ fontSize: '15px', lineHeight: 1.65, color: 'var(--text-muted)', margin: 0 }}>
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...wrap, marginTop: 'clamp(48px, 7vw, 80px)' }}>
        <h2 className="reveal" style={h2}>
          2. Konkurranseanalyse
        </h2>
        <p className="reveal" style={{ ...lead, marginBottom: '28px' }}>
          De reelle alternativene, og hvor hvert av dem stopper. Prosjektet skal sammenligne
          Portlink mot disse på arbeidsflyt, integrasjon, sporbarhet, sikkerhet, innføringstid og
          pris.
        </p>
        <div style={{ display: 'grid', gap: '12px' }}>
          {alternatives.map((row) => (
            <div
              key={row.name}
              className="reveal"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.4fr)',
                gap: '16px',
                padding: '16px 18px',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px',
                lineHeight: 1.6,
              }}
            >
              <div style={{ fontWeight: 600 }}>{row.name}</div>
              <div style={{ color: 'var(--text-muted)' }}>{row.today}</div>
              <div style={{ color: 'var(--text-muted)' }}>{row.gap}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...wrap, marginTop: 'clamp(48px, 7vw, 80px)' }}>
        <h2 className="reveal" style={h2}>
          3. Mer om løsningen
        </h2>
        <p className="reveal" style={{ ...lead, marginBottom: '20px' }}>
          Den egenfinansierte prototypen samler seilinger, anløp, oppgaver, dokumenter, kostnader,
          aktiviteter på land og avvik i én sporbar arbeidsflyt, og gjør konseptet konkret. Den er
          testgrunnlag, ikke en ferdig tjeneste. Oppstartstilskudd 1 skal ikke finansiere ordinær
          plattformutvikling. Det skal avklare fire sammenhengende områder før en senere, avgrenset
          pilot:
        </p>
        <ol
          className="reveal"
          style={{ fontSize: '15px', lineHeight: 1.8, color: 'var(--text-muted)', paddingLeft: '20px' }}
        >
          {clarify.map((item) => (
            <li key={item} style={{ marginBottom: '6px' }}>
              {item}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ ...wrap, marginTop: 'clamp(48px, 7vw, 80px)' }}>
        <h2 className="reveal" style={h2}>
          Status i klartekst
        </h2>
        <p className="reveal" style={{ ...lead, marginBottom: '24px' }}>
          Vi overdriver ikke modenheten. Dette er hvor selskapet faktisk står i dag.
        </p>
        <dl className="reveal" style={{ display: 'grid', gap: '2px', margin: 0 }}>
          {status.map(([term, value]) => (
            <div
              key={term}
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 0.55fr) minmax(0, 1.45fr)',
                gap: '16px',
                padding: '14px 0',
                borderBottom: '1px solid var(--border)',
                fontSize: '15px',
                lineHeight: 1.6,
              }}
            >
              <dt style={{ fontWeight: 600 }}>{term}</dt>
              <dd style={{ margin: 0, color: 'var(--text-muted)' }}>{value}</dd>
            </div>
          ))}
        </dl>
        <p
          className="reveal"
          style={{ ...lead, fontSize: '15px', marginTop: '24px' }}
        >
          Bransjekontakter omtales konsekvent som potensielle pilotorganisasjoner, aldri som kunder,
          aktive piloter eller forpliktede kjøpere. Handberg Holding ApS er ekstern investor og
          rådgiver.
        </p>
      </div>

      <div style={{ ...wrap, marginTop: 'clamp(48px, 7vw, 80px)' }}>
        <div
          className="reveal"
          style={{
            padding: '28px',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '16px',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
              Vil dere se produktet og folkene bak?
            </div>
            <p style={{ ...lead, fontSize: '15px', margin: 0 }}>
              Forsiden viser arbeidsflyten. Teamsiden viser gründerne og rådgiverne.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                background: 'var(--brand)',
                color: 'var(--ds-primary-ink)',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Se forsiden
            </Link>
            <Link
              href="/team/"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Teamet
            </Link>
            <Link
              href="/contact/"
              style={{
                border: '1px solid var(--border)',
                color: 'var(--text-primary)',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Kontakt
            </Link>
          </div>
        </div>
        <p
          className="reveal"
          style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '20px' }}
        >
          Portlink AS, org.nr. 937 347 553, Schweigaards gate 15, 0191 Oslo. Siden gjelder søknad om
          Oppstartstilskudd 1 og er sist oppdatert 21.09.2026. Innholdet finnes også som vedlegget
          «Det unike ved løsningen», levert i søknadsportalen.
        </p>
      </div>
    </section>
  )
}
