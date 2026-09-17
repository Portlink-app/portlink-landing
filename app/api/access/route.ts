/**
 * POST /api/access is the one contact endpoint: the pilot request and the build enquiry.
 *
 * ONE ROUTE, TWO INTENTS, from 17.09.2026. `/contact/` asks what the visitor wants before it asks
 * anything else, and `AccessSection` on the homepage asks the same form with `intent=pilot` already
 * chosen. Both post here. A second endpoint would mean a second refuse-before-send ordering to
 * prove, and `scripts/check-access-guard.mjs` proves exactly one.
 *
 * 1. Refuse anything that is not a well-formed submission: unparseable JSON, a filled honeypot, a
 *    missing or oversized field, an unknown role, or an address that is not a work email.
 * 2. Only then construct the mail client and send two messages: a confirmation to the person and
 *    a notification to the admin.
 *
 * THE ORDER IS THE POINT. Every refusal returns before `new Resend(...)` exists, so no refusal can
 * reach the network however the code below is later edited. `scripts/check-access-guard.mjs`
 * asserts exactly that, with `RESEND_API_KEY` unset and `fetch` replaced by a tripwire.
 *
 * WHAT IT IS GUARDING. The confirmation goes to an address supplied by the caller, from our
 * verified sender. Unguarded, that is one message to any address on earth, on demand, signed by
 * portlink.app, which is a sender-reputation problem long before it is a spam problem. Everything
 * the caller supplies also lands inside two HTML emails, so every interpolated value is escaped.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml as esc, wrap } from '@/lib/email/wrap'
import {
  isContactIntent,
  isPilotRole,
  pilotEmailProblem,
  recipientKey,
  type ContactIntent,
  type PilotRole,
} from '@/lib/access/eligibility'
import { clientIp, rateLimit } from '@/lib/rateLimit'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portlink.app'

/** Hits per caller and per recipient. Deliberately loose: a person fills this form once. */
const PER_IP = { limit: 5, windowMs: 10 * 60 * 1000 }
const PER_RECIPIENT = { limit: 3, windowMs: 60 * 60 * 1000 }

/** A cleaned submission. Referenced by name from `app/privacy/page.tsx`; keep it descriptive. */
interface AccessRequest {
  /** Use the platform, or have us build something. Selects the confirmation and the admin block. */
  intent: ContactIntent
  role: PilotRole
  name: string
  email: string
  company: string
  // Cruise line
  fleetSize?: string
  portCallsPerYear?: string
  currentPdaTool?: string
  // Port or terminal
  cruiseCallsPerYear?: string
  berths?: string
  currentSystem?: string
  // Port agency
  portsOperated?: string
  cruiseLinesServed?: string
  agentSoftware?: string
  // Tour operator
  destinationsCount?: string
  groupSizeTypical?: string
  bookingLeadTime?: string
  // Build enquiry
  need?: string
  timeline?: string
  existingSystems?: string
  // Shared
  keyPorts?: string
  message?: string
}

/** Anything a caller can put on the wire. Nothing here is trusted to be a string. */
interface Body {
  [key: string]: unknown
  /** Honeypot. Off-screen and tab-skipped in the form, so only a script fills it. */
  website?: unknown
}

/**
 * A single-line value: trimmed, capped, control characters removed. The removal is what stops a
 * name or a company from carrying a newline into an email subject header.
 */
function line(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max)
}

/** The free-text message, where real line breaks are meaningful and kept. */
function block(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ').trim().slice(0, max)
}

/** Empty optional fields drop out of the admin email rather than rendering as blank rows. */
function optional(value: unknown, max: number): string | undefined {
  return line(value, max) || undefined
}

function refuse(error: string, status = 400) {
  return NextResponse.json({ error }, { status })
}

// Confirmation email (to the person signing up)

