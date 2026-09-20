'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { BentoGrid, BentoCard } from '@/components/BentoGrid'
import { Anchor, CheckCircle2 } from 'lucide-react'
import { portCallRoles, type PortCallRole } from './portCallStory'

// ── Abstract mini-visuals ─────────────────────────────────────────────────────

/**
 * One type floor for the mini-visuals, and one row shape.
 *
 * Both exist because the same decision was being made separately in every visual below.
 *
 * `VIZ_TEXT` is the smallest size any text inside a mini-visual renders at, and `VIZ_TEXT_LEAD`
 * the one deliberate step above it. Each visual used to inline its own number, so the page's
 * smallest text was settled in fourteen separate declarations across eleven visuals: 9 px for a
 * calendar letter, 10 px for a node label, an ETA and two card eyebrows, 11 px for most rows and
 * 12 px for the audit trail.
 * Measured on the built page before this change, pressing the section's own role tabs: Port agent
 * rendered 6 strings below 11 px, Tour operator 11 (7 at 9 px, 4 at 10 px) and Port or terminal 12
 * (7 at 9 px, 5 at 10 px), at 390 px and at 1440 px alike. The default Cruise line tab rendered
 * none, which is why a font-size sweep that never presses a tab reports zero for the whole page.
 * `scripts/check-viz-type.mjs` fails the build on a smaller literal, so the next visual inherits
 * the floor rather than having to remember it.
 *
 * `vizRow` is the label-left, value-right row. It carries a gap, and that is the whole fix: a
 * card's visual area is a shrink-to-fit flex item, so the widest row decides the list's width and
 * has no slack left for `space-between` to distribute. Measured at both 390 px and 1440 px,
 * `Costa Fortuna` and `Tomorrow 14:00` rendered exactly 0 px apart and read as one word. A gap is
 * part of the intrinsic width, so it survives where distributed space cannot.
 */
const VIZ_TEXT = 11
const VIZ_TEXT_LEAD = 12

const vizRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
}

function StatusFlow() {
  const steps = ['Pending', 'Reviewing', 'Confirmed']
  const colors = ['var(--text-muted)', 'var(--text-secondary)', 'var(--success)']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            padding: '4px 8px',
            borderRadius: 9999,
            background: i === 2 ? 'rgba(74,124,78,0.1)' : 'var(--bg)',
            border: `1px solid ${colors[i]}`,
            fontSize: VIZ_TEXT,
            fontWeight: 600,
            color: colors[i],
          }}>
            {s}
          </div>
          {i < 2 && <div style={{ width: 12, height: 1, background: 'var(--border)', flexShrink: 0 }} />}
        </div>
      ))}
    </div>
  )
}

function FleetTimeline() {
  const ports = ['MIA', 'BCN', 'PIR', 'DUB', 'SOU']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 48, flexWrap: 'nowrap', maxWidth: '100%' }}>
      {ports.map((p, i) => (
        <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, flex: '1 1 0', minWidth: 0 }}>
          <div style={{
            width: '100%', maxWidth: 28, height: `${22 + i * 4}px`,
            background: i === 2 ? 'var(--brand)' : 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 4,
          }} />
          <span style={{ fontSize: VIZ_TEXT, color: 'var(--text-muted)', fontWeight: 600 }}>{p}</span>
        </div>
      ))}
    </div>
  )
}

function CostCard() {
  const items = [{ l: 'Port dues', v: '€4,200' }, { l: 'Pilotage', v: '€1,800' }, { l: 'Mooring', v: '€950' }]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%', maxWidth: 200 }}>
      {items.map(item => (
        <div key={item.l} style={{ ...vizRow, padding: '3px 8px', background: 'var(--surface)', borderRadius: 6, fontSize: VIZ_TEXT }}>
          <span style={{ color: 'var(--text-muted)' }}>{item.l}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.v}</span>
        </div>
      ))}
    </div>
  )
}

function PortGrid() {
  const ports = ['Barcelona', 'Miami', 'Piraeus', 'Dublin']
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
      {ports.map(p => (
        <div key={p} style={{
          padding: '4px 8px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 6,
          fontSize: VIZ_TEXT, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'center',
        }}>{p}</div>
      ))}
    </div>
  )
}

function NotificationStream() {
  const items = ['MSC Grandiosa · Piraeus', 'Costa Fortuna · Bari', 'Celebrity Edge · Mykonos']
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      {items.map((item, i) => (
        <div key={item} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '4px 10px', borderRadius: 8,
          background: i === 0 ? 'var(--brand-faint)' : 'var(--surface)',
          border: `1px solid ${i === 0 ? 'var(--brand)' : 'var(--border)'}`,
          fontSize: VIZ_TEXT, color: 'var(--text-secondary)',
        }}>
          <Anchor size={10} color="var(--brand)" style={{ flexShrink: 0 }} />
          {item}
        </div>
      ))}
    </div>
  )
}

