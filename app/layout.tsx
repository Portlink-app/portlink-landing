import type { Metadata, Viewport } from 'next'
import {
  ogDefaults,
  ogImage,
  siteDescription as description,
  siteTitle as title,
  siteUrl,
  twitterDefaults,
} from '@/lib/metadata'
import './globals.css'
import MotionProvider from '@/components/MotionProvider'
import { OSPRY_TAG_SRC } from '@/lib/ospry'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: { canonical: '/' },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: { ...ogDefaults, url: '/', title, description },
  twitter: { ...twitterDefaults, title, description },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#1e3a5f',
}

/**
 * Organization structured data.
 *
 * ⛔ EVERY FIELD IS ALREADY PUBLISHED ON THIS SITE, and nothing else is here. "Portlink AS, Oslo,
 * Norway" is the entity named on /seatrade/terms and in both footers; pilot@portlink.app is the
 * contact address those terms give. There is no `sameAs`: the site links to no public company
 * profile anywhere, and a structured-data claim about a profile that may not exist is worse than
 * the absence it would paper over. Add it the day a real one is linked from the footer.
 */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Portlink',
  legalName: 'Portlink AS',
  url: siteUrl,
  logo: `${siteUrl}/icon-512.png`,
  image: `${siteUrl}${ogImage}`,
  description,
  email: 'pilot@portlink.app',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Oslo',
    addressCountry: 'NO',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="light">
      <head>
        {/* Ospry visitor identification, first in <head> as the vendor asks. Async, so it never
            blocks render, and the root layout persists across client navigations, so it loads once
            per visit. Its consent banner gates identification; see lib/ospry.ts and docs/OSPRY.md. */}
        <script async src={OSPRY_TAG_SRC} />
      </head>
      <body>
        {/* First focusable thing on the page. Without it a keyboard or switch user tabs the whole
            navigation before reaching any content, on every visit and every page. It is offscreen
            until focused, never display:none, because a hidden element cannot receive focus. */}
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionProvider>{children}</MotionProvider>
        <noscript><style>{`.reveal { opacity: 1; transform: none; }`}</style></noscript>
        <script
          type="application/ld+json"
          // The object is built above from constants, so there is no interpolated input to escape.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </body>
    </html>
  )
}
