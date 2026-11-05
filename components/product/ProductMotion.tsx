'use client'

/**
 * The product pages' motion layer (/portlink, /embark). Entrances per section part, staggered
 * 75 ms, 700 ms strong ease-out (Tiller's motion bar, measured from the references); meters and
 * seat bars fill to their real values. Transform and opacity only.
 *
 * Content is visible without script: the start state exists only after this runs and adds `.pm`
 * to the page root, and never when the visitor asks for reduced motion. The first screen is left
 * still on purpose, so the largest paint is not held back by an entrance.
 */
import { useEffect } from 'react'

const PARTS = 'h2, .body, .clockwrap, [data-ui], .pic img, .pics img, .actions, .lens, .lensnote, .phone'

export default function ProductMotion({ rootId }: { rootId: string }) {
  useEffect(() => {
    const root = document.getElementById(rootId)
    if (!root || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    root.classList.add('pm')
    const groups = [...root.querySelectorAll<HTMLElement>('section')]
    const timers: number[] = []
    for (const g of groups) {
      g.classList.add('pre-bar')
      g.querySelectorAll(PARTS).forEach((el) => {
        // A part nested in another part enters with its parent.
        if (el.parentElement?.closest(PARTS) && g.contains(el.parentElement.closest(PARTS))) return
        el.classList.add('pre')
      })
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          const g = e.target as HTMLElement
          io.unobserve(g)
          ;[...g.querySelectorAll('.pre')].forEach((el, i) => {
            timers.push(window.setTimeout(() => { el.classList.add('in'); el.classList.remove('pre') }, i * 75))
          })
          timers.push(window.setTimeout(() => g.classList.remove('pre-bar'), 120))
        }
      },
      { threshold: 0.12 },
    )
    groups.forEach((g) => io.observe(g))
    return () => {
      io.disconnect()
      timers.forEach(clearTimeout)
      root.classList.remove('pm')
      root.querySelectorAll('.pre, .in, .pre-bar').forEach((el) => el.classList.remove('pre', 'in', 'pre-bar'))
    }
  }, [rootId])
  return null
}
