/**
 * Google Analytics 4 for portlink.app. Loaded ONLY by the `analytics` row in lib/consent.ts, after
 * the visitor switches Analytics on. Entry doc: docs/CONSENT.md ("Google Analytics").
 *
 * GA account "Portlink AS", created 28.09.2026 under David's Google login (davidbakke85@gmail.com,
 * which he uses for all his projects), property "portlink.app" (Norway, NOK, Norway time), web
 * stream https://portlink.app, stream id 15861671503. All four account data-sharing settings were
 * left OFF at creation, and the GDPR Data Processing Terms were accepted.
 *
 * Consent Mode "basic": gtag.js does not exist until consent, so there are no cookieless pings
 * before a yes. Advertising storage and signals stay denied even after it, because nothing on this
 * site advertises and the banner never asked for that.
 */
export const GA_ID = 'G-41922W5K8H'
export const GA_SRC = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`
/** 13 months, the ceiling CNIL recommends for an audience-measurement cookie (GA's default is 24). */
const COOKIE_EXPIRES_S = 395 * 86400

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

export const analyticsLoaded = () => !!document.querySelector(`script[src="${GA_SRC}"]`)

/** Google's documented opt-out switch: when true, gtag sends nothing for this property. */
function setDisabled(disabled: boolean) {
  ;(window as unknown as Record<string, boolean>)[`ga-disable-${GA_ID}`] = disabled
}

export function loadAnalytics() {
  if (analyticsLoaded()) return
  setDisabled(false)
  window.dataLayer = window.dataLayer ?? []
  // gtag must push the arguments object itself, not an array copy: gtag.js tells commands apart by it.
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('consent', 'default', {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })
  window.gtag('js', new Date())
  window.gtag('config', GA_ID, {
    cookie_expires: COOKIE_EXPIRES_S,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  })
  const s = document.createElement('script')
  s.async = true
  s.src = GA_SRC
  document.head.appendChild(s)
}

/** Stops any further hits on this page; the caller clears the `_ga*` cookies and reloads. */
export function disableAnalytics() {
  setDisabled(true)
  try {
    window.gtag?.('consent', 'update', { analytics_storage: 'denied' })
  } catch {
    // Nothing loaded yet, so nothing to tell.
  }
}
