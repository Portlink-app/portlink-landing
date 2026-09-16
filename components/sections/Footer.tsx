'use client'

const navLinks = {
  Product: [
    { label: 'Features', href: '#how' },
    { label: 'Roles', href: '#roles' },
    { label: 'Pilot Program', href: '#pilot' },
    { label: 'Request Access', href: '#access' },
  ],
  Company: [
    { label: 'Team', href: '/team/' },
    { label: 'About', href: '#' },
    { label: 'Blog', href: 'https://www.linkedin.com/company/portlink-app/' },
    { label: 'Contact', href: '#access' },
    { label: 'Privacy', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bg)',
        borderTop: '1px solid var(--border)',
        padding: '64px 24px 32px',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '48px',
        }}
        className="footer-grid"
      >
        {/* Logo + tagline */}
        <div>
          <div style={{ marginBottom: '12px' }}>
            <img
              src="/portlink-logo.png"
              alt="Portlink"
              className="logo-img"
              style={{ height: '28px' }}
            />
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '300px' }}>
            The port call platform. Connecting cruise lines, port agents, and tour operators in one shared workspace.
          </p>
        </div>

        {/* Nav columns */}
        {Object.entries(navLinks).map(([category, links]) => (
          <div key={category}>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '16px',
              }}
            >
              {category}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    // An off-site link opens in a new tab and drops the opener, derived from the
                    // href rather than flagged per row, so the next external link inherits it.
                    {...(link.href.startsWith('http')
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    style={{
                      color: 'var(--text-muted)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'color var(--ds-dur-2) var(--ds-ease-standard)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Copyright */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '48px auto 0',
          borderTop: '1px solid var(--border)',
          paddingTop: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Portlink AS. All rights reserved.
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Made in Oslo, Norway
        </p>
      </div>
    </footer>
  )
}
