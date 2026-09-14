/**
 * The Seatrade funnel emails. Four to the lead, one to the admin.
 *
 *   e1  immediately   "Your port call friction score: 72/100"   score, findings, role line, reply CTA
 *   e2  +2 days       "How Seatrade Med scored"                  live benchmark link, 20-min walkthrough
 *   e3  +6 days       "The three changes that remove the most friction"   the fixes, tied to their answers
 *   e4  +12 days      "Founding pilot seats for the Med"         the pilot, founding pricing, request access
 *
 * e2–e4 are booked with Resend `scheduledAt` at sign-up, so their HTML is frozen at that moment.
 * That is why e2 links to the live report instead of quoting numbers. Changing copy here changes
 * future sign-ups only; already-scheduled sends keep the old copy (cancel + rebook to replace).
 *
 * Every lead email carries an unsubscribe link and List-Unsubscribe headers. Plain HTML, inline
 * styles, hex colours (see lib/email/wrap.ts for why).
 */
import { ctaButton, escapeHtml as esc, wrap } from '@/lib/email/wrap'
import { EVENT, PILOT_URL, REPORT_PATH, SITE_URL } from './config'
import { ROLE_LABELS, ROLE_LINES, type Finding, type ScoreResult, QUESTIONS, type Answers } from './scorecard'

export interface LeadEmailInput {
  id: string
  name: string
  email: string
  company: string
  answers: Answers
  result: ScoreResult
}

export interface RenderedEmail {
  subject: string
  html: string
  text: string
}

export function unsubscribeUrl(id: string): string {
  return `${SITE_URL}/api/seatrade/unsubscribe/?t=${id}`
}

export function unsubscribeHeaders(id: string): Record<string, string> {
  return {
    'List-Unsubscribe': `<${unsubscribeUrl(id)}>`,
    'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
  }
}

function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'there'
}

function unsubFooter(id: string): string {
  return `You are getting this because you asked for your port call friction score at ${esc(EVENT.name)}. <a href="${unsubscribeUrl(id)}" style="color:#94a3b8">Unsubscribe</a> in one click.`
}

const BAND_COLOUR: Record<string, string> = {
  smooth: '#2f855a',
  choppy: '#b7791f',
  heavy:  '#c53030',
}

function scoreBlock(result: ScoreResult): string {
  const colour = BAND_COLOUR[result.band.id] ?? '#3d7daf'
  return `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 24px;background:#f0f6fb;border-radius:12px">
      <tr>
        <td style="padding:22px 24px;vertical-align:middle;width:120px">
          <span style="display:block;font-size:44px;font-weight:800;line-height:1;color:#111827">${result.score}</span>
          <span style="display:block;font-size:12px;color:#6b7280;margin-top:4px">out of 100</span>
        </td>
        <td style="padding:22px 24px 22px 0;vertical-align:middle">
          <span style="display:inline-block;background:${colour};color:#ffffff;font-size:12px;font-weight:700;padding:4px 12px;border-radius:9999px;letter-spacing:0.03em;text-transform:uppercase">${esc(result.band.label)}</span>
          <p style="margin:10px 0 0;font-size:14px;color:#374151;line-height:1.6">${esc(result.band.descriptor)}</p>
        </td>
      </tr>
    </table>`
}

function findingsBlock(findings: Finding[]): string {
  return findings.map((f, i) => `
    <table cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 12px">
      <tr>
        <td style="width:28px;vertical-align:top;padding:2px 10px 0 0;font-size:14px;font-weight:700;color:#3d7daf">${i + 1}.</td>
        <td style="vertical-align:top">
          <p style="margin:0 0 4px;font-size:15px;font-weight:600;color:#111827;line-height:1.45">${esc(f.title)}</p>
          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${esc(f.body)}</p>
        </td>
      </tr>
    </table>`).join('')
}

function p(text: string, extra = ''): string {
  return `<p style="margin:0 0 18px;font-size:15px;color:#374151;line-height:1.7;${extra}">${text}</p>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#111827;line-height:1.3">${text}</h1>`
}

