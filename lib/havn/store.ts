/**
 * Where a submission from portlink.app/portlink+griegconnect is kept, besides the email.
 *
 * One JSON document per send in the Netlify Blobs store `havn-answers`, keyed by time and a random
 * id, so nothing is ever overwritten and the order of arrival is the sort order. The email is the
 * thing people read tonight; this is the copy an admin surface in the platform imports later
 * (Kris, 22.09.2026: "level 1 now, show it in Portlink admin this week"), so the answers become
 * citable rows instead of being retyped from an inbox.
 *
 * Best effort by design: a failed write is logged and never blocks the send. The email has already
 * proven to reach the inbox; the store is the second copy, not the only one.
 *
 * Same store factory as the Seatrade funnel: on Netlify the credentials are platform-provided;
 * locally, `netlify dev` provides them or NETLIFY_SITE_ID + NETLIFY_AUTH_TOKEN are read from the env.
 */
import { randomUUID } from 'node:crypto'
import { getStore, type Store } from '@netlify/blobs'

export const ANSWER_STORE = 'havn-answers'

export interface Submission {
  id: string
  receivedAt: string
  who: string
  /** Free text per question id. */
  answers: Record<string, string>
  /** Tap-first picks per question id, always an array. */
  choices: Record<string, string[]>
  /** The page's question count at the time, so a later import knows which numbering applied. */
  questionCount: number
  /** Resend message id of the email that carried the same content, for cross-checking. */
  resendId?: string
}

let cached: Store | null = null

function answerStore(): Store {
  if (cached) return cached
  const siteID = process.env.NETLIFY_BLOBS_SITE_ID || process.env.NETLIFY_SITE_ID
  const token = process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN
  cached = siteID && token
    ? getStore({ name: ANSWER_STORE, siteID, token, consistency: 'strong' })
    : getStore({ name: ANSWER_STORE, consistency: 'strong' })
  return cached
}

export function newSubmissionId(): string {
  return randomUUID()
}

/** Key sorts by arrival: an ISO timestamp first, the id after, so a listing reads top to bottom. */
export function submissionKey(s: Pick<Submission, 'id' | 'receivedAt'>): string {
  return `submission/${s.receivedAt}_${s.id}`
}

export async function saveSubmission(s: Submission): Promise<void> {
  await answerStore().setJSON(submissionKey(s), s)
}

export async function listSubmissions(): Promise<Submission[]> {
  const store = answerStore()
  const { blobs } = await store.list({ prefix: 'submission/' })
  const out: Submission[] = []
  for (const b of blobs) {
    const s = (await store.get(b.key, { type: 'json' })) as Submission | null
    if (s) out.push(s)
  }
  return out.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt))
}
