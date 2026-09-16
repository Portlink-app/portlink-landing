import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import PageNav from '@/components/PageNav'
import TeamSection from '@/components/sections/TeamSection'
import Footer from '@/components/sections/Footer'

const title = 'Our team · Portlink'
const description =
  'The people building Portlink: co-founders David Bakke and Kris Willassen, with advisors Dann Handberg Madsen and Leo Hansen.'

/* Spread, not declared fresh. Next REPLACES openGraph and twitter rather than merging them, so
   the first version of this set only title/description/url and measurably dropped og:image,
   og:site_name and summary_large_image from this page. The defaults carry the card; only the
   headline is this page's own. */
export const metadata = {
  title,
  description,
  alternates: { canonical: '/team/' },
  openGraph: { ...ogDefaults, title, description, url: '/team/' },
  twitter: { ...twitterDefaults, title, description },
}

/* A standalone route rather than a homepage anchor, because the homepage is persona-gated and a
   visitor arriving from a signature, a deck or a business card should land on the team directly.
   PageNav carries the same destinations as the homepage nav, but as real links back to `/`,
   because a homepage anchor clicked from this route would dead-end. */
export default function TeamPage() {
  return (
    <>
      <PageNav />
      <main id="main" tabIndex={-1}>
        <TeamSection />
      </main>
      <Footer />
    </>
  )
}
