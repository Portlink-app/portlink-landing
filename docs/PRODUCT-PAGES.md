# Product pages: /portlink and /embark

Entry doc for the two product landing pages (phase 3 of the product landing plan, 05.11.2026).
Plan: `PLANS/PORTLINK_PRODUCT_LANDING_PAGES_2026-11-05.md` in the Buzz workspace. Feature order: Tiller (Design),
`RESEARCH/PORTLINK_PRODUCT_LANDING_REFS_2026-11-05/FEATURE_INVENTORY.md` there.

## Clone method (David, 05.11.2026 kl. 11.42)

Each page is a literal clone of its reference, rebranded: waabi.ai for /portlink, butter.video for /embark. Layout,
section order, motion, scroll scenes and type scale are the reference's; colour, logo, copy and product media are
Portlink's and Embark's. Since the swap (06.11.2026) every stylesheet, class name and face on both pages is ours; no
reference file ships (see "The swap"). The first direction (original pages on D14 tokens) is commit `3a99520` on this
branch.

## Map

| Path | What |
|---|---|
| `app/(product)/portlink/page.tsx` | Waabi's homepage markup and classes, Portlink copy and recordings |
| `components/clone/waabi/` | `WaabiMotion` (scroll scenes: progress rule, lede, hero zoom, tile drift, sticky split, carousel), `SplitTabs` (phone split), `SeatLens` (pick a seat; tabs by the platform's `SECTION_VIS`), `content.ts` |
| `public/product-pages/portlink.css` | The /portlink stylesheet, scoped under `.wb`: faces, the layout utilities, then "Page additions" (`wbx-*` rules, rebrand, AA fixes, reduced motion) |
| `app/(product)/embark/page.tsx` | Serves the Butter-structure page from landing PR #26 (`b25b2b2`) |
| `components/clone/butter/embark-body.ts` | The /embark markup (`em-*` classes); authored source, edit it directly |
| `app/(product)/embark/EmbarkFilm.tsx` | Mounts the product film for visitors who allow motion |
| `public/product-pages/embark.css` | The /embark stylesheet, scoped under `.bt`, then its "Page additions" |
| `public/product-pages/embark/` | `products.js` (walkthrough, film scrub), `keyring.js` + three.js (MIT, licence beside it), `media/` |
| `components/clone/Film.tsx` | Muted looping recording; poster image for reduced motion and the server |
| `scripts/clone/reauthor-css.mjs` | The record of the swap: how the two stylesheets were written from the reference ones (reads them from `6c178db`) |
| `components/product/config.ts` | Robots setting and the one demo action (`/#access`, "Book a 20-minute demo") |

## Rules that hold here

- `app/globals.css` keeps the landing's Tailwind out of these folders (`@source not`), so the reference's own
  utility classes are the only ones that apply.
- The design system styles bare elements unlayered, so each overrides file hands colour, face and tracking back to
  the scope (`:is(h1, …)` reset). Waabi hides `[aria-hidden="true"]`: never put it on a video or a visible icon.
- Every demo action carries `data-cta` (`demo-portlink-*`, `demo-embark-*`), counted by the visitor funnel.
- No film for reduced motion: every `<video>` sits behind `useMotionAllowed()` and no film path is in server HTML
  (`check-film-motion`). Pass film paths to `Film` without `.mp4`.
- Pages are `noindex, follow` and absent from `app/sitemap.ts` until phase 4 acceptance.
- `npm run check:provenance` refuses, in every build, any file under `public/clone/`, any face that is not ours, and
  any reference build identifier (`*-module__*__`, `*-sc-<hash>-N`, `__className_<hash>`). Never bring a reference
  site's file back, also not "for a preview".

## The swap (done 06.11.2026)

Both reference stylesheets and all four reference faces are gone. `scripts/clone/reauthor-css.mjs` wrote our
stylesheets from the reference ones in one pass: it dropped every rule no source file uses (Waabi kept 444 of 1547,
Butter 318 of 772), renamed every reference identifier to ours in CSS and markup (Butter's styled-components and
next/font classes to `em-*`, `--butter-*` to `--em-*`, Waabi's `type-z-*`/`type-s-*` to `type-display-*`/`type-text-*`),
removed the reference faces and build residue, and pointed every stack at our open faces. Proof that the rename moved
nothing: with the reference faces still in place, all 51 reduced-motion frames (both pages, 1440 and 390, top to
bottom) were pixel-identical to `6c178db`. Then the faces changed.

### Faces

| Reference face | Ours (OFL, `app/_fonts/`) | Why this one |
|---|---|---|
| F37 Zagma Serif Book (Waabi display) | Source Serif 4, weight 400, optical size 12 | x-height 0,475 vs 0,476 and cap 0,670 vs 0,668 em; the text optical size is the low-contrast cut closest to Zagma |
| Neue Haas Grotesk Text 65 Medium (Waabi text) | Inter 500 (already ours) | x-height 0,546 vs 0,534, cap 0,728 vs 0,744, set width within 0,2% |
| Die Grotesk C (Butter text and display) | Archivo at 90% width | at 90% width it sets the same line lengths; Inter Tight ran 5% wide and rebroke headings |
| ABC Diatype Mono (Butter captions) | Red Hat Mono | both monospaced at 0,6 em; x-height 0,488 vs 0,482 |

Metrics: fontTools on the woff2 files; widths and the zero glyph measured in Chrome (06.11.2026). Butter's columns are
sized in `ch`, the width of the face's zero, which is 0,6253 em in Die Grotesk and 0,524 em in Archivo at 90%; the
grotesque columns therefore keep the reference measure as `calc(N * var(--em-ch))` with `--em-ch: 0.6253em`.

## Decisions

- Chose: rewrite the reference stylesheets mechanically (purge, rename, re-face) and prove no pixel moved before the
  faces changed. Over: hand-authoring both pages' CSS from scratch. Because: David asked for the reference layout and
  motion kept as built; a from-scratch rewrite of 4 900 lines would drift from it with no way to prove it had not, and
  what made the files someone else's (their faces, their compiled files, their identifiers) is what the rewrite removes.
  Revisit-if: either page is redesigned; then write it on D14 tokens instead.
- Chose: the open faces above. Over: Inter Tight for Butter's grotesque (5% wide), Schibsted Grotesk, DM Mono.
  Because: closest measured metrics and line lengths. Revisit-if: David or Kris buys a licence for a reference face.
- Chose: the provenance guard refuses in every build again. Over: the preview exemption of 05.11. Because: the swap was
  its revisit trigger and an exemption is how reference files would return. Revisit-if: another clone preview is asked
  for; scope the exemption to that branch only.
- Chose: under reduced motion the hero lede keeps its scroll-linked opacity when the script runs. Over: shown from the
  top. Because: shown from the top it covered the headline for visitors who reduce motion (measured 06.11.2026, also on
  `6c178db`); opacity moves nothing. Revisit-if: never.
- Chose: `.bt #overview { overflow: clip }`. Over: the reference's `overflow: hidden`. Because: hidden made the
  section the scroll container of the film's sticky stage, so the stage scrolled away and left a blank band of about
  1,5 screens (measured 06.11.2026 on deploy-preview-29; the same rule is in `6c178db`); clip clips the same pixels without
  that. Both this and the lede rule are applied by `scripts/clone/reauthor-css.mjs`, so a re-run keeps them.
  Revisit-if: the film leaves `#overview`.
- Chose: Embark from PR #26's Butter port. Over: a fresh cloner run. Because: #26 was already butter.video rebuilt
  with Embark content and product media; reusing it keeps one Butter port. Revisit-if: Butter's homepage changes.
- Chose: hero headline rises by CSS at full opacity. Over: Waabi's fade from 0. Because: the fade held the LCP behind
  hydration. Revisit-if: never; the rise is still Waabi's.
- Chose: Embark's keyring script at idle (`lazyOnload`). Over: after hydration. Because: the PNG stands in and is the
  LCP. Revisit-if: the keyring needs to start before first interaction.
- Chose: phone hero plays the dark chart film (`hero-C`) as desktop does. Over: the light voyage-builder portrait
  film with a heavier scrim. Because: white type measured 2,43 to 2,68:1 over the light capture (Starboard,
  05.11.2026). Revisit-if: a dark portrait recording exists.
- Chose: the product stills carry a fictional fleet (Aster Brisa, Aster Solvind and others; agent Molo Agents),
  relabelled in the pixels with Inter fitted to the original glyphs. Over: a reshoot. Because: the demo data named
  a real cruise line's ships, a real coastal fleet and a real Genoa agency, which reads as a customer claim on a
  public page; no demo organisation with fictional names exists to reshoot from. Also fixes the /havn story, which
  uses the same three files. Revisit-if: the platform's demo seed gets fictional names; then reshoot.
- Chose: the Embark tour film without native controls. Over: controls. Because: the film is scrubbed by scroll
  (`products.js`), never autoplays, so controls only added chrome. Revisit-if: the film starts autoplaying.
- Money: the day card states PDA 412 380 kr, FDA 401 250 kr, 11 130 kr under, as the copy does.

## Still unmapped

Embark media is #26's illustrative material (rendered from our own product, `fjord.jpg` is the site's own
`public/family/fjord-cruise.jpg`; #26's eight Portlink stills and films that /embark never used were dropped in the
swap); real usage of each feature. `scripts/sync-fonts.mjs` run today would also rewrite Google's updated latin-ext
ranges for the three older families, which this branch kept as they were.
