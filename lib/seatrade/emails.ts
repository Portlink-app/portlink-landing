/**
 * The Seatrade funnel emails. Five to the lead, one to the admin.
 *
 *   e1       immediately   "Your port call friction score: 72/100"   score, findings, CONFIRM EMAIL button,
 *                                                                     invitation link, draw terms
 *   verify   +20 h         "Your entry is not active yet"            confirm button; cancelled when they confirm
 *   e2       +2 days       "How Seatrade Med scored"                  live benchmark + entries page
 *   e3       +6 days       "The three changes that remove the most friction"
 *   e4       +12 days      "Founding pilot seats for the Med"
 *   credited on demand     "One more entry"                           to a referrer when someone they invited confirms
 *
 * e2–e4 are booked with Resend `scheduledAt` at sign-up, so their HTML is frozen at that moment.
 * That is why e2 links to live pages instead of quoting numbers. Changing copy here changes
 * future sign-ups only; already-scheduled sends keep the old copy (cancel + rebook to replace).
 *
 * Every lead email carries an unsubscribe link and List-Unsubscribe headers. Plain HTML, inline
 * styles, hex colours (see lib/email/wrap.ts for why).
 */
import { ctaButton, escapeHtml as esc, wrap } from '@/lib/email/wrap'
import { DRAW, EVENT, PILOT_URL, PRIZE_NAME, REFERRAL_CAP, REPORT_PATH, SITE_URL, TERMS_PATH, meUrl, referralUrl, verifyUrl } from './config'
import { ROLE_LABELS, ROLE_LINES, type Finding, type ScoreResult, QUESTIONS, type Answers } from './scorecard'
import { OPEN_QUESTIONS, type OpenAnswers } from './openQuestions'

export interface LeadEmailInput {
  id: string
  name: string
  email: string
  company: string
  answers: Answers
  result: ScoreResult
  referralCode: string
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
  return `You are getting this because you asked for your port call friction score at ${esc(EVENT.name)}. <a href="${unsubscribeUrl(id)}" style="color:#94a3b8">Unsubscribe</a> in one click (your draw entry stays; reply to withdraw it).`
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

/** The draw box: confirm button, invitation link, the rule, the dates. Used by e1 and the reminder. */
function drawBlock(lead: LeadEmailInput, opts: { confirmed: boolean }): string {
  const link = referralUrl(lead.referralCode)
  const terms = `${SITE_URL}${TERMS_PATH}`
  const confirmLine = opts.confirmed
    ? `<p style="margin:0 0 14px;font-size:14px;color:#2f855a;font-weight:600">Your email is confirmed. Your entry is active.</p>`
    : `<p style="margin:0 0 6px;font-size:14px;color:#374151;line-height:1.6">One click confirms your work email and activates your entry:</p>
       ${ctaButton(verifyUrl(lead.id), 'Confirm my email')}
       <p style="margin:14px 0 18px;font-size:12px;color:#6b7280">Nothing is active until you confirm. We only count people in the industry, and the work email is how we see where you work.</p>`
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:22px 24px;margin:8px 0 24px">
      <p style="margin:0 0 10px;font-size:12px;font-weight:700;color:#1e4a6e;text-transform:uppercase;letter-spacing:0.06em">The Seatrade Med draw: ${esc(PRIZE_NAME)}</p>
      ${confirmLine}
      <p style="margin:0 0 6px;font-size:14px;color:#374151;line-height:1.6"><strong>Your invitation link</strong> (your code is <span style="font-family:Menlo,Consolas,monospace">${esc(lead.referralCode)}</span>):</p>
      <p style="margin:0 0 12px;font-size:14px;line-height:1.5;word-break:break-all"><a href="${link}" style="color:#3d7daf">${link}</a></p>
      <p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6">Every colleague or partner who scores their port calls through your link and confirms their work email adds one entry for you, up to ${REFERRAL_CAP}. Entries close ${esc(DRAW.closesLabel)}; the draw is on ${esc(DRAW.drawLabel)}. <a href="${terms}" style="color:#6b7280">Terms</a>.</p>
    </div>`
}

function drawText(lead: LeadEmailInput, opts: { confirmed: boolean }): string[] {
  return [
    `THE SEATRADE MED DRAW: ${PRIZE_NAME}`,
    opts.confirmed ? 'Your email is confirmed. Your entry is active.' : `Confirm your work email to activate your entry: ${verifyUrl(lead.id)}`,
    `Your invitation link (code ${lead.referralCode}): ${referralUrl(lead.referralCode)}`,
    `Every colleague or partner who scores their port calls through your link and confirms their work email adds one entry for you, up to ${REFERRAL_CAP}. Entries close ${DRAW.closesLabel}; the draw is on ${DRAW.drawLabel}. Terms: ${SITE_URL}${TERMS_PATH}`,
  ]
}

// ── e1: the scorecard ─────────────────────────────────────────────────────────

export function renderE1(lead: LeadEmailInput, opts: { confirmed?: boolean } = {}): RenderedEmail {
  const { result } = lead
  const role = lead.answers.role
  const roleLine = ROLE_LINES[role] ?? ROLE_LINES.other
  const reportUrl = `${SITE_URL}${REPORT_PATH}`
  const confirmed = !!opts.confirmed

  const html = wrap(`
    ${h1(`Your port call friction score: ${result.score}/100`)}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`Here is the scorecard you asked for at ${esc(EVENT.name)}. Based on your answers for <strong>${esc(lead.company)}</strong>:`)}
    ${scoreBlock(result)}
    <p style="margin:0 0 12px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Where the friction is</p>
    ${findingsBlock(result.findings)}
    ${drawBlock(lead, { confirmed })}
    ${p(roleLine)}
    ${p(`If you want to see this on one of your own port calls, reply to this email. We are in ${esc(EVENT.city)} this week and can do 15 minutes at the terminal, or a short call after the show. How the show is scoring so far: <a href="${reportUrl}" style="color:#3d7daf">the live benchmark</a>.`)}
    ${signoff()}
  `, { preheader: confirmed ? `${result.band.label}. Your findings, and your entry is active.` : `${result.band.label}. One click activates your entry in the draw.`, footerNote: unsubFooter(lead.id) })

  const text = textify([
    `Your port call friction score: ${result.score}/100 (${result.band.label})`,
    `Hi ${firstName(lead.name)},`,
    `Here is the scorecard you asked for at ${EVENT.name}, based on your answers for ${lead.company}.`,
    result.band.descriptor,
    'Where the friction is:',
    ...result.findings.map((f, i) => `${i + 1}. ${f.title}\n   ${f.body}`),
    ...drawText(lead, { confirmed }),
    roleLine,
    `If you want to see this on one of your own port calls, reply to this email. We are in ${EVENT.city} this week and can do 15 minutes at the terminal, or a short call after the show.`,
    `How the show is scoring: ${reportUrl}`,
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(lead.id)}`,
  ])

  return { subject: `Your port call friction score: ${result.score}/100`, html, text }
}

