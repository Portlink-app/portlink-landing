/**
 * The interview questions on portlink.app/portlink+griegconnect, in one place.
 *
 * Read by the form (components/havn/Sporsmal.tsx) and by the mail route (app/api/havn/route.ts),
 * so the email that lands in the inbox carries the same numbering and wording the respondent saw.
 * Norwegian on purpose: the respondents are Norwegian port operators who use Grieg Connect's port system
 * every day. Nothing here is translated for the rest of the site.
 *
 * Groups carry the order. The first five are the ones to answer if time runs out; the form says so.
 */

export interface Question {
  /** Stable key, also the form field id and the JSON key on the wire. Never renumber a shipped key. */
  id: string
  /** The question itself, one sentence. */
  text: string
  /** Optional second line: the concrete things to think about. */
  hint?: string
}

export interface QuestionGroup {
  title: string
  /** Shown as a small pill next to the group title. */
  badge?: string
  questions: Question[]
}

export const GROUPS: readonly QuestionGroup[] = [
  {
    title: 'De fem viktigste',
    badge: 'Start her',
    questions: [
      {
        id: 'q1',
        text: 'Når en agent eller et rederi vil ha kai: hvordan går det fra forespørsel til «bekreftet»?',
        hint: 'Hvem bestemmer, hva er den offisielle bekreftelsen (e-post, Port Community-portalen, telefon), og hvor ofte ender det i muntlige avtaler utenom systemet?',
      },
      {
        id: 'q2',
        text: 'Hva må være på plass før dere regner et anløp som «klart»?',
        hint: 'Tenk ISPS-nivå, avfallsmelding, los, taubåt, landstrøm, vann, gangvei, tollklarering, mannskapsliste. Hvilke glipper oftest, og hvem har ballen når det glipper?',
      },
      {
        id: 'q3',
        text: 'Hvor kommer den faktiske ETA-en fra i praksis?',
        hint: 'SafeSeaNet, AIS, agenten eller telefonen? Hvor ofte er den feil, og hva koster det når den er feil (folk som venter på kaia, los som må ombookes)?',
      },
      {
        id: 'q4',
        text: 'Bruker agentene deres Port Community-portalen fra Grieg Connect, eller sender de fortsatt e-post og ringer?',
        hint: 'Hva sier agentene selv om portalen?',
      },
      {
        id: 'q5',
        text: 'Utviklingsprosjektet med Grieg og de andre havnene: hva ville havnene ha som Grieg ikke bygde?',
        hint: 'Og hva ble bygget som ingen bruker? Hvordan får dere ønsker inn på veikartet i dag?',
      },
    ],
  },
  {
    title: 'Dag til dag i Grieg Connect',
    questions: [
      {
        id: 'q6',
        text: 'Hva bruker dere flest klikk på i Grieg Connect i løpet av en uke?',
        hint: 'Hva gjør dere fortsatt i Excel, på whiteboard eller i hodet ved siden av?',
      },
      {
        id: 'q7',
        text: 'Kaiplanen: hvordan håndterer dere to skip som vil ha samme kai samtidig?',
        hint: 'Og hvor langt frem i tid er cruisekaiene faktisk låst?',
      },
      {
        id: 'q8',
        text: 'Endringer underveis (ny ETA, annen kai, forlenget liggetid): hvordan flyter det til alle som trenger det?',
        hint: 'Hvem må dere ringe manuelt?',
      },
      {
        id: 'q9',
        text: 'Bruker kaifolkene mobilappen Port GO ute, eller etterregistreres tjenester på kontoret etterpå?',
      },
      {
        id: 'q10',
        text: 'Nettsiden deres sier «Portwin» og «under oppdatering». Er dere ferdig migrert til Grieg Connects nye system?',
        hint: 'Hvordan var den overgangen?',
      },
    ],
  },
  {
    title: 'Penger og rapportering',
    questions: [
      {
        id: 'q11',
        text: 'Fra anløp til faktura: hvilke data må agenten levere, hva mangler oftest, og hvor mange fakturaer blir bestridt?',
        hint: 'Ser dere noen gang agentens PDA eller FDA, eller bryr dere dere ikke om den?',
      },
      {
        id: 'q12',
        text: 'Rapportering til Kystverket, SSB, tollen og ISPS-myndighet: hva er automatisk fra Grieg Connect, og hva punches manuelt?',
      },
    ],
  },
  {
    title: 'Cruise spesielt',
    questions: [
      {
        id: 'q13',
        text: 'Hva er annerledes med et cruiseanløp mot et lasteanløp for dere?',
        hint: 'Hvor er koordineringen med DMC, busser og cruiseagent tyngst, og har havna innsyn i noe av det?',
      },
      {
        id: 'q14',
        text: 'Hvordan ser losbestillingen og taubåtbehovet ut hos dere, og hvem bestiller?',
      },
    ],
  },
  {
    title: 'Havnedistriktet og trafikken',
    questions: [
      {
        id: 'q15',
        text: 'Offshore supply er volumet i Kristiansund. Registrerer baseoperatørene i Grieg Connect, eller har de egne systemer?',
        hint: 'Hvordan ser et supplyanløp ut i Grieg Connect sammenlignet med et cruiseanløp?',
      },
      {
        id: 'q16',
        text: 'Havna dekker mange kommuner. Hvordan registreres og faktureres et anløp på en kai der ingen jobber?',
        hint: 'Hvem ser at skipet kom, og hvem stoler dere på?',
      },
      {
        id: 'q17',
        text: 'Miljøavgift, EPI og landstrøm: bruker dere Environmental Port Index for cruise, hvem sjekker rapporten, og hvordan bestilles og prises landstrøm?',
      },
      {
        id: 'q18',
        text: 'Vær og vind: hvem avgjør at et skip ikke kan legge til, hvor ofte skjer det, og hvordan varsles agent, DMC og busser?',
      },
    ],
  },
  {
    title: 'Det store bildet',
    questions: [
      {
        id: 'q19',
        text: 'Hvis et nytt verktøy skulle gjøre én ting ved siden av Grieg Connect, uten å erstatte det: hva ville det vært?',
        hint: 'Og motsatt: hva er den ene tingen som må være i Grieg Connect for at det skal være verdt å logge inn et annet sted?',
      },
      {
        id: 'q20',
        text: 'Slipper Grieg Connect tredjeparter inn via API-et sitt, eller er det bare ERP og Visma?',
        hint: 'Vet dere om noen agent eller rederi som er integrert maskin til maskin, som Sea-Cargo i Bergen?',
      },
      {
        id: 'q21',
        text: 'Hva er den største frustrasjonen med Grieg Connect som dere har gitt opp å få fikset?',
      },
    ],
  },
  {
    title: 'Fritt ord',
    questions: [
      {
        id: 'q22',
        text: 'Er det noe vi ikke har spurt om?',
        hint: 'Tanker, ideer, ting som har irritert i årevis, eller noe dere ville gjort annerledes om dere skulle bygget dette selv. Alt er velkomment.',
      },
    ],
  },
]

export const QUESTIONS: readonly Question[] = GROUPS.flatMap((g) => g.questions)

export const QUESTION_IDS: ReadonlySet<string> = new Set(QUESTIONS.map((q) => q.id))

/** Per-answer ceiling. Generous for stikkord, tight enough that a script cannot mail a novel. */
export const ANSWER_MAX = 4000
export const WHO_MAX = 160
