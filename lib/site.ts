/**
 * The origin this deployment speaks as, resolved once.
 *
 * It has to be resolved rather than hard-coded, because an absolute og:image is the only kind a
 * link-preview crawler will fetch, and a card that always points at portlink.app is unverifiable
 * on a deploy preview: the crawler would be sent to production, which either serves the old asset
 * or 404s on a new one. Netlify supplies both halves. DEPLOY_PRIME_URL is this branch's own URL,
 * so a preview advertises a card that exists and can be pasted into a debugger; URL is the site's
 * production address, used only in the production context.
 *
 * Canonical, robots and the sitemap all follow the same base. On a preview that means a
 * self-canonical and a sitemap on a preview host, which is safe because Netlify already serves
 * deploy previews with `x-robots-tag: noindex` (measured 16.09.2026: present on the preview,
 * absent on portlink.app), so nothing there is indexable to point anywhere in the first place.
 *
 * ⛔ ONE VALUE, FOUR READERS. layout.tsx, robots.ts, sitemap.ts and manifest.ts all read this.
 * A sitemap that advertises one origin while the canonical names another is the specific
 * self-contradiction crawlers report as an error, and it is exactly what four copies of this
 * expression would eventually produce.
 */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.CONTEXT === 'production' ? process.env.URL : process.env.DEPLOY_PRIME_URL) ||
  'https://portlink.app'

/** True only on the production deploy of the real domain. */
export const isProduction = process.env.CONTEXT === 'production'
