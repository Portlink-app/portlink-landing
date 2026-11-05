/**
 * Layout for the product pages /portlink and /embark (product landing plan, phase 3, 05.11.2026).
 * Loads the D14 faces and the page styles only here, so the homepage and its vendored DS are
 * unchanged. Entry doc: docs/PRODUCT-PAGES.md.
 *
 * The faces are the latin woff2 files of @portlink/tokens 1.3.0 (portlink-platform
 * packages/portlink-tokens/assets, origin/main a53e01ed6), copied byte for byte into app/_fonts/
 * with their OFL licences. Latin covers Norwegian (æ ø å) and every glyph on these pages.
 *
 * Chose next/font/local, over a hand-written @font-face file. Because: the h1 is the largest paint
 * on both pages, and with a plain @font-face the display face arrived after first paint and
 * repainted the h1, which Lighthouse mobile measured as LCP 5,0 s on /portlink. next/font preloads
 * the file and adds a metric-matched fallback. Still measured LCP 2,8 to 3,4 s with `swap`, because
 * the swap itself repaints the largest text; `optional` (the homepage's own choice for its display
 * face, app/_fonts/fonts.css) paints once: the preloaded face when it is there in time, else the
 * matched fallback until the next view. Revisit-if: D14 Gate A vendors @portlink/tokens into
 * app/_ds/; then point --pp-font-* at the package's faces here.
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
  return <div className={`${display.variable} ${text.variable}`} style={{ display: 'contents' }}>{children}</div>
}
