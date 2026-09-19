# Portlink landing

## Services and connections

Verified 19.09.2026 against GitHub and the Netlify site API. This routing supersedes the old Connections table and the pre-transfer remote note in CLAUDE.md.

**Architecture:** Next.js App Router marketing site on Netlify. The homepage and contact, team and privacy pages share the vendored Portlink design system. Contact and pilot requests use Resend. The separate Seatrade funnel uses Resend and Netlify Blobs. No Supabase database belongs to this repository.

| Service | This repo uses | Verify with |
|---|---|---|
| GitHub | account `portlinkadmin`, org repository `Portlink-app/portlink-landing`, origin `https://github.com/Portlink-app/portlink-landing.git`, default `main` | authenticated `/user` and repository API, `git remote -v` |
| Netlify | account `admin-irpjrvy`, site `portlin-landing-2`, id `34ab2932-19da-44e5-b761-0bc83acc0055`, domain `https://portlink.app`, builds `main` | site API id, account_slug, custom_domain and build_settings |
| Resend | Portlink account, contact and Seatrade mail, runtime `RESEND_API_KEY` | existing mail guards; do not send verification mail |
| Netlify Blobs | `seatrade-leads`, on the site above | existing Seatrade entry documentation |
| Supabase | none for the landing site | the registry's Portlink product database is outside this repository |

**Credentials:** references only. Portlink vault `cypqkqoeuibf4f6aud47v3qooa`.

| Need | Reference |
|---|---|
| GitHub | `op://cypqkqoeuibf4f6aud47v3qooa/owl6advkmjvx2bjpzi3y6duyha/credential` |
| Netlify | `op://cypqkqoeuibf4f6aud47v3qooa/a7h7xyjwjlfmzsc4oaf6gmuoym/credential` |
| Resend | `op://cypqkqoeuibf4f6aud47v3qooa/lhylbglnfx7vy7yenlxn2tfehm/credential` |

Use `/Users/nyx/.Codex/bin/secret`. Feed values directly into the consuming process; never log them. Verify GitHub login is `portlinkadmin` for each session. The default connector and shell account can be `GitDABA`, which is outside this project's scope. Use a process-local Portlink credential rather than switching the machine's global account.

**Runtime configuration:** Netlify manages `RESEND_API_KEY` and `ADMIN_EMAIL`; Blobs credentials are platform-provided in production. Their values do not belong in these documents.

**Hard separation:** only this org repository and this Netlify site. The `v2` remote is stale and deploys nothing. No neighbouring project's database, credentials or hosting belongs in this task.

**Publishing:** the explicit ruling recorded in CLAUDE.md on 17.09.2026 applies. A change David requested is carried through to the live domain without an intermediate ask. After verification, publishing is `ALLOW_MAIN=1 git push origin main`. Agent-initiated publication, DNS changes and design-system version bumps still require David's approval. Never push a shared checkout containing another session's unpushed work.

## Homepage work entry point

Read `docs/LANDING-DIRECTION.md` for the design rationale, Refero references, component map, verification evidence and current progress. Do not edit generated `app/_ds/*`. The product explorer's chapter registry is `components/scenes/chapters.ts`; keep every scene's separate Wide and Narrow composition. Contact forms and the Seatrade campaign are independent of this visual upgrade.

Run `npm run build` and `npm run verify`. The build checks rendered scene pairs and excludes film from server markup. `check:viz-type` covers authored TSX and CSS, including the new CSS modules. Browser verification still owns actual layout, keyboard, fragment links and playback.
