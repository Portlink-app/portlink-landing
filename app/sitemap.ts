import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/site'

/**
 * The sitemap, listing only pages that are public, indexable and real.
 *
 * ⛔ IT MUST NOT CONTRADICT robots.ts. A sitemap that advertises a path robots.txt forbids is a
 * self-contradiction crawlers report as an error, so the two disallowed Seatrade routes and every
 * `/api/` path are absent here by the same reasoning that disallows them there. `/seatrade/report`
 * is a live benchmark rendered on demand and is deliberately left out: it has no stable content to
 * rank and changes as people answer.
 *
 * `lastModified` is omitted rather than stamped with the build time. A build is not a content
 * change, and a sitemap that claims every page changed on every deploy teaches a crawler to stop
 * believing the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/contact/`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/team/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/innovasjon-norge/`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/seatrade/`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/seatrade/terms/`, changeFrequency: 'yearly', priority: 0.2 },
  ]
}
