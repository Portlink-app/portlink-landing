/**
 * POST /api/access is the pilot request form.
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
import { isPilotRole, pilotEmailProblem, recipientKey, type PilotRole } from '@/lib/access/eligibility'
import { clientIp, rateLimit } from '@/lib/rateLimit'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portlink.app'

/** Hits per caller and per recipient. Deliberately loose: a person fills this form once. */
const PER_IP = { limit: 5, windowMs: 10 * 60 * 1000 }
const PER_RECIPIENT = { limit: 3, windowMs: 60 * 60 * 1000 }

/** A cleaned submission. Referenced by name from `app/privacy/page.tsx`; keep it descriptive. */
interface AccessRequest {
  role: PilotRole
  name: string
  email: string
  company: string
  fleetSize?: string
  portCallsPerYear?: string
  currentPdaTool?: string
  portsOperated?: string
  cruiseLinesServed?: string
  agentSoftware?: string
  destinationsCount?: string
  groupSizeTypical?: string
  bookingLeadTime?: string
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
  'Port Agent': {
    heading: 'We got your request.',
    context: 'We are building Portlink to get rid of the copy-paste, the conflicting spreadsheets, and the emails nobody can find. One workspace per port call, one login, full history across every cruise line you serve. The pilot is how we make sure it fits the way you actually work.',
  },
  'Tour Operator': {
    heading: 'We got your request.',
    context: 'We are building Portlink to handle booking deadlines automatically, sync your tour data once across every cruise line format, and make sure nobody edits your programme without your sign-off. The pilot is how we make sure it works with your real volume.',
  },
}

function buildConfirmationEmail(data: AccessRequest): string {
  const conf = roleConfirmation[data.role]
  const firstName = esc(data.name.split(' ')[0])

  return wrap(`
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#111827;line-height:1.3">
      ${conf.heading}
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
      Thanks for putting in a request for the Portlink pilot. We have your application for <strong>${esc(data.company)}</strong> and will get back to you within 48 hours.
    </p>
    <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7">
      ${conf.context}
    </p>

    <!-- What happens next -->
    <div style="background:#f0f6fb;border-radius:12px;padding:24px;margin:0 0 24px">
      <p style="margin:0 0 14px;font-size:14px;font-weight:600;color:#1e4a6e">What happens next</p>
      <table cellpadding="0" cellspacing="0" style="font-size:14px;color:#374151;line-height:1.7">
        <tr>
          <td style="padding:0 10px 8px 0;vertical-align:top;color:#3d7daf;font-weight:600">1.</td>
          <td style="padding:0 0 8px">We look at your application and see if it is a good fit for the current cohort.</td>
        </tr>
        <tr>
          <td style="padding:0 10px 8px 0;vertical-align:top;color:#3d7daf;font-weight:600">2.</td>
          <td style="padding:0 0 8px">If selected, we set up a short call to learn about your setup.</td>
        </tr>
        <tr>
          <td style="padding:0 10px 0px 0;vertical-align:top;color:#3d7daf;font-weight:600">3.</td>
          <td style="padding:0">We onboard you personally. No help articles, no self-serve.</td>
        </tr>
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
  }

  const detailRows = roleFields[data.role]
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

  const messageBlock = data.message
    ? `<div style="margin:24px 0 0;padding:16px 20px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Message</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${esc(data.message).replace(/\n/g, '<br>')}</p>
      </div>`
    : ''

  const roleBadgeColor: Record<PilotRole, string> = {
    'Cruise Line': '#3d7daf',
    'Port Agent': '#1e4a6e',
    'Tour Operator': '#5ba3cc',
  }
  const badgeColor = roleBadgeColor[data.role]
  const mailto = `mailto:${esc(encodeURIComponent(data.email).replace(/%40/g, '@'))}`

  return wrap(`
    <div style="margin:0 0 24px">
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.3">
        New pilot access request
      </h1>
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

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e2e8f0;margin:16px 0">

    <!-- Operation details -->
    <p style="margin:0 0 8px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Operation details</p>
    <table cellpadding="0" cellspacing="0" style="border-collapse:collapse;width:100%">
      ${detailRows}
      ${keyPortsRow}
    </table>

    ${messageBlock}

    <!-- Quick reply CTA -->
    <div style="margin:28px 0 0;text-align:center">
      <a href="${mailto}?subject=Portlink%20pilot%20-%20${esc(encodeURIComponent(data.company))}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">
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

  const role = line(body.role, 40)
  const name = line(body.name, 80)
  const email = line(body.email, 160)
  const company = line(body.company, 120)

  if (!isPilotRole(role)) return refuse('Please choose your role.')
  if (name.length < 2) return refuse('Please enter your name.')
  if (company.length < 2) return refuse('Please enter your company.')

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
    role,
    name,
    email,
    company,
    fleetSize: optional(body.fleetSize, 40),
    portCallsPerYear: optional(body.portCallsPerYear, 40),
    currentPdaTool: optional(body.currentPdaTool, 60),
    portsOperated: optional(body.portsOperated, 200),
    cruiseLinesServed: optional(body.cruiseLinesServed, 40),
    agentSoftware: optional(body.agentSoftware, 60),
    destinationsCount: optional(body.destinationsCount, 40),
    groupSizeTypical: optional(body.groupSizeTypical, 40),
    bookingLeadTime: optional(body.bookingLeadTime, 40),
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
      subject: `We received your pilot request, ${data.name.split(' ')[0]}`,
      html: buildConfirmationEmail(data),
    }),
    resend.emails.send({
      from: 'Portlink <pilot@portlink.app>',
      to: ADMIN_EMAIL,
      replyTo: data.email,
      subject: `Pilot request: ${data.name}, ${data.company} (${data.role})`,
      html: buildAdminEmail(data),
    }),
  ])

  if (confirmation.error || admin.error) {
    console.error('Resend errors:', { confirmation: confirmation.error, admin: admin.error })
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
