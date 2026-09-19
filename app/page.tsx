'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import FilmHero from '@/components/film/FilmHero'
import VoyageSeenSection from '@/components/film/VoyageSeenSection'
import PlatformExplorer from '@/components/scenes/PlatformExplorer'
import FounderBar from '@/components/sections/FounderBar'
import PainSection from '@/components/sections/PainSection'
import BuiltSection from '@/components/sections/BuiltSection'
import EcosystemSection from '@/components/sections/EcosystemSection'
import BentoSection from '@/components/sections/BentoSection'
import TwoDoorsSection from '@/components/sections/TwoDoorsSection'
import TeamProofSection from '@/components/sections/TeamProofSection'
import AccessSection from '@/components/sections/AccessSection'
import Footer from '@/components/sections/Footer'

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <>
      <Nav theme={theme} setTheme={setTheme} />
      <main id="main" tabIndex={-1}>
        <FilmHero />
        {/* The Seatrade draw block is deliberately absent from the front page — David's instruction
            of 17.09.2026. The campaign itself is unchanged and live: /seatrade/ still takes entries,
            the show QR codes still resolve, the email sequence still sends. Only the front page
            stopped advertising it. Restoring it is this one import plus the two nav rows named in
            the header of components/sections/DrawSection.tsx. */}
        <FounderBar />
        <PainSection />

        {/* The hinge. It converts every scene below it from "buy this" into "this is the standard
            of work that leaves this building", which is the whole argument of the repositioning of
            17.09.2026. The scenes themselves are unchanged; only their job is. */}
        <BuiltSection />

        <PlatformExplorer />
        <VoyageSeenSection />

        <EcosystemSection />
        <BentoSection />
        <TeamProofSection />
        {/* Keeps id="pilot": the nav, the footer and PageNav all link to it. */}
        <TwoDoorsSection />
        <AccessSection />
      </main>
      <Footer />
    </>
  )
}
