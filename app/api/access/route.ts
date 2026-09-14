import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { wrap } from '@/lib/email/wrap'

const resend = new Resend(process.env.RESEND_API_KEY)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@portlink.app'

interface AccessRequest {
  role: string
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

// ── Confirmation email (to the person signing up) ────────────────────────────

const roleConfirmation: Record<string, { heading: string; context: string }> = {
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
  const conf = roleConfirmation[data.role] ?? roleConfirmation['Cruise Line']
  const firstName = data.name.split(' ')[0]

  return wrap(`
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:700;color:#111827;line-height:1.3">
      ${conf.heading}
    </h1>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
      Hi ${firstName},
    </p>
    <p style="margin:0 0 20px;font-size:15px;color:#374151;line-height:1.7">
      Thanks for putting in a request for the Portlink pilot. We have your application for <strong>${data.company}</strong> and will get back to you within 48 hours.
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

// ── Admin notification email ─────────────────────────────────────────────────

function buildAdminEmail(data: AccessRequest): string {
  const roleFields: Record<string, { label: string; value: string | undefined }[]> = {
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

  const fields = roleFields[data.role] ?? []

  const detailRows = fields
    .filter(f => f.value)
    .map(f => `
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">${f.label}</td>
        <td style="padding:8px 0;font-size:14px;color:#111827">${f.value}</td>
      </tr>`)
    .join('')

  const keyPortsRow = data.keyPorts
    ? `<tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Key ports</td>
        <td style="padding:8px 0;font-size:14px;color:#111827">${data.keyPorts}</td>
      </tr>`
    : ''

  const messageBlock = data.message
    ? `<div style="margin:24px 0 0;padding:16px 20px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0">
        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.05em">Message</p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${data.message}</p>
      </div>`
    : ''

  const roleBadgeColor: Record<string, string> = {
    'Cruise Line': '#3d7daf',
    'Port Agent': '#1e4a6e',
    'Tour Operator': '#5ba3cc',
  }
  const badgeColor = roleBadgeColor[data.role] ?? '#3d7daf'

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
        <td style="padding:8px 0;font-size:14px;color:#111827;font-weight:600">${data.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Email</td>
        <td style="padding:8px 0;font-size:14px"><a href="mailto:${data.email}" style="color:#3d7daf;text-decoration:none">${data.email}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;font-size:13px;color:#6b7280;white-space:nowrap;vertical-align:top">Company</td>
        <td style="padding:8px 0;font-size:14px;color:#111827">${data.company}</td>
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
      <a href="mailto:${data.email}?subject=Portlink%20pilot%20-%20${encodeURIComponent(data.company)}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">
        Reply to ${data.name.split(' ')[0]}
      </a>
    </div>
  `)
}

// ── POST handler ─────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  const data: AccessRequest = await request.json()

  if (!data.name || !data.email || !data.role || !data.company) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Send both emails in parallel
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