function signoff(): string {
  return p('Talk soon,<br>David Bakke, Portlink', 'margin-top:8px')
}

function textify(lines: string[]): string {
  return lines.join('\n\n') + '\n'
}

// ── e1: the scorecard ─────────────────────────────────────────────────────────

export function renderE1(lead: LeadEmailInput): RenderedEmail {
  const { result } = lead
  const role = lead.answers.role
  const roleLine = ROLE_LINES[role] ?? ROLE_LINES.other
  const reportUrl = `${SITE_URL}${REPORT_PATH}`

  const html = wrap(`
    ${h1(`Your port call friction score: ${result.score}/100`)}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`Here is the scorecard you asked for at ${esc(EVENT.name)}. Based on your answers for <strong>${esc(lead.company)}</strong>:`)}
    ${scoreBlock(result)}
    <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Where the friction is</p>
    ${findingsBlock(result.findings)}
    ${p(roleLine, 'margin-top:20px')}
    ${p(`If you want to see this on one of your own port calls, reply to this email. We are in ${esc(EVENT.city)} this week and can do 15 minutes at the terminal, or a short call after the show.`)}
    ${ctaButton(reportUrl, 'See how the show is scoring')}
    ${signoff()}
  `, { preheader: `${result.band.label}. Your findings and what to do about them.`, footerNote: unsubFooter(lead.id) })

  const text = textify([
    `Your port call friction score: ${result.score}/100 (${result.band.label})`,
    `Hi ${firstName(lead.name)},`,
    `Here is the scorecard you asked for at ${EVENT.name}, based on your answers for ${lead.company}.`,
    result.band.descriptor,
    'Where the friction is:',
    ...result.findings.map((f, i) => `${i + 1}. ${f.title}\n   ${f.body}`),
    roleLine,
    `If you want to see this on one of your own port calls, reply to this email. We are in ${EVENT.city} this week and can do 15 minutes at the terminal, or a short call after the show.`,
    `How the show is scoring: ${reportUrl}`,
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(lead.id)}`,
  ])

  return { subject: `Your port call friction score: ${result.score}/100`, html, text }
}

// ── e2: the benchmark ─────────────────────────────────────────────────────────

export function renderE2(lead: LeadEmailInput): RenderedEmail {
  const reportUrl = `${SITE_URL}${REPORT_PATH}`
  const roleLabel = (ROLE_LABELS[lead.answers.role] ?? 'your role').toLowerCase()
  const roleLine = ROLE_LINES[lead.answers.role] ?? ROLE_LINES.other

  const html = wrap(`
    ${h1('How Seatrade Med scored')}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`${esc(EVENT.name)} is over. Everyone who scanned the code answered the same seven questions, and the benchmark is live: how much of the Med's port calls still run on email, how many times one call gets re-typed, and how changes actually reach the other parties.`)}
    ${p(`You scored <strong>${lead.result.score}/100</strong>. The page shows where that sits against the rest of the room, and the numbers keep updating as more people answer.`)}
    ${ctaButton(reportUrl, 'Open the live benchmark')}
    ${p(`On the ${esc(roleLabel)} side, this is what Portlink changes:`, 'margin-top:28px')}
    ${p(roleLine)}
    ${p('If you would like to see it on your own port calls, reply to this email and we will set up 20 minutes. Screen share, real data, no slides.')}
    ${signoff()}
  `, { preheader: 'The live benchmark from Las Palmas, and where you sit in it.', footerNote: unsubFooter(lead.id) })

  const text = textify([
    'How Seatrade Med scored',
    `Hi ${firstName(lead.name)},`,
    `${EVENT.name} is over. Everyone who scanned the code answered the same seven questions, and the benchmark is live.`,
    `You scored ${lead.result.score}/100. See where that sits: ${reportUrl}`,
    roleLine,
    'If you would like to see it on your own port calls, reply to this email and we will set up 20 minutes.',
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(lead.id)}`,
  ])

  return { subject: 'How Seatrade Med scored', html, text }
}

