#!/usr/bin/env node
/**
 * check-contact-intent — every mount of the contact form names which door it opens on.
 *
 * What this is, plainly: the site has one contact form and two places it appears. One is the
 * homepage's pilot section, where the reader has already said what they want. The other is
 * `/contact/`, the page the homepage's "Tell us what you need" link points at. Those two want
 * different answers pre-selected, and for a while the code could not tell them apart: one optional
 * prop meant both "use this value" and "do not ask the question", so the page that asks the
 * question fell through to a `?? 'pilot'` tail nobody had chosen.
 *
 * Measured on https://portlink.app/contact/ on 17.09.2026, straight out of the served markup:
 * the `pilot` radio carried `checked` and `build` did not, under an H1 reading "Tell us what you
 * need built." A visitor who skimmed sent a pilot request meaning a build request. The submission
 * was valid, the confirmation was plausible, and nothing recorded that the intent was wrong.
 *
 * ⛔ WHY THE EXISTING SUITE DID NOT CATCH IT, WHICH IS THE POINT OF THIS FILE. Seventeen publish
 * predicates ran against that page and all seventeen passed. Every one of them asked whether a
 * control EXISTS. Not one asked which control is SELECTED. A presence check cannot see a wrong
 * default, so this gate reads the selected value and the asked/locked state at every mount.
 *
 * EXITS: 0 clean · 1 a mount disagrees with the table below · 2 this script is blind and judged
 * nothing. Worded apart on purpose: a gate that reports its own blindness as the repository's
 * defect is one people learn to rerun past.
 */

import { readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(new URL('.', import.meta.url)), '..')

/**
 * What each mount is supposed to do. `asks` is whether the reader is shown the question at all.
 *
 * A file listed here that has no mount is exit 1: the page stopped mounting the form, and that is
 * a change worth stopping on. A file listed here that does not EXIST is exit 2: this table has
 * gone stale and the script can no longer see what it claims to judge.
 */
const EXPECTED = [
  {
    file: 'app/contact/page.tsx',
    intent: 'build',
    asks: true,
    why: 'this route is the build door in the site’s own navigation and its H1 says so',
  },
  {
    file: 'components/sections/AccessSection.tsx',
    intent: 'pilot',
    asks: false,
    why: 'the reader has just read the pilot terms, so the question is already answered',
  },
]

/** Pull every `<ContactForm …>` mount out of one file with the props that decide the door. */
function mounts(source) {
  const found = []
  for (const m of source.matchAll(/<ContactForm\b([^>]*)\/?>/g)) {
    const props = m[1]
    const intent = props.match(/\bintent=(?:"([^"]*)"|'([^']*)')/)
    found.push({
      intent: intent ? (intent[1] ?? intent[2]) : null,
      locked: /\blockIntent\b(?!\s*=\s*\{?\s*false)/.test(props),
      line: source.slice(0, m.index).split('\n').length,
    })
  }
  return found
}

// ── Calibration, on fixtures held in this file rather than on the repository ──
// The predecessor gate here calibrated on a real id and exited 2 blaming its own pattern the day
// that id was renamed. Nothing below depends on any particular mount still existing.
const CASES = [
  ['a mount that asks, with build selected', '<ContactForm intent="build" />', { intent: 'build', locked: false }],
  ['a mount that locks to pilot', '<ContactForm intent="pilot" lockIntent />', { intent: 'pilot', locked: true }],
  ['an explicit lockIntent={true}', '<ContactForm intent="pilot" lockIntent={true} />', { intent: 'pilot', locked: true }],
  ['an explicit lockIntent={false}', '<ContactForm intent="build" lockIntent={false} />', { intent: 'build', locked: false }],
  ['single quotes', "<ContactForm intent='build' />", { intent: 'build', locked: false }],
  ['props across lines', '<ContactForm\n  intent="pilot"\n  lockIntent\n/>', { intent: 'pilot', locked: true }],
  ['a mount with no intent at all', '<ContactForm />', { intent: null, locked: false }],
]
const calibration = []
for (const [name, src, want] of CASES) {
  const got = mounts(src)
  if (got.length !== 1) { calibration.push(`${name}: found ${got.length} mounts, expected 1`); continue }
  if (got[0].intent !== want.intent) calibration.push(`${name}: read intent ${JSON.stringify(got[0].intent)}, expected ${JSON.stringify(want.intent)}`)
  if (got[0].locked !== want.locked) calibration.push(`${name}: read locked ${got[0].locked}, expected ${want.locked}`)
}
// It must also find nothing where there is nothing, or "0 mounts" would prove only that it is broken.
if (mounts('<SomeOtherForm intent="build" />').length !== 0) calibration.push('matched a component that is not ContactForm')

if (calibration.length) {
  console.error('check-contact-intent: THIS SCRIPT IS BROKEN and judged nothing about the repository.')
  for (const c of calibration) console.error(`  - ${c}`)
  console.error('\nThe fixtures above live inside this file. Fix the reader, then rerun.')
  process.exit(2)
}

// ── The run ──────────────────────────────────────────────────────────────────
const missing = EXPECTED.filter(e => !existsSync(join(ROOT, e.file)))
if (missing.length) {
  console.error('check-contact-intent: the table in this script names files that no longer exist, so it is blind:')
  for (const m of missing) console.error(`  - ${m.file}`)
  console.error('\nUpdate the table to the mounts that exist now. This is the script going stale, not the site being wrong.')
  process.exit(2)
}

const failures = []
for (const e of EXPECTED) {
  const found = mounts(readFileSync(join(ROOT, e.file), 'utf8'))
  if (found.length === 0) {
    failures.push(`${e.file}: no <ContactForm> mount. This page is supposed to carry one (${e.why}).`)
    continue
  }
  if (found.length > 1) {
    failures.push(`${e.file}: ${found.length} mounts. One page, one form: two mounts on one document also collide on input ids.`)
    continue
  }
  const [got] = found
  if (got.intent === null) {
    failures.push(`${e.file}:${got.line}: mounts <ContactForm> with no intent. Name the door: ${e.why}.`)
  } else if (got.intent !== e.intent) {
    failures.push(`${e.file}:${got.line}: opens on "${got.intent}", expected "${e.intent}" because ${e.why}.`)
  }
  if (got.locked === e.asks) {
    failures.push(`${e.file}:${got.line}: ${got.locked ? 'hides' : 'asks'} the intent question; it should ${e.asks ? 'ask' : 'hide'} it because ${e.why}.`)
  }
  if (!failures.length || !failures[failures.length - 1].startsWith(e.file)) {
    console.log(`  ok    ${e.file} opens on "${got.intent}" and ${got.locked ? 'does not ask' : 'asks'} the question`)
  }
}

if (failures.length) {
  console.error(`\ncheck-contact-intent: ${failures.length} mount problem(s).`)
  for (const f of failures) console.error(`  - ${f}`)
  console.error('\nA presence check cannot see a wrong default. That is why this one reads the value.')
  process.exit(1)
}
console.log('check-contact-intent: ok — every mount names which door it opens on.')
