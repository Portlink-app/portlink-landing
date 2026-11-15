# portlink-landing

The public Portlink marketing site, Next.js 16, live at **https://portlink.app**.
It vendors the Portlink design system into `app/_ds/` at a pinned version; see
`../portlink-design-system/CONSUMERS.md`.

## Services and connections

**Architecture:** A Next.js App Router marketing site on Netlify with no database of its own, no
auth and no payments. Two server-side flows exist: the pilot request form (`/api/access`, Resend)
and the **Seatrade Cruise Med 2026 lead funnel** (`/seatrade/`, `/api/seatrade/*`; Resend for the
four-email sequence, **Netlify Blobs** for the lead store). Everything else is static. The vendored
design system is copied in rather than fetched at runtime. Funnel entry doc:
`docs/SEATRADE-MED-2026.md`.

| Service | This repo uses | Verify with |
|---|---|---|
| GitHub | **`Portlink-app/portlink-landing`** (the **org**), public, default branch `main`. Local `origin` is `https://github.com/Portlink-app/portlink-landing.git` (measured 13.10.2026; the pre-transfer path still redirects). Push a task branch and open a pull request: **David = `Bakke-Co`** (renamed from `GitDABA` on 25.10.2026, account 20335443), Kris = `Nautiqs`, automation = `portlink-app-factory[bot]` (`portlinkadmin` is a read-only org member since 28.09.2026 and cannot push) | `git remote -v`; `gh repo view Portlink-app/portlink-landing` with the named login |
| GitHub, second remote | `v2` -> `https://github.com/portlinkadmin/portlink-landing-v2.git`, public, last pushed 20.03.2026. **Not the live site.** Never `git push v2` expecting a deploy | `git remote -v` · `gh repo view portlinkadmin/portlink-landing-v2` |
| Netlify | account **Portlink** (`admin-irpjrvy`) · site **`portlin-landing-2`**, note the spelling "portlin", not "portlink" (`34ab2932-19da-44e5-b761-0bc83acc0055`) · **https://portlink.app** · builds `main` from the org repo | `GET /api/v1/sites` with the **Portlink** token |
| Resend | account **Portlink**, domain `portlink.app` verified (eu-west-1), sender `pilot@portlink.app`, audiences *General* + *Seatrade Med 2026* (`462446b9-df54-4ce1-ace1-8cf07e3b4d7b`) | `GET https://api.resend.com/domains` with the key below |
| Netlify Blobs | store `seatrade-leads` on the site above, site-wide (shared by drafts and production) | `node scripts/seatrade-delete-lead.mjs --list` |
| Visitor intelligence | own first-party lead tracking: `/api/intel/*`, `/leads/`, Blobs store `visitor-intel`, hourly scheduled function `intel-cron`; Netlify manages `INTEL_SECRET` | `docs/VISITOR-INTELLIGENCE.md`; `npm run check:consent-gate` |
| CI | GitHub Actions `.github/workflows/ci.yml` (`verify` job running `npm run verify` on `ubuntu-latest`), plus `.github/CODEOWNERS` (`@Bakke-Co @Nautiqs`) | `gh run list --repo Portlink-app/portlink-landing` |
| Supabase / Stripe / SMS | **none** | no database or payment integration in this repository |

**Deploy trigger and branch rules (updated 14.11.2026):** Netlify auto-deploys `main` from the
**org** repo to **portlink.app**, the company's public front door. `main` is protected by an active
repository ruleset (`main`: pull request required, deletion and force-push blocked, `verify` CI job
in `.github/workflows/ci.yml`). Push work on a task branch and land via a verified pull request. A
push to the `v2` remote deploys nothing.

**Credentials: references only, never values.** Vault `cypqkqoeuibf4f6aud47v3qooa` (*Portlink*):

| Need | Route |
|---|---|
| GitHub (read, push a task branch, PR) | Named gh keyring login `GH_TOKEN="$(gh auth token --user Bakke-Co)" gh ...` (Kris: `Nautiqs`) or the Portlink App Factory token `op://cypqkqoeuibf4f6aud47v3qooa/p4zg7e67zuku7xe23rukd7u4ku/password` via `github-app token`. Never `gh auth switch` and never the ambient active account |
| Netlify API token (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/a7h7xyjwjlfmzsc4oaf6gmuoym/credential` |
| Resend API key (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/lhylbglnfx7vy7yenlxn2tfehm/credential` |
| INTEL_SECRET (visitor intelligence) | `op://cypqkqoeuibf4f6aud47v3qooa/3jup4j5ayriz63j6ocfwqyczo4/password` |

The former `GitHub PAT (Portlink)` item (`owl6advkmjvx2bjpzi3y6duyha`) belongs to `portlinkadmin` and
reads this repo as pull-only since 28.09.2026 (measured 13.10.2026: `push:false`). It is not a route
for any GitHub action here; do not reintroduce it.

Read a value only through the secret wrapper and pipe it straight into the consumer:
`~/.claude/bin/secret probe '<ref>'` proves the reference resolves (byte count, never the value);
`~/.claude/bin/secret get '<ref>' | <consumer>` uses it. Never echo, log or paste a value.

**Runtime environment (Netlify site env, all contexts):** `RESEND_API_KEY` (same value as the
1Password item above) and `ADMIN_EMAIL` (where pilot requests, Seatrade lead notifications and CSV
exports land; `post@davidbakke.no` as of 14.09.2026). Nothing else. Netlify Blobs needs no credential
on Netlify; locally run `netlify dev` (the checkout is linked to the site) or export
`NETLIFY_SITE_ID` + `NETLIFY_AUTH_TOKEN`.

**Local secrets:** `npm run dev` runs `scripts/dev.sh`, which starts `next dev` under
`op run --env-file=.env.op`, so `RESEND_API_KEY` comes from 1Password and `.env.local` holds only
`ADMIN_EMAIL`. Never write a key back into `.env.local`. Without `op` (or with `PL_DEV_NO_OP=1`) it is
plain `next dev`, and mail routes then run without a key.

**Hard separation:** this repo uses only the `Portlink-app` GitHub organisation through the named
login above, the **Portlink** Netlify account and the Portlink vault. Any other Netlify account,
vault or GitHub organisation on this machine is out of bounds. Check the identity with the named
login before every external action, because a wrong-account push lands in the wrong history. No
Supabase project belongs to this repo. `npm run check:service-docs` refuses the retired routes.

**Remote routing verified 13.10.2026:** origin already uses `https://github.com/Portlink-app/portlink-landing.git`. The former pre-transfer-origin cleanup item is closed. Recheck current identity before external work.

**Irreversible steps and who owns them:**

| Step | Owner | Note |
|---|---|---|
| Merging a pull request to `main` | **Founders / authorised release lane** | `main` is protected by a PR ruleset (14.11.2026) and auto-deploys to `portlink.app`. Specialist lanes push task branches and open PRs; release merges require verified CI (`npm run verify`) and founder/release authority |
| `git push v2 ...` | **avoid** | that remote is a stale parallel repo and deploys nothing; pushing there splits history |
| Changing the custom domain or DNS for portlink.app | **David / Kris only** | it takes the company's public site offline |
| Bumping the vendored DS version in `app/_ds/` | **David / Kris approves** | it is a visual change to the public site; keep `CONSUMERS.md` in step |
