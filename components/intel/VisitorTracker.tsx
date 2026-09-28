'use client'

/**
 * Records page views, deep scrolls, form sends and time on page for visitor intelligence. Mounted
 * once in the root layout. No cookie, no storage of its own: see lib/intel/client.ts and the
 * collector app/api/intel/v/route.ts. Entry doc: docs/VISITOR-INTELLIGENCE.md.
 */
import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import { LINK_PARAM } from '@/lib/intel/config'
import { isUntracked, send } from '@/lib/intel/client'

const SCROLL_DEPTH = 0.75

export default function VisitorTracker() {
  const pathname = usePathname()
  const first = useRef(true)

  // A signed outreach link: report it once, then take the token out of the address bar so it is
  // not bookmarked, shared or sent on as a referrer.
  useEffect(() => {
    const url = new URL(location.href)
    const token = url.searchParams.get(LINK_PARAM)
    if (!token) return
    send({ t: 'link', token, p: url.pathname })
    url.searchParams.delete(LINK_PARAM)
    history.replaceState(history.state, '', url.pathname + url.search + url.hash)
  }, [])

  useEffect(() => {
    if (isUntracked(pathname)) return
    const started = Date.now()
    const ev: Record<string, unknown> = { t: 'pv', p: pathname, title: document.title }
    if (first.current) {
      first.current = false
      if (document.referrer) {
        try {
          const r = new URL(document.referrer)
          if (r.host !== location.host) ev.ref = r.host + r.pathname
        } catch {
          // An unparseable referrer is simply not recorded.
        }
      }
      const q = new URLSearchParams(location.search)
      const utm: Record<string, string> = {}
      for (const k of ['source', 'medium', 'campaign', 'term', 'content']) {
        const v = q.get(`utm_${k}`)
        if (v) utm[k] = v
      }
      if (Object.keys(utm).length) ev.utm = utm
    }
    // The title updates after navigation in the App Router; read it a tick later.
    const timer = window.setTimeout(() => send({ ...ev, title: document.title }), 50)

    let scrolled = false
    const onScroll = () => {
      if (scrolled) return
      const max = document.documentElement.scrollHeight - window.innerHeight
      if (max > 0 && window.scrollY / max >= SCROLL_DEPTH) {
        scrolled = true
        send({ t: 'scroll', p: pathname })
      }
    }
    const onSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement | null
      if (f?.tagName === 'FORM') send({ t: 'form', p: pathname, formId: f.id || f.getAttribute('name') || f.getAttribute('aria-label') || 'form' })
    }
    let left = false
    const leave = () => {
      if (left) return
      left = true
      send({ t: 'leave', p: pathname, ms: Date.now() - started })
    }
    const onHide = () => { if (document.visibilityState === 'hidden') leave() }

    window.addEventListener('scroll', onScroll, { passive: true })
    document.addEventListener('submit', onSubmit, true)
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', leave)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('scroll', onScroll)
      document.removeEventListener('submit', onSubmit, true)
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', leave)
      leave()
    }
  }, [pathname])

  return null
}
