/**
 * Layout for the product pages /portlink and /embark (Phase 5 perfection rebuild, 09.11.2026).
 * Loads the D14 display and text faces and the scoped product stylesheet (.pp), leaving the
 * root homepage and its vendored design system untouched. Entry doc: docs/PRODUCT-PAGES.md.
 */
import localFont from 'next/font/local'
import './product.css'

const display = localFont({
  src: '../_fonts/schibsted-grotesk-latin.woff2',
  weight: '400 900',
  variable: '--pp-font-display',
  display: 'optional',
})

const text = localFont({
  src: '../_fonts/manrope-latin.woff2',
  weight: '200 800',
  variable: '--pp-font-text',
  display: 'optional',
})

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${text.variable}`} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
