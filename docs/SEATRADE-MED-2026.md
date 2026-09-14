# Seatrade Cruise Med 2026 — lead funnel (`/seatrade/`)

Entry-point doc for the Port Call Friction Score funnel. Built 14.09.2026 for the show on
16–17.09.2026 (Santa Catalina Terminal, Las Palmas). Read this before touching anything under
`app/seatrade`, `app/api/seatrade`, `components/seatrade`, `lib/seatrade` or `lib/email`.

## What it is, in one paragraph

A QR code on a badge, card, slide or post opens `https://portlink.app/seatrade/?s=<placement>`. The
visitor answers seven tap-only questions (role, volume, where the port call lives, re-entry, how
changes propagate, time-to-full-picture, biggest pain), gets a **Port Call Friction Score** 0–100
with a nautical band (Smooth sailing · Choppy · Heavy weather) and three findings, and leaves name,
work email and company to get the scorecard by email. That sign-up sends one email immediately and
books three more with Resend's `scheduledAt`, anchored to the show's end: a sign-up on 14–17.09 gets
e2 on 19.09, e3 on 23.09, e4 on 29.09 (09:00 Madrid); a later sign-up counts from its own date. Every answer feeds a live, anonymous benchmark at
`/seatrade/report/`. The admin gets a notification per lead and can mail themselves the full CSV.

## The idea, and why this one

Ten directions were scored (see the campaign artifact / the session that built this). The
scorecard won because it: gives value before it asks for anything (a personal score in 60 s); turns
the pilot form's qualification questions into the visitor's own result; creates a floor
conversation ("what did you score?"); produces a post-show asset (the benchmark) with zero manual
work; needs no prize, no booth screen, no platform change; and was buildable and verifiable in one
day. Runners-up: "see your own ship in Portlink" (highest wow, needs platform work), prize draw
(money + Spanish promo rules), booth-slot booking (folded in as the reply CTA).

## The referral draw (added 14.09.2026)

**Rule, in the visitor's words:** confirm your work email and you hold one entry in the draw for
`PRIZE_NAME` (config.ts, default "an iPhone"). Every colleague or partner who scores through your
invitation link and confirms their own work email adds one entry, up to `REFERRAL_CAP` (10), at most
`SAME_DOMAIN_CAP` (3) from your own domain. People count once, for whoever invited them first.
Entries close `DRAW.closesAt` (26.09.2026 23.59 CEST), draw `DRAW.drawDate` (29.09.2026). Terms at
`/seatrade/terms/`.

**What "verified lead" means here:** (1) a work email, so free-mail and disposable providers are
refused at the form and at the API (`lib/seatrade/eligibility.ts`); (2) the person clicked "Confirm
my email" in e1 (`/api/seatrade/verify/?t=<id>`), which sets `verifiedAt` and cancels the +20 h
reminder; (3) `domainMatch` ("likely"/"unclear") is a review aid in the CSV and the admin mail, not a
gate, because "MSC Cruises" at msccruises.com is obvious to a person and unprovable to a machine.
David checks the winner's row before announcing.

**Mechanics:** `referralCode` (6 chars, alphabet without I/L/O/0/1) is allocated at first sign-up and
indexed as `code/<CODE>`; the page reads `?r=CODE` (kept in sessionStorage) and posts it as `ref`;
the API sets `referredBy` on new leads only, never to a test lead, never to yourself (emails are
normalised, `+tag` stripped, before dedupe). Entries are **computed on every read** by
`tallyEntries()` in `store.ts`, never stored, so caps can change without touching data. When an
invitee confirms, the inviter (if confirmed and subscribed) gets "One more entry" with their tally.
`/seatrade/me/?t=<id>` shows score, status, entries, invitations and a share sheet (Web Share,
WhatsApp, LinkedIn, email, copy). Unsubscribing stops emails but keeps the entry (terms say reply to
withdraw). **The draw:** `node scripts/seatrade-draw.mjs <export.csv> --seed "<public value>"`,
weighted by `entries`, `eligible=yes`, test rows excluded, reproducible for the same seed.

## Architecture

