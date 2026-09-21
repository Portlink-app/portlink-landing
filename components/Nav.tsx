'use client'

import { useEffect, useRef, useState } from 'react'
import { Menu, X, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import styles from './Nav.module.css'

const links = [
  { label: 'Problem', href: '/#pain' },
  { label: 'Platform', href: '/#dashboard' },
  { label: 'Roles', href: '/#roles' },
  { label: 'Pilot', href: '/#pilot' },
  { label: 'Access', href: '/#access' },
  { label: 'Team', href: '/team/' },
  { label: 'Contact', href: '/contact/' },
]

/** One non-modal navigation disclosure for every marketing route. */
export default function Nav() {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const header = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    if (!open) return
    const dismiss = (event: PointerEvent) => {
      if (!header.current?.contains(event.target as Node)) setOpen(false)
    }
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        toggle.current?.focus()
      }
    }
    const desktop = window.matchMedia('(min-width: 1001px)')
    const resize = () => { if (desktop.matches) setOpen(false) }
    document.addEventListener('pointerdown', dismiss)
    document.addEventListener('keydown', escape)
    desktop.addEventListener('change', resize)
    return () => {
      document.removeEventListener('pointerdown', dismiss)
      document.removeEventListener('keydown', escape)
      desktop.removeEventListener('change', resize)
    }
  }, [open])

  return (
    <header ref={header} className={styles.header} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false)
    }}>
      <nav aria-label="Main navigation">
        <div className={styles.bar}>
          <Link href="/" aria-label="Portlink home" className={styles.logo}>
            <img src="/portlink-logo.png" alt="Portlink" className="logo-img" width={107} height={28} />
          </Link>
          <div className={styles.desktop}>
            {links.map((link) => <a key={link.href} href={link.href}>{link.label}</a>)}
          </div>
          <div className={styles.actions}>
            <button className={styles.iconButton} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <a href="/contact/" className={styles.cta}>Contact us</a>
            <button ref={toggle} className={`${styles.iconButton} ${styles.menuToggle}`} onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="main-menu">
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
        <div id="main-menu" className={styles.menu} hidden={!open}>
          {links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)}>{link.label}</a>)}
        </div>
      </nav>
    </header>
  )
}
