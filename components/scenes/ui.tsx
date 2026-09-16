'use client'

/**
 * Shared primitives for the seven coded feature scenes.
 *
 * These echo the product surfaces in the landing film: hairline borders,
 * letterspaced small-caps column headers, pill states, tabular numerals.
 * Every colour is a semantic DS variable — no literal colours — so the
 * Consolidated palette lands later as a change of token values, not markup.
 */

import React from 'react'

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

const toneFg: Record<Tone, string> = {
  neutral: 'var(--ds-text-2)',
  primary: 'var(--ds-primary)',
  success: 'var(--ds-success)',
  warning: 'var(--ds-warning)',
  danger: 'var(--ds-danger)',
  info: 'var(--ds-info)',
}

const toneBg: Record<Tone, string> = {
  neutral: 'var(--ds-surface-2)',
  primary: 'var(--ds-primary-faint)',
  success: 'var(--ds-success-bg)',
  warning: 'var(--ds-warning-bg)',
  danger: 'var(--ds-danger-bg)',
  info: 'var(--ds-info-bg)',
}

/** Letterspaced small-caps label — the product's column-header treatment. */
export function Caps({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.09em',
        textTransform: 'uppercase',
        color: 'var(--ds-text-3)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/** Status pill. 11 px is the floor anywhere on this page. */
export function Pill({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 9px',
        borderRadius: 'var(--ds-radius-pill)',
        background: toneBg[tone],
        color: toneFg[tone],
        border: `1px solid ${tone === 'neutral' ? 'var(--ds-border-1)' : 'transparent'}`,
        fontSize: 11,
        fontWeight: 600,
        lineHeight: 1.45,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  )
}

/** A small round dot, for state that reads faster than a word. */
export function Dot({ tone = 'neutral', size = 7 }: { tone?: Tone; size?: number }) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: toneFg[tone],
        flexShrink: 0,
        display: 'inline-block',
      }}
    />
  )
}

/** Tabular numerals — times, distances and money stay in column. */
export function Num({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span
      style={{
        fontFamily: 'var(--ds-font-mono)',
        fontVariantNumeric: 'tabular-nums',
        fontSize: 12,
        color: 'var(--ds-text-1)',
        ...style,
      }}
    >
      {children}
    </span>
  )
}

/**
 * The window the scene lives in. Reads as a product surface without
 * pretending to be a screenshot: a title strip, then the composition.
 */
export function AppFrame({
  title,
  meta,
  children,
  padded = true,
}: {
  title: string
  meta?: React.ReactNode
  children: React.ReactNode
  padded?: boolean
}) {
  return (
    <div
      style={{
        background: 'var(--ds-surface-1)',
        border: '1px solid var(--ds-border-1)',
        borderRadius: 'var(--ds-radius-lg)',
        boxShadow: 'var(--ds-shadow-2)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 14px',
          borderBottom: '1px solid var(--ds-border-1)',
          background: 'var(--ds-surface-2)',
          minHeight: 40,
        }}
      >
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ds-text-2)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </span>
        {meta ? <span style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>{meta}</span> : null}
      </div>
      <div style={{ padding: padded ? 14 : 0 }}>{children}</div>
    </div>
  )
}

/** A hairline-separated list row. The narrow compositions are built from these. */
export function Row({
  children,
  first = false,
  style,
}: {
  children: React.ReactNode
  first?: boolean
  style?: React.CSSProperties
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 2px',
        borderTop: first ? 'none' : '1px solid var(--ds-border-1)',
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/** Wide composition — desktop only. Its narrow sibling is authored separately. */
export function Wide({ children }: { children: React.ReactNode }) {
  return <div className="scene-wide">{children}</div>
}

/** Narrow composition — phone only. Same truth, different authoring. */
export function Narrow({ children }: { children: React.ReactNode }) {
  return <div className="scene-narrow">{children}</div>
}
