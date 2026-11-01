'use client'

/**
 * The one primary action on the homepage: "Book a 20-minute demo". Every demo link on the page
 * (header, hero) lands here, on one mount of the shared contact form.
 *
 * ⛔ `id="access"` IS LOAD-BEARING OUTSIDE THIS REPOSITORY AND CANNOT BE RENAMED. `lib/seatrade/config.ts`
 * builds `PILOT_URL` as `${SITE_URL}/#access`, and that link is in Seatrade mail already delivered
 * to real inboxes. Those messages cannot be edited. `scripts/check-anchors.mjs` fails the build if
 * it disappears.
 *
 * ⛔ `id="pilot"` LIVES HERE TOO, on the pilot terms. The nav, the footer and `PageNav` carry a Pilot
 * row, and the anchor guard requires it. It used to be `TwoDoorsSection`, unmounted in Batch 1.
 *
 * Conversion Batch 1, 01.11.2026 (goal portlink-landing-conversion-2026-11-01).
 * Chose: one action, the demo, on the existing pilot form (intent `pilot`, unchanged payload and
 *   mail), with the pilot terms, the 90-day trial when it is live, and the build enquiry as the
 *   secondary paths beside it.
 * Over: a booking calendar (a new vendor, excluded by the brief), or a new `demo` intent on
 *   /api/access (changes the mail contract, also excluded).
 * Because: October had three wordings for the action and 0 form submissions in 105 visits; one
 *   low-commitment action measured end to end is the test, and the form already reaches a founder.
 * Revisit-if: the founders want demo requests separated from pilot requests in their inbox, which
 *   is a mail-contract change routed through Starboard.
 */

import { ArrowUpRight } from 'lucide-react'
import { useReveal } from '@/hooks/useReveal'
import ContactForm from '@/components/contact/ContactForm'
import { selfServeUrl } from '@/lib/site'
import styles from './AccessSection.module.css'

/** The pilot's terms. One copy, on one page, in one place (moved here from TwoDoorsSection). */
const pilotTerms = [
  {
    title: 'Shape what gets built',
    body: 'Pilot participants work directly with our team. Your operational reality drives the roadmap, not a feature backlog written by people who have never done a port call.',
  },
  {
    title: 'Founding pricing, permanent',
    body: 'Pilot participants lock in pricing that will not be available at public launch. No promotional asterisk.',
  },
  {
    title: 'Onboarding that actually works',
    body: 'We set you up, migrate your existing data, and stay until your team is running. Not a help article.',
  },
]

export default function AccessSection() {
  const sectionRef = useReveal()

  return (
    <section ref={sectionRef} id="access" className={styles.section} aria-labelledby="access-title">
      <div className={styles.layout}>
        <div className={`reveal ${styles.intro}`}>
          <h2 id="access-title">Book a 20-minute demo</h2>
          <p>Tell us how your port calls run today. David or Kris replies within 48 hours to set a time.</p>
        </div>

        <div className={`reveal ${styles.form}`}>
          <ContactForm intent="pilot" lockIntent />
        </div>

        <div className={`reveal ${styles.aside}`}>
          <div id="pilot" className={styles.pilot}>
            <h3>After the demo, the pilot</h3>
            <ol>
              {pilotTerms.map((term) => (
                <li key={term.title}><strong>{term.title}.</strong> {term.body}</li>
              ))}
            </ol>
            {selfServeUrl && (
              <a href={`${selfServeUrl}/start`} className={styles.link} data-cta="trial-access">
                Or start a 90-day trial <ArrowUpRight size={16} aria-hidden="true" />
              </a>
            )}
          </div>
          <p className={styles.build}>
            Need something built rather than the platform?{' '}
            <a href="/contact/" className={styles.link} data-cta="build-access">
              Tell us what you need <ArrowUpRight size={16} aria-hidden="true" />
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
