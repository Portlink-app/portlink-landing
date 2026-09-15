import PageNav from '@/components/PageNav'
import TeamSection from '@/components/sections/TeamSection'
import Footer from '@/components/sections/Footer'

export const metadata = {
  title: 'Our team · Portlink',
  description:
    'The people building Portlink: co-founders David Bakke and Kris Willassen, with advisors Dann Handberg Madsen and Leo Hansen.',
}

/* A standalone route rather than a homepage anchor, because the homepage is persona-gated and a
   visitor arriving from a signature, a deck or a business card should land on the team directly.
   PageNav carries the same destinations as the homepage nav, but as real links back to `/`,
   because a homepage anchor clicked from this route would dead-end. */
export default function TeamPage() {
  return (
    <>
      <PageNav />
      <main>
        <TeamSection />
      </main>
      <Footer />
    </>
  )
}