function DocumentCard() {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '8px 12px', width: '100%', maxWidth: 200,
    }}>
      <div style={{ fontSize: VIZ_TEXT, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>PDA Draft</div>
      {['Port dues', 'Pilotage', 'Agency fee', 'Total'].map((l, i) => (
        <div key={l} style={{
          ...vizRow,
          padding: '2px 0',
          borderTop: i === 3 ? '1px solid var(--border)' : 'none',
          marginTop: i === 3 ? 4 : 0,
          fontSize: VIZ_TEXT,
          color: i === 3 ? 'var(--text-primary)' : 'var(--text-muted)',
          fontWeight: i === 3 ? 600 : 400,
        }}>
          <span>{l}</span>
          <span>€{[4200, 1800, 650, 6650][i].toLocaleString()}</span>
        </div>
      ))}
    </div>
  )
}

function NetworkDiagram() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {['Cruise Line', 'Portlink', 'You'].map((label, i) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i === 1 ? 'var(--brand)' : 'var(--surface)',
              border: `1px solid ${i === 1 ? 'transparent' : 'var(--border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 4px',
            }}>
              <Anchor size={14} color={i === 1 ? 'white' : 'var(--text-muted)'} />
            </div>
            <span style={{ fontSize: VIZ_TEXT, color: 'var(--text-muted)' }}>{label}</span>
          </div>
          {i < 2 && <div style={{ width: 20, height: 1, background: 'var(--brand)', opacity: 0.5 }} />}
        </div>
      ))}
    </div>
  )
}

function VesselList() {
  const vessels = [{ name: 'MSC Grandiosa', eta: 'Today 08:00' }, { name: 'Costa Fortuna', eta: 'Tomorrow 14:00' }]
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {vessels.map(v => (
        <div key={v.name} style={{
          ...vizRow,
          padding: '5px 10px', background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 8,
        }}>
          <span style={{ fontSize: VIZ_TEXT, color: 'var(--text-primary)', fontWeight: 500 }}>{v.name}</span>
          <span style={{ fontSize: VIZ_TEXT, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{v.eta}</span>
        </div>
      ))}
    </div>
  )
}

function CalendarView() {
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const active = [1, 3, 5]
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {days.map((d, i) => (
        <div key={i} style={{
          width: 28, height: 36, borderRadius: 6,
          background: active.includes(i) ? 'var(--brand-faint)' : 'var(--surface)',
          border: `1px solid ${active.includes(i) ? 'var(--brand)' : 'var(--border)'}`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <span style={{ fontSize: VIZ_TEXT, color: active.includes(i) ? 'var(--brand)' : 'var(--text-muted)', fontWeight: 600 }}>{d}</span>
          {active.includes(i) && <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--brand)' }} />}
        </div>
      ))}
    </div>
  )
}

function ShoreRequestCard() {
  return (
    <div style={{
      background: 'var(--bg)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '8px 12px', maxWidth: 220,
    }}>
      <div style={{ fontSize: VIZ_TEXT, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Shore Request</div>
      {[['Port', 'Barcelona'], ['Pax', '3,200'], ['Date', 'Apr 14']].map(([l, v]) => (
        <div key={l} style={{ ...vizRow, fontSize: VIZ_TEXT, padding: '2px 0' }}>
          <span style={{ color: 'var(--text-muted)' }}>{l}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
        </div>
      ))}
    </div>
  )
}

function AuditTrail({ steps = ['Requested', 'Confirmed', 'Delivered'] }: { steps?: string[] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={14} color={i < 2 ? 'var(--ds-success)' : 'var(--border)'} />
          <span style={{ fontSize: VIZ_TEXT_LEAD, color: i < 2 ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: i < 2 ? 500 : 400 }}>{s}</span>
        </div>
      ))}
    </div>
  )
}

// ── Per-persona card data ─────────────────────────────────────────────────────

type BentoItem = {
  title: string
  description: string
  visual: React.ReactNode
  span?: 'full' | 'half' | 'third' | 'two-thirds'
  accent?: boolean
}

const bentoData: Record<PortCallRole, BentoItem[]> = {
  cruise: [
    {
      title: 'Full Fleet Visibility',
      description: 'Every port call, every deployment, one live view. Not a spreadsheet you update by hand.',
      visual: <FleetTimeline />,
      span: 'two-thirds',
    },
    {
      title: 'From Request to Confirmed',
      description: 'Berth request sent. Agent confirmed. Documented in the same place, without an email thread.',
      visual: <StatusFlow />,
      accent: true,
    },
    {
      title: 'PDA Control at Scale',
      description: 'PDAs submitted in a standard format. You review once. No chasing agents for attachments.',
      visual: <CostCard />,
    },
    {
      title: 'Shore Programme Oversight',
      description: 'Monitor approved tour operators and shore excursion offerings per port, per season.',
      visual: <PortGrid />,
      span: 'two-thirds',
    },
  ],
  agent: [
    {
      title: 'All Calls, One Inbox',
      description: 'Every inbound call from every cruise line in one place. Not separate portal logins.',
      visual: <NotificationStream />,
      span: 'two-thirds',
    },
    {
      title: 'Digital PDA Workflow',
      description: 'Build the pro-forma, submit it, track the gap to final, in one workflow, without the spreadsheet.',
      visual: <DocumentCard />,
      accent: true,
    },
    {
      title: 'Your Network, Protected',
      description: 'Portlink surfaces your relationships. Cruise lines connect with you directly, not around you.',
      visual: <NetworkDiagram />,
    },
    {
      title: 'Port Call Timeline',
      description: 'Vessel status, documents and open tasks stay linked to the call, with access for the connected teams.',
      visual: <VesselList />,
      span: 'two-thirds',
    },
  ],
  // The vessel is the fourth operational participant in the actual platform.
  // Evidence: docs/CONNECTED-PORT-CALL.md. The port-authority console is reserved.
  vessel: [
    {
      title: 'The next call, in context',
      description: 'See the port calls ahead and the agent handling each arrival.',
      visual: <CalendarView />,
      span: 'two-thirds',
    },
    {
      title: 'A handover you can follow',
      description: 'Pick up the arrangements and history on the call shared with shoreside.',
      visual: <NetworkDiagram />,
      accent: true,
    },
    {
      title: 'Changes with a decision',
      description: 'Review proposed operational amendments with the old value, the change and its reason together.',
      visual: <AuditTrail steps={['Proposed', 'Under review', 'Acknowledged']} />,
    },
    {
      title: 'Departure, signed together',
      description: 'Confirm the departure sections and co-sign the report with the agent before finance prepares the final account.',
      visual: <AuditTrail steps={['Agent filled', 'Ship confirmed', 'Report co-signed']} />,
      span: 'two-thirds',
    },
  ],
  tour: [
    {
      title: 'Demand You Can Plan Around',
      description: 'Confirmed calls, months out. Plan staffing and pricing before the season starts.',
      visual: <CalendarView />,
      span: 'two-thirds',
    },
    {
      title: 'Structured Shore Requests',
      description: "Every brief arrives in the same format. You respond once. It's on the record.",
      visual: <ShoreRequestCard />,
      accent: true,
    },
    {
      title: 'The call behind the request',
      description: 'Keep the port, arrival and expected passenger count with the shore programme you are quoting.',
      visual: <NetworkDiagram />,
    },
    {
      title: 'Booking Confirmation Trail',
      description: 'Keep requests, quotes and bookings connected to the same port call.',
      visual: <AuditTrail />,
      span: 'two-thirds',
    },
  ],
}

// ── Section ───────────────────────────────────────────────────────────────────

type RoleKey = PortCallRole

const roles = portCallRoles

/**
 * The per-role copy, folded in from the old `RoleSection` on 16.09.2026.
 *
 * It used to live in a second section with a second, independent role switch,
 * so choosing Port Agent there left this section on Cruise Line. Kris asked for
 * one switch — "kun bentogrid endrer seg" — and the page shipped two. Now there
 * is one switch, one state, and the copy and the cards change together.
 */
const roleCopy: Record<RoleKey, { tagline: string; headline: string; body: string; features: string[] }> = {
  cruise: {
    tagline: 'Fleet-wide coordination',
    headline: 'Your entire fleet. One live view.',
    body: 'See every port call across your deployment, prep status, agent confirmations, PDA approvals, shore programme oversight. Without calling anyone.',
    features: [
      'Fleet-wide port call calendar',
      'Real-time agent confirmation status',
      'PDA review and approval',
      'Shore programme oversight',
      'Full audit trail per port call',
    ],
  },
  agent: {
    tagline: 'Port operations hub',
    headline: 'Every vessel. One workspace.',
    body: 'Manage all incoming calls, coordinate services, submit PDAs, and communicate with cruise lines from a single dashboard with full history. Not a stack of portals with separate logins.',
    features: [
      'All cruise line calls in one inbox',
      'Digital PDA workflow',
      'Service coordination dashboard',
      'Document sharing with full versioning',
      'Complete port call history',
    ],
  },
  vessel: {
    tagline: 'Onboard operations',
    headline: 'The call comes onboard with its history.',
    body: 'Work from the call shared with the line and the port agent. Follow the handover, respond to amendments and confirm the departure report.',
    features: [
      'Upcoming port calls',
      'Agent and shoreside contacts',
      'Operational amendment review',
      'Departure section confirmation',
      'Joint departure sign-off',
    ],
  },
  tour: {
    tagline: 'Shore excursions management',
    headline: 'The shore programme, connected to the arrival.',
    body: 'Keep your tour catalogue in one place. Receive shore requests, prepare quotes and manage bookings against the port call they belong to.',
    features: [
      'Tour catalogue management',
      'Structured shore requests',
      'Tour quotes and bookings',
      'Expected passenger counts',
      'Bookings linked to the port call',
    ],
  },
}

/**
 * The role switch, and the only place on the page a role exists.
 *
 * It used to be a gate in front of the whole site and a floating pill that
 * re-keyed five sections. Now the state lives here and nothing outside this
 * component reads it, so "the switch changes the role block and the cards, and
 * nothing else" is a property of the code rather than something to re-check by
 * eye. Everything the role moves is inside `#bento`; everything outside it is
 * the same bytes whichever role is chosen.
 */
export default function BentoSection() {
  const [role, setRole] = useState<RoleKey>('cruise')
  const cards = bentoData[role]
  const copy = roleCopy[role]

  return (
    <section id="roles" style={{ background: 'var(--ds-canvas)', padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', marginBottom: '28px' }}
        >
          <span className="section-eyebrow">Built for your role</span>
          <h2 style={{
            fontSize: 'clamp(1.75rem, 3.6vw, 2.75rem)',
            fontWeight: 700,
            color: 'var(--ds-text-1)',
            letterSpacing: '-0.02em',
            margin: '10px 0 0',
          }}>
            Four roles. One platform.
          </h2>
          <p style={{
            fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
            color: 'var(--ds-text-2)',
            lineHeight: 1.6,
            maxWidth: 560,
            margin: '12px auto 0',
          }}>
            Each team has its own workspace, responsibilities and permissions. The port call connects their work.
          </p>
        </motion.div>

        {/* Everything the switch moves lives in here — including the switch's own
            selected state, which is why the tablist sits inside it. Outside this
            element the page is the same bytes whichever role is chosen. */}
        <div id="bento">
          {/* The switch */}
          <div
            role="tablist"
            aria-label="Choose a role"
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '28px',
            }}
          >
            <div style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: 4,
              padding: 4,
              borderRadius: 'var(--ds-radius-pill)',
              background: 'var(--ds-surface-2)',
              border: '1px solid var(--ds-border-1)',
            }}>
              {roles.map((r) => {
                const Icon = r.icon
                const active = role === r.id
                return (
                  <button
                    key={r.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setRole(r.id)}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 7,
                      padding: '9px 18px',
                      minHeight: 40,
                      borderRadius: 'var(--ds-radius-pill)',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 13,
                      fontWeight: active ? 600 : 500,
                      whiteSpace: 'nowrap',
                      background: active ? 'var(--ds-primary)' : 'transparent',
                      color: active ? 'var(--ds-primary-ink)' : 'var(--ds-text-2)',
                      transition: 'background var(--ds-dur-2) var(--ds-ease-standard), color var(--ds-dur-2) var(--ds-ease-standard)',
                    }}
                  >
                    <Icon size={15} />
                    {r.label}
                  </button>
                )
              })}
            </div>
          </div>

          <motion.div
            key={role}
            /* A fade, with no travel: this block changes because the reader
               pressed a tab, and a translate on a keyboard-driven change is
               motion nobody asked for. */
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 36px)' }}
          >
            <span style={{
              fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em',
              color: 'var(--ds-text-3)', fontWeight: 600,
            }}>
              {copy.tagline}
            </span>
            <h3 style={{
              fontSize: 'clamp(1.25rem, 2.4vw, 1.75rem)',
              fontWeight: 700,
              color: 'var(--ds-text-1)',
              letterSpacing: '-0.02em',
              margin: '8px 0 0',
            }}>
              {copy.headline}
            </h3>
            <p style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
              color: 'var(--ds-text-2)',
              lineHeight: 1.6,
              maxWidth: 620,
              margin: '10px auto 0',
            }}>
              {copy.body}
            </p>

            <ul style={{
              listStyle: 'none',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '10px 24px',
              margin: '18px auto 0',
              padding: 0,
              maxWidth: 860,
            }}>
              {copy.features.map((f) => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={16} color="var(--ds-primary)" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'var(--ds-text-2)' }}>{f}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <BentoGrid columns={3}>
            {cards.map((card, i) => (
              <BentoCard
                key={`${role}-${card.title}`}
                title={card.title}
                description={card.description}
                visual={card.visual}
                span={card.span}
                accent={card.accent}
                delay={i * 0.06}
              />
            ))}
          </BentoGrid>
        </div>
      </div>
    </section>
  )
}
