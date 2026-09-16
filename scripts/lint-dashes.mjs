#!/usr/bin/env node
/**
 * lint-dashes.mjs: refuse a U+2014 or U+2013 in this site's shipped copy.
 *
 *   node scripts/lint-dashes.mjs          (npm run lint:dashes, and prebuild)
 *   Exit 0 = clean in the declared scope; 1 = at least one violation.
 *
 * ## THE RULE
 *
 * No em-dash or en-dash in copy a visitor can read. Kris stated it 24.06.2026 for the platform
 * and it names chat, code, commits and docs; David restated it 15.09.2026 as covering websites
 * explicitly. It is enforced in `portlink-platform` by two ports, `scripts/lint-style.cjs`
 * (absolute, over UI copy) and `scripts/lint-diff-dashes.mjs` (per hunk, over the whole repo).
 * This site had neither, which is why eight of the character reached the served page and one
 * reached the browser tab title.
 *
 * ## WHY THIS IS THE ABSOLUTE FORM AND NOT A PORT OF THE DIFF GATE
 *
 * The diff gate grades a pull request against its merge-base. It is the right shape for a repo
 * with 20 445 existing occurrences, and it is wired into CI, where the base is an input of the
 * event. THIS REPO HAS NO CI (`ls .github/workflows` is empty) and Netlify is the only thing that
 * builds it, so the only place a gate can stand is `prebuild`. A build has no merge-base: the
 * platform's own local wrapper answers "NOT MEASURED" and exits 0 when it cannot resolve one,
 * which is the correct discipline there and a silent pass here, in the one place this gate exists
 * to fire. A gate that cannot measure must not be the only gate.
 *
 * The absolute form is affordable here because the scope below is already clean, measured at
 * adoption. It cannot answer NOT MEASURED: it either finds the character or it does not.
 *
 * ## SCOPE IS DECLARED AND PRINTED, BECAUSE A ZERO IS ONLY EVER A SCOPED ZERO
 *
 * INCLUDE is the code that renders portlink.app's own pages. EXCLUDE is printed on every run,
 * so "clean" can never be read as "clean everywhere":
 *
 *   app/_ds/        vendored design system, replaced wholesale by a version bump
 *   app/seatrade/   ) the Seatrade Cruise Med 2026 funnel and its API, deliberately out of the
 *   app/api/        ) landing rebuild's scope. It carries the character today; that residue is
 *   lib/            ) reported, not silently covered, and closing it is its own scoped change.
 *   components/seatrade/
 *
 * ## SCOPE IS CODE, NOT COMMENTS
 *
 * Exactly lint-style.cjs's reading: comments are stripped before testing, so only strings and
 * identifiers that ship are bound. A dash in a JSDoc is prose and reaches nobody. Block, line and
 * JSX comments in TS/TSX, and block comments in CSS.
 *
 * ## THE OPT-OUT IS THE PLATFORM'S DIRECTIVE, NOT A SECOND ONE
 *
 * `lint-allow-style` on the line. Two ports with two hatches is two rules.
 *
 * ## THIS FILE CONTAINS NO LITERAL DASH, ON PURPOSE
 *
 * Every occurrence is a — or – escape, and a finding is printed with the character
 * replaced by a [U+2014] marker. A port whose own source carries what it bans cannot be
 * introduced under its own rule, and a gate that prints the banned character to a terminal is
 * doing the thing it exists to stop. The marker is also better output: these are hard to see and
 * easy to mistake for a hyphen.
 *
 * Self-test: `npm run lint:dashes-selftest`. It proves the scanner can SEE the character before
 * any clean result from it is believed, and every refusal case has a pass case beside it.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EM = "—";
const EN = "–";
/** lint-style.cjs's DASH_RE, character for character. Do not narrow one without the other. */
const DASH_RE = new RegExp(`[${EM}${EN}]`, "g");
/** lint-style.cjs's ALLOW_DIRECTIVE. Shared on purpose; see the header. */
const ALLOW_DIRECTIVE = "lint-allow-style";
const MARK = { [EM]: "[U+2014]", [EN]: "[U+2013]" };

export const INCLUDE_DIRS = ["app", "components", "hooks"];
export const EXCLUDE_PREFIXES = [
  "app/_ds/",
  "app/seatrade/",
  "app/api/",
  "components/seatrade/",
];
const EXTS = [".ts", ".tsx", ".css"];

const relPath = (p) => path.relative(ROOT, p).split(path.sep).join("/");

