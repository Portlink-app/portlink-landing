'use client'

import { useEffect, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { useMotionAllowed } from '@/components/film/useFilm'

gsap.registerPlugin(ScrollTrigger, useGSAP)

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const scopeRef = useRef<HTMLDivElement | null>(null)
  const motionAllowed = useMotionAllowed()

  useEffect(() => {
    if (!motionAllowed) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      syncTouch: false,
    })

    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [motionAllowed])

  useGSAP(
    () => {
      const root = scopeRef.current
      if (!root) return

      const reduced =
        !motionAllowed || window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const targets = gsap.utils.toArray<HTMLElement>(
        [
          'section h2',
          'section h3',
          '.pp-hero-sub',
          '.pp-chapter-sub',
          '.pp-hero-actions',
          '.pp-staircase-item',
          '.pp-stage-frame',
          '.pp-ui-card',
          '.pp-gangway-stage',
          '.pp-sibling-card',
          '.pp-personalise-bar',
          '.pp-topic-bar',
          '[data-gsap-step]',
        ].join(', '),
        root,
      )

      if (reduced) {
        gsap.set(targets, { clearProps: 'transform,opacity' })
        return
      }

      // Move 1: Sheet-Over-Hero Parallax Curtain on hero stage frames
      const heroStages = gsap.utils.toArray<HTMLElement>(
        '.pp-hero .pp-hero-stage-wrap, [data-acquisition] [data-scene]',
        root,
      )
      for (const stage of heroStages) {
        gsap.fromTo(
          stage,
          { scale: 1, y: 0 },
          {
            scale: 0.985,
            y: 16,
            ease: 'none',
            scrollTrigger: {
              trigger: stage,
              start: 'top 35%',
              end: 'bottom top',
              scrub: 0.4,
            },
          },
        )
      }

      // Move 2: Staggered Section Part Entrances across every chapter
      const sections = gsap.utils.toArray<HTMLElement>('section, footer', root)
      for (const sec of sections) {
        const parts = gsap.utils.toArray<HTMLElement>(
          [
            'h2',
            'h3',
            'p',
            '.pp-hero-actions',
            '.pp-staircase-item',
            '.pp-stage-frame',
            '.pp-ui-card',
            '.pp-gangway-stage',
            '.pp-sibling-card',
            '.pp-personalise-bar',
            '.pp-topic-bar',
            '[data-gsap-step]',
          ].join(', '),
          sec,
        )
        if (!parts.length) continue

        gsap.fromTo(
          parts.slice(0, 8),
          { y: 18, opacity: 0.18 },
          {
            y: 0,
            opacity: 1,
            duration: 0.65,
            stagger: 0.065,
            ease: 'power3.out',
             overwrite: 'auto',
            scrollTrigger: {
              trigger: sec,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: scopeRef, dependencies: [motionAllowed] },
  )

  return (
    <div ref={scopeRef} style={{ display: 'contents' }}>
      {children}
    </div>
  )
}
