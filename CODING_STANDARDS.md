# CODING_STANDARDS.md - portlink-landing

Review-time coding standards, Studio Website Pipeline checks, vendored design-system rules, and the 12 Fowler structural smells for `portlink-landing`. Loaded on demand during diff verification (`two-axis-review --org portlink`, `Surgeon (Portlink)`, and `Starboard`). Always-loaded service connections and release rules live in [CLAUDE.md](CLAUDE.md) and [AGENTS.md](AGENTS.md); canonical domain terms live in [GLOSSARY.md](GLOSSARY.md).

## 1. Studio Website Pipeline & Visual Verification (`orgs/portlink/RULES.md` #39)

1. **Direction and live references:** Ground every visual or layout change in `DIRECTION.md` and `docs/LANDING-DIRECTION.md` with `design-taste-frontend` and `signature-design`.
2. **Real product choreography:** Capture real desktop (`1440x900`) and mobile (`390x844`) product frames via `capture.mjs`, keep every chapter's separate Wide and Narrow composition in `components/scenes/chapters.ts`, and wire motion with `Lenis` and `GSAP ScrollTrigger`.
3. **Floor and Reflex gates:** Never use banned fonts (`Fraunces`, `Instrument Serif`), external placeholder URLs (`picsum.photos`), macOS traffic-light chrome, emoji icons, 3-column icon card grids, or headlines exceeding 2 lines. Pass the Cold Hero Gate (`website-verify --hero-only`) and record a `0 FAIL` receipt from `/Users/nyx/.local/bin/website-verify` at `HEAD` before reporting completion on visual changes.
4. **Vendored design system:** Do not edit generated files under `app/_ds/*`; keep `npm run ds:check` and `check:viz-type` green.

## 2. Copy, Privacy & Verification Gates (`npm run verify`)

1. **No em-dashes (U+2014) or en-dashes (U+2013):** Enforced by `npm run lint:dashes` (`scripts/lint-dashes.mjs`) and calibrated by `npm run lint:dashes-selftest`. Use standard punctuation (colon, comma, parentheses, full stop) or an ASCII hyphen `-`.
2. **Brand casing:** Always write `Portlink` (capital P, lowercase remainder) across copy, metadata, and identifiers.
3. **Service route integrity:** Keep `npm run check:service-docs` green (`scripts/check-service-docs.mjs` with `--selftest`).
4. **Full verification suite:** Run `npm run verify` and `npm run build` before opening or updating a pull request.

## 3. Deep-Module Architecture & Seam Testing

1. **Deep modules over shallow wrappers:** Favour cohesive modules with a narrow public interface hiding internal mechanics. Apply the **Deletion Test**: remove pass-through wrappers that add no policy or validation.
2. **The interface is the test surface:** Calibrate every verification script in `scripts/check-*.mjs` with paired known-good and known-bad self-tests (`--selftest`).
3. **One adapter = hypothetical seam, two = real:** Avoid single-implementation abstraction layers.

## 4. Axis 2 Review Checklist: 12 Fowler Structural Smells

Reviewers inspect every diff (`git diff <base>...<head>`) against all 12 structural smells and report concrete `file:line` findings when newly introduced or worsened:

1. **Mysterious Name:** Identifiers whose intent cannot be read without tracing internals.
2. **Duplicated Code:** Same rule, predicate, or transform copied into two or more places.
3. **Feature Envy:** Function reaching repeatedly into another module's internals instead of living on that module.
4. **Data Clumps:** The same group of 3+ primitives passed together across multiple call sites instead of one domain type.
5. **Primitive Obsession:** Raw strings or numbers carrying domain invariants without typed boundaries.
6. **Repeated Switches:** Identical conditional or switch dispatch on a type or status duplicated across modules.
7. **Shotgun Surgery:** One logical change requiring synchronized edits across 4+ unrelated files.
8. **Divergent Change:** One module edited for unrelated reasons (multiple orthogonal responsibilities mixed together).
9. **Speculative Generality:** Hooks, flags, options, or single-implementation adapters added for hypothetical future callers.
10. **Message Chains:** Deep `a.b().c().d()` traversal coupling callers to internal object structure.
11. **Middle Man:** Pass-through wrapper delegating almost every call without adding policy, validation, or abstraction depth.
12. **Refused Bequest:** Subclass or implementation ignoring or throwing on inherited or interface contract members.
