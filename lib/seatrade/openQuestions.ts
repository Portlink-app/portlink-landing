/**
 * The two open questions asked AFTER the entry is secured.
 *
 * Placement is the whole point: a free-text box in front of the email capture is where a visitor
 * on a show floor abandons. These are shown on the "sent" screen, once the scorecard is on its way
 * and the entry exists, and both are optional - a blank answer is a valid answer and never touches
 * the entry, the verification, the referral count or the benchmark.
 *
 * Pure module, no React and no Node APIs: the client form, the API route that stores the answers
 * and the admin email all read the question text from here, so there is one wording to change.
 */

export type OpenQuestionId = 'friction' | 'wish'

export interface OpenQuestion {
  id: OpenQuestionId
  /** The question itself. Also the heading in the admin email. */
  label: string
  placeholder: string
}

export const OPEN_QUESTIONS: readonly OpenQuestion[] = [
  {
    id: 'friction',
    label: 'Think of the last port call that went wrong. What happened?',
    placeholder: 'e.g. the berth moved and nobody told the tour operators until the coaches were already there',
  },
  {
    id: 'wish',
    label: 'If one thing about your port calls could change tomorrow, what would you change?',
    placeholder: 'e.g. one place everyone checks, instead of six inboxes and a phone tree',
  },
] as const

/** Per answer. Generous enough for a real story, short enough that the blob stays small. */
export const OPEN_ANSWER_MAX = 1200

export type OpenAnswers = Partial<Record<OpenQuestionId, string>> & { savedAt?: string }

/** Trim, cap, and drop the empties. Returns null when nothing usable was written. */
export function cleanOpenAnswers(raw: unknown): OpenAnswers | null {
  if (!raw || typeof raw !== 'object') return null
  const src = raw as Record<string, unknown>
  const out: OpenAnswers = {}
  for (const q of OPEN_QUESTIONS) {
    const v = src[q.id]
    if (typeof v !== 'string') continue
    const text = v.trim().slice(0, OPEN_ANSWER_MAX)
    if (text) out[q.id] = text
  }
  return Object.keys(out).length ? out : null
}

/** Same answers, ignoring when they were written. Stops a re-submit mailing the admin twice. */
export function sameOpenAnswers(a: OpenAnswers | undefined, b: OpenAnswers): boolean {
  if (!a) return false
  return OPEN_QUESTIONS.every(q => (a[q.id] ?? '') === (b[q.id] ?? ''))
}
