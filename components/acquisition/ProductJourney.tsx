'use client'
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages */

import Link from 'next/link'
import ProductHeader from '@/components/product/ProductHeader'
import { ProductPersonalisationBar } from '@/components/product/ProductPersonalisationBar'
import ProductFragment from './ProductFragment'
import { useProductSession } from './ProductSession'
import { demoRecord, productSlug, topics } from './journey-content'

export default function ProductJourney({ topicId }: { topicId?: string }) {
  const s = useProductSession()
  const slug = productSlug(s.product)
  const productTopics = topics[s.product]
  const activeTopic = productTopics.find((t) => t.id === topicId) ?? productTopics[0]
  const record = demoRecord(
    s.product,
    s.preferences.audience,
    activeTopic.id,
    !!s.progress[activeTopic.id],
  )
  const isEmbark = s.product === 'embark'

  return (
    <div className={`pp pp--${slug}`}>
      <ProductHeader
        product={slug}
        tone={isEmbark ? 'light' : 'dark'}
        onSwitch={(target) => s.transfer(target === 'embark' ? 'embark' : 'platform')}
      />

      <main id="main">
        <section
          className={`pp-chapter ${isEmbark ? 'pp-chapter--embark-day' : 'pp-chapter--night'} pp-hero`}
          id="overview"
           style={{ paddingBottom: '56px' }}
        >
          <span id="hero" aria-hidden="true" />
          <div className={`pp-hero-back ${isEmbark ? 'pp-hero-back--light' : ''}`} aria-hidden="true">
            <div
              className={`pp-hero-back-scrim ${
                isEmbark ? 'pp-hero-back-scrim--light' : 'pp-hero-back-scrim--dark'
              }`}
            />
          </div>

          <div className="pp-wrap pp-hero-back-grid">
            <div className="pp-hero-front">
              {isEmbark && (
                <img
                  src="/brand/embark-lockup.svg"
                  alt="Embark by Portlink"
                  width={168}
                  height={39}
                  style={{ display: 'block', marginBottom: '14px' }}
                />
              )}
              <div className="pp-chapter-tag">
                <span>{isEmbark ? 'Embark by Portlink' : 'Portlink Maritime Operations'}</span>
                <span aria-hidden="true">·</span>
                <span>Topic Deep-Dive · {activeTopic.id}</span>
              </div>
              <h1 tabIndex={-1} data-demo-focus-fallback>
                {activeTopic.title}
              </h1>
              <p className="pp-hero-sub">{activeTopic.detail}</p>
              <div className="pp-hero-actions">
                <a href="/#access" className="pp-cta-btn" data-cta={`demo-${slug}-${activeTopic.id}`}>
                  Book a 20-minute demo
                </a>
                <a
                  href={`/start/?product=${s.product}&audience=${s.preferences.audience}`}
                  className={`pp-secondary-link ${isEmbark ? 'pp-secondary-link--light' : ''}`}
                  data-cta={`trial-${s.product}-${activeTopic.id}`}
                >
                  Start my trial →
                </a>
                <Link
                  href={`/${slug}/`}
                  className={`pp-secondary-link ${isEmbark ? 'pp-secondary-link--light' : ''}`}
                >
                  ← Full 6-chapter {isEmbark ? 'Embark' : 'Portlink'} overview
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section
          className={`pp-chapter ${isEmbark ? 'pp-chapter--embark-alt' : 'pp-chapter--day'}`}
          id={activeTopic.anchor}
        >
          <div className="pp-wrap">
            <ProductPersonalisationBar defaultTopic={activeTopic.id} />

            <ProductFragment
              product={s.product}
              audience={s.preferences.audience}
              topic={activeTopic.id}
              record={record}
              reviewed={!!s.progress[activeTopic.id]}
            />

            <div className="pp-topic-bar">
              <div className="pp-topic-bar-info">
                <strong>Interactive task check:</strong>
                <span>
                  {s.progress[activeTopic.id] ? record.result : record.unavailable ?? activeTopic.outcome}
                </span>
              </div>
              <div className="pp-topic-bar-actions">
                <button
                  type="button"
                  className="pp-topic-link"
                  disabled={!!record.unavailable}
                  onClick={() => s.review(activeTopic.id)}
                >
                  {record.action}
                </button>
                <button
                  type="button"
                  className="pp-topic-modal-btn"
                  onClick={(e) => s.open(activeTopic.id, e.currentTarget)}
                >
                  Expand {activeTopic.id} modal
                </button>
              </div>
            </div>

            <nav aria-label="More product topics" className="pp-topic-nav-grid">
              {productTopics
                .filter((t) => t.id !== activeTopic.id)
                .map((t) => (
                  <Link key={t.id} href={`/${slug}/${t.id}/`} className="pp-topic-card">
                    <div>
                      <strong>{t.title}</strong>
                      <p style={{ marginTop: '6px' }}>
                        <span>{t.outcome}</span>
                      </p>
                    </div>
                    <span className="pp-mono" style={{ fontWeight: 700, color: '#0F766E' }}>
                      Explore {t.id} →
                    </span>
                  </Link>
                ))}
              <Link href={`/${slug}/`} className="pp-topic-card">
                <div>
                  <strong>All 6 {isEmbark ? 'Embark' : 'Portlink'} Chapters</strong>
                  <p style={{ marginTop: '6px' }}>
                    <span>
                      Return to the complete 6-chapter D14 product overview and live samples.
                    </span>
                  </p>
                </div>
                <span className="pp-mono" style={{ fontWeight: 700, color: '#0F766E' }}>
                  Full overview →
                </span>
              </Link>
            </nav>
          </div>
        </section>

        <div id="product-consent" className="pp-wrap" />
      </main>

      <footer className="pp-footer">
        <div className="pp-wrap pp-footer-inner">
          <div className="pp-footer-links">
            <a href="/">Portlink Home</a>
            <a href="/portlink/">Portlink (Port Calls)</a>
            <a href="/embark/">Embark (Shorex &amp; Tours)</a>
            <a href="/team/#mission">Team &amp; Ethos</a>
            <a href="/privacy/">Privacy</a>
            <a href="/contact/">Contact</a>
          </div>
          <p className="pp-footer-copy">
            Portlink AS · Oslo, Norway · Maritime port-call and shore-excursion operations.
          </p>
        </div>
      </footer>
    </div>
  )
}
