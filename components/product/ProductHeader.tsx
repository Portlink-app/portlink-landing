'use client'
/* eslint-disable @next/next/no-html-link-for-pages */

import Link from 'next/link'
import { setManualMotion, useMotionAllowed } from '@/components/film/useFilm'

type ProductSlug = 'portlink' | 'embark'

export default function ProductHeader({
  product,
  tone = 'dark',
  onSwitch,
}: {
  product: ProductSlug
  tone?: 'dark' | 'light'
  onSwitch?: (product: ProductSlug) => void
}) {
  const motionAllowed = useMotionAllowed()

  return (
    <header className={`pp-header pp-header--${tone}`} aria-label="Product navigation">
      <div className="pp-wrap pp-header-inner">
        <div className="pp-header-brand">
          <a className="pp-wordmark" href="/" aria-label="Portlink home">
            <span className="pp-wordmark-dot" aria-hidden="true" />
            <span>Portlink</span>
          </a>
          <div className="pp-switcher" role="navigation" aria-label="Switch product">
            <Link onClick={() => onSwitch?.('portlink')}
              href="/portlink/"
              className={`pp-switcher-pill ${product === 'portlink' ? 'is-active' : ''}`}
              aria-current={product === 'portlink' ? 'page' : undefined}
            >
              Portlink
            </Link>
            <Link onClick={() => onSwitch?.('embark')}
              href="/embark/"
              className={`pp-switcher-pill ${product === 'embark' ? 'is-active' : ''}`}
              aria-current={product === 'embark' ? 'page' : undefined}
            >
              Embark
            </Link>
          </div>
        </div>

        {product === 'portlink' ? (
          <nav className="pp-chapter-nav" aria-label="Portlink page chapters">
            <a href="/portlink/#live-record">Planning Example</a>
            <a href="/portlink/#voyage-ais">Passage planning</a>
            <a href="/portlink/#gangway-signoff">Gangway Sign-Off</a>
            <a href="/portlink/#pda-fda">PDA to FDA</a>
          </nav>
        ) : (
          <nav className="pp-chapter-nav" aria-label="Embark page chapters">
            <a href="/embark/#quay-checkin">Departure Example</a>
            <a href="/embark/#dispatch">Departures &amp; Roster</a>
            <a href="/embark/#paid-before">Booking arrangement</a>
            <a href="/embark/#cruise-bridge">Platform</a>
          </nav>
        )}

        <div className="pp-header-actions">
          <button
            type="button"
            className={`pp-motion-toggle ${motionAllowed ? 'is-on' : 'is-off'}`}
            aria-pressed={motionAllowed}
            onClick={() => setManualMotion(!motionAllowed)}
          >
            <span className="pp-motion-indicator" aria-hidden="true" />
            <span>Motion: {motionAllowed ? 'On' : 'Off'}</span>
          </button>
          <a
            href="/#access"
            className="pp-cta-btn pp-cta-btn--nav"
            data-cta={product === 'portlink' ? 'demo-portlink-nav' : 'demo-embark-nav'}
          >
            Book a 20-minute demo
          </a>
        </div>
      </div>
    </header>
  )
}
