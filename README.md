# Portlink Landing Page

Public marketing site for [Portlink](https://portlink.app) — operational coordination infrastructure for the cruise industry. Next.js 16, App Router, deployed via Netlify.

Consumes the Portlink Design System **v4.1.1** (see `app/_ds/VERSION`).

## Design System

This app **vendors** the DS — it doesn't re-declare tokens or re-implement shared components. Everything brand- or surface-level lives in the sibling repo `portlink-design-system/` and is distributed here as two generated bundles.

```
app/_ds/
├─ portlink-tokens.dist.css   ← Tier 1 + Tier 2 tokens (generated)
├─ ds-styles.bundle.css       ← .pl-* / .wh-* component CSS (generated)
├─ ds-styles.css              ← back-compat alias of the bundle
├─ VERSION                    ← plain text "v4.1.1"
└─ manifest.json              ← per-file SHA-256 for integrity
```

`app/globals.css` imports tokens.dist + ds-styles.bundle at the top of the cascade. No component here defines brand colours, type, spacing, motion, or shadows — all of that resolves to `--ds-*` values declared in the vendored tokens file.

### Resync from the DS

When the DS ships a new version:

```bash
cd ../portlink-design-system
npm run ds:release            # regenerates dist + copies into both consumers
```

Or preview without copying:

```bash
cd ../portlink-design-system
node scripts/sync-consumers.mjs --check --only=landing
```

### Prebuild guard

`scripts/check-ds-version.mjs` runs as the npm `prebuild` hook. It verifies `app/_ds/VERSION` parses as semver, and — if the sibling DS repo exists locally — warns when the vendored version lags. To fail the build on drift:

```bash
npm run ds:check              # --strict, exits 1 on drift
```

CI environments without the sibling repo fall through cleanly (warn-only).

### Landing-only styles

Everything not covered by the DS stays here:

- `app/globals.css` — a thin alias layer (`--bg`, `--brand`, `--wave-1`, `--alert`, …) that points at `--ds-*` values for migration convenience. No hardcoded colours.
- Section-level layout CSS in `app/page.tsx` and component files — composition, not branding.
- One legitimate hex exemption: `app/api/access/route.ts` uses literal hex inside a transactional email HTML template, because email clients don't resolve CSS variables.

If you catch yourself adding a token, a shadow value, or a brand colour in this repo — stop and move it to `portlink-design-system/` first. See the sibling repo's `CONTRIBUTING.md`.

## Project structure

```
app/
├─ _ds/                       vendored DS distribution
├─ api/                       Netlify-backed route handlers (access, reserve)
├─ globals.css                alias layer + page-level styles
├─ layout.tsx                 root layout, font loading, theme meta
└─ page.tsx                   landing composition (hero + bento + scroll + gate)
public/                       static assets, logos, OG images
scripts/
└─ check-ds-version.mjs       prebuild guard
```

## Getting started

```bash
npm install
npm run dev                   # http://localhost:3000
npm run build                 # prebuild guard runs first
npm run ds:check              # strict DS version check
```

## Deploy

Netlify, wired to the main branch. Each push triggers `npm run build`, which runs the DS version guard before `next build`. The guard is warn-only in Netlify (no sibling DS in the build container); strict mode is reserved for local dev and the manual `ds:check` script.

## Related repos

- `portlink-design-system/` — source of truth for tokens, components, specimens
- `wheelhouse-v2/` — internal mission-control app, consumes the same DS

## Related docs

- `../portlink-design-system/README.md` — DS overview
- `../portlink-design-system/SYNC.md` — distribution pipeline
- `../portlink-design-system/CONSUMERS.md` — this app's entry as a DS consumer
- `../portlink-design-system/docs/BRAND.md` — brand anchor
