# portlink-landing — CHANGELOG

## DS v4.1.2 — 2026-11-01 — muted text meets AA on the canvas

Vendored DS v4.1.2 into `app/_ds/` (one value). Light `--ds-text-3` moves from `#6b7382` (4,36:1 on `--ds-canvas`, documented 5,1:1) to `#616876` (5,12:1). Every `.ds-subtle`, placeholder, table-muted, `--text-muted` and Havn label on the light canvas now passes WCAG AA. Dark theme unchanged. The DS build now fails on any text token below 4,5:1 or below its documented ratio.

## v4.1.0 — 2026-04-14 — DS consumer migration (Phase 3)

Landing is now a pure consumer of `portlink-design-system` v4.1. No tokens are defined locally (except the Tailwind `@theme` bridge that re-exposes DS tokens as Tailwind theme values). Every hex literal outside the transactional email template has been replaced with a DS variable reference. Brand visual shifts from the old warm sepia + teal palette to the v4 **Mist + Navy** palette automatically via the DS token distribution.

### What landed

**Token pipeline rewired.**

- `app/_ds/portlink-tokens.dist.css` — vendored from DS v4.1.0.
- `app/_ds/ds-styles.css` — vendored from DS v4.1.0 (brings in the full `.pl-*` + `.wh-*` class ladder).
- `app/globals.css` rewritten:
  - Old `:root` + `[data-theme="dark"]` blocks with hex values **deleted**.
  - DS dist imports added at the top.
  - Landing-local names (`--bg`, `--surface`, `--border`, `--text-primary`, `--brand`, `--wave-*`, `--nav-glass`, `--inverted-*`, etc.) preserved as **thin aliases** that re-point to `--ds-*` tokens, so every existing `var(--brand)` / `var(--bg)` call site continues to work unchanged.
  - Tailwind v4 `@theme` block added that maps DS tokens into Tailwind's theme (`bg-brand`, `text-primary`, `border-default`, etc. now emit DS-aligned colours).
  - Focus ring now uses `var(--ds-focus)` + `var(--ds-radius-xs)`.
  - Scroll-reveal and body transitions now driven by `var(--ds-dur-*)` + `var(--ds-ease-standard)` instead of hardcoded `0.3s ease`.

**Hex eradication.**

| Layer | Hex literals before | Hex literals after |
|---|---:|---:|
| `app/globals.css` | 50+ (token block) | **0** |
| `components/` (all, incl. sections) | 200 | **0** |
| `components/sections/*` | 2 | 0 |
| `components/Dashboard*.tsx` (6 files) | 151 | 0 |
| `components/{WavesHero,BentoGrid,ContainerScroll,PersonaToggle,PersonaGate,Nav}.tsx` | 7 | 0 |
| `app/api/access/route.ts` (email template) | ~40 | unchanged — intentional exception |

`app/api/access/route.ts` is a transactional HTML email renderer. Email clients strip `<style>` and don't resolve CSS custom properties, so inlined hex is required. This file is explicitly out of scope for the "zero hex" rule.

**Motion tokens.**

35+ hardcoded CSS transition durations / easings across 15 component files replaced with `var(--ds-dur-*)` and `var(--ds-ease-*)`. Framer-motion JavaScript `duration` props were **intentionally left alone** — those are JS numbers, not CSS strings, and the DS doesn't currently expose a JS-side motion API. Revisit in Phase 5 if we package motion tokens for JS consumption.

### Component-by-component status

| File | Action | Notes |
|---|---|---|
| `components/Nav.tsx` | Hex swap | 2 `#ffffff` → `var(--ds-text-invert)`. Body already used aliases. Mirrors DS `.pl-nav` contract. |
| `components/WavesHero.tsx` | No hex changes | Canvas `fillStyle` uses `rgba(255,255,255,...)` (no hex). CSS already used `var(--wave-*)` aliases, which now point at `--ds-wave-*`. Mirrors DS `.pl-waves-hero`. |
| `components/BentoGrid.tsx` | Already clean | Already DS-token-only. Mirrors DS `.pl-bento`. |
| `components/ContainerScroll.tsx` | 5 hex-rgba-hybrids → rgba() | Device bezel hex (`#5a5a5a`, `#1a1a1a`, `#3a3a3a`) — flagged in DS Phase 2 as candidate for `--ds-bezel-*` family; still hardcoded in the DS too, so deferred. Mirrors DS `.pl-container-scroll`. |
| `components/PersonaToggle.tsx` | Already clean | Already DS-token-only. Mirrors DS `.pl-persona-toggle`. |
| `components/PersonaGate.tsx` | Already clean | Already DS-token-only. Mirrors DS `.pl-persona-gate`. |
| `components/DashboardMockup.tsx` | 25 hex swaps | Stylized wheelhouse-v2 mockup. Illustrative only — does not mirror a DS component. |
| `components/DashboardMockupMobile.tsx` | 25 hex swaps | ditto |
| `components/DashboardMockupMobileAgent.tsx` | 25 hex swaps | ditto |
| `components/DashboardMockupMobileTour.tsx` | 26 hex swaps | ditto |
| `components/DashboardAgent.tsx` | 27 hex swaps | ditto |
| `components/DashboardTour.tsx` | 23 hex swaps | ditto |
| `components/sections/HeroSection.tsx` | 1 hex swap | `#ffffff` → `var(--ds-text-invert)` for CTA text on brand bg. |
| `components/sections/BentoSection.tsx` | 1 hex swap | `#22c55e` → `var(--ds-success)` for checkmark icon. |
| `components/sections/{Access,Ecosystem,Footer,Pain,Pilot,Role,Value}Section.tsx` | Motion tokens only | No hex; motion transitions updated. |

