'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import { ContainerScroll } from '@/components/ContainerScroll'
import DashboardMockup from '@/components/DashboardMockup'

type RoleKey = 'cruise' | 'agent' | 'tour'

interface RoleData {
  label: string
  tagline: string
  headline: string
  body: string
  features: string[]
}

const roleData: Record<RoleKey, RoleData> = {
  cruise: {
    label: 'Cruise Line',
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
    label: 'Port Agent',
    tagline: 'Port Operations Hub',
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
  tour: {
    label: 'Tour Operator',
    tagline: 'Shore Excursions Management',
    headline: 'Enter your tour once. Export to any format.',
    body: 'Publish to the platform. Receive booking requests. Set deadlines that hold. No more filling in nine different RFP formats with the same information for each cruise line.',
    features: [
      'One-time tour listing',
      'Automatic deadline enforcement',
      'Real-time booking counts',
      'Schedule change notifications',
      'Consistent export to any cruise line format',
    ],
  },
}

const tabs: RoleKey[] = ['cruise', 'agent', 'tour']

function RoleContent({ role }: { role: RoleKey }) {
  const data = roleData[role]
  return (
    <div>
      <ContainerScroll
        titleComponent={
          <div>
            <span
              style={{
                display: 'inline-block',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--inverted-text)',
                opacity: 0.5,
                fontWeight: 500,
                marginBottom: '12px',
              }}
            >
              {data.tagline}
            </span>
            <h3
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--inverted-text)',
                margin: '0 0 16px',
                lineHeight: 1.2,
              }}
            >
              {data.headline}
            </h3>
            <p
              style={{
                fontSize: '16px',
                color: 'var(--inverted-text)',
                opacity: 0.7,
                lineHeight: 1.6,
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              {data.body}
            </p>
          </div>
        }
      >
        <DashboardMockup />
      </ContainerScroll>

      <ul
        style={{
          listStyle: 'none',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '20px 28px',
          marginTop: '20px',
          padding: 0,
          maxWidth: '860px',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        {data.features.map((f) => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={18} color="var(--brand-bright)" style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '15px', color: 'var(--inverted-text)' }}>{f}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/**
 * One neutral variant: the three roles as tabs, which reads to any visitor.
 * The tab state is local to this section and drives nothing outside it.
 */
export default function RoleSection() {
  const [activeTab, setActiveTab] = useState<RoleKey>('cruise')
  const sectionRef = useReveal()

  return (
    <section
      ref={sectionRef}
      id="roles"
      style={{ background: 'var(--inverted-bg)', paddingTop: '48px', paddingBottom: '72px', color: 'var(--inverted-text)' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span
              className="reveal"
              style={{
                display: 'inline-block',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'var(--inverted-text)',
                opacity: 0.5,
                fontWeight: 500,
              }}
            >
              Built for your role
            </span>
            <h2
              className="reveal"
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                color: 'var(--inverted-text)',
                margin: '12px 0',
              }}
            >
              Three roles. One platform.
            </h2>
        </div>

        <div
            className="reveal"
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '32px',
              marginBottom: '48px',
              borderBottom: '1px solid var(--dark-border)',
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontFamily: 'inherit',
                  color: activeTab === tab ? 'var(--brand-bright)' : 'var(--inverted-text)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  paddingBottom: '12px',
                  borderBottom: activeTab === tab ? '2px solid var(--brand-bright)' : '2px solid transparent',
                  transition: 'all var(--ds-dur-2) var(--ds-ease-standard)',
                }}
              >
                {roleData[tab].label}
              </button>
            ))}
        </div>

        <div className="reveal">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
            >
              <RoleContent role={activeTab} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
