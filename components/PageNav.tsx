'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Sun, Moon } from 'lucide-react'

/* The nav for routes that are not the homepage.
   The homepage Nav scrolls to sections that exist on that page; from anywhere else those same
   destinations have to be real links back to `/`, or every entry dead-ends. Same links, same order,
   same look, different mechanism. */
const links = [
  { label: 'Problem', href: '/#pain' },
  { label: 'Roles', href: '/#roles' },
  { label: 'Platform', href: '/#how' },
  { label: 'Pilot', href: '/#pilot' },
  { label: 'Team', href: '/team/' },
]

const linkStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: 500,
  transition: 'color var(--ds-dur-2) var(--ds-ease-standard)',
}

export default function PageNav() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <nav
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        background: 'var(--nav-glass)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" aria-label="Portlink home" style={{ textDecoration: 'none' }}>
          <img src="/portlink-logo.png" alt="Portlink" className="logo-img" style={{ height: '28px' }} />
        </Link>

        <div className="nav-links-desktop" style={{ display: 'flex', gap: '28px', alignItems: 'center' }}>
          {links.map((link) => (
            <Link key={link.href} href={link.href} style={linkStyle}>
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '9999px',
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
            }}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <Link
            href="/#access"
            className="nav-cta-desktop"
            style={{
              background: 'var(--brand)',
              color: 'var(--ds-primary-ink)',
              padding: '8px 20px',
              borderRadius: '9999px',
              fontSize: '14px',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Request Access
          </Link>

          <button
            className="nav-burger"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
            }}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open ? (
        <div
          style={{
            borderTop: '1px solid var(--border)',
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} style={linkStyle}>
              {link.label}
            </Link>
          ))}
          <Link href="/#access" onClick={() => setOpen(false)} style={{ ...linkStyle, color: 'var(--brand)', fontWeight: 600 }}>
            Request Access
          </Link>
        </div>
      ) : null}
    </nav>
  )
}
