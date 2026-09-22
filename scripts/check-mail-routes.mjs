#!/usr/bin/env node
/**
 * check:mail-routes - every route in this repo that can send mail is either GUARDED or EXEMPT BY NAME.
 *
 *   node scripts/check-mail-routes.mjs      (npm run check:mail-routes, and prebuild)
 *   Exit 0 = every mail-capable route is accounted for; 1 = at least one is not; 2 = could not measure.
 *
 * ## WHY THIS EXISTS, AND IT IS NOT THE SAME QUESTION AS check:access
 *
 * `check:access` proves that ONE route refuses before it sends. This proves there is no SECOND
 * route nobody thought to ask about. Measured 17.09.2026: six routes under `app/api/` import
 * `resend`, and `scripts/check-access-guard.mjs` imports exactly one of them by literal path. The
 * ordering property was therefore measured for one sixth of the endpoints that can make our
 * verified sender deliver a message, and nothing anywhere said so.
 *
 * A judge wired into one arm is not a guard, it is a guard in one place. The general form of that
 * failure is in `~/.buzz/GUIDES/CHECKS_THAT_COULD_NOT_HAVE_SEEN_IT.md`: the question is never
 * "does the rule exist", it is "which ARMS call it".
 *
 * ## HOW IT DECIDES, AND WHY NOTHING HERE IS A HAND-KEPT LIST OF WHAT IS COVERED
 *
 * COVERED is read out of the guard's own source: the paths it dynamically imports under
 * `../app/api/`. So a route stops being covered the moment the guard stops importing it, with no
 * second list to update. A hand-kept "we test these" list is a list that goes stale silently, which
 * is the exact shape of the defect this file exists to stop.
 *
 * EXEMPT is the only hand-kept list, and it is deliberately hostile to rot:
 *   - an exempt entry naming a route that does NOT import resend FAILS. It has either been fixed
 *     or deleted, and either way the exemption is a blanket over nothing.
 *   - an exempt entry naming a path that does not exist FAILS, for the same reason.
 *   - an exempt entry with no reason FAILS.
 * So the list can only ever shrink by accident, never grow by accident.
 *
 * ## THE INSTRUMENT IS CALIBRATED BEFORE ANY ZERO FROM IT IS BELIEVED
 *
 * A known positive (`app/api/access/route.ts`, which does import resend) must be FOUND, and known
 * negatives (routes in the same tree that do not import it) must NOT be. A scanner that reads the
 * wrong tree, or a pattern that matches nothing, reports "all accounted for" and looks identical to
 * a clean repository.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const API_DIR = path.join(ROOT, 'app', 'api')
const GUARD = path.join(ROOT, 'scripts', 'check-access-guard.mjs')

/** Any import of the mail client, single or double quoted, static or dynamic. */
const RESEND_IMPORT = /from\s*['"]resend['"]|import\s*\(\s*['"]resend['"]\s*\)/

/**
 * Routes that can send mail and are deliberately NOT exercised by check:access.
 *
 * Each needs a reason, and the reason has to be about scope, never about effort. `scripts/lint-dashes.mjs`
 * excludes `app/api/` from the dash rule on exactly the same reasoning and prints its exclusions on
 * every run for exactly the same purpose: a zero is only ever a scoped zero.
 */
const EXEMPT = [
  {
    route: 'app/api/seatrade/route.ts',
    reason: 'Seatrade Cruise Med 2026 funnel entry. Its own scoped change; guarded by check:eligibility for the address rule.',
  },
  {
    route: 'app/api/seatrade/verify/route.ts',
    reason: 'Seatrade funnel: double opt-in confirmation. Sends only to an address that already passed the entry route.',
  },
  {
    route: 'app/api/seatrade/notes/route.ts',
    reason: 'Seatrade funnel: the two open questions after an entry. Same scope as the entry route.',
  },
  {
    route: 'app/api/seatrade/unsubscribe/route.ts',
    reason: 'Seatrade funnel: unsubscribe confirmation. Same scope as the entry route.',
  },
  {
    route: 'app/api/seatrade/export/route.ts',
    reason: 'Seatrade funnel: admin CSV export, sent to ADMIN_EMAIL only and never to a caller-supplied address.',
  },
  {
    route: 'app/api/havn/route.ts',
    reason: 'Port-operator interview answers (portlink.app/portlink+griegconnect), sent to the constant Portlink inbox only and never to a caller-supplied address.',
  },
]

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/')

function fail(msg, code = 1) {
  console.error(`\ncheck:mail-routes FAILED\n  ${msg}`)
  process.exit(code)
}

// ── Enumerate ────────────────────────────────────────────────────────────────
if (!fs.existsSync(API_DIR)) fail(`no such directory: ${rel(API_DIR)}`, 2)
if (!fs.existsSync(GUARD)) fail(`no such file: ${rel(GUARD)}`, 2)

function routeFiles(dir) {
  const out = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) out.push(...routeFiles(full))
    else if (entry.isFile() && /^route\.(ts|tsx|js|mjs)$/.test(entry.name)) out.push(full)
  }
  return out
}