// ── verify reminder (+20 h, cancelled on confirmation) ───────────────────────

export function renderVerifyReminder(lead: LeadEmailInput): RenderedEmail {
  const html = wrap(`
    ${h1('Your entry is not active yet')}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`You scored ${lead.result.score}/100 at ${esc(EVENT.name)}, but your entry in the draw for ${esc(PRIZE_NAME)} is still waiting for one click: the one that confirms your work email.`)}
    ${drawBlock(lead, { confirmed: false })}
    ${p(`If you did not sign up, ignore this email and nothing happens.`)}
    ${signoff()}
  `, { preheader: 'One click confirms your work email.', footerNote: unsubFooter(lead.id) })

  const text = textify([
    'Your entry is not active yet',
    `Hi ${firstName(lead.name)},`,
    `You scored ${lead.result.score}/100 at ${EVENT.name}, but your entry in the draw for ${PRIZE_NAME} is still waiting for one click: the one that confirms your work email.`,
    ...drawText(lead, { confirmed: false }),
    'If you did not sign up, ignore this email and nothing happens.',
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(lead.id)}`,
  ])

  return { subject: 'Your entry is not active yet', html, text }
}

// ── credited: someone you invited confirmed ───────────────────────────────────

export function renderReferralCredited(referrer: LeadEmailInput, entries: number, countedReferrals: number): RenderedEmail {
  const me = meUrl(referrer.id)
  const html = wrap(`
    ${h1('One more entry')}
    ${p(`Hi ${esc(firstName(referrer.name))},`)}
    ${p(`Someone you invited just confirmed their work email. You now hold <strong>${entries} ${entries === 1 ? 'entry' : 'entries'}</strong> in the draw for ${esc(PRIZE_NAME)} (${countedReferrals} from invitations, up to ${REFERRAL_CAP} count).`)}
    ${p(`Your invitation link: <a href="${referralUrl(referrer.referralCode)}" style="color:#3d7daf">${referralUrl(referrer.referralCode)}</a>`)}
    ${ctaButton(me, 'See my entries')}
    ${signoff()}
  `, { preheader: `${entries} ${entries === 1 ? 'entry' : 'entries'} in the draw.`, footerNote: unsubFooter(referrer.id) })

  const text = textify([
    'One more entry',
    `Hi ${firstName(referrer.name)},`,
    `Someone you invited just confirmed their work email. You now hold ${entries} ${entries === 1 ? 'entry' : 'entries'} in the draw for ${PRIZE_NAME} (${countedReferrals} from invitations, up to ${REFERRAL_CAP} count).`,
    `Your invitation link: ${referralUrl(referrer.referralCode)}`,
    `See my entries: ${me}`,
    'Talk soon,\nDavid Bakke, Portlink',
    `Unsubscribe: ${unsubscribeUrl(referrer.id)}`,
  ])

  return { subject: `One more entry: you now hold ${entries}`, html, text }
}

// ── e2: the benchmark ─────────────────────────────────────────────────────────

export function renderE2(lead: LeadEmailInput): RenderedEmail {
  const reportUrl = `${SITE_URL}${REPORT_PATH}`
  const roleLabel = (ROLE_LABELS[lead.answers.role] ?? 'your role').toLowerCase()
  const roleLine = ROLE_LINES[lead.answers.role] ?? ROLE_LINES.other
  const me = meUrl(lead.id)

  const html = wrap(`
    ${h1('How Seatrade Med scored')}
    ${p(`Hi ${esc(firstName(lead.name))},`)}
    ${p(`${esc(EVENT.name)} is over. Everyone who scanned the code answered the same seven questions, and the benchmark is live: how much of the Med's port calls still run on email, how many times one call gets re-typed, and how changes actually reach the other parties.`)}
    ${p(`You scored <strong>${lead.result.score}/100</strong>. The page shows where that sits against the rest of the room, and the numbers keep updating as more people answer.`)}
    ${ctaButton(reportUrl, 'Open the live benchmark')}
    ${p(`Entries in the draw for ${esc(PRIZE_NAME)} close ${esc(DRAW.closesLabel)}. Your entries and your invitation link: <a href="${me}" style="color:#3d7daf">your page</a>.`, 'margin-top:28px')}
    ${p(`On the ${esc(roleLabel)} side, this is what Portlink changes:`)}
    ${p(roleLine)}
    ${p('If you would like to see it on your own port calls, reply to this email and we will set up 20 minutes. Screen share, real data, no slides.')}
    ${signoff()}
  `, { preheader: 'The live benchmark from Las Palmas, and where you sit in it.', footerNote: unsubFooter(lead.id) })

  const text = textify([
    'How Seatrade Med scored',
    `Hi ${firstName(lead.name)},`,
    `${EVENT.name} is over. Everyone who scanned the code answered the same seven questions, and the benchmark is live.`,
    `You scored ${lead.result.score}/100. See where that sits: ${reportUrl}`,
    `Entries in the draw for ${PRIZE_NAME} close ${DRAW.closesLabel}. Your entries and your invitation link: ${me}`,
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

export interface AdminInput extends LeadEmailInput {
  source: string
  submissions: number
  emailDomain: string
  domainMatch: 'likely' | 'unclear'
  roleDetail?: string
  referrer?: { name: string; company: string; code: string }
}

export function renderAdmin(lead: AdminInput): RenderedEmail {
  const rows = QUESTIONS.map(q => {
    const opt = q.options.find(o => o.id === lead.answers[q.id])
    return `<tr>
      <td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;vertical-align:top;white-space:nowrap">${esc(q.id)}</td>
      <td style="padding:6px 0;font-size:14px;color:#111827">${esc(opt?.label ?? lead.answers[q.id])}${opt?.points ? ` <span style="color:#94a3b8">(+${opt.points})</span>` : ''}</td>
    </tr>`
  }).join('')

  const exportUrl = `${SITE_URL}/api/seatrade/export/`
  const roleLabel = ROLE_LABELS[lead.answers.role] ?? lead.answers.role
  const matchColour = lead.domainMatch === 'likely' ? '#2f855a' : '#b7791f'

  const html = wrap(`
    <div style="margin:0 0 20px">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">Seatrade lead: ${esc(lead.name)}</h1>
      <span style="display:inline-block;background:#1e4a6e;color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px">${esc(roleLabel)}</span>
      <span style="display:inline-block;background:${BAND_COLOUR[lead.result.band.id]};color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;margin-left:6px">${lead.result.score}/100 · ${esc(lead.result.band.label)}</span>
      ${lead.submissions > 1 ? `<span style="display:inline-block;background:#e2e8f0;color:#374151;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;margin-left:6px">submission #${lead.submissions}</span>` : ''}
    </div>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Email</td><td style="padding:6px 0;font-size:14px"><a href="mailto:${esc(lead.email)}" style="color:#3d7daf;text-decoration:none">${esc(lead.email)}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Company</td><td style="padding:6px 0;font-size:14px;color:#111827">${esc(lead.company)}${lead.roleDetail ? ` <span style="color:#6b7280">· ${esc(lead.roleDetail)}</span>` : ''}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Domain</td><td style="padding:6px 0;font-size:14px;color:#111827">${esc(lead.emailDomain)} <span style="color:${matchColour};font-size:12px;font-weight:600">${lead.domainMatch === 'likely' ? 'matches company' : 'check against company'}</span></td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Source</td><td style="padding:6px 0;font-size:14px;color:#111827">${esc(lead.source)}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Invited by</td><td style="padding:6px 0;font-size:14px;color:#111827">${lead.referrer ? `${esc(lead.referrer.name)}, ${esc(lead.referrer.company)} <span style="color:#94a3b8;font-family:Menlo,Consolas,monospace">${esc(lead.referrer.code)}</span>` : '<span style="color:#94a3b8">nobody (direct)</span>'}</td></tr>
      <tr><td style="padding:6px 12px 6px 0;font-size:13px;color:#6b7280;white-space:nowrap">Their code</td><td style="padding:6px 0;font-size:14px;color:#111827;font-family:Menlo,Consolas,monospace">${esc(lead.referralCode)}</td></tr>
    </table>
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Answers</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">${rows}</table>
    <p style="margin:24px 0 0;font-size:13px;color:#6b7280;line-height:1.6">
      Not confirmed yet: entry activates when they click the confirmation link (reminder after 20 h). Sequence booked: e2, e3, e4 at 2, 6 and 12 days after the show ends (or after sign-up, if later), 09:00 Madrid. Cancelled automatically if they unsubscribe.<br>
      Full list as CSV (with entries and eligibility): open <a href="${exportUrl}" style="color:#3d7daf">${exportUrl}</a> and it lands in this inbox.
    </p>
    <div style="margin:24px 0 0;text-align:center">
      <a href="mailto:${esc(lead.email)}?subject=${encodeURIComponent(`Portlink at Seatrade Med, ${lead.company}`)}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">Reply to ${esc(firstName(lead.name))}</a>
    </div>
  `)

  const text = textify([
    `Seatrade lead: ${lead.name}, ${lead.company} (${roleLabel}) · ${lead.result.score}/100 ${lead.result.band.label}`,
    `Email: ${lead.email}\nDomain: ${lead.emailDomain} (${lead.domainMatch})\nSource: ${lead.source}\nInvited by: ${lead.referrer ? `${lead.referrer.name}, ${lead.referrer.company} (${lead.referrer.code})` : 'nobody'}\nTheir code: ${lead.referralCode}\nSubmission: #${lead.submissions}`,
    ...QUESTIONS.map(q => `${q.id}: ${q.options.find(o => o.id === lead.answers[q.id])?.label ?? lead.answers[q.id]}`),
    `CSV export: ${exportUrl}`,
  ])

  return {
    subject: `Seatrade lead: ${lead.name}, ${lead.company} (${roleLabel}) · ${lead.result.score}/100`,
    html,
    text,
  }
}