// ── e3: the three fixes ───────────────────────────────────────────────────────

const FIXES: Finding[] = [
  {
    title: 'One record per port call, shared by every party.',
    body: 'Cruise line, agent, port and operator write to the same call. The latest version is the only version, and the history stays on the call.',
  },
  {
    title: 'Changes reach everyone at the same moment.',
    body: 'A new ETA, a berth swap or new tour numbers land on the record and notify the parties they affect. No forwarding, no "did you see my email".',
  },
  {
    title: 'Data entered once, reused by all.',
    body: 'Vessel, pax, services, PDA lines: typed once, reused across every format and every party. The copy-paste tax disappears.',
  },
]

export function renderE3(lead: LeadEmailInput): RenderedEmail {
  const q = (id: Answers extends Record<infer K, string> ? K : never) => QUESTIONS.find(x => x.id === id)!
  const systemLabel = q('system').options.find(o => o.id === lead.answers.system)?.label ?? ''
  const changeLabel = q('change').options.find(o => o.id === lead.answers.change)?.label ?? ''

  const html = wrap(`
    ${h1('The three changes that remove the most friction')}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`Across every scorecard from ${esc(EVENT.city)}, the same three things separate "smooth sailing" from "heavy weather". None of them is a bigger team or a longer checklist.`)}
    ${findingsBlock(FIXES)}
    ${p(`You told us your port calls live in <strong>${esc(systemLabel.toLowerCase())}</strong> and that changes reach the other parties when <strong>${esc(changeLabel.toLowerCase())}</strong>. That is exactly the gap the first two fixes close.`, 'margin-top:20px')}
    ${p('Portlink is built around these three. If you want to see what your next port call looks like with them in place, reply here and we will walk you through it on a real call.')}
    ${ctaButton(`${SITE_URL}/`, 'What Portlink does')}
    ${signoff()}
  `, { preheader: 'None of them is a bigger team or a longer checklist.', footerNote: unsubFooter(lead.id) })

  const text = textify([
    'The three changes that remove the most friction',
    `Hi ${firstName(lead.name)},`,
    `Across every scorecard from ${EVENT.city}, the same three things separate smooth sailing from heavy weather.`,
    ...FIXES.map((f, i) => `${i + 1}. ${f.title}\n   ${f.body}`),
    `You told us your port calls live in ${systemLabel.toLowerCase()} and that changes reach the other parties when ${changeLabel.toLowerCase()}. That is the gap the first two fixes close.`,
    `Portlink is built around these three: ${SITE_URL}/`,
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(lead.id)}`,
  ])

  return { subject: 'The three changes that remove the most friction', html, text }
}

// ── e4: the pilot ─────────────────────────────────────────────────────────────

const PERKS: Finding[] = [
  { title: 'Shape what gets built.', body: 'Pilot teams work directly with us. Your operational reality drives the roadmap.' },
  { title: 'Founding pricing, permanent.', body: 'Rates that will not be available after public launch. No promotional asterisk.' },
  { title: 'Onboarding that actually works.', body: 'We set you up, migrate your existing data, and stay until your team is running. Not a help article.' },
]

export function renderE4(lead: LeadEmailInput): RenderedEmail {
  const html = wrap(`
    ${h1('Founding pilot seats for the Med')}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`Two weeks after ${esc(EVENT.city)}, one last note. We are onboarding a small number of teams into the Portlink founding cohort, and we are holding seats for Mediterranean operations we met at the show.`)}
    ${p('Best fit: complex operations, a low tolerance for manual work, and strong opinions about what is broken. What the cohort gets:')}
    ${findingsBlock(PERKS)}
    ${p(`Your scorecard put <strong>${esc(lead.company)}</strong> at <strong>${lead.result.score}/100</strong>. If that number bothers you, the request takes two minutes and we reply within 48 hours.`, 'margin-top:20px')}
    ${ctaButton(PILOT_URL, 'Request pilot access')}
    ${p('Or just reply to this email. Either way, thank you for scanning the code in Las Palmas.', 'margin-top:24px')}
    ${signoff()}
  `, { preheader: 'A small number of teams. Seats held for the Med.', footerNote: unsubFooter(lead.id) })

  const text = textify([
    'Founding pilot seats for the Med',
    `Hi ${firstName(lead.name)},`,
    `Two weeks after ${EVENT.city}, one last note. We are onboarding a small number of teams into the Portlink founding cohort, and we are holding seats for Mediterranean operations we met at the show.`,
    ...PERKS.map((f, i) => `${i + 1}. ${f.title} ${f.body}`),
    `Your scorecard put ${lead.company} at ${lead.result.score}/100. If that number bothers you, the request takes two minutes: ${PILOT_URL}`,
    'Or just reply to this email.',
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(lead.id)}`,
  ])

  return { subject: 'Founding pilot seats for the Med', html, text }
}

