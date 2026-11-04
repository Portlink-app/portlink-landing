import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Anchor, Waves } from 'lucide-react'
import type { Product } from './content'
import styles from './Family.module.css'

export const embarkContact = 'mailto:pilot@portlink.app?subject=Embark%20demo%20enquiry'

export default function FamilyHero({ product }: { product: Product }) {
  const operator = product === 'Embark'
  const Symbol = operator ? Waves : Anchor
  const contact = operator ? embarkContact : '/#access'
  return (
    <header className={styles.hero}>
      <nav className={styles.nav} aria-label="Product navigation">
        <div><Link href="/" className={styles.wordmark}>Portlink</Link><Link href="/embark/" aria-current={operator ? 'page' : undefined}>Embark</Link></div>
        <a className={styles.contact} href={contact} data-cta={operator ? 'embark-demo-nav' : 'demo-nav'}>Book a demo <ArrowUpRight size={15}/></a>
      </nav>
      <div className={styles.object} aria-hidden="true">
        <div className={styles.strap}/>
        <div className={styles.tagBack}><Symbol size={48} strokeWidth={1.5}/><span>{operator ? 'Guide pass' : 'Port agent'}</span></div>
        <div className={styles.tag}><i/><small>{operator ? 'Embark / Field issue' : 'Portlink / Marine issue'}</small>
          <Image sizes="160px" src={operator ? '/family/fjord-cruise.jpg' : '/video/landing-2026-09-15/hero-A.jpg'} alt="" width="210" height="100"/>
          <strong>{operator ? 'Icefjord' : 'Ilulissat'}</strong><span>{operator ? 'Excursion E-014' : 'Port call GLJAV'}</span>
        </div><div className={styles.ring}/>
      </div>
      <p className={styles.byline}>{operator ? 'Embark, a Portlink product' : 'Portlink for cruise operations'}</p>
      <h1>{operator ? 'Run the departure.' : 'Coordinate the port call.'}</h1>
      <p className={styles.intro}>{operator ? 'Manage bookings, assign guides and check guests in. Work with the DMCs preparing shore excursions for cruise lines on Portlink.' : 'Bring the cruise line, port agent and shore team together around the same arrival, from the first berth request to the final account.'}</p>
      <a className={styles.action} href={operator ? '#departure' : '#pain'}>Follow {operator ? 'a departure' : 'a port call'} <span aria-hidden="true">↓</span></a>
    </header>
  )
}
