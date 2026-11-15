import { NextResponse } from 'next/server'
import { resolveAcquisitionEntry } from '@/lib/acquisition'
import { selfServeUrl } from '@/lib/site'

// Keep selection and enablement decisions out of caches, including when trial entry closes.
export const dynamic = 'force-dynamic'

/** Additive acquisition handoff; performs no provisioning, billing or account mutation. */
export function GET(request: Request) {
  const source = new URL(request.url)
  const entry = resolveAcquisitionEntry(source.searchParams, selfServeUrl)
  // A relative fallback preserves the public hostname even behind a reverse proxy.
  const response = new NextResponse(null, { status: 307, headers: { Location: entry.href } })
  response.headers.set('Cache-Control', 'private, no-store')
  response.headers.set('Referrer-Policy', 'no-referrer')
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}
