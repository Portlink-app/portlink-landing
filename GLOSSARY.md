# GLOSSARY.md - portlink-landing

Canonical domain vocabulary for **portlink-landing** (https://portlink.app). Keep one canonical term per concept across TypeScript code, API routes, public marketing copy, and documentation. Update this file in the same commit whenever a domain concept is added or retired.

## 1. Canonical Domain Terms

| Term | Definition | Code & Schema Anchor | `_Avoid_` |
|---|---|---|---|
| `Portlink` | Brand and company name across all public marketing copy and metadata (Portlink rule #36). | `app/`, `DIRECTION.md` | `PortLink` |
| `Pilot request` | Inbound pilot-access submission handled by `/api/access` via Resend. | `app/api/access/route.ts` | `free trial signup`, `self-serve account` |
| `Seatrade lead` | Lead captured through `/seatrade/` and `/api/seatrade/*`, stored in Netlify Blobs store `seatrade-leads` and nurtured via the 4-email Resend sequence. | `app/seatrade/`, `app/api/seatrade/`, `docs/SEATRADE-MED-2026.md` | `CRM contact`, `Supabase lead` |
| `Vendored design system` | Pinned copy of the Portlink design system under `app/_ds/` synced with `CONSUMERS.md`. | `app/_ds/` | `page-local CSS`, `inline theme override` |
| `Studio Website Pipeline` | Mandatory 6-stage visual pipeline (`DIRECTION.md`, `capture.mjs`, Cold Hero Gate `website-verify --hero-only`, `Lenis` + `GSAP ScrollTrigger`, `website-verify` 0 FAIL receipt at `HEAD`, Tailscale Serve preview). | `DIRECTION.md`, `.git/website-verify-receipt.json` | `house style`, `placeholder screenshot` |

## 2. Entity Relationships

- `Visitor 1 -> 0..N Pilot request` (dispatched via `/api/access` and Resend)
- `Seatrade campaign 1 -> N Seatrade lead` (persisted in Netlify Blobs `seatrade-leads` and nurtured by 4-email sequence)
- `Vendored design system (app/_ds/) 1 -> N Landing scene` (`components/scenes/chapters.ts`, wide and narrow compositions)

## 3. Boundary Notes

- **No relational database on landing:** `portlink-landing` uses Netlify Blobs (`seatrade-leads`, `visitor-intel`) and Resend; it does not connect to the platform Supabase database.
- **Acquisition handoff:** Public signup and trial preferences verify against `npm run check:acquisition` before redirecting into the product receivers.