| Piece | Where | Notes |
|---|---|---|
| Scoring model | `lib/seatrade/scorecard.ts` | Pure. Questions, points, bands, findings. Used by client, API, emails, report. `MAX_POINTS` = 22. |
| Constants | `lib/seatrade/config.ts` | Event facts, sender, audience id, sequence offsets, `scheduleAt()` (09:00 Madrid = 07:00Z in Sept). No secrets. |
| Lead store | `lib/seatrade/store.ts` | **Netlify Blobs**, store `seatrade-leads`, site-wide (shared by every deploy incl. drafts). Keys `lead/<uuid>`, `email/<sha256>` (dedupe), `meta/last-export`. Aggregation cached 30 s in-process. |
| Emails | `lib/seatrade/emails.ts` | e1 (now), e2 (+2 d), e3 (+6 d), e4 (+12 d), admin. Unsubscribe link + `List-Unsubscribe` headers on every lead email. |
| Shared shell | `lib/email/wrap.ts` | The one HTML email frame for the whole site; `/api/access` uses it too. Hex is allowed here only (email clients ignore CSS variables). |
| Eligibility | `lib/seatrade/eligibility.ts` | Free-mail/disposable refusal, email normalisation, `domainMatch` heuristic, code alphabet. Pure. |
| Verify | `app/api/seatrade/verify/route.ts` | GET. Sets `verifiedAt`, cancels reminder, credits the inviter, 303 → `/seatrade/me/?t=…&confirmed=1`. |
| Ref lookup | `app/api/seatrade/ref/route.ts` | GET `?c=CODE` → first name only, for "Ana invited you". |
| My page / terms | `app/seatrade/me/page.tsx` (dynamic, noindex) · `app/seatrade/terms/page.tsx` · `components/seatrade/ShareBox.tsx` | |
| Draw | `scripts/seatrade-draw.mjs` | Reads the exported CSV; seeded weighted pick; audit table. |
| Sign-up | `app/api/seatrade/route.ts` | POST. Honeypot, consent, server-side re-score, dedupe by email (second submission = re-send e1, no re-booking), Resend contact into audience *Seatrade Med 2026*. |
| Stats | `app/api/seatrade/stats/route.ts` | GET. Counts only, no PII. |
| Unsubscribe | `app/api/seatrade/unsubscribe/route.ts` | GET (link) and POST (RFC 8058 one-click). Cancels e2–e4 via `resend.emails.cancel`. |
| Export | `app/api/seatrade/export/route.ts` | GET. Mails the CSV to `ADMIN_EMAIL`. No auth by design; throttled to one per 10 min. |
| Pages | `app/seatrade/page.tsx` (+ `layout.tsx` metadata/OG), `app/seatrade/report/page.tsx` (dynamic), `app/seatrade/unsubscribed/page.tsx` | One-column shell `components/seatrade/Shell.tsx`; quiz `components/seatrade/Scorecard.tsx`. |
| Assets | `public/seatrade/qr-*.svg`, `public/seatrade/og.png` | QR per placement (`badge card slides linkedin booth print`), error level H, encode `https://portlink.app/seatrade/?s=<placement>`. |

**Runtime env** (already set on the Netlify site for all contexts): `RESEND_API_KEY`, `ADMIN_EMAIL`.
Optional overrides: `RESEND_AUDIENCE_ID`, `NEXT_PUBLIC_SITE_URL`. Blobs need no credential in
production; locally use `netlify dev` (linked site) or set `NETLIFY_SITE_ID` + `NETLIFY_AUTH_TOKEN`.

## Decisions (Chose / Over / Because / Revisit if)

- **Chose Netlify Blobs** over a Supabase table in portlink-platform — because the landing has no DB
  on purpose, the product DB is PR-only across two agents, and leads are a few hundred JSON docs.
  Revisit if leads must join product data (then migrate the CSV, do not point the site at Supabase).
