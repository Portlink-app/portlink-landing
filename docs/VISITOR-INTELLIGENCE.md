# Visitor intelligence (Portlink's own lead tracking)

Entry doc. Built 29.09.2026 at David's request: "create a script and own solution that accomplishes
the same lead and information tracking as what Ospry accomplishes, built from scratch." It replaced
Ospry, which was removed the same day. Legal basis: `docs/LIA-VISITOR-INTELLIGENCE.md`. Consent
banner: `docs/CONSENT.md`.

## What it does, next to Ospry

| Ospry | Ours | Where |
|---|---|---|
| Pixel: page views, SPA navigation, scroll depth, form submits | Same, plus time on page and referrer/UTM. Form **events** only, never field values | `components/intel/VisitorTracker.tsx` |
| Visitor cookie `lgn_vid` on every consented visitor | **No cookie** for company-level. `pl_vid` only after "Remember me" | `lib/intel/client.ts` |
| Company identification (US-only on our unpaid plan) | Every visitor, worldwide: IP truncated to /24 or /48 → RIPEstat → ASN → holder + RDAP domain; PeeringDB + keyword list drop ISPs, clouds, VPNs | `lib/intel/org.ts` |
| Person names from a bought identity graph (RB2B), US only | Person only when they identify themselves: our contact form with "Remember me" on, or a **signed link we emailed them** | `app/api/intel/v/route.ts`, `scripts/lead-link.mjs` |
| "Resolve known visitors from links" (`lgn_cid`) | Same idea, `?pl=<token>` signed with INTEL_SECRET, stripped from the address bar after use | `lib/intel/token.ts` |
| ICP fit, Top leads, Top pages, velocity and intent rules | One scoring model: page points, depth, scroll, form, email link, several colleagues, target-account bonus | `lib/intel/config.ts`, `lib/intel/aggregate.ts` |
| Slack/CRM routing, daily CSV | Hot-lead email (score ≥ 30, once per company per day) and a daily digest after 07.00 Oslo, to ADMIN_EMAIL; CSV export | `app/api/intel/cron/route.ts`, `netlify/functions/intel-cron.mts` |
| Dashboard | `/leads/`: companies, people, top pages, unresolved networks, latest visits; 1/7/30/90 days | `app/leads/page.tsx` |
| Consent platform | Ours (`docs/CONSENT.md`); category `remember` replaced `insight` | `lib/consent.ts` |

What it cannot do: name people who never identify themselves. That needs a purchased identity graph
(RB2B directly, from 199 USD a month, US visitors only) and is not lawful for EEA visitors.

## Using it

- **Open the leads page:** the link at the bottom of any alert or digest email
  (`/api/intel/login/?k=…`) sets a 90-day admin cookie on that browser, then `/leads/`. Without the
  cookie `/leads/` is a 404.
- **Know who opened your email:** make a personal link and paste it into a one-to-one email:
  `op run --env-file=.env.op -- node scripts/lead-link.mjs jane@carnival.com --name "Jane Doe" --company Carnival --url https://portlink.app/contact/`
  Never post these links publicly: whoever clicks is recorded as that person.
- **Send the digest now:** POST `/api/intel/cron/?digest=now` with header `x-intel-secret`.
- **Tune:** `lib/intel/config.ts`. Add target accounts to `ICP_DOMAINS` (keyed by the domain the
  network's registry names), pages to `PAGE_POINTS`, networks to `NOT_A_COMPANY`. The "Networks not
  shown as companies" table on `/leads/` is the list to review.

## Data, storage, retention

- Netlify Blobs store `visitor-intel` (site `portlin-landing-2`). Keys in `lib/intel/store.ts`.
  Events are append-only; the page aggregates in memory (fine to low tens of thousands of events a month).
- **No IP is stored.** Visits are grouped by `sha256(daily salt + IP + user agent)`; the salt is
  random, stored per day and deleted after two days, so older visit keys cannot be linked.
- Events kept 395 days (swept by the daily run). Lookup caches 30 days.
- Withdrawal of "Remember me" deletes the identity link and every event carrying that `pl_vid`.
- Objection (`pl_optout`, button on `/privacy/`), Global Privacy Control (`Sec-GPC: 1`), bots and
  `/leads`, `/seatrade`, `/api` are never recorded.
- External lookups receive only the truncated prefix or an ASN: RIPE NCC (RIPEstat), rdap.org and
  the regional registries, PeeringDB.

## Secrets and config

| Name | Where | Reference |
|---|---|---|
| `INTEL_SECRET` (64 chars) | Netlify env, all contexts, secret | `op://cypqkqoeuibf4f6aud47v3qooa/3jup4j5ayriz63j6ocfwqyczo4/password` |
| `INTEL_STORE_NAME` | local/tests only, e.g. `visitor-intel-test` | never set in production |
| `ADMIN_EMAIL`, `RESEND_API_KEY` | existing | see AGENTS.md |

## Verified 29.09.2026 (local production build, test store, then emptied)

- Carnival prefix → "Carnival Corporation", carnival.com, target, path `/ → /contact/`, 2 min, referrer
  and campaign kept; NCL prefix → ncl.com; Telenor → network, not a company.
- Dropped as designed: Googlebot UA, `Sec-GPC: 1`, `pl_optout=1`, a forged link token, an identify
  without consent, `/leads`.
- Signed link named the person; consented form identify named the person; "forget" removed the
  identity and its events. (Since then, forget accepts the id from the body alone: the random id is
  the proof, and the cookie may already be deleted when the beacon leaves.)
- Cron: 404 without the secret; hot alert "Hot lead on portlink.app: Carnival Corporation" delivered to
  ADMIN_EMAIL (Resend `last_event: delivered`); second run did not repeat it; digest sent on demand.
- Browser: `?pl=` token reported then stripped; no cookie before a choice; "Remember me" set only
  `pl_vid`; the privacy page objection sets `pl_optout`.
- Build gates: `check:consent-gate` (no GA or Ospry tag in server HTML), `check:mail-routes` (cron route
  exempt by name: mails ADMIN_EMAIL only), `npm run verify` clean.

## Open / next

- Two weeks of real traffic, then prune `NOT_A_COMPANY` and extend `ICP_DOMAINS` from the unresolved
  table. Expect most visits to resolve to a network, not a company; the value is in the few that do.
- Optional: an AI brief per hot company, and a record in Wheelhouse instead of email only.
- Ospry account (app.ospry.ai) still exists and holds no data; closing it is David's.
