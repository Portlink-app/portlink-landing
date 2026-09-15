'use client'

import { useReveal } from '@/hooks/useReveal'

type Member = {
  name: string
  role: string
  bio?: string
  affiliation?: string
  href?: string
  photo: string
}

/* Founders first, then advisors. Both founders carry the same role and the same shape of sentence:
   no CEO, no chair, nothing that ranks one above the other (David, 15.09.2026). Each line leads
   with the expertise the person brings rather than a title, and carries only what their own CV
   states: nobody's biography is written here on their behalf.
   The advisors' positions are the ones they publish themselves at pallefabrik.dk. */
const founders: Member[] = [
  {
    name: 'David Bakke',
    role: 'Co-Founder',
    bio: 'Digital product and e-commerce. Sixteen years building and running digital services at Volkswagen Møller Bilfinans, Telenor and Nortura, with executive education in artificial intelligence at MIT.',
    photo: '/team/david.jpg',
  },
  {
    name: 'Kris Willassen',
    role: 'Co-Founder',
    bio: 'Cruise port operations. A decade of itinerary planning, deployment and nautical planning at SeaDream Yacht Club and Hurtigruten Expeditions, including expedition compliance and permitting, on top of training in nautical navigation.',
    photo: '/team/kris.jpg',
  },
]

const advisors: Member[] = [
  {
    name: 'Dann Handberg Madsen',
    role: 'Advisor and Investor',
    affiliation: 'CEO and owner, Pallefabrik',
    href: 'https://www.pallefabrik.dk/kontakt-os',
    photo: '/team/dann.jpg',
  },
  {
    name: 'Leo Hansen',
    role: 'Advisor',
    affiliation: 'CFO, Pallefabrik',
    href: 'https://www.pallefabrik.dk/kontakt-os',
    photo: '/team/leo.jpg',
  },
]

function Person({ member }: { member: Member }) {
  const affiliation = member.affiliation ? (
    member.href ? (
      <a
        href={member.href}
        target="_blank"
        rel="noreferrer"
        style={{ color: 'var(--text-muted)', textDecoration: 'none', borderBottom: '1px solid var(--border)' }}
      >
        {member.affiliation}
      </a>
    ) : (
      <span style={{ color: 'var(--text-muted)' }}>{member.affiliation}</span>
    )
  ) : null

  return (
    <div className="reveal" style={{ textAlign: 'center' }}>
      <img
        src={member.photo}
        alt={member.name}
        width={200}
        height={200}
        loading="lazy"
        style={{
          width: '160px',
          height: '160px',
          objectFit: 'cover',
          borderRadius: '50%',
          background: 'var(--color-surface-sunken, var(--bg))',
          border: '1px solid var(--border)',
          /* globals.css sets `img { display: block }`, so textAlign cannot centre these.
             Centre the box itself rather than relying on inline-level alignment. */
          display: 'block',
          margin: '0 auto 20px',
        }}
      />
      <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '4px' }}>{member.name}</div>
      <div style={{ fontSize: '14px', color: 'var(--brand)', fontWeight: 500 }}>{member.role}</div>
      {affiliation ? <div style={{ fontSize: '13px', marginTop: '6px' }}>{affiliation}</div> : null}
      {member.bio ? (
        <p
          style={{
            marginTop: '12px',
            fontSize: '14px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            maxWidth: '260px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          {member.bio}
        </p>
      ) : null}
    </div>
  )
}

export default function TeamSection({ heading = true }: { heading?: boolean }) {
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="team"
      className="section-pad"
      style={{ background: 'var(--bg)', padding: '120px 24px' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        {heading ? (
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span
              className="reveal"
              style={{
                display: 'inline-block',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--text-muted)',
                fontWeight: 500,
              }}
            >
              Our team
            </span>
            <h2 className="reveal" style={{ marginTop: '16px', fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.15 }}>
              The people building Portlink
            </h2>
            <p
              className="reveal"
              style={{
                marginTop: '16px',
                maxWidth: '620px',
                marginLeft: 'auto',
                marginRight: 'auto',
                color: 'var(--text-muted)',
                fontSize: '17px',
                lineHeight: 1.6,
              }}
            >
              Portlink is built by people who have run port calls, not by people who have read about them.
              We are a small team, and we are advised by operators who have grown a logistics business of their own.
            </p>
          </div>
        ) : null}

        <div
          className="team-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px 32px',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          {founders.map((m) => (
            <Person key={m.name} member={m} />
          ))}
        </div>

        <div style={{ textAlign: 'center', margin: '72px 0 40px' }}>
          <span
            style={{
              display: 'inline-block',
              fontSize: '12px',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: 'var(--text-muted)',
              fontWeight: 500,
            }}
          >
            Advisors
          </span>
        </div>

        <div
          className="team-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '48px 32px',
            maxWidth: '560px',
            margin: '0 auto',
          }}
        >
          {advisors.map((m) => (
            <Person key={m.name} member={m} />
          ))}
        </div>
      </div>
    </section>
  )
}