const roleConfirmation: Record<PilotRole, { heading: string; context: string }> = {
  'Cruise Line': {
    heading: 'We got your request.',
    context: 'We are building Portlink so cruise lines can see every port call across their deployment in one place. Status, agents, PDA, shore programmes, all of it. No more chasing people for updates. The pilot is how we make sure it actually fits the way your fleet operates before we open it up.',
  },
  'Port or Terminal': {
    heading: 'We got your request.',
    context: 'We are building Portlink so a port or a terminal has one view of who is arriving, what they need and who is handling it, with the documents on the call record instead of attached to a message somebody has to forward. The pilot is how we make sure it fits the way your terminal actually runs a season.',
  },
  'Port Agent': {
    heading: 'We got your request.',
    context: 'We are building Portlink to get rid of the copy-paste, the conflicting spreadsheets, and the emails nobody can find. One workspace per port call, one login, full history across every cruise line you serve. The pilot is how we make sure it fits the way you actually work.',
  },
  'Tour Operator': {
    heading: 'We got your request.',
    context: 'We are building Portlink to handle booking deadlines automatically, sync your tour data once across every cruise line format, and make sure nobody edits your programme without your sign-off. The pilot is how we make sure it works with your real volume.',
  },
  'Something else': {
    heading: 'We got your request.',
    context: 'We are building Portlink so every side of a port call works from the same record rather than from its own copy of it. You told us your operation does not fit the four boxes on the form, which is useful on its own: the pilot is how we find out what it does need.',
  },
}

/**
 * The build enquiry's confirmation, and it promises exactly what `/contact/` promises.
 *
 * The three steps below are the three numbered items on that page, in the same order and with the
 * same commitments. Page and mail agreeing is not a nicety here: the page's whole argument is that
 * the reader can go and check what we say, and the first checkable thing is the reply itself.
 */
const buildConfirmation = {
  heading: 'We got it, and one of us will read it.',
  context: 'Thanks for writing. We build software for the cruise and port industry, so the useful part of your message is the part about how your operation actually runs, and that is the part we will answer.',
}

/** The three steps, per intent. Index 0 is step 1; the order is the order the reader sees. */
const nextSteps: Record<ContactIntent, string[]> = {
  pilot: [
    'We look at your application and see if it is a good fit for the current cohort.',
    'If selected, we set up a short call to learn about your setup.',
    'We onboard you personally. No help articles, no self-serve.',
  ],
  build: [
    'David or Kris reads it. There is no sales team, and the person who replies is one of the two people who decide what gets built.',
    'You get a real answer within 48 hours. Either what we would build and roughly what that takes, or a straight no with the reason.',
    'If it goes further, we talk to the people who do the work. The planner, the agent, the duty officer, not a procurement contact.',
  ],
}

function buildConfirmationEmail(data: AccessRequest): string {
  const conf = data.intent === 'build' ? buildConfirmation : roleConfirmation[data.role]
  const firstName = esc(data.name.split(' ')[0])
  const opening =
    data.intent === 'build'
      ? `We have your message from <strong>${esc(data.company)}</strong> and will get back to you within 48 hours.`
      : `Thanks for putting in a request for the Portlink pilot. We have your application for <strong>${esc(data.company)}</strong> and will get back to you within 48 hours.`

  const steps = nextSteps[data.intent]
    .map((text, i) => `
        <tr>
          <td style="padding:0 10px ${i === 2 ? '0' : '8px'} 0;vertical-align:top;color:#3d7daf;font-weight:600">${i + 1}.</td>
          <td style="padding:0 0 ${i === 2 ? '0' : '8px'}">${text}</td>
        </tr>`)
    .join('')

  return wrap(`
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#111827;line-height:1.3">
      ${conf.heading}
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
      ${opening}
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7">
      ${conf.context}
    </p>

    <!-- What happens next -->
    <div style="background:#f0f6fb;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1e4a6e">What happens next</p>
      <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;line-height:1.7">${steps}
      </table>
    </div>

    <p style="margin:0 0 4px;font-size:15px;color:#374151;line-height:1.7">
      If you have any questions in the meantime, just reply to this email.
    </p>
    <p style="margin:20px 0 0;font-size:15px;color:#374151;line-height:1.7">
      Talk soon,<br>The Portlink team
    </p>
  `)
}

// Admin notification email

