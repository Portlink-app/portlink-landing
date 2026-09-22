import type { Metadata } from 'next'
import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import HavnShell from '@/components/havn/Shell'
import HavnHero from '@/components/havn/Hero'
import Coexist from '@/components/havn/Coexist'
import Story from '@/components/havn/Story'
import Sporsmal from '@/components/havn/Sporsmal'
import Modulkart from '@/components/havn/Modulkart'
import Hilsen from '@/components/havn/Hilsen'

/* Dated file, served immutable for a year like the site card: a re-cut lands at a new path. Built
   from scripts/og/havn-card.html. */
const ogHavn = '/og/havn-2026-09-22.png'
const title = 'Portlink og Grieg Connect · Portlink'
const description =
  'Hvordan Portlink og Grieg Connect kan leve sammen om det samme anløpet, og 22 spørsmål til dere som bruker systemet hver dag.'

/**
 * portlink.app/portlink+griegconnect
 *
 * Written 22.09.2026 for three people from Kristiansund og Nordmøre Havn who use Port by Grieg
 * Connect daily, ahead of a car ride to Surnadal on 23.09.2026, and meant to be shared onwards
 * inside their project. Norwegian on purpose; the rest of the site stays English.
 *
 * noindex on purpose: the page names another company's product and shows its marketing
 * screenshots to explain a proposed coexistence. It is a page you are sent, not one you find.
 */
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/portlink+griegconnect/' },
  robots: { index: false, follow: false },
  openGraph: { ...ogDefaults, title, description, url: '/portlink+griegconnect/', locale: 'nb_NO', images: [{ url: ogHavn, width: 1200, height: 630, alt: 'Havna har Grieg Connect. Resten av anløpet har e-post.' }] },
  twitter: { ...twitterDefaults, title, description, images: [ogHavn] },
}

export default function HavnPage() {
  return (
    <HavnShell>
      <HavnHero />
      <Coexist />
      <Story />
      <Modulkart />
      <Sporsmal />
      <Hilsen />
    </HavnShell>
  )
}