- **Chose Resend `scheduledAt`** over a cron drip — because it is verifiable on a draft deploy
  (scheduled functions only run on production), has no moving parts, and cancels cleanly. Cost:
  e2–e4 HTML is frozen at sign-up, so e2 links to the live report rather than quoting numbers.
  Revisit if the sequence ever exceeds 30 days (Resend's horizon) or must react to replies.
- **Chose explicit consent checkbox (unchecked)** over soft opt-in — because the audience is EU B2B
  individuals (Spain/Norway) and the follow-ups are marketing. Conversion cost accepted.
- **Chose an unauthenticated export that mails the admin** over a token-protected download —
  because it adds no secret and the worst case is one extra email to David every 10 minutes.

## How to operate it

- **Print / share the QR codes**: `public/seatrade/qr-badge.svg` (name badge or lanyard card),
  `qr-card.svg` (business card back), `qr-slides.svg` (any slide), `qr-linkedin.svg` (posts),
  `qr-booth.svg`, `qr-print.svg`. All decode-verified with zbar on 14.09.2026. Vector, prints at any size;
  keep a quiet zone and a minimum of 25 mm on paper.
- **Get the lead list**: open `https://portlink.app/api/seatrade/export/` → CSV lands in `ADMIN_EMAIL`
  (columns include `verifiedAt`, `referralCode`, `referredByCode`, `entries`, `eligible`, `domainMatch`).
- **Run the draw (29.09.2026)**: save that CSV, pick a public seed nobody controls, run
  `node scripts/seatrade-draw.mjs seatrade-leads-2026-09-29.csv --seed "<value>"`, check the winner's
  `domainMatch`/company/role by hand, email them (terms: reply within 7 days), keep the output.
- **Change the prize**: `PRIZE_NAME` in `lib/seatrade/config.ts` (or env `SEATRADE_PRIZE_NAME`); the
  terms carry a substitution clause. Dates: `DRAW` in the same file.
- **Watch the room**: `https://portlink.app/seatrade/report/` (works on a phone or a screen).
- **Change copy**: edit `lib/seatrade/emails.ts` / `scorecard.ts`; already-booked e2–e4 keep the old
  copy. To replace them for an existing lead: cancel the ids in the lead doc and re-book.
- **Remove a test lead**: run `node scripts/seatrade-delete-lead.mjs <email>` with
  `NETLIFY_AUTH_TOKEN` in the env (deletes `lead/<id>` and the `email/<hash>` pointer).

## Verification log

| Date | What | Result |
|---|---|---|
| 14.09.2026 | `npm run build` with all routes | exit 0; `/seatrade` static, `/seatrade/report` + 4 API routes dynamic |
| 14.09.2026 | Local `netlify dev`, POST test lead (`test: true`) | e1 delivered to Resend sink; e2/e3/e4 `scheduled` (+2/+6/+12 d from sign-up, before the show-end anchor was added); admin `[TEST]` mail sent; stats stayed n=0 |
| 14.09.2026 | Unsubscribe GET | 303 → `/seatrade/unsubscribed/`; e2/e3/e4 `canceled` in Resend; second call idempotent; POST one-click 200 |
| 14.09.2026 | Export | CSV mailed to admin; second call inside 10 min → 429 |
| 14.09.2026 | Quiz on 375×812 in-app browser | Full tap-through; transitions made timer-free after a throttled-tab stall |
| 14.09.2026 | QR PNGs decoded with `zbarimg` | all six decode to the intended URL |
| 14.09.2026 | **Draft deploy** `6aa796fbb2742a8567890fff--portlin-landing-2.netlify.app` (real Blobs, real env) | `/seatrade/`, `/seatrade/report/`, `/seatrade/unsubscribed/`, `og.png`, `qr-badge.svg` all 200; stats n=0 |
| 14.09.2026 | Draft: POST test lead (`test: true`, to davidbakke85@gmail.com, source `draft-verify`) | 200, score 95 Heavy weather; e1 `delivered` and present in the Gmail inbox 06:42:08Z; e2/e3/e4 `scheduled` 19.09 / 23.09 / 29.09 07:00Z; admin `[TEST]` mail `sent`; stats n=0 |
| 14.09.2026 | Draft: unsubscribe link | 303 → `portlink.app/seatrade/unsubscribed/` (Netlify appends the `?t=` query to the Location; cosmetic); e2/e3/e4 `canceled` in Resend |
| 14.09.2026 | Cleanup | `scripts/seatrade-delete-lead.mjs davidbakke85@gmail.com` → store lists 0 leads, 0 keys |
| 14.09.2026 | **Referral draw, local `netlify dev`** (`scratchpad/referral-test.sh`) | A signs up → code + link; `/ref/` resolves the code; gmail refused; "other" without detail refused; B via `ref=pl-<code>` → `invitedBy` A; A re-submit with `+tag` → `isNew=false`, same code; before confirmation: verified 0, entries 0; A confirms → 303 to me page; B confirms → A's page "You hold 2 entries · 1 + 1 invited"; stats verified 2, entries 3, top 2; second confirm idempotent; invalid token → "link not valid" page |
| 14.09.2026 | Resend side of the same run | e1 delivered to both; both "Your entry is not active yet" reminders `canceled` on confirmation; "One more entry: you now hold 2" delivered to A; unsubscribe → 0 still scheduled, 8 canceled |
| 14.09.2026 | **Referral draw on draft deploy** `6aa7afdb17e044c25aa132a3--portlin-landing-2.netlify.app` (real Blobs, real Resend, real inbox) | `/seatrade/`, `/report/`, `/terms/`, `/me/?t=nope`, `/api/seatrade/ref/` → 200; test sign-up (post@davidbakke.no, `test: true`) → code `KR4B6A`; confirm link → 303 to `/seatrade/me/?t=…&confirmed=1`; page reads "Email confirmed. Your entry is active."; Resend: e1 `sent`, reminder `canceled` on confirmation, e2/e3/e4 `scheduled`; unsubscribe 303; lead + code key deleted, store empty |
| 14.09.2026 | `scripts/seatrade-draw.mjs` on a 4-row fixture | eligible 2, tickets 5 (4 + 1), pending and test rows excluded, same seed → same winner |

## Still unmapped / could surprise us

- Netlify Blobs on the **draft deploy vs production**: the store is site-wide, so a draft-deploy
  test lead is visible to production; mark them `test: true` or delete them (script above).
- The e-mail sender `pilot@portlink.app` replies go to `ADMIN_EMAIL` (`post@davidbakke.no` in
  the Netlify env, not `david@portlink.app`). Change the env var, not the code, if that should differ.
- The unsubscribe redirect reaches the browser as `/seatrade/unsubscribed/?t=<id>` on Netlify (the
  query survives the 303 there, not locally). Harmless: the page ignores it and the id is already in
  that person's own email. Strip it in the route if it ever matters.
- A test lead (`test: true`) confirms fine but shows 0 entries on its page, because test leads are
  excluded from every tally by design. Do not read that as a bug during a rehearsal.
- Netlify free-tier Blobs and function limits are far above a trade show's volume, but the
  in-process stats cache is per lambda instance; two instances may disagree by ≤30 s. Harmless.