function buildAdminEmail(data: AccessRequest): string {
  const roleFields: Record<PilotRole, { label: string; value: string | undefined }[]> = {
    'Cruise Line': [
      { label: 'Fleet size', value: data.fleetSize },
      { label: 'Port calls / year', value: data.portCallsPerYear },
      { label: 'Current PDA tool', value: data.currentPdaTool },
    ],
    'Port or Terminal': [
      { label: 'Cruise calls / year', value: data.cruiseCallsPerYear },
      { label: 'Berths', value: data.berths },
      { label: 'Current system', value: data.currentSystem },
    ],
    'Port Agent': [
      { label: 'Ports operated', value: data.portsOperated },
      { label: 'Cruise lines served', value: data.cruiseLinesServed },
      { label: 'Agent software', value: data.agentSoftware },
    ],
    'Tour Operator': [
      { label: 'Destinations', value: data.destinationsCount },
      { label: 'Typical group size', value: data.groupSizeTypical },
      { label: 'Booking lead time', value: data.bookingLeadTime },
    ],
    'Something else': [],
  }

  /* A build enquiry has no organisation-shaped detail block. What it has is the need, and that is
     the whole message, so it gets its own rows rather than being squeezed into the pilot's. */
  const buildFields: { label: string; value: string | undefined }[] = [
    { label: 'Timeline', value: data.timeline },
    { label: 'Has to talk to', value: data.existingSystems },
  ]

  const detailRows = (data.intent === 'build' ? buildFields : roleFields[data.role])
    .filter(f => f.value)
    .map(f => `
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">${f.label}</td>
        <td style="padding:8px 0;font-size:14px;color:#111827">${esc(f.value as string)}</td>
      </tr>`)
    .join('')

  const keyPortsRow = data.keyPorts
    ? `<tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Key ports</td>
        <td style="padding:8px 0;font-size:14px;color:#111827">${esc(data.keyPorts)}</td>
      </tr>`
    : ''

  const freeText = data.intent === 'build' ? data.need : data.message
  const freeTextLabel = data.intent === 'build' ? 'What they need' : 'Message'
  const messageBlock = freeText
    ? `<div style="margin:24px 0 0;padding:16px 20px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">${freeTextLabel}</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${esc(freeText).replace(/\n/g, '<br>')}</p>
      </div>`
    : ''

  const roleBadgeColor: Record<PilotRole, string> = {
    'Cruise Line': '#3d7daf',
    'Port or Terminal': '#2f6d8f',
    'Port Agent': '#1e4a6e',
    'Tour Operator': '#5ba3cc',
    'Something else': '#6b7280',
  }
  const badgeColor = roleBadgeColor[data.role]
  /* Two badges, because the intent decides what to do with the mail and the org type decides who
     is writing. Reading one without the other has sent a reply to the wrong question before. */
  const intentBadge = data.intent === 'build'
    ? { label: 'Wants us to build something', color: '#8a5a1f' }
    : { label: 'Wants the pilot', color: '#2f6b46' }
  const mailto = `mailto:${esc(encodeURIComponent(data.email).replace(/%40/g, '@'))}`

  /* Heading, divider and table only when a row exists. An empty labelled section is what a
     `Something else` pilot request and a build enquiry with no optional answers both produce. */
  const detailBlock = detailRows || keyPortsRow
    ? `<hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">${data.intent === 'build' ? 'Enquiry details' : 'Operation details'}</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
      ${detailRows}
      ${keyPortsRow}
    </table>`
    : ''

  return wrap(`
    <div style="margin:0 0 24px">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">
        ${data.intent === 'build' ? 'New build enquiry' : 'New pilot access request'}
      </h1>
      <span style="display:inline-block;background:${intentBadge.color};color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;letter-spacing:0.02em;margin-right:6px">
        ${intentBadge.label}
      </span>
      <span style="display:inline-block;background:${badgeColor};color:#ffffff;font-size:12px;font-weight:600;padding:4px 12px;border-radius:9999px;letter-spacing:0.02em">
        ${data.role}
      </span>
    </div>

    <!-- Contact details -->
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%;margin:0 0 4px">
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Name</td>
        <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600">${esc(data.name)}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Email</td>
        <td style="padding:8px 0;font-size:14px"><a href="${mailto}" style="color:#3d7daf;text-decoration:none">${esc(data.email)}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Company</td>
        <td style="padding:8px 0;font-size:14px;color:#111827">${esc(data.company)}</td>
      </tr>
    </table>

    ${detailBlock}

    ${messageBlock}

    <!-- Quick reply CTA -->
    <div style="margin:28px 0 0;text-align:center">
      <a href="${mailto}?subject=${data.intent === 'build' ? 'Portlink%20-%20' : 'Portlink%20pilot%20-%20'}${esc(encodeURIComponent(data.company))}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">
        Reply to ${esc(data.name.split(' ')[0])}
      </a>
    </div>
  `)
}

