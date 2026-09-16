/**
 * The public draw leaderboard — who is in the draw, and how many entries they hold.
 *
 * WHAT THIS IS, PLAINLY. The draw gives you one entry for confirming your own work email and one
 * more for every colleague you invite who confirms theirs. This turns that into a public table so
 * people can see where they stand. It is the whole point of a referral competition: an invisible
 * score motivates nobody.
 *
 * ⛔ WHAT IT DELIBERATELY DOES NOT PUBLISH, and why the shape is narrow rather than filtered later.
 * These are other people's names, entered on a form that promised a scorecard and a draw, not a
 * public listing. So the row TYPE cannot carry an email, a domain, a lead id, a referral code, a
 * benchmark score or a timestamp - not "we filter them out at the edge", but never in the object,
 * so a future caller cannot leak one by spreading the row into a response. First name and company
 * only, which is what a leaderboard needs to be readable and nothing more.
 *
 * Excluded from the board entirely: unconfirmed sign-ups (they hold no entries anyway),
 * unsubscribed people (leaving means leaving), test leads, and anyone at zero entries.
 */
import { DRAW } from './config'
import { listLeads, tallyEntries, type Lead } from './store'

export interface LeaderRow {
  rank: number
  /** First name only. Never the full name, and never the email it was derived from. */
  name: string
  company: string
  entries: number
}

export interface Leaderboard {
  rows: LeaderRow[]
  /** Everyone holding at least one entry, including those past the `shown` cut. */
  total: number
  /** How many rows are in `rows`. Stated so a truncated board never reads as a complete one. */
  shown: number
  /** Entries in the draw, summed across every eligible person. */
  entriesTotal: number
  closesAt: string
  closesLabel: string
  drawLabel: string
  updatedAt: string
}

/** A display name that cannot carry more than it should: first word, trimmed, length-capped. */
export function firstName(full: string): string {
  const first = (full ?? '').trim().split(/\s+/)[0] ?? ''
  return first.slice(0, 24)
}

export function buildLeaderboard(leads: Lead[], limit: number, now: Date): Leaderboard {
  const tallies = tallyEntries(leads)
  const eligible = leads
    .filter(l => !l.test && l.verifiedAt && !l.unsubscribedAt)
    .map(l => ({ lead: l, entries: tallies.get(l.id)?.entries ?? 0 }))
    .filter(x => x.entries > 0)
    // Most entries first. Ties go to whoever got there first, so the board is stable between
    // polls rather than reshuffling equal scores on every request.
    .sort((a, b) => b.entries - a.entries || a.lead.createdAt.localeCompare(b.lead.createdAt))

  return {
    rows: eligible.slice(0, limit).map((x, i) => ({
      rank: i + 1,
      name: firstName(x.lead.name),
      company: (x.lead.company ?? '').trim().slice(0, 48),
      entries: x.entries,
    })),
    total: eligible.length,
    shown: Math.min(limit, eligible.length),
    entriesTotal: eligible.reduce((sum, x) => sum + x.entries, 0),
    closesAt: DRAW.closesAt,
    closesLabel: DRAW.closesLabel,
    drawLabel: DRAW.drawLabel,
    updatedAt: now.toISOString(),
  }
}

export async function getLeaderboard(limit = 25): Promise<Leaderboard> {
  return buildLeaderboard(await listLeads(), limit, new Date())
}
