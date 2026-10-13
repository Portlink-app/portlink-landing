#!/usr/bin/env node
/**
 * check-service-docs.mjs: refuse retired or contradictory service routes in this repo's docs.
 *
 *   node scripts/check-service-docs.mjs             (npm run check:service-docs, and verify)
 *   node scripts/check-service-docs.mjs --selftest  calibrate every rule on a known-bad and a known-good line
 *   Exit 0 = clean in the declared scope; 1 = at least one violation or a failed calibration.
 *
 * WHY: CLAUDE.md "Services and connections" is the one service table (AGENTS.md routes to it).
 * Until 13.10.2026 the same section told an agent to push as GitDABA in one row and called GitDABA
 * out of bounds four paragraphs later, listed a portlinkadmin PAT that reads this repo pull-only
 * since 28.09.2026, and prescribed a raw `op read` instead of the secret wrapper. Each line looked
 * authoritative on its own. This check makes those three contradictions fail instead of drift back.
 *
 * SCOPE (printed on every run, so a zero is a scoped zero): the files in FILES below. CHANGELOG.md
 * is excluded because it records history, which may quote a retired route.
 */
import { readFileSync, existsSync } from 'node:fs';

const FILES = ['CLAUDE.md', 'AGENTS.md', '.mission-control/account-context.md', 'docs/LANDING-DIRECTION.md'];

// Each rule refuses a line. `bad` and `good` calibrate it in --selftest.
const LINE_RULES = [
  {
    id: 'raw-op-read',
    why: 'read secrets through ~/.claude/bin/secret (probe/get), never a raw `op read`',
    test: (l) => /\bop read\b/.test(l),
    bad: "rejects. Read with `op read '<ref>' --no-newline` and pipe straight into the consuming command;",
    good: "`~/.claude/bin/secret get '<ref>' | <consumer>` uses it. Never echo, log or paste a value.",
  },
  {
    id: 'retired-pat-reference',
    why: 'the portlinkadmin PAT item reads this repo pull-only since 28.09.2026; it is not a route',
    test: (l) => /op:\/\/[^\s`]*owl6advkmjvx2bjpzi3y6duyha/.test(l),
    bad: '| GitHub PAT (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/owl6advkmjvx2bjpzi3y6duyha/credential` |',
    good: 'The former `GitHub PAT (Portlink)` item (`owl6advkmjvx2bjpzi3y6duyha`) belongs to `portlinkadmin` and',
  },
  {
    id: 'push-identity-excluded',
    paragraph: true, // the retired sentence wrapped GitDABA and "out of bounds" onto two lines
    why: 'GitDABA is the declared push login for this repo; a sentence calling it out of bounds contradicts the table',
    test: (l) => /GitDABA/.test(l) && /(out of bounds|different company)/i.test(l),
    bad: 'account. The **Bakke & Co** side of this machine, GitHub `GitDABA`, the Bakke & Co Netlify out of bounds',
    good: 'vault or GitHub organisation on this machine is out of bounds. Check the identity with the named',
  },
  {
    id: 'ambient-account',
    why: 'never rely on, or switch, the ambient gh account; use the named keyring login',
    test: (l) => /active account defaults/i.test(l) || (/gh auth switch/.test(l) && !/\bnever\b/i.test(l)),
    bad: "active account defaults to `GitDABA`; check it every time, because a wrong-account push here lands",
    good: 'login above. Never `gh auth switch` and never the ambient active account |',
  },
  {
    id: 'readonly-account-as-route',
    why: 'portlinkadmin cannot push here; it is never the account to use',
    test: (l) => /use (the )?github account `?portlinkadmin/i.test(l),
    bad: 'Use GitHub account `portlinkadmin` and Netlify site `portlin-landing-2` only.',
    good: 'Use the named GitHub login declared there and Netlify site `portlin-landing-2` only.',
  },
];

// The table must still declare the positive route, so deleting the row cannot pass the check.
const REQUIRED_IN_CLAUDE = [
  { id: 'github-row-names-login', test: (s) => /\| GitHub \|[^\n]*`GitDABA`/.test(s) },
  { id: 'named-login-form', test: (s) => s.includes('gh auth token --user GitDABA') },
  { id: 'secret-wrapper', test: (s) => s.includes('~/.claude/bin/secret get') },
];

function scan(name, text) {
  const out = [];
  const lines = text.split('\n');
  lines.forEach((line, i) => {
    for (const r of LINE_RULES) if (!r.paragraph && r.test(line)) out.push(`${name}:${i + 1} [${r.id}] ${r.why}`);
  });
  // Paragraph rules: join each blank-line-separated block, report its first line.
  let start = 0;
  for (let i = 0; i <= lines.length; i++) {
    if (i === lines.length || lines[i].trim() === '') {
      const para = lines.slice(start, i).join(' ');
      for (const r of LINE_RULES) if (r.paragraph && para && r.test(para)) out.push(`${name}:${start + 1} [${r.id}] ${r.why}`);
      start = i + 1;
    }
  }
  return out;
}

if (process.argv.includes('--selftest')) {
  let failed = 0;
  for (const r of LINE_RULES) {
    if (!r.test(r.bad)) { console.error(`SELFTEST FAIL ${r.id}: known-bad line admitted`); failed++; }
    if (r.test(r.good)) { console.error(`SELFTEST FAIL ${r.id}: known-good line refused`); failed++; }
  }
  for (const q of REQUIRED_IN_CLAUDE) {
    if (q.test('')) { console.error(`SELFTEST FAIL ${q.id}: empty document satisfies a required route`); failed++; }
  }
  console.log(failed ? `check-service-docs selftest: ${failed} failure(s)` : `check-service-docs selftest: ${LINE_RULES.length} rules calibrated both ways`);
  process.exit(failed ? 1 : 0);
}

const problems = [];
for (const f of FILES) {
  if (!existsSync(f)) { problems.push(`${f}: missing (declared in scope)`); continue; }
  const text = readFileSync(f, 'utf8');
  problems.push(...scan(f, text));
  if (f === 'CLAUDE.md') for (const q of REQUIRED_IN_CLAUDE) if (!q.test(text)) problems.push(`CLAUDE.md [${q.id}] required route is missing`);
}
console.log(`check-service-docs: scope ${FILES.join(', ')} (CHANGELOG.md excluded: history)`);
if (problems.length) {
  for (const p of problems) console.error(p);
  process.exit(1);
}
console.log('check-service-docs: clean');
