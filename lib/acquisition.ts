/**
 * Public discovery-to-product handoff. This chooses a destination, never an entitlement.
 * Existing scene role IDs map to the Platform catalogue; no prices or trial clocks live here.
 * See docs/ACQUISITION.md for source pins and the still-assisted product boundaries.
 */
import type { PortCallRole } from '@/components/sections/portCallStory'

type SelfServeSegment = 'cruise_line' | 'port_agent' | 'dmc'
const platformSegments: Record<PortCallRole, SelfServeSegment | null> = {
  cruise: 'cruise_line',
  agent: 'port_agent',
  tour: 'dmc',
  vessel: null,
}

export type AcquisitionEntry =
  | { kind: 'trial'; href: string; product: 'platform'; segment: SelfServeSegment }
  | { kind: 'assisted'; href: '/#access' }

const assisted: AcquisitionEntry = { kind: 'assisted', href: '/#access' }

/** Only an explicitly configured HTTPS origin can receive a product handoff. */
function configuredOrigin(value: string | null | undefined): string | null {
  if (!value) return null
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password ||
        url.pathname !== '/' || url.search || url.hash) return null
    return url.origin
  } catch {
    return null
  }
}

/**
 * URL parameters are selection hints, never identity, permission, price or redirect authority.
 * Reject duplicate selection keys instead of letting different readers choose different values.
 * Absent selection preserves the existing Platform cruise-line default. An explicit unknown
 * selection must not silently purchase that default. Embark and Wheelhouse remain assisted until
 * their independent entry and commercial gates are accepted.
 */
export function resolveAcquisitionEntry(
  search: URLSearchParams,
  platformBaseUrl: string | null | undefined,
): AcquisitionEntry {
  if (search.getAll('product').length > 1 || search.getAll('audience').length > 1) return assisted
  const product = search.get('product') ?? 'platform'
  const audience = search.get('audience') ?? 'cruise'
  if (product !== 'platform' || !Object.hasOwn(platformSegments, audience)) return assisted
  const segment = platformSegments[audience as PortCallRole]
  const origin = configuredOrigin(platformBaseUrl)
  if (!segment || !origin) return assisted
  const target = new URL('/start', origin)
  target.searchParams.set('segment', segment)
  return { kind: 'trial', href: target.href, product: 'platform', segment }
}
