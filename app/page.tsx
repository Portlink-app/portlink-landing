'use client'

import Nav from '@/components/Nav'
import FilmHero from '@/components/film/FilmHero'
import PlatformExplorer from '@/components/scenes/PlatformExplorer'
import PainSection from '@/components/sections/PainSection'
import EcosystemSection from '@/components/sections/EcosystemSection'
import TeamProofSection from '@/components/sections/TeamProofSection'
import AccessSection from '@/components/sections/AccessSection'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" tabIndex={-1}>
        <FilmHero />
        {/* The Seatrade draw block is deliberately absent from the front page — David's instruction
            of 17.09.2026. The campaign itself is unchanged and live: /seatrade/ still takes entries,
            the show QR codes still resolve, the email sequence still sends. Only the front page
            stopped advertising it. Restoring it is this one import plus the two nav rows named in
            the header of components/sections/DrawSection.tsx. */}
        {/* Conversion Batch 1, 01.11.2026: the page went from 11 540 px to under 8 000 at 1440 wide.
            Folded, not lost: FounderBar's credibility is the hero sub-line and TeamProofSection;
            BuiltSection's "illustrative data" line is the explorer's own label; TwoDoorsSection's
            pilot terms and build door live in AccessSection (it keeps id="pilot"). Cut because they
            repeat the explorer: VoyageSeenSection (two more cuts of the hero film) and BentoSection
            (four role previews of the same screens; the ecosystem diagram names the same four
            participants from the shared registry). Their files stay, unmounted, so a revert of
            this one file restores the old order. */}
        <PainSection />
        <PlatformExplorer />
        <EcosystemSection />
        <TeamProofSection />
        {/* The one primary action, "Book a 20-minute demo", lands here. Keeps id="access" (Seatrade
            mail) and carries id="pilot" (nav, footer, PageNav). */}
        <AccessSection />
      </main>
      <Footer />
    </>
  )
}
