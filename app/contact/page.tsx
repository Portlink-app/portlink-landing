import { ogDefaults, twitterDefaults } from '@/lib/metadata'
import PageNav from '@/components/PageNav'
import ContactForm from '@/components/contact/ContactForm'
import { CONTACT_PROMISES } from '@/lib/contact/promises'
import TeamProofSection from '@/components/sections/TeamProofSection'
import Footer from '@/components/sections/Footer'

const title = 'Tell us what you need built · Portlink'
const description =
  'Portlink is a software company for the cruise and port industry. Tell us what your port, terminal, agency, line or tour operation needs built, and one of the two founders replies within 48 hours.'

/* Spread, not declared fresh. Next REPLACES openGraph and twitter rather than merging them, so a
   fresh declaration silently drops og:image, og:site_name and summary_large_image, which is what
   /team measurably did before it was fixed. The defaults carry the card; only the headline is this
   page's own. */
export const metadata = {
  title,
  description,
  alternates: { canonical: '/contact/' },
  openGraph: { ...ogDefaults, title, description, url: '/contact/' },
  twitter: { ...twitterDefaults, title, description },
}

/**
 * The door. It is the second of the two things David asked for on 17.09.2026: a landing page that
 * says Portlink is a software company for this industry, and a page where anyone in it can say what
 * they need built.
 *
 * ⛔ THE THREE PROMISES BELOW ARE ALL CHECKABLE, AND THAT IS THE POINT. "Within 48 hours" is not a
 * new promise invented for this page: `app/api/access/route.ts` has said it in the confirmation
 * mail since before this page existed, and the same route now says it for this intent too. Do not
 * add a customer, a vessel count, an uptime figure, a certification or a "trusted by" here. The
 * company is new; the people are not, and the proof strip at the bottom is the only proof that is
 * both true and ours.
 *
 * ⛔ THE FORM COMES BEFORE THE THREE PROMISES IN THE DOM, AND THAT IS DELIBERATE.
 * Chose: promises after the form in source order, lifted above it by `order` at 768 px and up.
 * Over: promises first in source order, which is how they read on a desktop.
 * Because: the gate on this page is that the first answer control clears the fold on a 390 px
 *   screen. Measured on the built page, the headline, the lede and three multi-line promises put
 *   the first control past it. A phone gets the form; a desktop, where the fold is not in question,
 *   gets the brief's reading order.
 * Revisit-if: the promises are ever shortened to one line each, at which point both can be true
 *   without the override.
 */
export default function ContactPage() {
  return (
    <>
      <PageNav />
      <main id="main" tabIndex={-1}>
        <section
          style={{
            background: 'var(--ds-canvas)',
            padding: 'clamp(40px, 6vw, 72px) clamp(16px, 4vw, 24px) clamp(56px, 8vw, 96px)',
          }}
        >
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <h1
              style={{
                fontSize: 'clamp(2rem, 5vw, 3.25rem)',
                fontWeight: 700,
                color: 'var(--ds-text-1)',
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                margin: 0,
              }}
            >
              Tell us what you need built.
            </h1>
            <p
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                color: 'var(--ds-text-2)',
                lineHeight: 1.6,
                maxWidth: 620,
                margin: '16px 0 0',
              }}
            >
              Portlink is a software company for the cruise and port industry. If you run a port, a
              terminal, an agency, a line or a tour operation, and part of your week still runs on
              email and spreadsheets, describe it here. We read every one of these ourselves.
            </p>

            <div className="contact-stack" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(32px, 5vw, 48px)', marginTop: 'clamp(28px, 4vw, 40px)' }}>
              <div className="contact-form-slot">
                <ContactForm />
              </div>

              <ol className="contact-promises" style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 18 }}>
                {CONTACT_PROMISES.map((item, i) => (
                  <li key={item.lead} style={{ display: 'flex', gap: 14 }}>
                    <span
                      aria-hidden="true"
                      style={{
                        flexShrink: 0,
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        background: 'var(--ds-primary-faint)',
                        border: '1px solid var(--ds-border-1)',
                        color: 'var(--ds-primary)',
                        fontSize: 13,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {i + 1}
                    </span>
                    <span>
                      <span style={{ display: 'block', fontSize: 16, fontWeight: 600, color: 'var(--ds-text-1)', lineHeight: 1.4 }}>
                        {item.lead}
                      </span>
                      <span style={{ fontSize: 14.5, color: 'var(--ds-text-2)', lineHeight: 1.6 }}>
                        {item.body}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <TeamProofSection />

        <section
          style={{
            background: 'var(--ds-surface-2)',
            borderTop: '1px solid var(--ds-border-1)',
            padding: 'clamp(56px, 8vw, 96px) clamp(16px, 4vw, 24px)',
          }}
        >
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <h2
              style={{
                fontSize: 'clamp(1.5rem, 3.2vw, 2.25rem)',
                fontWeight: 700,
                color: 'var(--ds-text-1)',
                letterSpacing: '-0.02em',
                lineHeight: 1.18,
                margin: 0,
              }}
            >
              What we will not do
            </h2>
            <div style={{ display: 'grid', gap: 16, marginTop: 'clamp(18px, 3vw, 24px)' }}>
              {[
                'We do not take work we cannot do well. If what you need sits outside what we know, we say so in the first reply rather than the third meeting.',
                'We do not put you into a sequence. One reply from a person, and nothing after that unless you answer.',
                'We do not claim customers we do not have. Everything on this site is either our own product or our own people’s history, and all of it is checkable.',
              ].map((text) => (
                <p
                  key={text}
                  style={{
                    margin: 0,
                    fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
                    color: 'var(--ds-text-2)',
                    lineHeight: 1.65,
                  }}
                >
                  {text}
                </p>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