// ── admin notification ────────────────────────────────────────────────────────

export function renderAdmin(lead: LeadEmailInput & { source: string; submissions: number; unsubscribed?: boolean }): RenderedEmail {
  const rows = QUESTIONS.map(q => {
    const opt = q.options.find(o => o.id === lead.answers[q.id])
    return `<tr>
      <td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;vertical-align:top;white-space:nowrap">${esc(q.id)}</td>
      <td style="padding:6px 0;font-size:14px;color:#111827">${esc(opt?.label ?? lead.answers[q.id])}${opt?.points ? ` <span style="color:#94a3b8">(+${opt.points})</span>` : ''}</td>
    </tr>`
  }).join('')

  const exportUrl = `${SITE_URL}/api/seatrade/export/`
  const roleLabel = ROLE_LABELS[lead.answers.role] ?? lead.answers.role

  const html = wrap(`
    <div style="margin:0 0 20px">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">Seatrade lead: ${esc(lead.name)}</h1>
      <span style="display:inline-block;background:#1e4a6e;color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px">${esc(roleLabel)}</span>
      <span style="display:inline-block;background:${BAND_COLOUR[lead.result.band.id]};color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;margin-left:6px">${lead.result.score}/100 · ${esc(lead.result.band.label)}</span>
      ${lead.submissions > 1 ? `<span style="display:inline-block;background:#e2e8f0;color:#374151;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;margin-left:6px">submission #${lead.submissions}</span>` : ''}
    </div>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Email</td><td style="padding:6px 0;font-size:14px"><a href="mailto:${esc(lead.email)}" style="color:#3d7daf;text-decoration:none">${esc(lead.email)}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Company</td><td style="padding:6px 0;font-size:14px;color:#111827">${esc(lead.company)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Source</td><td style="padding:6px 0;font-size:14px;color:#111827">${esc(lead.source)}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Answers</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6">
      Sequence booked: e2, e3, e4 at 2, 6 and 12 days after the show ends (or after sign-up, if later), 09:00 Madrid. Cancelled automatically if they unsubscribe.<br>
      Full list as CSV: open <a href="${exportUrl}" style="color:#3d7daf">${exportUrl}</a> and it lands in this inbox.
    </p>
    <div style="margin:24px 0 0;text-align:center">
      <a href="mailto:${esc(lead.email)}?subject=${encodeURIComponent(`Portlink at Seatrade Med, ${lead.company}`)}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">Reply to ${esc(firstName(lead.name))}</a>
    </div>
  `)

  const text = textify([
    `Seatrade lead: ${lead.name}, ${lead.company} (${roleLabel}) · ${lead.result.score}/100 ${lead.result.band.label}`,
    `Email: ${lead.email}\nSource: ${lead.source}\nSubmission: #${lead.submissions}`,
    ...QUESTIONS.map(q => `${q.id}: ${q.options.find(o => o.id === lead.answers[q.id])?.label ?? lead.answers[q.id]}`),
    `CSV export: ${exportUrl}`,
  ])

  return {
    subject: `Seatrade lead: ${lead.name}, ${lead.company} (${roleLabel}) · ${lead.result.score}/100`,
    html,
    text,
  }
}