// POST handler

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return refuse('Invalid JSON')
  }
  if (!body || typeof body !== 'object') return refuse('Invalid JSON')

  // Honeypot first, and it answers with success: a script that is told it failed tries again.
  if (line(body.website, 10)) return NextResponse.json({ ok: true })

  /*
   * `intent` defaults to the pilot only when it is genuinely ABSENT, which is what every submission
   * before 17.09.2026 meant and what the homepage form means when its preset is in place.
   *
   * ⛔ ABSENT AND MALFORMED ARE NOT THE SAME THING, and collapsing them is how the old `role` field
   * used to fall through to the Cruise Line template. `line()` answers '' for a number, an object
   * and an array alike, so `line(...) || 'pilot'` would accept `intent: { build: true }` as a pilot
   * request and send that person the wrong mail. Caught by this route's own guard, which is the
   * only reason it is not shipped: the case reads as a pass in every status code.
   */
  const rawIntent = body.intent === undefined || body.intent === null ? 'pilot' : line(body.intent, 20)
  const role = line(body.role, 40)
  const name = line(body.name, 80)
  const email = line(body.email, 160)
  const company = line(body.company, 120)
  const need = block(body.need, 2000)

  if (!isContactIntent(rawIntent)) return refuse('Please tell us what you are asking about.')
  const intent: ContactIntent = rawIntent
  if (!isPilotRole(role)) return refuse('Please choose the kind of organisation you work in.')
  if (name.length < 2) return refuse('Please enter your name.')
  if (company.length < 2) return refuse('Please enter your company.')
  if (intent === 'build' && need.length < 2) return refuse('Please tell us what you need built.')

  const emailProblem = pilotEmailProblem(email)
  if (emailProblem) return refuse(emailProblem)

  const ip = clientIp(request)
  if (ip && !rateLimit(`access:ip:${ip}`, PER_IP)) {
    return refuse('Too many requests. Please try again in a few minutes.', 429)
  }
  if (!rateLimit(`access:to:${recipientKey(email)}`, PER_RECIPIENT)) {
    return refuse('We have already sent a confirmation to that address. Please check your inbox.', 429)
  }

  const data: AccessRequest = {
    intent,
    role,
    name,
    email,
    company,
    fleetSize: optional(body.fleetSize, 40),
    portCallsPerYear: optional(body.portCallsPerYear, 40),
    currentPdaTool: optional(body.currentPdaTool, 60),
    cruiseCallsPerYear: optional(body.cruiseCallsPerYear, 40),
    berths: optional(body.berths, 40),
    currentSystem: optional(body.currentSystem, 60),
    portsOperated: optional(body.portsOperated, 200),
    cruiseLinesServed: optional(body.cruiseLinesServed, 40),
    agentSoftware: optional(body.agentSoftware, 60),
    destinationsCount: optional(body.destinationsCount, 40),
    groupSizeTypical: optional(body.groupSizeTypical, 40),
    bookingLeadTime: optional(body.bookingLeadTime, 40),
    need: need || undefined,
    timeline: optional(body.timeline, 40),
    existingSystems: optional(body.existingSystems, 200),
    keyPorts: optional(body.keyPorts, 200),
    message: block(body.message, 2000) || undefined,
  }

  // Nothing above this line can reach the network. The client is built only for a submission that
  // has already been accepted.
  const resend = new Resend(process.env.RESEND_API_KEY)

  const [confirmation, admin] = await Promise.all([
    resend.emails.send({
      from: 'Portlink <pilot@portlink.app>',
      to: data.email,
      subject: intent === 'build'
        ? `We got your message, ${data.name.split(' ')[0]}`
        : `We received your pilot request, ${data.name.split(' ')[0]}`,
      html: buildConfirmationEmail(data),
    }),
    resend.emails.send({
      from: 'Portlink <pilot@portlink.app>',
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: intent === 'build'
        ? `Build enquiry: ${data.name}, ${data.company} (${data.role})`
        : `Pilot request: ${data.name}, ${data.company} (${data.role})`,
      html: buildAdminEmail(data),
    }),
  ])

  if (confirmation.error || admin.error) {
    console.error('Resend errors:', { confirmation: confirmation.error, admin: admin.error })
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
