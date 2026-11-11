import type { Metadata } from 'next'
import { PRODUCT_PAGE_ROBOTS } from '@/components/product/config'
import ProductJourney from '@/components/acquisition/ProductJourney'

export const metadata: Metadata = {
  title: 'Embark by Portlink: Keep Departures Ready',
  description:
    'Embark runs daily departures, boat and guide capacity, online bookings with Vipps and Stripe, in an independent tour operator workspace.',
  alternates: { canonical: '/embark/' },
  robots: PRODUCT_PAGE_ROBOTS,
}

export default function Page() { return <ProductJourney /> }
