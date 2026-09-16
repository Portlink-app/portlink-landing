#!/usr/bin/env node
/**
 * Self-test for lint-dashes.mjs. Every case declares its expected verdict before it runs.
 *
 *   npm run lint:dashes-selftest        Exit 0 = every case matched.
 *
 * ## WHY EVERY REFUSAL CASE HAS A PASS CASE BESIDE IT
 *
 * A list of refusals passes on a gate that refuses everything, and a gate nobody can satisfy gets
 * switched off. So the cases come in pairs that differ by ONE thing: the same line in code and in
 * a comment, the same line with the directive and without. The pair is what grades the rule; a
 * single case only grades that something happened.
 *
 * ## AND WHY THE FIRST CASE IS A KNOWN-POSITIVE CONTROL
 *
 * Every clean result this gate ever prints rests on the scanner being able to see a U+2014 at all.
 * A scanner that silently read zero would report OK on every file in the repo and look exactly
 * like a working one. A number cannot police itself, so the primitive is proven here first and
 * this refuses to grade anything if it fails.
 *
 * NO LITERAL DASH APPEARS IN THIS FILE. The fixtures build both characters from their code points,
 * for the reason the gate's own header gives: a test whose source carries the character it bans
 * could not be introduced under its own rule.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { scan, codeLines } from "./lint-dashes.mjs";

const EM = String.fromCodePoint(0x2014);
const EN = String.fromCodePoint(0x2013);

let passes = 0;
let fails = 0;

function check(name, expect, actual) {
  if (expect === actual) { passes++; console.log(`MATCH    ${name}  expected=${expect}`); }
  else { fails++; console.error(`MISMATCH ${name}  expected=${expect} got=${actual}`); }
}

// ── known-positive control ─────────────────────────────────────────────────────────────────────
// The bytes must be the ones the gate is looking for, and the scanner must find them. If either
// half is wrong, every OK the gate prints is meaningless, so nothing below is graded.
const emBytes = Buffer.from(EM, "utf8").toString("hex");
const enBytes = Buffer.from(EN, "utf8").toString("hex");
if (emBytes !== "e28094" || enBytes !== "e28093") {
  console.error(`CONTROL_BROKEN fixture bytes em=${emBytes} en=${enBytes} (want e28094 / e28093)`);
  process.exit(9);
}

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "lint-dashes-selftest-"));
const write = (name, body) => { const p = path.join(dir, name); fs.writeFileSync(p, body); return p; };

const planted = write("planted.tsx", `const a = 'one ${EM} two'\nconst b = 'three ${EN} four'\n`);
const control = scan([planted]);
const controlCount = control.reduce((a, f) => a + f.count, 0);
if (control.length !== 2 || controlCount !== 2) {
  console.error(`CONTROL_BROKEN the scanner cannot see what it counts: lines=${control.length} hits=${controlCount} (want 2 and 2)`);
  fs.rmSync(dir, { recursive: true, force: true });
  process.exit(9);
}
console.log(`CONTROL ok: planted lines=${control.length} hits=${controlCount}, em=${emBytes} en=${enBytes}`);

// ── the DENY side ──────────────────────────────────────────────────────────────────────────────
check("em-dash-in-a-string-denies", 1, scan([write("d1.tsx", `const s = 'a ${EM} b'\n`)]).length);
check("en-dash-in-a-string-denies", 1, scan([write("d2.tsx", `const s = 'a ${EN} b'\n`)]).length);
check("em-dash-in-an-aria-label-denies", 1, scan([write("d3.tsx", `<img aria-label="Portlink ${EM} chart" />\n`)]).length);
check("em-dash-in-css-content-denies", 1, scan([write("d4.css", `.x::after { content: "${EM}"; }\n`)]).length);
// A block comment that never closes must not swallow the rest of the file into an exemption.
check("code-after-a-closed-block-comment-still-denies", 1,
  scan([write("d5.tsx", `/* prose ${EM} here */ const s = 'a ${EM} b'\n`)]).length);

// ── the PASS side, which is what decides whether anyone can keep working here ──────────────────
check("a-file-with-no-dashes-is-clean", 0, scan([write("p1.tsx", `const s = 'a - b'\n`)]).length);
// The decider, and the pair for d1: the SAME sentence, moved into a comment.
check("the-same-sentence-in-a-line-comment-passes", 0, scan([write("p2.tsx", `// prose ${EM} here\nconst s = 'a'\n`)]).length);
check("the-same-sentence-in-a-block-comment-passes", 0, scan([write("p3.tsx", `/**\n * prose ${EM} here\n */\nconst s = 'a'\n`)]).length);
check("the-same-sentence-in-a-jsx-comment-passes", 0, scan([write("p4.tsx", `<div>{/* prose ${EM} here */}</div>\n`)]).length);
check("the-same-sentence-in-a-css-comment-passes", 0, scan([write("p5.css", `/* prose ${EM} here */\n.x { color: red; }\n`)]).length);
// The pair for the directive: identical line, one word different.
check("a-string-with-the-directive-passes", 0, scan([write("p6.tsx", `const s = 'a ${EM} b' // lint-allow-style\n`)]).length);
check("the-SAME-line-without-the-directive-denies", 1, scan([write("p7.tsx", `const s = 'a ${EM} b'\n`)]).length);
// A double slash inside a string is not a comment, so it must not exempt the rest of the line.
check("a-url-in-a-string-does-not-open-a-comment", 1,
  scan([write("p8.tsx", `const s = 'https://portlink.app ${EM} home'\n`)]).length);

// ── the scope is real, not decorative ─────────────────────────────────────────────────────────
// codeLines is the thing the rule rests on; assert it strips rather than trusting the cases above
// to have exercised it for the right reason.
const stripped = codeLines(`/* ${EM} */\nconst s = 'x'\n`).map((l) => l.code).join("");
check("codeLines-removes-the-comment-body", false, stripped.includes(EM));

fs.rmSync(dir, { recursive: true, force: true });
console.log(`\nSELFTEST_MATCHES=${passes} SELFTEST_MISMATCHES=${fails}`);
process.exit(fails === 0 ? 0 : 1);
