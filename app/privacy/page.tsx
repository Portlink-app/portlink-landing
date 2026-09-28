/**
 * /privacy/ — what Portlink's website collects, why, and how to get rid of it.
 *
 * WHY THIS EXISTS. The footer carried a Privacy link pointing at href="#", so it scrolled to the top
 * and read as broken on a site that collects work email addresses at a trade show. The draw already
 * had a "Your data" section in its own terms, but that covers the draw only: the access request form
 * collects more fields than the draw does and was described nowhere.
 *
 * EVERY CLAIM BELOW IS READ OUT OF THE CODE, not drafted as policy:
 *   - access form fields: the AccessRequest interface in app/api/access/route.ts
 *   - access form storage: that route only calls resend.emails.send twice. It stores nothing.
 *   - draw fields and storage: the Lead interface in lib/seatrade/store.ts, saved to Netlify Blobs
 *   - audience: resend.contacts.create against RESEND_AUDIENCE_ID in app/api/seatrade/route.ts
 *   - leaderboard exposure: lib/seatrade/leaderboard.ts, first name and company only
 * If one of those changes, this page is wrong and must change in the same commit.
 */
import Link from 'next/link'
import PageNav from '@/components/PageNav'
import Footer from '@/components/sections/Footer'
import { ADMIN_EMAIL, TERMS_PATH } from '@/lib/seatrade/config'

export const metadata = {
  title: 'Privacy · Portlink',
  description: 'What the Portlink website collects, why, where it is stored, and how to have it deleted.',
}

const h: React.CSSProperties = { fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)', margin: '36px 0 10px' }
const p: React.CSSProperties = { fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 14px' }

export default function Privacy() {
  return (
    <>
      <PageNav />
      <main id="main" tabIndex={-1} style={{ background: 'var(--bg)', padding: '120px 24px 80px' }}>
        <div style={{ maxWidth: '720px', margin: '0 auto' }}>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
            Privacy
          </h1>
          <p style={{ ...p, color: 'var(--text-muted)' }}>
            Two forms on this website collect personal data. This page says what each one takes, what
            happens to it, and how to have it removed. Nothing else on the site collects anything about you.
          </p>

          <h2 style={h}>Requesting pilot access</h2>
          <p style={p}>
            The access form takes your name, work email, company and role, plus the operational questions
            shown for your role, such as fleet size, port calls per year, the tools you use today and the
            ports you work. There is an optional message field.
          </p>
          <p style={p}>
            <strong>This form stores nothing.</strong> It sends two emails through Resend and keeps no
            database record: one confirmation to you, one notification to us. Your data then lives in our
            mailbox, the same as any email you send us.
          </p>

          <h2 style={h}>The Seatrade draw and benchmark</h2>
          <p style={p}>
            The draw takes your name, work email, company, your seven benchmark answers, anything you write
            in the two optional open questions we show once your entry is in, and, if you arrived through a
            colleague&rsquo;s link, who invited you. That record is stored on Netlify Blobs and is
            what runs the draw, produces your scorecard and feeds the live benchmark in anonymous aggregate.
            Confirming your work email is what activates an entry.
          </p>
          <p style={p}>
            Agreeing to the Portlink newsletter is a condition of entering the draw, and it is stated before
            the questions begin. Your email is added to our Resend audience so we can send it, together with
            the emails described in the <Link href={TERMS_PATH} style={{ color: 'var(--brand)' }}>draw terms</Link>.
            The newsletter has no end date, every message carries an unsubscribe link, and unsubscribing does
            not withdraw your entry.
          </p>

          <h2 style={h}>The public standings</h2>
          <p style={p}>
            The draw has a public leaderboard. It shows <strong>first name, company and number of
            entries</strong>. It never shows an email address, an email domain or your benchmark score, and
            people who have unsubscribed are not listed at all. Ask us and we will take you off the board
            while keeping your entries.
          </p>

          <h2 style={h}>Where it is stored, and who else sees it</h2>
          <p style={p}>
            Website hosting and the draw records are on Netlify. Email is sent through Resend in their EU
            region. We do not sell anything to anyone, and we do not share your details with other
            participants beyond the first name and company on the standings above.
          </p>

          <h2 style={h}>Getting rid of it</h2>
          <p style={p}>
            Write to <a href={`mailto:${ADMIN_EMAIL}`} style={{ color: 'var(--brand)' }}>{ADMIN_EMAIL}</a> and
            say what you want: off the mailing list, off the standings, out of the draw, or deleted entirely.
            Deleting your record removes your entries too, which is the one trade-off worth knowing before
            you ask. We will confirm when it is done.
          </p>

          <p style={{ ...p, color: 'var(--text-muted)', marginTop: '36px' }}>
            Questions about any of this go to the same address.
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
