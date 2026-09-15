import Link from 'next/link'
import SeatradeShell from '@/components/seatrade/Shell'
import { DRAW, EVENT, PRIZE_NAME, REFERRAL_CAP, SAME_DOMAIN_CAP } from '@/lib/seatrade/config'

export const metadata = { title: 'Draw terms · Seatrade Med · Portlink', description: `Terms of the Portlink Seatrade Cruise Med 2026 draw for ${PRIZE_NAME}.` }

const h: React.CSSProperties = { fontSize: '1.05rem', fontWeight: 700, margin: 'var(--ds-gap-6) 0 6px' }
const p: React.CSSProperties = { margin: '0 0 10px', color: 'var(--text-secondary)', lineHeight: 1.65, fontSize: 'var(--ds-text-sm)' }

/** Plain-language terms. Reviewed by Portlink AS before publication; one place to edit. */
export default function TermsPage() {
  return (
    <SeatradeShell>
      <p style={{ fontSize: 'var(--ds-text-xs)', textTransform: 'uppercase', letterSpacing: 'var(--ds-track-caps)', color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 8px' }}>Draw terms</p>
      <h1 style={{ fontSize: 'clamp(1.6rem, 6vw, 2.2rem)', fontWeight: 700, lineHeight: 1.15, margin: '0 0 var(--ds-gap-4)' }}>The Portlink draw at {EVENT.name}</h1>
      <p style={p}>Short version: score your port calls, confirm your work email, invite colleagues, and you may win {PRIZE_NAME}. The details, in plain language:</p>

      <h2 style={h}>Who runs it</h2>
      <p style={p}>Portlink AS, Oslo, Norway (&ldquo;Portlink&rdquo;). Questions: reply to any email from pilot@portlink.app.</p>

      <h2 style={h}>Who can enter</h2>
      <p style={p}>People aged 18 or over who work in the cruise and maritime industry: cruise lines, port agents, ports and terminals, tour operators and destination management companies, and other industry roles. You enter with your work email address at your employer&rsquo;s domain. Free-mail and temporary addresses are not accepted. Portlink employees and their families cannot enter. No purchase is necessary.</p>

      <h2 style={h}>How to enter, and how entries are counted</h2>
      <p style={p}>Complete the port call friction score at portlink.app/seatrade and confirm your email through the link we send you. A confirmed sign-up is one entry. Every person who signs up through your invitation link and confirms their own work email adds one entry for you, up to {REFERRAL_CAP} such entries; at most {SAME_DOMAIN_CAP} of them may come from your own email domain. Each person counts once, for whoever invited them first. One sign-up per person; duplicate or automated sign-ups, aliases and addresses that do not belong to the person entering are removed.</p>

      <h2 style={h}>Dates</h2>
      <p style={p}>Entries close {DRAW.closesLabel}. The draw takes place on {DRAW.drawLabel}.</p>

      <h2 style={h}>The draw and the prize</h2>
      <p style={p}>One winner is drawn at random, with each entry an equal chance, from all eligible entries. Portlink checks that the winner meets the eligibility rules before the prize is confirmed. The prize is {PRIZE_NAME}; Portlink may substitute a prize of equal or greater value if the announced prize is unavailable. There is no cash alternative. The prize is not transferable. Any tax due on the prize is the winner&rsquo;s responsibility.</p>

      <h2 style={h}>Winner notification</h2>
      <p style={p}>The winner is notified by email within three days of the draw and must reply within seven days with a delivery address. If they do not, or are found ineligible, a new winner is drawn. The winner&rsquo;s first name and company may be announced by Portlink, with their agreement.</p>

      <h2 style={h}>Your data</h2>
      <p style={p}>Your name, work email, company and answers are used to run the draw, to send you your scorecard and up to three follow-up emails about Portlink, and, in anonymous aggregate, for the live benchmark. Unsubscribing from emails does not withdraw your entry; reply to any email to withdraw or to have your data deleted. Data is stored on Netlify (EU/US) and emails are sent through Resend (EU region). Portlink&rsquo;s privacy contact: reply to pilot@portlink.app.</p>

      <h2 style={h}>The rest</h2>
      <p style={p}>The draw is not sponsored, endorsed or administered by the organisers of {EVENT.name}, by Apple, or by any other third party. Portlink may cancel or amend the draw if it cannot be run as planned. Norwegian law applies. By entering you accept these terms.</p>

      <p style={{ ...p, marginTop: 'var(--ds-gap-6)' }}><Link href="/seatrade/" style={{ color: 'var(--brand)', fontWeight: 600 }}>Score your port calls</Link></p>
    </SeatradeShell>
  )
}
