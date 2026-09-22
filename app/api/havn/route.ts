/**
 * POST /api/havn is the answer sheet behind portlink.app/portlink+griegconnect: Norwegian port
 * operators answer the interview questions on their phone, and the answers land in the Portlink
 * inbox as ONE email.
 *
 * WHAT MAKES THIS ROUTE SAFE TO EXEMPT FROM check:access. It never sends to an address the caller
 * supplies. The only recipient is HAVN_TO below, a constant, so the worst a script can do is fill
 * our own inbox, and the rate limit in front of the send bounds that. `scripts/check-mail-routes.mjs`
 * lists this route as exempt by name with exactly that reason; if the recipient ever becomes
 * caller-controlled, move the route under the guard instead of editing the reason.
 *
 * THE ORDER IS STILL THE POINT. Every refusal returns before `new Resend(...)` exists, same as
 * /api/access, so no refusal path can reach the network however the code below is edited later.
 *
 * Everything the caller supplies is interpolated into an HTML email, so every value is escaped.
 */
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { escapeHtml as esc, wrap } from '@/lib/email/wrap'
import { ANSWER_MAX, GROUPS, QUESTION_BY_ID, QUESTION_IDS, WHO_MAX } from '@/lib/havn/questions'
import { clientIp, rateLimit } from '@/lib/rateLimit'

export const dynamic = 'force-dynamic'

/** Where the answers go. Deliberately NOT ADMIN_EMAIL: that env points at a personal inbox as of
 *  14.09.2026, and Kris asked (22.09.2026) that these land in the shared Portlink address. */
const HAVN_TO = 'admin@portlink.app'
const FROM = 'Portlink <pilot@portlink.app>'

/** Hits per caller. Loose: three people in one car may share one address and send twice each. */
const PER_IP = { limit: 10, windowMs: 60 * 60 * 1000 }

interface Body {
  [key: string]: unknown
  who?: unknown
  answers?: unknown
  /** Tap-first picks per question id: a string, or a string array for multi questions. */
  choices?: unknown
  /** Honeypot. Off-screen and tab-skipped in the form, so only a script fills it. */
  website?: unknown
}

function str(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

export async function POST(request: Request) {
  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'Ugyldig forespørsel.' }, { status: 400 })
  }

  if (str(body.website, 10)) {
    // Honeypot tripped. Pretend success so the script moves on.
    return NextResponse.json({ ok: true })
  }

  const who = str(body.who, WHO_MAX)
  const raw = body.answers
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return NextResponse.json({ error: 'Ingen svar mottatt.' }, { status: 400 })
  }

  // Only known question ids, each bounded. Unknown keys are dropped, never echoed.
  const answers = new Map<string, string>()
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!QUESTION_IDS.has(key)) continue
    const text = str(value, ANSWER_MAX)
    if (text) answers.set(key, text)
  }
  // Choices: only known ids, only the options that question actually offers. Anything else is dropped.
  const choices = new Map<string, string[]>()
  const rawChoices = body.choices
  if (rawChoices && typeof rawChoices === 'object' && !Array.isArray(rawChoices)) {
    for (const [key, value] of Object.entries(rawChoices as Record<string, unknown>)) {
      const q = QUESTION_BY_ID.get(key)
      if (!q?.options) continue
      const list = (Array.isArray(value) ? value : [value]).filter((v): v is string => typeof v === 'string' && q.options!.includes(v))
      if (list.length) choices.set(key, q.multi ? list : list.slice(0, 1))
    }
  }
  const answeredIds = new Set([...answers.keys(), ...choices.keys()])
  if (answeredIds.size === 0) {
    return NextResponse.json({ error: 'Svar på minst ett spørsmål før du sender.' }, { status: 400 })
  }

  const ip = clientIp(request)
  if (ip && !rateLimit(`havn:ip:${ip}`, PER_IP)) {
    return NextResponse.json({ error: 'For mange forsøk. Prøv igjen om en time.' }, { status: 429 })
  }

  // Every refusal above returned before this line. Nothing below can run for a refused request.
  const resend = new Resend(process.env.RESEND_API_KEY)

  const sentAt = new Date()
  const stamp = sentAt.toLocaleString('nb-NO', { timeZone: 'Europe/Oslo', dateStyle: 'medium', timeStyle: 'short' })
  const subject = `Havnesvar${who ? ` fra ${who}` : ''} (${answeredIds.size} av ${QUESTION_IDS.size})`

  const htmlGroups = GROUPS.map((group) => {
    const rows = group.questions
      .map((q) => {
        const a = answers.get(q.id)
        const c = choices.get(q.id)
        const number = q.id.slice(1).padStart(2, '0')
        const choiceHtml = c
          ? `<p style="margin:6px 0 0;font-size:13px;color:#1e4a6e"><strong>Valgt:</strong> ${esc(c.join(', '))}</p>`
          : ''
        const answerHtml = a
          ? `<p style="margin:6px 0 0;font-size:14px;line-height:1.6;color:#111827;white-space:pre-wrap">${esc(a)}</p>`
          : c ? '' : `<p style="margin:6px 0 0;font-size:13px;color:#94a3b8">Ikke besvart</p>`
        return `<tr><td style="padding:14px 0;border-bottom:1px solid #e2e8f0">
          <p style="margin:0;font-size:12px;color:#94a3b8;font-family:'JetBrains Mono',Menlo,monospace">${number}</p>
          <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e4a6e;line-height:1.45">${esc(q.text)}</p>
          ${choiceHtml}${answerHtml}
        </td></tr>`
      })
      .join('')
    return `<h2 style="margin:28px 0 4px;font-size:12px;letter-spacing:.09em;text-transform:uppercase;color:#374151">${esc(group.title)}</h2>
      <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>`
  }).join('')

  const html = wrap(
    `<p style="margin:0 0 6px;font-size:12px;color:#94a3b8">${esc(stamp)} (Oslo)</p>
     <h1 style="margin:0 0 8px;font-size:22px;color:#111827">Svar fra havnefolk</h1>
     <p style="margin:0;font-size:14px;color:#374151;line-height:1.6">${who ? `Fra: <strong>${esc(who)}</strong>. ` : ''}${answeredIds.size} av ${QUESTION_IDS.size} spørsmål besvart via portlink.app/portlink+griegconnect.</p>
     ${htmlGroups}`,
    { preheader: `${answeredIds.size} svar${who ? ` fra ${who}` : ''}` },
  )

  const text = [
    `Svar fra havnefolk, ${stamp} (Oslo)`,
    who ? `Fra: ${who}` : '',
    `${answeredIds.size} av ${QUESTION_IDS.size} besvart.`,
    '',
    ...GROUPS.flatMap((group) => [
      `== ${group.title} ==`,
      ...group.questions.flatMap((q) => [
        `${q.id.slice(1).padStart(2, '0')}. ${q.text}`,
        ...(choices.get(q.id) ? [`Valgt: ${choices.get(q.id)!.join(', ')}`] : []),
        answers.get(q.id) ?? (choices.get(q.id) ? '' : '(ikke besvart)'),
        '',
      ]),
    ]),
  ].filter((line, i, arr) => !(line === '' && arr[i - 1] === '')).join('\n')

  const res = await resend.emails.send({
    from: FROM,
    to: HAVN_TO,
    subject,
    html,
    text,
    headers: { 'X-Portlink-Havn': 'answers' },
  })
  if (res.error) {
    console.error('[havn] send failed', res.error)
    return NextResponse.json({ error: 'Kunne ikke sende akkurat nå. Svarene er tatt vare på, prøv igjen om litt.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true, answered: answeredIds.size })
}
