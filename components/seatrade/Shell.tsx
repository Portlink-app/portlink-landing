import Link from 'next/link'
import { EVENT } from '@/lib/seatrade/config'

/**
 * The one-column page frame shared by /seatrade/, /seatrade/report/ and /seatrade/unsubscribed/.
 * Server component. Tokens only; no hex, no px that the DS already names.
 */
export default function SeatradeShell({ children, wide = false }: { children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), var(--ds-gap-5))',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), var(--ds-gap-10))',
        paddingLeft: 'var(--ds-gap-5)',
        paddingRight: 'var(--ds-gap-5)',
      }}
    >
      <div style={{ maxWidth: wide ? 760 : 560, margin: '0 auto' }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--ds-gap-3)', marginBottom: 'var(--ds-gap-7)' }}>
          <Link href="/" aria-label="Portlink home" style={{ display: 'inline-flex' }}>
            <img src="/portlink-logo.png" alt="Portlink" className="logo-img" style={{ height: 26, width: 'auto' }} />
          </Link>
          <span
            style={{
              fontSize: 'var(--ds-text-xs)',
              color: 'var(--text-muted)',
              letterSpacing: 'var(--ds-track-caps)',
              textTransform: 'uppercase',
              fontWeight: 600,
              textAlign: 'right',
              lineHeight: 1.3,
            }}
          >
            {EVENT.name.replace('Cruise ', '')}<br />
            <span style={{ fontWeight: 500, textTransform: 'none', letterSpacing: 0 }}>{EVENT.city.split(' de ')[0]} · {EVENT.dates}</span>
          </span>
        </header>
        <main id="main" tabIndex={-1}>{children}</main>
        <footer style={{ marginTop: 'var(--ds-gap-12)', paddingTop: 'var(--ds-gap-5)', borderTop: '1px solid var(--border)', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          © {new Date().getFullYear()} Portlink AS · The port call platform · <Link href="/" style={{ color: 'var(--text-muted)' }}>portlink.app</Link>
        </footer>
      </div>
    </div>
  )
}
