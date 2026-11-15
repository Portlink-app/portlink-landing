# portlink-landing

The public Portlink marketing site: Next.js 16, live at **https://portlink.app**.
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
| GitHub | `Portlink-app/portlink-landing`, default branch `main`, ruleset `27278269` (`main-pr-only`, 14.11.2026: squash-only PRs, no direct pushes). Authenticate via GitHub App `portlink-app-factory` (`5762523`, installation `182031120`) for repo/PR work and `portlink-app-verdict` (`5762513`, installation `182031016`) for `portlink/verdict` commit statuses. | `git remote -v`; `~/Projects/bakke/agent-system/bin/github-app token <ref>` |
| GitHub (second remote) | `v2` -> `https://github.com/portlinkadmin/portlink-landing-v2.git`, public, last pushed 20.03.2026. **Not the live site.** Never `git push v2` expecting a deploy | `git remote -v` |
| CI | `.github/workflows/ci.yml` (`verify` job running `npm ci --no-audit --no-fund` and `npm run verify` on `ubuntu-latest`) | `gh pr checks <pr> -R Portlink-app/portlink-landing` |
| Netlify | account **Portlink** (`admin-irpjrvy`) · site **`portlin-landing-2`** (note the typo: "portlin", not "portlink"; `34ab2932-19da-44e5-b761-0bc83acc0055`) · **https://portlink.app** · builds `main` from the org repo | `GET /api/v1/sites` with the **Portlink** token |
| Resend | account **Portlink**, domain `portlink.app` verified (eu-west-1), sender `pilot@portlink.app`, audiences *General* + *Seatrade Med 2026* (`462446b9-df54-4ce1-ace1-8cf07e3b4d7b`) | `GET https://api.resend.com/domains` with the key below |
| Netlify Blobs | store `seatrade-leads` on the site above, site-wide (shared by drafts and production) | `node scripts/seatrade-delete-lead.mjs --list` |
| Supabase / Stripe / SMS | **none** | none configured |

**Deploy trigger, stated plainly:** Netlify auto-deploys `main` from `Portlink-app/portlink-landing`
to **portlink.app**, the company's public front door. Merging into `main` is publishing. A push to
the `v2` remote deploys nothing.

**Who may publish, settled 17.09.2026 and updated 14.11.2026.** **A change David asked for is
published by whoever carries it out, all the way to the live domain, with no intermediate ask.**
What stays his is the publish nobody requested: an agent-initiated edit to the public site.

**Publishing uses squash-merged pull requests (ruleset `27278269`, 14.11.2026).** Direct pushes to
`main` (`git push origin main`) are blocked by the `main-pr-only` ruleset. To ship a change David
asked for:
1. Push a branch and open a pull request as `portlink-app-factory[bot]`.
2. Wait for `.github/workflows/ci.yml` (`verify`) to pass on the PR head SHA.
3. Have an independent Portlink verifier inspect the PR (`orgs/portlink/VERIFIER_ROLE.md`) and post
   a commit-bound `portlink/verdict` PASS status via `portlink-app-verdict[bot]`
   (`/Users/nyx/.buzz/OPS/scripts/portlink_verdict.py`). Builder lanes never mint or post their own
   verdict.
4. Squash-merge the PR into `main` (the production gate verifies both green checks and the
   commit-bound `portlink/verdict` status before admitting `gh pr merge`), then confirm the Netlify
   deploy record (`commit_ref`, `state`, `published_at`).

For an agent-initiated change nobody asked for, open the PR and leave merge approval to David.

**Credentials (references only, never values).** Vault `cypqkqoeuibf4f6aud47v3qooa` (*Portlink*):

| Need | `op://` reference |
|---|---|
| GitHub App `portlink-app-factory` (App `5762523`, installation `182031120`, repo/PR/actions) | `op://cypqkqoeuibf4f6aud47v3qooa/p4zg7e67zuku7xe23rukd7u4ku/password` |
| GitHub App `portlink-app-verdict` (App `5762513`, installation `182031016`, verifier `statuses:write`) | `op://cypqkqoeuibf4f6aud47v3qooa/owgdcoruwvb5hgoulfqod3l2um/password` |
| Netlify API token (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/a7h7xyjwjlfmzsc4oaf6gmuoym/credential` |
| Resend API key (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/lhylbglnfx7vy7yenlxn2tfehm/credential` |

Mint short-lived GitHub App installation tokens with
`~/Projects/bakke/agent-system/bin/github-app token <ref>`. Read API tokens with
`~/.claude/bin/secret get '<ref>'` piped straight into the consuming command; never echo, log or
paste a value. The former `portlinkadmin` PAT (`owl6advkmjvx2bjpzi3y6duyha`) is retired for agent
operations.

**Runtime environment (Netlify site env, all contexts):** `RESEND_API_KEY` (same value as the
1Password item above) and `ADMIN_EMAIL` (where pilot requests, Seatrade lead notifications and CSV
exports land; `post@davidbakke.no` as of 14.09.2026). Nothing else. Netlify Blobs needs no credential
on Netlify; locally run `netlify dev` (the checkout is linked to the site) or export
`NETLIFY_SITE_ID` + `NETLIFY_AUTH_TOKEN`.

**Hard separation:** GitHub org `Portlink-app` (`portlink-app-factory[bot]` /
`portlink-app-verdict[bot]`) and the **Portlink** Netlify account. The **Bakke & Co** side of this
machine (GitHub `GitDABA`, the Bakke & Co Netlify account, vault `7tr6yo3acnhdlbltgkzexw7rce`) is a
different company and is out of bounds. Default `gh` auth on this machine is `Bakke-Co` / `GitDABA`;
always pass a process-scoped `GH_TOKEN` minted from `portlink-app-factory` when operating on
`Portlink-app` repos. No Supabase project belongs to this repo.

**Remote routing verified 15.11.2026:** `origin` uses
`https://github.com/Portlink-app/portlink-landing.git`. Recheck process-scoped GitHub App identity
before external work.

**Irreversible steps and who owns them:**

| Step | Owner | Note |
|---|---|---|
| Squash-merging a PR to `main`, carrying out a change **David asked for** | **you land it** | his ruling, 17.09.2026: *"whenever i ask for somthing i expecot yoiu to tkae the instrcurtucon and land it all the way, without quaestion"*. Pass `verify`, obtain an independent `portlink/verdict` PASS status, squash-merge, and verify the Netlify deploy record without filing a decision row |
| Squash-merging a PR to `main`, carrying a change **nobody asked for** | **David approves** | it publishes portlink.app, the company's public front door. An agent-initiated edit to the public site stays his |
| `git push v2 ...` | **avoid** | that remote is a stale parallel repo and deploys nothing; pushing there splits history |
| Changing the custom domain or DNS for portlink.app | **David only** | it takes the company's public site offline |
| Bumping the vendored DS version in `app/_ds/` | **David approves** | it is a visual change to the public site; keep `CONSUMERS.md` in step |
