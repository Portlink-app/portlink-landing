import Link from 'next/link'
import SeatradeShell from '@/components/seatrade/Shell'
import ShareBox from '@/components/seatrade/ShareBox'
import { DRAW, PRIZE_NAME, REFERRAL_CAP, SAME_DOMAIN_CAP, TERMS_PATH, drawIsOpen, referralUrl } from '@/lib/seatrade/config'
import { bandFor } from '@/lib/seatrade/scorecard'
import { getLead, getStats, listLeads, tallyEntries, tallyFor } from '@/lib/seatrade/store'

/**
 * portlink.app/seatrade/me/?t=<lead id> — one person's page: score, confirmation status, entries,
 * invitation link and share buttons. Reached from the confirmation click and from every email.
 * Rendered per request; never indexed.
 */
export const dynamic = 'force-dynamic'
export const metadata = { title: 'My entries · Seatrade Med draw · Portlink', robots: { index: false, follow: false } }

const BAND_TONE: Record<string, { fg: string; bg: string }> = {
  smooth: { fg: 'var(--ds-success)', bg: 'var(--ds-success-bg)' },
  choppy: { fg: 'var(--ds-warning)', bg: 'var(--ds-warning-bg)' },
  heavy:  { fg: 'var(--ds-danger)',  bg: 'var(--ds-danger-bg)' },
}

const card: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--ds-radius-xl)', padding: 'var(--ds-gap-6)' }
const label: React.CSSProperties = { display: 'block', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)' }

export default async function MePage({ searchParams }: { searchParams: Promise<{ t?: string; confirmed?: string }> }) {
  const { t = '', confirmed } = await searchParams
  const lead = await getLead(t)

  if (!lead) {
    return (
      <SeatradeShell>
        <div style={{ ...card, textAlign: 'center' }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 1.8rem)', fontWeight: 700, margin: '0 0 10px' }}>This link is not valid.</h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 var(--ds-gap-5)' }}>Use the link in your scorecard email from pilot@portlink.app, or score your port calls to get one.</p>
          <Link href="/seatrade/" style={{ display: 'inline-block', background: 'var(--brand)', color: 'var(--ds-primary-ink)', padding: '14px 28px', borderRadius: 'var(--ds-radius-pill)', fontWeight: 600, textDecoration: 'none' }}>Score your port calls</Link>
        </div>
      </SeatradeShell>
    )
  }

  const [leads, stats] = await Promise.all([listLeads(), getStats({ fresh: true })])
  const tally = tallyFor(lead.id, tallyEntries(leads))
  const band = bandFor(lead.score)
  const tone = BAND_TONE[band.id]
  const url = referralUrl(lead.referralCode)
  const open = drawIsOpen()
  const first = lead.name.trim().split(/\s+/)[0]

  return (
    <SeatradeShell>
      {confirmed === '1' && (
        <div role="status" style={{ background: 'var(--ds-success-bg)', color: 'var(--ds-success)', borderRadius: 'var(--ds-radius-lg)', padding: '12px 16px', fontWeight: 600, marginBottom: 'var(--ds-gap-4)', fontSize: 'var(--ds-text-sm)' }}>
          Email confirmed. Your entry is active.
        </div>
      )}

      <p style={{ ...label, marginBottom: 8 }}>{first}, {lead.company}</p>
      <h1 style={{ fontSize: 'clamp(1.75rem, 6vw, 2.4rem)', fontWeight: 700, lineHeight: 1.1, letterSpacing: 'var(--ds-track-title)', margin: '0 0 var(--ds-gap-5)' }}>
        {lead.verifiedAt ? `You hold ${tally.entries} ${tally.entries === 1 ? 'entry' : 'entries'}` : 'Your entry is not active yet'}
      </h1>

      {!lead.verifiedAt && (
        <div style={{ ...card, borderColor: 'var(--ds-warning)', marginBottom: 'var(--ds-gap-4)' }}>
          <p style={{ margin: '0 0 6px', fontWeight: 700 }}>Confirm your work email to activate it.</p>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--ds-text-sm)', lineHeight: 1.6 }}>
            Open the email from pilot@portlink.app titled &ldquo;Your port call friction score&rdquo; and press <strong>Confirm my email</strong>. Invitations you send count once you are confirmed.
          </p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 'var(--ds-gap-4)' }}>
        <div style={{ background: tone.bg, borderRadius: 'var(--ds-radius-lg)', padding: '14px 12px' }}>
          <span style={{ ...label, color: tone.fg }}>Score</span>
          <span style={{ display: 'block', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.1 }}>{lead.score}</span>
          <span style={{ fontSize: 'var(--ds-text-xs)', color: tone.fg, fontWeight: 600 }}>{band.label}</span>
        </div>
        <div style={{ ...card, padding: '14px 12px', borderRadius: 'var(--ds-radius-lg)' }}>
          <span style={label}>Entries</span>
          <span style={{ display: 'block', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.1 }}>{tally.entries}</span>
          <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)' }}>{lead.verifiedAt ? `1 + ${tally.countedReferrals} invited` : 'needs confirmation'}</span>
        </div>
        <div style={{ ...card, padding: '14px 12px', borderRadius: 'var(--ds-radius-lg)' }}>
          <span style={label}>Leader</span>
          <span style={{ display: 'block', fontSize: '1.9rem', fontWeight: 800, lineHeight: 1.1 }}>{stats.topEntries}</span>
          <span style={{ fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)' }}>most entries so far</span>
        </div>
      </div>

      <div style={{ ...card, marginBottom: 'var(--ds-gap-4)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 700 }}>Invitations</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--ds-text-sm)' }}>
          <tbody>
            <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Confirmed their work email</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{tally.verifiedReferrals}</td></tr>
            <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Signed up, not confirmed yet</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{tally.pendingReferrals}</td></tr>
            <tr><td style={{ padding: '6px 0', color: 'var(--text-secondary)' }}>Counting as entries</td><td style={{ padding: '6px 0', textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{tally.countedReferrals} of {REFERRAL_CAP}</td></tr>
          </tbody>
        </table>
        <p style={{ margin: '10px 0 0', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          One entry per confirmed person you invite, up to {REFERRAL_CAP}; at most {SAME_DOMAIN_CAP} from your own company. People are counted once, whoever invited them first.
        </p>
      </div>

      {open ? (
        <ShareBox url={url} code={lead.referralCode} prize={PRIZE_NAME} />
      ) : (
        <div style={card}><p style={{ margin: 0, color: 'var(--text-secondary)' }}>Entries closed on {DRAW.closesLabel}. The draw is on {DRAW.drawLabel}; the winner is notified by email.</p></div>
      )}

      <p style={{ margin: 'var(--ds-gap-5) 0 0', fontSize: 'var(--ds-text-xs)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        The draw for {PRIZE_NAME}: entries close {DRAW.closesLabel}, drawn {DRAW.drawLabel}. <Link href={TERMS_PATH} style={{ color: 'var(--text-muted)' }}>Terms</Link> · <Link href="/seatrade/report/" style={{ color: 'var(--text-muted)' }}>Live benchmark</Link>
      </p>
    </SeatradeShell>
  )
}
