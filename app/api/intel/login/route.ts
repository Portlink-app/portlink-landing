/**
 * GET /api/intel/login/?k=<INTEL_SECRET>: opens the private /leads page on this browser.
 *
 * The alert and digest emails carry this link, so David is one click from the page on any device.
 * It sets an httpOnly cookie holding an HMAC of the secret (never the secret itself) for 90 days,
 * then redirects to /leads without the key in the address bar. A wrong key gets a plain 404, so
 * the route does not advertise itself.
 */
import { NextResponse } from 'next/server'
import { ADMIN_COOKIE } from '@/lib/intel/config'
import { adminCookieValue, isAdminSecret } from '@/lib/intel/token'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const value = adminCookieValue()
  if (!value || !isAdminSecret(url.searchParams.get('k'))) return new NextResponse('Not found', { status: 404 })
  const res = NextResponse.redirect(new URL('/leads/', url.origin), 303)
  res.cookies.set(ADMIN_COOKIE, value, { httpOnly: true, secure: url.protocol === 'https:', sameSite: 'lax', path: '/', maxAge: 90 * 86400 })
  return res
}
