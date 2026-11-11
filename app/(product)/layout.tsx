/**
 * Layout for the product pages /portlink and /embark (Phase 5 perfection rebuild, 09.11.2026).
 * Loads the D14 display and text faces and the scoped product stylesheet (.pp), leaving the
 * root homepage and its vendored design system untouched. Entry doc: docs/PRODUCT-PAGES.md.
 */
import { display, body } from '@/components/acquisition/fonts'
import './product.css'

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${body.variable}`} style={{ display: 'contents', '--pp-font-display': 'var(--acq-display)', '--pp-font-text': 'var(--acq-body)' } as React.CSSProperties}>
      {children}
    </div>
  )
}
