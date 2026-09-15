import Link from 'next/link'
import TeamSection from '@/components/sections/TeamSection'
import Footer from '@/components/sections/Footer'

export const metadata = {
  title: 'Our team · Portlink',
  description:
    'The people building Portlink: co-founders David Bakke and Kris Willassen, with advisors Dann Handberg Madsen and Leo Hansen.',
}

/* A standalone route rather than a homepage anchor, because the homepage is persona-gated and a
   visitor arriving from a signature, a deck or a business card should land on the team directly.
   Nav is not reused here: its links are homepage anchors and would dead-end on this route. */
export default function TeamPage() {
  return (
    <>
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          padding: '20px 24px',
          background: 'var(--bg)',
        }}
      >
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <Link href="/" aria-label="Portlink home" style={{ display: 'inline-block' }}>
            <img src="/portlink-logo.png" alt="Portlink" className="logo-img" style={{ height: '28px' }} />
          </Link>
        </div>
      </header>
      <main>
        <TeamSection />
      </main>
      <Footer />
    </>
  )
}
