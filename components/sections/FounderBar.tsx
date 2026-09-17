'use client'

/**
 * Who builds it, in three sentences, immediately under the hero.
 *
 * The hero now claims a company rather than a product, and the first question a reader has about a
 * company they have not heard of is who is behind it. This answers it before the page asks for
 * anything, in text only: no photographs, no logos, no cards. `TeamProofSection` further down does
 * the faces, and repeating them here would make the top of the page a team page.
 *
 * ⛔ BOTH FACTS ARE READ FROM `founders`, NEVER RETYPED. `short` is the same string `/team/` and the
 * proof strip render, so a role or an employer corrected in one place is corrected on all three.
 * The homepage used to consume only `everyone`, which is why this file exists to consume `founders`
 * instead of carrying its own copy of two CVs.
 *
 * ⛔ THE THIRD SENTENCE IS NOT OPTIONAL. Without it, four employer names in a row read as a client
 * list, which is the one claim this site must never make: we have no customers to name yet. It is
 * the sentence that turns a CV into a disclaimer, so it stays even if the layout changes.
 */

import { useReveal } from '@/hooks/useReveal'
import { founders } from './team-members'

/* Kris first: the reader has just been told this is maritime software, and the maritime half of the
   pair is the one that earns the sentence. Selected by name rather than by index, so a reorder in
   team-members.ts cannot silently swap them. */
const ORDER = ['Kris Willassen', 'David Bakke'] as const

export default function FounderBar() {
  const sectionRef = useReveal()
  const people = ORDER.map((name) => founders.find((f) => f.name === name)).filter(
    (f): f is NonNullable<typeof f> => Boolean(f),
  )

  return (
    <section
      ref={sectionRef}
      id="founders"
      style={{
        background: 'var(--ds-surface-2)',
        borderTop: '1px solid var(--ds-border-1)',
        borderBottom: '1px solid var(--ds-border-1)',
        padding: 'clamp(40px, 6vw, 64px) clamp(16px, 4vw, 24px)',
      }}
    >
      <div style={{ maxWidth: 780, margin: '0 auto' }}>
        <span
          className="reveal section-eyebrow"
          style={{ display: 'inline-block', marginBottom: 14 }}
        >
          Who builds it
        </span>

        <ul
          className="reveal"
          style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}
        >
          {people.map((person) => (
            <li
              key={person.name}
              style={{
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                color: 'var(--ds-text-1)',
                lineHeight: 1.55,
              }}
            >
              <strong style={{ fontWeight: 700 }}>{person.name.split(' ')[0]}</strong>{' '}
              <span style={{ color: 'var(--ds-text-2)' }}>{person.short}</span>
            </li>
          ))}
        </ul>

        <p
          className="reveal"
          style={{
            margin: '18px 0 0',
            fontSize: 'clamp(0.95rem, 1.4vw, 1.0625rem)',
            color: 'var(--ds-text-2)',
            lineHeight: 1.6,
          }}
        >
          Those are not our customers. They are where we learned the two halves of this.
        </p>
      </div>
    </section>
  )
}
