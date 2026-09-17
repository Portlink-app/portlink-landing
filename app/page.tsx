'use client'

import { useState, useEffect } from 'react'
import Nav from '@/components/Nav'
import FilmHero from '@/components/film/FilmHero'
import VoyageSeenSection from '@/components/film/VoyageSeenSection'
import SceneSection from '@/components/scenes/SceneSection'
import S1Overview from '@/components/scenes/S1Overview'
import S2Calls from '@/components/scenes/S2Calls'
import S3Review from '@/components/scenes/S3Review'
import S4Finance from '@/components/scenes/S4Finance'
import S5Work from '@/components/scenes/S5Work'
import S6Messages from '@/components/scenes/S6Messages'
import S7Compliance from '@/components/scenes/S7Compliance'
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

        <SceneSection
          id="dashboard"
          eyebrow="Overview"
          headline="You decide what your dashboard looks like"
          body="Add the widgets you actually watch, drop the ones you do not, and put them where you want them. The layout is yours, not a default somebody else picked."
          tone="surface"
        >
          <S1Overview />
        </SceneSection>

        <SceneSection
          id="calls"
          eyebrow="Port calls"
          headline="Every call, from every line, in one list"
          body="Your whole schedule in one ledger, with the state of each call on the row: confirmed, awaiting a berth, in port, or still missing an agent. No separate portal per cruise line."
        >
          <S2Calls />
        </SceneSection>

        <SceneSection
          id="review"
          eyebrow="Review flow"
          headline="Each department signs off its own part"
          body="A voyage moves from draft to approved one stage at a time. Everyone can see which stage it is on, who owes the next signature, and how long it has been sitting there."
          tone="surface"
        >
          <S3Review />
        </SceneSection>

        <SceneSection
          id="finance"
          eyebrow="Finance"
          headline="From PDA to FDA: every cost tracked against the estimate"
          body="The proforma and the final account are the same object, line by line. The variance is on the screen while the call is still open, not in a reconciliation three weeks later."
        >
          <S4Finance />
        </SceneSection>

        <VoyageSeenSection />

        <SceneSection
          id="work"
          eyebrow="Work"
          headline="Tasks, board and calendar in the same place as the call"
          body="Work assigned across departments, on the record it belongs to. Nobody moves to another app to find out what is still open before the ship arrives."
          tone="surface"
        >
          <S5Work />
        </SceneSection>

        <SceneSection
          id="messages"
          eyebrow="Messages"
          headline="The conversation lives on the call record"
          body="Agents, operations and shore operators talk in one thread attached to the call, with the attachments and the decisions in the same place. Not in an inbox somebody has to be copied into."
        >
          <S6Messages />
        </SceneSection>

        <SceneSection
          id="compliance"
          eyebrow="Compliance"
          headline="Permits and certificates stay current, and stay shared"
          body="What is valid, what expires next month, and what is waiting for a counter-signature. Visible to the people on the call rather than filed on somebody's desktop."
          tone="surface"
        >
          <S7Compliance />
        </SceneSection>

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
