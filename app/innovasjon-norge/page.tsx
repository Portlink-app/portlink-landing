import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import PageNav from '@/components/PageNav'
import InnovasjonNorgeSection from '@/components/sections/InnovasjonNorgeSection'
import Footer from '@/components/sections/Footer'

const title = 'Det unike ved løsningen · Portlink'
const description =
  'Portlink AS til Innovasjon Norge: hva som er nytt, konkurranseanalysen og status i klartekst, som vedlegg til søknaden om Oppstartstilskudd 1.'

/* Spread, never declared fresh: Next REPLACES openGraph and twitter rather than merging them, so
   a page that sets only title and description silently loses og:image and the large share card.
   Measured on /team, 16.09.2026, and documented in lib/metadata.ts. */
export const metadata = {
  title,
  description,
  alternates: { canonical: '/innovasjon-norge/' },
  openGraph: { ...ogDefaults, title, description, url: '/innovasjon-norge/', locale: 'nb_NO' },
  twitter: { ...twitterDefaults, title, description },
}

/* A standalone route, linked from the Oppstartstilskudd 1 application rather than from the site's
   own navigation. PageNav carries the homepage destinations as real links back to `/`, because a
   homepage anchor clicked from this route would dead-end. */
export default function InnovasjonNorgePage() {
  return (
    <>
      <PageNav />
      <main id="main" tabIndex={-1} lang="nb">
        <InnovasjonNorgeSection />
      </main>
      <Footer />
    </>
  )
}
