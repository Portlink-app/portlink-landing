import type { NextConfig } from 'next'

/**
 * ⛔ SECURITY HEADERS LIVE HERE, NOT ONLY IN netlify.toml, AND THE SPLIT IS MEASURED.
 *
 * netlify.toml's [[headers]] rules are applied by the CDN to STATIC assets. Pages are rendered by
 * the Next runtime through @netlify/plugin-nextjs, and that response does not pick them up.
 * Measured on deploy preview 2 at 0cb6b537, with the three headers declared for `/*` in
 * netlify.toml:
 *
 *   /og/portlink-2026-09-16.png   Referrer-Policy, X-Frame-Options, Permissions-Policy   present
 *   /apple-touch-icon.png         the same three                                          present
 *   /                             none of them
 *   /team/                        none of them
 *   /robots.txt                   none of them
 *
 * So the surfaces that actually need clickjacking and referrer protection, the HTML pages, were
 * the exact ones not getting it. This is the same mechanism that made the blanket Cache-Control
 * rule miss `/` in the previous round: `/` serves `public,max-age=0,must-revalidate` from the Next
 * runtime regardless of what the toml says.
 *
 * Both files keep the rules. They cover different paths and neither is redundant.
 *
 * Deliberately no Content-Security-Policy: Next emits inline scripts for hydration and the flight
 * payload, so a CSP here needs nonce plumbing, and getting it wrong blanks the page. That is its
 * own work item, not a line added next to a cache rule.
 */
const securityHeaders = [
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
]

const nextConfig: NextConfig = {
  trailingSlash: true,
  images: { unoptimized: true },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

export default nextConfig