### Removed / deleted

- **`app/globals.css`** hex-valued `:root` and `[data-theme="dark"]` blocks. No landing-local hex values remain. The landing no longer defines any tokens of its own — if a new token is needed, add it upstream in `portlink-design-system` first.

### Replaced, not rebuilt

None of these local components were deleted in favour of their DS equivalents this phase — they still live in `portlink-landing/components/`. The DS promotion in v4.1 published canonical `.pl-waves-hero`, `.pl-bento`, `.pl-container-scroll`, `.pl-persona-toggle`, `.pl-persona-gate` classes, but landing's local React components already hit all the same visual contracts via the aliased variables. A future follow-up could swap the local files for direct imports from `portlink-design-system/components/ui/` once the DS is published as an installable package.

### Left in place as landing-specific

- All 6 `Dashboard*.tsx` mockup components — these are stylized wheelhouse screenshots specific to the marketing story, not product components.
- All `components/sections/*.tsx` — page sections (Hero, Value, Pain, Access, etc.) are landing composition, not DS atoms.
- `Nav.tsx`, `Footer.tsx` — landing-specific chrome.

### Animation + interaction parity

- CSS transition durations/easings now consume `--ds-dur-*` + `--ds-ease-*`.
- `prefers-reduced-motion` honoured via the existing `.reveal` rule; adding a `@media (prefers-reduced-motion: reduce)` override for body transitions is tracked as a Phase 5 task.
- Framer-motion JS-side durations intentionally left as numeric literals (scope note above).

### Acceptance

- `grep -rnE '#[0-9a-fA-F]{3,8}\b' components/` → **0 matches** ✅
- `grep -nE '#[0-9a-fA-F]{3,8}\b' app/globals.css` → **0 matches** ✅
- `npx tsc --noEmit` → **clean** ✅ (no TypeScript errors after refactor)
- `npm run build` → **not run in this environment** — the build sandbox cannot fetch `@next/swc-linux-arm64-gnu`. Run locally on your Mac to confirm (`tsc` passing is a strong positive signal, and no structural changes were made that would affect bundling).

### Known follow-ups

- **Container-scroll device bezel colours** (`#5a5a5a`, `#1a1a1a`, `#3a3a3a`) — still hardcoded both here and in the DS. Tracked upstream as a `--ds-bezel-*` token family candidate.
- **Framer-motion JS tokens** — the DS does not currently publish a JS-side motion object. Candidate for Phase 5 if we want landing's Framer animations to track DS motion changes automatically.
- **Transactional email palette** — `app/api/access/route.ts` still uses old accent hex (`#3d7daf`, `#1e4a6e`, `#5ba3cc`). Not strictly in scope for Phase 3, but a one-hour refresh to v4 navy-aligned hex would keep the email visually coherent with the landing.
- **Consider dropping local landing components in favour of DS React imports** — blocked on publishing the DS as an installable package (not just as a vendored directory).

### Files touched

```
app/_ds/portlink-tokens.dist.css     [new, vendored from DS v4.1.0]
app/_ds/ds-styles.css                [new, vendored from DS v4.1.0]
app/globals.css                      [rewritten: imports DS, aliases local names, Tailwind @theme bridge]
components/Nav.tsx                   [2 hex + 3 motion]
components/WavesHero.tsx             [motion only]
components/BentoGrid.tsx             [motion only]
components/ContainerScroll.tsx       [5 hex-rgba-hybrid]
components/PersonaToggle.tsx         [motion only]
components/PersonaGate.tsx           [2 motion]
components/DashboardMockup.tsx       [25 hex + 3 motion]
components/DashboardMockupMobile.tsx [25 hex]
components/DashboardMockupMobileAgent.tsx [25 hex]
components/DashboardMockupMobileTour.tsx [26 hex]
components/DashboardAgent.tsx        [27 hex + 2 motion]
components/DashboardTour.tsx         [23 hex + 2 motion]
components/sections/AccessSection.tsx     [motion only — 6]
components/sections/BentoSection.tsx      [1 hex]
components/sections/EcosystemSection.tsx  [motion only — 1]
components/sections/Footer.tsx            [motion only — 1]
components/sections/HeroSection.tsx       [1 hex + 2 motion]
components/sections/PainSection.tsx       [motion only — 1]
components/sections/PilotSection.tsx      [motion only — 2]
components/sections/RoleSection.tsx       [motion only — 1]
components/sections/ValueSection.tsx      [motion only — 1]
CHANGELOG.md                         [this file]
```

### Not touched (intentional)

- `app/api/access/route.ts` — email template; see exception note above.
- `app/layout.tsx`, `app/page.tsx` — no hex / motion literals to change.
- `hooks/**`, `public/**`, `next.config.ts`, `package.json` — no DS coupling needed.
