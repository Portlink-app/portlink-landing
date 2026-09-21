'use client'

import React from 'react'
import styles from './BentoGrid.module.css'
import { motion } from 'framer-motion'

interface BentoCardProps {
  title: string
  description: string
  visual?: React.ReactNode
  span?: 'full' | 'half' | 'third' | 'two-thirds'
  accent?: boolean
  delay?: number
}

export function BentoCard({ title, description, visual, span = 'half', delay = 0 }: BentoCardProps) {
  return (
    <motion.div
      className={styles.card}
      data-span={span}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        padding: '28px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color var(--ds-dur-2) var(--ds-ease-standard), box-shadow var(--ds-dur-2) var(--ds-ease-standard)',
        cursor: 'default',
      }}
    >
      {/* Visual area */}
      {visual && (
        <div style={{
          width: '100%',
          minHeight: '60px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 4,
        }}>
          {visual}
        </div>
      )}

      <div>
        <h3 style={{
          fontSize: '16px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: '0 0 8px',
          lineHeight: 1.3,
        }}>
          {title}
        </h3>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.65,
          margin: 0,
        }}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

interface BentoGridProps {
  children: React.ReactNode
  columns?: 2 | 3
}

export function BentoGrid({ children, columns = 3 }: BentoGridProps) {
  return (
    <div className={styles.grid} style={{ '--bento-columns': columns } as React.CSSProperties}>
      {children}
    </div>
  )
}
