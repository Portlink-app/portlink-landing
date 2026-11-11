'use client'
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */
import Link from 'next/link'
import { getImageProps } from 'next/image'
import { useState } from 'react'
import ProductHeader from '@/components/product/ProductHeader'
import { useProductSession } from './ProductSession'
import { audienceLabels, demoRecord, productSlug, topics, type JourneyTopic } from './journey-content'
import type { AcquisitionAudience } from '@/lib/acquisition-preferences'
import styles from './ProductJourney.module.css'

function Personalisation() {
  const s = useProductSession(); const [error, setError] = useState('')
  const [expanded, setExpanded] = useState(false)
  return <aside className={styles.preferences}><h2 className={styles.preferenceTitle}>Make it yours</h2><button className={styles.mobileToggle} aria-expanded={expanded} aria-controls="personalisation-fields" onClick={() => setExpanded(value => !value)}>Make it yours</button><div id="personalisation-fields" className={styles.preferenceFields} data-expanded={expanded}>
    <p>Preview only. No account has been created.</p>
    <label>Company name<input key={s.preferences.companyName} defaultValue={s.preferences.companyName} maxLength={100} autoComplete="organization" onBlur={event => setError(s.update({ ...s.preferences, companyName: event.target.value }) ? '' : 'Use a plain-text company name.')} /></label>
    <label>Brand colour<input type="color" value={s.preferences.brandColor || '#173b57'} onChange={event => s.update({ ...s.preferences, brandColor: event.target.value })} /></label>
    {s.product === 'platform' ? <label>Your work<select value={s.preferences.audience} onChange={event => s.update({ ...s.preferences, audience: event.target.value as AcquisitionAudience })}>{(['cruise','agent','tour'] as const).map(a => <option key={a} value={a}>{audienceLabels[a]}</option>)}</select></label> : <p>Independent tour operator. <Link href="/portlink/">Planning cruise calls? Explore Platform.</Link></p>}
    <p>Colour marks customer-brand areas. Product identity and warning colours stay unchanged.</p>
    {error && <p role="alert">{error}</p>}{!s.storageAvailable && <p role="status">Preferences stay in this page session. Browser storage is unavailable.</p>}
    <button onClick={() => { s.resetPreferences(); setError('') }}>Reset preferences</button>
    <details className={styles.preview}><summary>Your workspace preview</summary><p><strong>{s.preferences.companyName || 'Your company'}</strong></p><p>{audienceLabels[s.preferences.audience]}</p><span className={styles.swatch} style={{ background: s.preferences.brandColor || '#173b57' }} aria-hidden="true" /><span>{s.preferences.brandColor || 'Default brand colour'}</span><p>Selected preferences only. Demo records do not transfer. Trial setup is assisted until the receiving journey is accepted.</p></details>
  </div></aside>
}
function Feature({ topic, detail = false, priority = false }: { topic: JourneyTopic; detail?: boolean; priority?: boolean }) {
  const s = useProductSession(); const record = demoRecord(s.product, s.preferences.audience, topic.id, !!s.progress[topic.id])
  const phone = topic.image.startsWith('/acquisition/') ? getImageProps({ src: topic.image.replace('-wide.webp', '-phone.webp'), alt: '', width: 640, height: 960, sizes: '(max-width: 767px) calc(100vw - 40px), 640px' }).props : null
  return <section className={styles.feature}>
    {topic.anchor === 'voyage-ais' && <span id="voyage-ais" />}
    {topic.anchor === 'gangway-signoff' && <span id="gangway-signoff" />}
    {topic.anchor === 'pda-fda' && <span id="pda-fda" />}
    {topic.anchor === 'dispatch' && <span id="dispatch" />}
    {topic.anchor === 'quay-checkin' && <span id="quay-checkin" />}
    {topic.anchor === 'paid-before' && <span id="paid-before" />}
    <div><h2>{topic.title}</h2><p>{detail ? topic.detail : topic.outcome}</p><Link href={`/${productSlug(s.product)}/${topic.id}/`}>Read about {topic.id} →</Link></div>
    <div className={styles.visual}>
      <button className={styles.visualImage} aria-label={`Open ${topic.id} example`} onClick={event => s.open(topic.id, event.currentTarget)}><picture>{phone && <source media="(max-width: 767px)" srcSet={phone.srcSet} sizes={phone.sizes} />}<img src={topic.image} alt={s.product === 'embark' ? 'Coastal setting for the operator example' : 'Coastal setting for the port-call example'} width={1536} height={1024} loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : undefined} /></picture></button>
      <div className={styles.visualRecord} style={{ borderLeftColor: s.preferences.brandColor || undefined }}><p>{s.preferences.companyName || 'Your company'} · Illustrative record</p><h3>{record.title}</h3><p>{record.rows[0][0]}: {record.rows[0][1]}</p><p>{record.rows[record.rows.length - 1][0]}: {record.rows[record.rows.length - 1][1]}</p><button onClick={event => s.open(topic.id, event.currentTarget)}>Explore {topic.id} demo</button></div>
    </div>
  </section>
}
export default function ProductJourney({ topicId }: { topicId?: string }) {
  const s = useProductSession(); const slug = productSlug(s.product); const topic = topics[s.product].find(t => t.id === topicId)
  return <div className={`pp pp--${slug} ${styles.journey}`}>
    <ProductHeader product={slug} tone="light" />
    <main id="main">
      <span id="hero" /><header className={styles.intro} id="overview"><div><h1>{topic ? topic.title : s.product === 'embark' ? 'Keep departures ready' : 'Plan the whole voyage'}</h1></div><div><p>{topic ? topic.outcome : s.product === 'embark' ? 'Embark brings bookings, capacity and guide preparation into one view for independent tour operators.' : 'Platform helps cruise lines, port agents and DMCs plan the itinerary and prepare each call.'}</p><a href="/#access" data-cta={`demo-${slug}-hero`}>Book a 20-minute demo</a><a href={`/start/?product=${s.product}&audience=${s.preferences.audience}`} data-cta={`trial-${s.product}-hero`}>Explore trial options</a>{topic && <Link href={`/${slug}/`}>Back to {s.product === 'embark' ? 'Embark' : 'Platform'} overview</Link>}</div></header>
      <div className={styles.layout}><Personalisation /><div className={styles.features}><span id="discovery-workflow" />
        {s.product === 'platform' && <span id="live-record" />}
        {topic ? <Feature topic={topic} detail priority /> : topics[s.product].map((t, index) => <Feature key={t.id} topic={t} priority={index === 0} />)}
        {topic && <nav aria-label="More product topics" className={styles.topicNav}>{topics[s.product].filter(t => t.id !== topic.id).map(t => <Link key={t.id} href={`/${slug}/${t.id}/`}>{t.title} →</Link>)}</nav>}
        <section id="cruise-bridge" className={styles.close}><h2>{s.product === 'embark' ? 'A workspace for your operation' : 'Bring your next voyage'}</h2><p>Explore the examples, then review the right setup with our team. Your browser preferences are not a completed workspace.</p><a href="/#access" data-cta={`demo-${slug}-close`}>Book a 20-minute demo</a><Link href={s.product === 'embark' ? '/portlink/' : '/embark/'}>{s.product === 'embark' ? 'Explore Platform for cruise planning' : 'Explore Embark for independent tour operations'} →</Link></section>
      </div></div>
      <noscript><p>Topic pages remain readable without JavaScript. Interactive demos and personalisation need JavaScript. <a href="/#access">Arrange a guided demo</a>.</p></noscript>
    </main>
    <footer className={styles.footer}><Link href="/">Portlink home</Link><Link href="/contact/">Contact</Link><Link href="/privacy/">Privacy</Link><p>Portlink AS · Oslo, Norway</p></footer>
  </div>
}