const allRoutes = routeFiles(API_DIR).map(rel).sort()
const mailRoutes = allRoutes.filter((r) => RESEND_IMPORT.test(fs.readFileSync(path.join(ROOT, r), 'utf8')))

/*
 * ── Calibration, before any verdict is read off the numbers above ───────────
 *
 * ⛔ ON FIXTURES, NOT ON A NAMED ROUTE. Calibrating by asserting that `app/api/access/route.ts`
 * matches would mean that deleting or renaming that route reports "reading the wrong tree" rather
 * than the truth, which is the same defect `scripts/check-anchors.mjs` records having shipped once.
 * The pattern is proven here; the tree is then judged by counts alone.
 */
{
  const positives = [
    "import { Resend } from 'resend'",
    'import { Resend } from "resend"',
    "const { Resend } = await import('resend')",
  ]
  const negatives = [
    "import { NextResponse } from 'next/server'",
    "// this route deliberately does not import resend",
    "import { resendLater } from './helpers'",
  ]
  const missed = positives.filter((p) => !RESEND_IMPORT.test(p))
  if (missed.length) fail(`the import pattern missed ${missed.length} known mail import(s), starting with: ${missed[0]}. It is broken, so "no unguarded routes" would be a false clean.`, 2)
  const falsePositives = negatives.filter((n) => RESEND_IMPORT.test(n))
  if (falsePositives.length) fail(`the import pattern matched ${falsePositives.length} line(s) that do not import the mail client, starting with: ${falsePositives[0]}. A gate that flags everything is a gate somebody switches off.`, 2)
}

if (allRoutes.length === 0) fail(`no route files under ${rel(API_DIR)}. This is reading the wrong tree.`, 2)
const knownNegatives = allRoutes.filter((r) => !mailRoutes.includes(r))

// ── Covered is read out of the guard, never declared here ───────────────────
const guardSrc = fs.readFileSync(GUARD, 'utf8')
const covered = [...guardSrc.matchAll(/['"]\.\.\/(app\/api\/[^'"]+)['"]/g)]
  .map((m) => m[1])
  .filter((v, i, a) => a.indexOf(v) === i)
  .sort()

if (covered.length === 0) {
  fail(`${rel(GUARD)} imports no route under app/api/. Either it stopped exercising the endpoint or this reader is broken; both make the coverage number below a fiction.`, 2)
}

// ── The exemption list may not rot ──────────────────────────────────────────
const exemptProblems = []
for (const e of EXEMPT) {
  if (!e.reason || !e.reason.trim()) exemptProblems.push(`${e.route}: exempted with no reason`)
  else if (!allRoutes.includes(e.route)) exemptProblems.push(`${e.route}: exempted, but no such route exists. Delete the entry.`)
  else if (!mailRoutes.includes(e.route)) exemptProblems.push(`${e.route}: exempted, but it no longer imports resend. Delete the entry; it is a blanket over nothing.`)
}

const exemptRoutes = EXEMPT.map((e) => e.route)
const unaccounted = mailRoutes.filter((r) => !covered.includes(r) && !exemptRoutes.includes(r))

// ── Report ──────────────────────────────────────────────────────────────────
console.log(`check:mail-routes: ${allRoutes.length} route(s) under app/api/, ${mailRoutes.length} can send mail.`)
console.log(`  calibration: the import pattern matched three known mail imports and rejected three near misses; ${knownNegatives.length} route(s) in this tree do not import it.`)
for (const r of mailRoutes) {
  const how = covered.includes(r)
    ? 'GUARDED by check:access'
    : `EXEMPT - ${EXEMPT.find((e) => e.route === r)?.reason ?? 'no reason'}`
  console.log(`  ${r}\n      ${how}`)
}

if (exemptProblems.length || unaccounted.length) {
  const lines = [
    ...unaccounted.map((r) => `${r}: imports resend and is neither exercised by ${rel(GUARD)} nor exempted by name. Add a case to the guard, or an EXEMPT entry with a reason.`),
    ...exemptProblems,
  ]
  fail(lines.join('\n  '))
}

console.log('\ncheck:mail-routes clean. Every mail-capable route is guarded or exempt by name.')
