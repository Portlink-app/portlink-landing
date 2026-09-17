# portlink-landing

The public Portlink marketing site — Next.js 16, live at **https://portlink.app**.
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
| GitHub | **`Portlink-app/portlink-landing`** (the **org**), public, default branch `main`. The local `origin` still says `https://github.com/portlinkadmin/portlink-landing.git` — the repo was **transferred to the org** and GitHub redirects the old path, which is why both work and why the Netlify site reports the org URL. Push with the `portlinkadmin` account | `gh repo view portlinkadmin/portlink-landing` → resolves to `Portlink-app/portlink-landing` |
| GitHub — second remote | `v2` → `https://github.com/portlinkadmin/portlink-landing-v2.git`, public, last pushed 20.03.2026. **Not the live site.** Never `git push v2` expecting a deploy | `git remote -v` · `gh repo view portlinkadmin/portlink-landing-v2` |
| Netlify | account **Portlink** (`admin-irpjrvy`) · site **`portlin-landing-2`** — note the typo, "portlin", not "portlink" — (`34ab2932-19da-44e5-b761-0bc83acc0055`) · **https://portlink.app** · builds `main` from the org repo | `GET /api/v1/sites` with the **Portlink** token |
| Resend | account **Portlink**, domain `portlink.app` verified (eu-west-1), sender `pilot@portlink.app`, audiences *General* + *Seatrade Med 2026* (`462446b9-df54-4ce1-ace1-8cf07e3b4d7b`) | `GET https://api.resend.com/domains` with the key below |
| Netlify Blobs | store `seatrade-leads` on the site above, site-wide (shared by drafts and production) | `node scripts/seatrade-delete-lead.mjs --list` |
| Supabase / Stripe / SMS / CI | **none** | `ls .github/workflows` → absent |

**Deploy trigger, stated plainly:** Netlify auto-deploys `main` from the **org** repo to
**portlink.app**, the company's public front door. Pushing `main` is publishing. There is no CI and
no build gate in front of it. A push to the `v2` remote deploys nothing.

**Who may publish, settled 17.09.2026.** This line used to read as a flat reservation to David, and
on 17.09 it cost him five hours: he asked for the draw block to come off the front page, the work was
done and proven within six minutes, and it then sat in PR #11 while two agents in turn refused to
merge it and put a decision row on his board instead. He had already decided. **A change David asked
for is published by whoever carries it out, all the way to the live domain, with no intermediate ask.**
What stays his is the publish nobody requested: an agent-initiated edit to the public site.

**Credentials — references only, never values.** Vault `cypqkqoeuibf4f6aud47v3qooa` (*Portlink*):

| Need | `op://` reference |
|---|---|
| GitHub PAT (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/owl6advkmjvx2bjpzi3y6duyha/credential` |
| Netlify API token (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/a7h7xyjwjlfmzsc4oaf6gmuoym/credential` |
| Resend API key (Portlink) | `op://cypqkqoeuibf4f6aud47v3qooa/lhylbglnfx7vy7yenlxn2tfehm/credential` |

`op://Portlink/…` also works (single-word vault name), unlike `op://Bakke & Co/…`, which `op`
rejects. Read with `op read '<ref>' --no-newline` and pipe straight into the consuming command;
never echo, log or paste a value.

**Runtime environment (Netlify site env, all contexts):** `RESEND_API_KEY` (same value as the
1Password item above) and `ADMIN_EMAIL` (where pilot requests, Seatrade lead notifications and CSV
exports land; `post@davidbakke.no` as of 14.09.2026). Nothing else. Netlify Blobs needs no credential
on Netlify; locally run `netlify dev` (the checkout is linked to the site) or export
`NETLIFY_SITE_ID` + `NETLIFY_AUTH_TOKEN`.

**Hard separation:** GitHub `portlinkadmin` / the `Portlink-app` org, and the **Portlink** Netlify
account. The **Bakke & Co** side of this machine — GitHub `GitDABA`, the Bakke & Co Netlify
account, vault `7tr6yo3acnhdlbltgkzexw7rce` — is a different company and is out of bounds. `gh`'s
active account defaults to `GitDABA`; check it every time, because a wrong-account push here lands
in the wrong company's history. No Supabase project belongs to this repo.

**Worth tidying, David's call:** the local `origin` points at the pre-transfer path. It works
through GitHub's redirect, but it makes every tool report a different owner than the one that owns
the repo. Repointing it (`git remote set-url origin https://github.com/Portlink-app/portlink-landing.git`)
is local and reversible — left undone here deliberately, since changing a remote is not a
documentation change.

**Irreversible steps and who owns them:**

| Step | Owner | Note |
|---|---|---|
| `git push origin main`, carrying out a change **David asked for** | **you land it** | his ruling, 17.09.2026: *"whenever i ask for somthing i expecot yoiu to tkae the instrcurtucon and land it all the way, without quaestion"*. Publishing is the last step of his instruction, not a separate permission. Do not stop at a pull request and do not file a decision row |
| `git push origin main`, carrying a change **nobody asked for** | **David approves** | it publishes portlink.app, the company's public front door, with no CI in between. An agent-initiated edit to the public site is still his |
| `git push v2 …` | **avoid** | that remote is a stale parallel repo and deploys nothing — pushing there splits history |
| Changing the custom domain or DNS for portlink.app | **David only** | it takes the company's public site offline |
| Bumping the vendored DS version in `app/_ds/` | **David approves** | it is a visual change to the public site; keep `CONSUMERS.md` in step |
