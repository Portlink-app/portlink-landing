'use client'
/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import Link from 'next/link'
import { useOptionalProductSession } from '@/components/acquisition/ProductSession'
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
  const session = useOptionalProductSession()

  function handleSwitch(target: ProductSlug) {
    session?.transfer(target === 'embark' ? 'embark' : 'platform')
    onSwitch?.(target)
  }

  return (
    <header className={`pp-header pp-header--${tone}`} aria-label="Product navigation">
      <div className="pp-wrap pp-header-inner">
        <div className="pp-header-brand">
          <a className="pp-wordmark" href="/" aria-label="Portlink home">
            <span className="pp-wordmark-dot" aria-hidden="true" />
            <span>Portlink</span>
          </a>
          <div className="pp-switcher" role="navigation" aria-label="Switch product">
            <Link
              onClick={() => handleSwitch('portlink')}
              href="/portlink/"
              className={`pp-switcher-pill ${product === 'portlink' ? 'is-active' : ''}`}
              aria-current={product === 'portlink' ? 'page' : undefined}
            >
              Portlink
            </Link>
            <Link
              onClick={() => handleSwitch('embark')}
              href="/embark/"
              className={`pp-switcher-pill ${product === 'embark' ? 'is-active' : ''}`}
              aria-current={product === 'embark' ? 'page' : undefined}
            >
              <img
                src="/brand/embark-symbol.svg"
                alt=""
                width={16}
                height={16}
                aria-hidden="true"
                style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 6 }}
              />
              Embark
            </Link>
          </div>
        </div>

        {product === 'portlink' ? (
          <nav className="pp-chapter-nav" aria-label="Portlink page chapters">
            <a href="/portlink/#live-record">Live Record</a>
            <a href="/portlink/#voyage-ais">Voyage &amp; AIS</a>
            <a href="/portlink/#gangway-signoff">Gangway Sign-Off</a>
            <a href="/portlink/#pda-fda">PDA to FDA</a>
          </nav>
        ) : (
          <nav className="pp-chapter-nav" aria-label="Embark page chapters">
            <a href="/embark/#quay-checkin">Quay Check-In</a>
            <a href="/embark/#dispatch">Departures &amp; Roster</a>
            <a href="/embark/#paid-before">Paid Before Departure</a>
            <a href="/embark/#cruise-bridge">Cruise-Trade Bridge</a>
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
