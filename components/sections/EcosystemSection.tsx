'use client'

/**
 * The ecosystem, in one neutral variant.
 *
 * This section used to render nothing at all unless a visitor had picked a
 * role at the gate. The page no longer has a gate, so it says the thing that
 * is true for every reader: three sides, one record.
 */

import { Anchor, Compass, Ship } from 'lucide-react'
import { motion } from 'framer-motion'

const partners = [
  {
    icon: Ship,
    title: 'Cruise lines',
    body: 'Push the itinerary and the requirements once. See prep status, agent confirmations and cost against estimate across the whole deployment, without calling anyone.',
  },
  {
    icon: Anchor,
    title: 'Port agents',
    body: 'Every inbound call from every line in one workspace, with the documents, the costs and the history attached to the call rather than to an inbox.',
  },
  {
    icon: Compass,
    title: 'Tour operators',
    body: 'Confirmed calls early enough to plan capacity, briefs that arrive in the same shape every time, and changes that come with a sign-off instead of a surprise.',
  },
]

export default function EcosystemSection() {
  return (
    <section
      id="ecosystem"
      style={{ background: 'var(--ds-surface-2)', padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)' }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vw, 48px)' }}
        >
          <span
            style={{
              fontSize: 11,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: 'var(--ds-primary)',
              fontWeight: 600,
            }}
          >
            Ecosystem
          </span>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
              fontWeight: 700,
              color: 'var(--ds-text-1)',
              letterSpacing: '-0.02em',
              margin: '10px 0 0',
            }}
          >
            Three sides of a port call, one record between them
          </h2>
          <p
            style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
              color: 'var(--ds-text-2)',
              maxWidth: 620,
              margin: '12px auto 0',
              lineHeight: 1.6,
            }}
          >
            Nobody re-enters what somebody else already entered. The status one side changes is the status
            the other two are reading.
          </p>
        </motion.div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'clamp(14px, 2vw, 24px)',
          }}
        >
          {partners.map((p, i) => {
            const Icon = p.icon
            return (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  background: 'var(--ds-surface-1)',
                  border: '1px solid var(--ds-border-1)',
                  borderRadius: 'var(--ds-radius-lg)',
                  padding: '26px 24px',
                }}
              >
                <Icon size={24} color="var(--ds-primary)" style={{ marginBottom: 16 }} />
                <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--ds-text-1)', margin: '0 0 8px' }}>{p.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--ds-text-2)', lineHeight: 1.6, margin: 0 }}>{p.body}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
