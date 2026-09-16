import type { MetadataRoute } from 'next'
import { isProduction, siteUrl } from '@/lib/site'

/**
 * robots.txt. There was no such file, and until 15.09.2026 that did not matter: the homepage was
 * behind a role gate, so there was little to index and nothing telling a crawler otherwise. The
 * film rebuild removed the gate, so the whole marketing site is now public and unguided.
 *
 * Two rules, and the division of labour matters because getting it wrong looks like it works:
 * robots.txt governs CRAWLING, the `robots` metadata tag governs INDEXING. The private Seatrade
 * routes already carry `index: false` in their own metadata; they are also disallowed here so a
 * crawler does not spend a budget discovering that. `/api/` is disallowed because none of it is a
 * page.
 *
 * Deploy previews are served noindex by Netlify regardless, so this could have been production
 * only. It is written for every context anyway, because a robots.txt that exists only on
 * production is a robots.txt nobody ever sees fail.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/seatrade/me', '/seatrade/unsubscribed'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: isProduction ? siteUrl : undefined,
  }
}