// ── admin notification: the two open answers ──────────────────────────────────

/**
 * Sent when someone writes one of the two open questions on the "sent" screen. A second, separate
 * mail rather than a field in the lead notification, because the lead notification has already
 * left the building by then: the entry is created and mailed before the questions are even shown.
 */
export function renderOpenAnswers(
  lead: Pick<LeadEmailInput, 'id' | 'name' | 'email' | 'company'>,
  answers: OpenAnswers,
): RenderedEmail {
  const written = OPEN_QUESTIONS.filter(q => answers[q.id])
  const blocks = written.map(q => `
    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#6b7280;line-height:1.5">${esc(q.label)}</p>
    <p style="margin:0 0 20px;font-size:15px;color:#111827;line-height:1.65;white-space:pre-wrap;border-left:3px solid #3d7daf;padding-left:14px">${esc(answers[q.id] ?? '')}</p>`,
  ).join('')

  const html = wrap(`
    ${h1(`In their own words: ${esc(lead.name)}`)}
    <p style="margin:0 0 20px;font-size:14px;color:#6b7280;line-height:1.6">${esc(lead.company)} · <a href="mailto:${esc(lead.email)}" style="color:#3d7daf;text-decoration:none">${esc(lead.email)}</a><br>
    Their entry and scorecard came through earlier; this is the free text they added afterwards.</p>
    ${blocks}
    <div style="margin:24px 0 0;text-align:center">
      <a href="mailto:${esc(lead.email)}?subject=${encodeURIComponent(`Portlink at Seatrade Med, ${lead.company}`)}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">Reply to ${esc(firstName(lead.name))}</a>
    </div>
  `)

  const text = textify([
    `In their own words: ${lead.name}, ${lead.company} (${lead.email})`,
    ...written.map(q => `${q.label}\n${answers[q.id]}`),
    `Lead id: ${lead.id}`,
  ])

  return { subject: `Seatrade answers: ${lead.name}, ${lead.company}`, html, text }
}
