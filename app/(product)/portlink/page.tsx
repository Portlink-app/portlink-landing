import type { Metadata } from 'next'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import ProductJourney from '@/components/acquisition/ProductJourney'

export const metadata: Metadata = {
  title: 'Platform by Portlink: Plan the Whole Voyage',
  description:
    'Cruise lines, port agents, shorex DMCs, and vessels coordinate berth readiness, fairway voyage routing, gangway departure sign-off, and PDA-to-FDA settlement in one shared record.',
  alternates: { canonical: '/portlink/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function Page() { return <ProductJourney /> }
