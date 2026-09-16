'use client'

/**
 * The dark beat: "the voyage, seen."
 *
 * Two more cuts from the same recording — the chart being worked in dark mode,
 * and the finished route end to end. They are not hero material, so they sit
 * here, where a dark band gives the page a breath between seven light scenes.
 *
 * The recording is light 0–62 s, dark 63–72 s, light again 73–82 s, so these
 * two cuts each stay inside one look. A clip crossing either seam would strobe.
 */

import { motion } from 'framer-motion'
import InViewVideo from './InViewVideo'

const clips = [
  {
    src: '/video/landing-2026-09-15/hero-C.mp4',
    poster: '/video/landing-2026-09-15/hero-C.jpg',
    title: 'Plan it on the chart',
    body: 'Depths, seamarks and lights are on the chart you route against, in the light or the dark.',
    label: 'Portlink: the chart in dark mode',
  },
  {
    src: '/video/landing-2026-09-15/hero-D.mp4',
    poster: '/video/landing-2026-09-15/hero-D.jpg',
    title: 'See the whole voyage',
    body: 'Every leg, every port and the distance between them, in one picture.',
    label: 'Portlink: the finished route',
  },
]

export default function VoyageSeenSection() {
  return (
    <section
      id="voyage"
      style={{
        background: 'var(--ds-inverted-bg)',
        color: 'var(--ds-inverted-text)',
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 640, marginBottom: 'clamp(24px, 4vw, 40px)' }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ds-inverted-text)',
              opacity: 0.55,
            }}
          >
            The voyage, seen
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              margin: '10px 0 0',
              color: 'var(--ds-inverted-text)',
            }}
          >
            The passage plan is part of the record, not a separate chart table
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
              lineHeight: 1.6,
              margin: '12px 0 0',
              color: 'var(--ds-inverted-text)',
              opacity: 0.72,
            }}
          >
            The route you draw is the route the itinerary computes against: the same distances, the same
            times, the same ports everyone else is reading.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 'clamp(16px, 2.5vw, 24px)',
          }}
        >
          {clips.map((c, i) => (
            <motion.figure
              key={c.src}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              style={{ margin: 0 }}
            >
              <div
                style={{
                  borderRadius: 'var(--ds-radius-lg)',
                  overflow: 'hidden',
                  border: '1px solid var(--ds-inverted-border)',
                  background: 'var(--ds-inverted-surface)',
                  lineHeight: 0,
                }}
              >
                <InViewVideo src={c.src} poster={c.poster} label={c.label} />
              </div>
              <figcaption style={{ marginTop: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ds-inverted-text)', display: 'block' }}>
                  {c.title}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.55,
                    color: 'var(--ds-inverted-text)',
                    opacity: 0.66,
                    display: 'block',
                    marginTop: 5,
                  }}
                >
                  {c.body}
                </span>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
