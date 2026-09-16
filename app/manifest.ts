import type { MetadataRoute } from 'next'

/**
 * The web app manifest, served by Next at /manifest.webmanifest and linked from every page.
 *
 * It exists so "Add to Home Screen" on an iPhone stops producing a generic tile. Before this there
 * was no manifest at any path and no apple-touch-icon, and the only declared icon was Next's own
 * default favicon: a black circle with a white triangle that had never been replaced.
 *
 * The colours are design-system tokens, not choices made here: --ds-primary for the theme colour,
 * which is what the site's own primary button is, and --ds-canvas for the background, which is the
 * page behind everything. They are written as literals because a manifest is JSON and cannot read
 * a CSS variable; if the tokens move, these move with them.
 *
 * `display: browser` rather than `standalone`. This is a marketing site, not an app: a reader who
 * saves it wants the page with its address bar and its share button, not a chromeless window that
 * traps them.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Portlink',
    short_name: 'Portlink',
    description:
      'One platform for cruise lines, port agents, and tour operators to coordinate port calls in real time.',
    start_url: '/',
    display: 'browser',
    theme_color: '#1e3a5f',
    background_color: '#f2f5f9',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  }
}
