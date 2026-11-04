import Image from 'next/image'
import FamilyHero, { embarkContact } from '@/components/product-family/FamilyHero'
import FamilyStory from '@/components/product-family/FamilyStory'
import FamilyLink from '@/components/product-family/FamilyLink'
import Footer from '@/components/sections/Footer'
import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import styles from '@/components/product-family/Family.module.css'

const title = 'Embark for tour operators · A Portlink product'
const description = 'Plan departures, assign guides, check in guests and respond to shore excursion requests from destination teams on Portlink.'
export const metadata = {
  title, description, alternates: { canonical: '/embark/' },
  openGraph: { ...ogDefaults, title, description, url: '/embark/', images: [{ url: '/family/fjord-cruise.jpg', alt: 'Fjord excursion' }] },
  twitter: { ...twitterDefaults, title, description, images: ['/family/fjord-cruise.jpg'] },
}

export default function Embark() {
  return <><main id="main" tabIndex={-1}>
    <FamilyHero product="Embark"/>
    <FamilyStory product="Embark"/>
    <section className={styles.features}>
      <Image sizes="(max-width: 700px) 100vw, 45vw" src="/family/fjord-cruise.jpg" width="720" height="500" loading="lazy" alt="Steep mountains and open water on a fjord excursion"/>
      <div><small>Daily operations</small><h2>Before the first guest arrives.</h2>
        <h3>Departures and bookings</h3><p>Open the day’s departures to see which tours are running and how many guests are booked.</p>
        <h3>Guide assignments</h3><p>Give each departure a guide so the person meeting the group knows which tour is theirs.</p>
        <h3>Guest check-in</h3><p>Open the guest list on the quay and mark arrivals as people board.</p>
      </div>
    </section>
    <FamilyLink from="Embark"/>
    <section className={styles.close}><h2>Show us how you run a tour.</h2><p>Talk through your bookings and your work with cruise partners in an Embark demo.</p><a href={embarkContact} className={styles.action}>Ask about Embark ↗</a></section>
  </main><Footer/></>
}
