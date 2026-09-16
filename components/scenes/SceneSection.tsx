'use client'

/**
 * The frame every feature scene sits in.
 *
 * Prose is authored once — it reads the same at any width. The composition
 * is authored twice, wide and narrow, because a dense product surface cannot
 * be made legible on a phone by scaling it down.
 */

import React from 'react'
import { motion } from 'framer-motion'

export default function SceneSection({
  id,
  eyebrow,
  headline,
  body,
  children,
  tone = 'canvas',
}: {
  id: string
  eyebrow: string
  headline: string
  body: string
  children: React.ReactNode
  tone?: 'canvas' | 'surface'
}) {
  return (
    <section
      id={id}
      style={{
        background: tone === 'canvas' ? 'var(--ds-canvas)' : 'var(--ds-surface-2)',
        padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ maxWidth: 680, marginBottom: 'clamp(24px, 4vw, 40px)' }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ds-primary)',
            }}
          >
            {eyebrow}
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--ds-text-1)',
              letterSpacing: '-0.02em',
              lineHeight: 1.18,
              margin: '10px 0 0',
            }}
          >
            {headline}
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
              color: 'var(--ds-text-2)',
              lineHeight: 1.6,
              margin: '12px 0 0',
            }}
          >
            {body}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </div>
    </section>
  )
}
