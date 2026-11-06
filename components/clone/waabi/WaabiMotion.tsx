'use client'
/**
 * The scroll scenes of waabi.ai's homepage, rebuilt for /portlink: the header's progress rule, the
 * lede that fades in as the headline leaves (the headline's word rise is CSS alone), the tile columns
 * that drift apart around the statement, the sticky split that steps through three claims, and
 * the carousel's prev/next. Everything here writes CSS custom properties or data attributes; the
 * look lives in public/product-pages/portlink.css ("Page additions"), and reduced motion is handled there.
 */
import { useEffect } from 'react'

const clamp = (n: number) => Math.min(1, Math.max(0, n))

export default function WaabiMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.wb')
    if (!root) return
    root.classList.add('wbx-js')

    const tiles = root.querySelector<HTMLElement>('[data-scene="tiles"]')
    const split = root.querySelector<HTMLElement>('[data-scene="split"]')
    let ticking = false
    const update = () => {
      ticking = false
      const vh = window.innerHeight
      const max = document.documentElement.scrollHeight - vh
      root.style.setProperty('--sp', String(max > 0 ? clamp(window.scrollY / max) : 0))
      root.style.setProperty('--lede', String(clamp((window.scrollY - vh * 0.35) / (vh * 0.45))))
      // The hero recording shrinks into the centre tile of the next scene, as Waabi's does.
      root.style.setProperty('--hp', String(clamp((window.scrollY - vh * 0.95) / (vh * 0.6))))
      root.style.setProperty('--hx', String(clamp((window.scrollY - vh * 1.55) / (vh * 0.15))))
      if (tiles) {
        const r = tiles.getBoundingClientRect()
        tiles.style.setProperty('--p', String(clamp((vh - r.top) / (r.height + vh))))
      }
      if (split) {
        const r = split.getBoundingClientRect()
        const p = clamp(-r.top / Math.max(1, r.height - vh))
        split.dataset.active = String(Math.min(2, Math.floor(p * 3)))
      }
    }
    const onScroll = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update) }
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    // Clicking a claim scrolls to its third of the split, as on the reference.
    const onSplitClick = (e: Event) => {
      const item = (e.target as HTMLElement).closest<HTMLElement>('.wbx-splititem')
      if (!item || !split) return
      const i = Number(item.dataset.i)
      const top = split.getBoundingClientRect().top + window.scrollY
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      window.scrollTo({ top: top + ((i + 0.5) / 3) * (split.offsetHeight - window.innerHeight), behavior: reduce ? 'auto' : 'smooth' })
    }
    split?.addEventListener('click', onSplitClick)

    const track = root.querySelector<HTMLElement>('[data-carousel="track"]')
    const onCarousel = (e: Event) => {
      const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-carousel="prev"],[data-carousel="next"]')
      if (!btn || !track) return
      const card = track.firstElementChild as HTMLElement | null
      const step = card ? card.offsetWidth + 24 : track.clientWidth * 0.8
      track.scrollBy({ left: btn.dataset.carousel === 'next' ? step : -step, behavior: 'smooth' })
    }
    root.addEventListener('click', onCarousel)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      split?.removeEventListener('click', onSplitClick)
      root.removeEventListener('click', onCarousel)
    }
  }, [])
  return null
}