function listFiles(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else if (entry.isFile() && EXTS.some((e) => entry.name.endsWith(e))) out.push(full);
  }
  return out;
}

/**
 * Each line as `{ n, raw, code }`, where `code` has its comments removed. Block comments are
 * tracked across lines, so a dash inside a multi-line JSDoc contributes nothing. Covers
 * `{/* … *\/}` JSX comments for free, since those are a block comment inside braces. `//` only
 * outside a string, checked crudely but adequately: a `//` preceded by an odd number of unescaped
 * quotes of either kind is inside one.
 *
 * ⛔ `raw` IS RETURNED BECAUSE THE DIRECTIVE LIVES IN A COMMENT AND THE DASH DOES NOT. Testing
 * both against `code` was the first form here, and the self-test's directive pair refused it: the
 * comment strip removes `// lint-allow-style` before the exemption can be read, so the documented
 * escape hatch did not exist and the only way past the gate would have been to delete it. A gate
 * whose own opt-out does not work is a gate somebody switches off. Dash against `code`, directive
 * against `raw`, exactly as lint-style.cjs does it.
 */
export function codeLines(source, { css = false } = {}) {
  const lines = source.split("\n");
  const out = [];
  let inBlock = false;
  for (let i = 0; i < lines.length; i++) {
    let code = lines[i];
    if (inBlock) {
      const end = code.indexOf("*/");
      if (end === -1) { out.push({ n: i + 1, raw: lines[i], code: "" }); continue; }
      code = code.slice(end + 2);
      inBlock = false;
    }
    code = code.replace(/\/\*[\s\S]*?\*\//g, "");
    const open = code.indexOf("/*");
    if (open !== -1 && code.indexOf("*/", open) === -1) {
      inBlock = true;
      code = code.slice(0, open);
    }
    if (!css) {
      // A `//` inside a string literal is not a comment. Count unbalanced quotes before it.
      const at = code.indexOf("//");
      if (at !== -1) {
        const before = code.slice(0, at);
        const quotes = (ch) => (before.match(new RegExp(`(?<!\\\\)${ch}`, "g")) || []).length;
        const open2 = quotes("'") % 2 || quotes('"') % 2 || quotes("`") % 2;
        if (!open2) code = before;
      }
    }
    out.push({ n: i + 1, raw: lines[i], code });
  }
  return out;
}

function marked(text) {
  let out = "";
  for (const ch of text) out += MARK[ch] ?? ch;
  return out;
}

export function scan(files) {
  const findings = [];
  for (const file of files) {
    const rel = relPath(file);
    const css = file.endsWith(".css");
    for (const { n, raw, code } of codeLines(fs.readFileSync(file, "utf8"), { css })) {
      // The dash is graded on the stripped line; the directive is read on the whole one, because
      // the directive is itself a comment. See codeLines' header.
      if (!code || raw.includes(ALLOW_DIRECTIVE)) continue;
      const hits = code.match(DASH_RE);
      if (hits) findings.push({ file: rel, line: n, count: hits.length, text: code.trim() });
    }
  }
  return findings;
}

function main() {
  const files = INCLUDE_DIRS.flatMap((d) => listFiles(path.join(ROOT, d)))
    .filter((f) => !EXCLUDE_PREFIXES.some((p) => relPath(f).startsWith(p)));

  const findings = scan(files);
  const scope = `${files.length} file(s) under ${INCLUDE_DIRS.join(", ")}; not scanned: ${EXCLUDE_PREFIXES.join(" ")}`;

  if (findings.length === 0) {
    console.log(`lint-dashes: OK. ${scope}. No U+2014 or U+2013 in shipped copy.`);
    return 0;
  }

  const total = findings.reduce((a, f) => a + f.count, 0);
  console.error(`lint-dashes: ${total} banned dash(es) on ${findings.length} line(s). ${scope}.`);
  console.error("");
  for (const f of findings) {
    console.error(`  ${f.file}:${f.line}  x${f.count}`);
    console.error(`      ${marked(f.text).slice(0, 160)}`);
  }
  console.error("");
  // The refusal names the remedy, copied from lint-style.cjs rather than paraphrased, so one rule
  // with three ports cannot become one rule with three different fixes.
  console.error('Fix: em/en-dash → grammar (colon/comma/parens/period) or "-" placeholder.');
  console.error("Kris' rule (24.06.2026) names chat, code, commits and docs; David restated it for websites 15.09.2026.");
  console.error(`Genuinely needs the character? append "${ALLOW_DIRECTIVE}" on the line, the directive lint-style.cjs takes.`);
  return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exit(main());
}
