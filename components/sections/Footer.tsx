import styles from './Footer.module.css'
import Link from 'next/link'

const navLinks = {
  Product: [
    { label: 'Platform', href: '/#dashboard' },
    { label: 'Roles', href: '/#roles' },
    { label: 'Pilot program', href: '/#pilot' },
    { label: 'Request access', href: '/#access' },
  ],
  Company: [
    { label: 'Team', href: '/team/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/portlink-app/' },
    { label: 'Contact', href: '/contact/' },
    { label: 'Privacy', href: '/privacy/' },
  ],
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>
        <div className={styles.identity}>
          <Link href="/" aria-label="Portlink home"><img src="/portlink-logo.png" alt="Portlink" className="logo-img" width={107} height={28} /></Link>
          <p>The port call platform. Connecting cruise lines, port agents, tour operators and vessels through the same port call.</p>
        </div>
        {Object.entries(navLinks).map(([category, links]) => (
          <nav key={category} aria-label={`${category} links`}>
            <h2>{category}</h2>
            <ul>{links.map((link) => (
              <li key={link.href}><a href={link.href} {...(link.href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{link.label}</a></li>
            ))}</ul>
          </nav>
        ))}
      </div>
      <div className={styles.legal}>
        <p>© {new Date().getFullYear()} Portlink AS. All rights reserved.</p>
        <p>Made in Oslo, Norway</p>
      </div>
    </footer>
  )
}
