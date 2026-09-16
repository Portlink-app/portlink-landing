'use client'

/**
 * The public draw standings.
 *
 * Shows first name and company only; that narrowing happens server-side in
 * lib/seatrade/leaderboard.ts and is held by `npm run check:leaderboard`, so this component cannot
 * widen it by rendering a field it was not given.
 *
 * Polls every 30 s, which matches the API's cache window: faster would return the same bytes and
 * slower would make a booth screen look frozen. It never shows a spinner after the first load,
 * because a table that blinks on every poll reads as broken rather than live.
 */
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface LeaderRow {
  rank: number
  name: string
  company: string
  entries: number
}

interface Board {
  rows: LeaderRow[]
  total: number
  shown: number
  entriesTotal: number
  closesLabel: string
  drawLabel: string
}

export default function Leaderboard({ limit = 10, compact = false }: { limit?: number; compact?: boolean }) {
  const [board, setBoard] = useState<Board | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let live = true
    const load = async () => {
      try {
        const res = await fetch(`/api/seatrade/leaderboard/?limit=${limit}`, { cache: 'no-store' })
        if (!res.ok) throw new Error(String(res.status))
        const data = (await res.json()) as Board
        if (live) { setBoard(data); setFailed(false) }
      } catch {
        // A failed poll must not blank a board that is already on screen: keep the last good one
        // and only say something when there has never been one.
        if (live && !board) setFailed(true)
      }
    }
    load()
    const timer = setInterval(load, 30_000)
    return () => { live = false; clearInterval(timer) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit])

  const cell: React.CSSProperties = {
    padding: compact ? '10px 8px' : '14px 12px',
    fontSize: compact ? '14px' : '15px',
    borderBottom: '1px solid var(--border)',
    textAlign: 'left',
  }

  if (failed) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
        The standings are not loading right now. Your entries are unaffected; they live on your own page.
      </p>
    )
  }

  if (!board) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>Loading the standings…</p>
  }

  if (board.rows.length === 0) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '32px 28px',
          textAlign: 'center',
        }}
      >
        <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
          Nobody is on the board yet.
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, lineHeight: 1.6 }}>
          Confirm your work email and you are first. Entries close {board.closesLabel}, drawn {board.drawLabel}.
        </p>
      </div>
    )
  }

  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <caption style={{ captionSide: 'top', textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px', paddingBottom: '10px' }}>
          {board.total} {board.total === 1 ? 'person' : 'people'} in the draw, {board.entriesTotal}{' '}
          {board.entriesTotal === 1 ? 'entry' : 'entries'} between them
          {board.shown < board.total ? `. Top ${board.shown} shown.` : '.'}
        </caption>
        <thead>
          <tr>
            <th scope="col" style={{ ...cell, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', width: '48px' }}>#</th>
            <th scope="col" style={{ ...cell, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Who</th>
            <th scope="col" style={{ ...cell, color: 'var(--text-muted)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'right' }}>Entries</th>
          </tr>
        </thead>
        <tbody>
          {board.rows.map((row) => (
            <tr key={`${row.rank}-${row.name}-${row.company}`}>
              <td style={{ ...cell, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>{row.rank}</td>
              <td style={{ ...cell, color: 'var(--text-primary)' }}>
                {row.name}
                {row.company ? <span style={{ color: 'var(--text-muted)' }}> · {row.company}</span> : null}
              </td>
              <td style={{ ...cell, color: 'var(--text-primary)', textAlign: 'right', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{row.entries}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '12px', lineHeight: 1.6 }}>
        First name and company only. We never publish an email address. Ask us and we will take you off the
        board while keeping your entries. <Link href="/seatrade/terms/" style={{ color: 'var(--text-muted)' }}>Terms</Link>
      </p>
    </div>
  )
}
