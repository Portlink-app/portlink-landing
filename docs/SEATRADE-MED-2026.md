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

## Architecture

| Piece | Where | Notes |
|---|---|---|
| Scoring model | `lib/seatrade/scorecard.ts` | Pure. Questions, points, bands, findings. Used by client, API, emails, report. `MAX_POINTS` = 22. |
| Constants | `lib/seatrade/config.ts` | Event facts, sender, audience id, sequence offsets, `scheduleAt()` (09:00 Madrid = 07:00Z in Sept). No secrets. |
| Lead store | `lib/seatrade/store.ts` | **Netlify Blobs**, store `seatrade-leads`, site-wide (shared by every deploy incl. drafts). Keys `lead/<uuid>`, `email/<sha256>` (dedupe), `meta/last-export`. Aggregation cached 30 s in-process. |
| Emails | `lib/seatrade/emails.ts` | e1 (now), e2 (+2 d), e3 (+6 d), e4 (+12 d), admin. Unsubscribe link + `List-Unsubscribe` headers on every lead email. |
| Shared shell | `lib/email/wrap.ts` | The one HTML email frame for the whole site; `/api/access` uses it too. Hex is allowed here only (email clients ignore CSS variables). |
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
- **Get the lead list**: open `https://portlink.app/api/seatrade/export/` → CSV lands in `ADMIN_EMAIL`.
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

## Still unmapped / could surprise us

- Netlify Blobs on the **draft deploy vs production**: the store is site-wide, so a draft-deploy
  test lead is visible to production; mark them `test: true` or delete them (script above).
- The e-mail sender `pilot@portlink.app` replies go to `ADMIN_EMAIL` (`post@davidbakke.no` in
  the Netlify env, not `david@portlink.app`). Change the env var, not the code, if that should differ.
- Netlify free-tier Blobs and function limits are far above a trade show's volume, but the
  in-process stats cache is per lambda instance; two instances may disagree by ≤30 s. Harmless.
