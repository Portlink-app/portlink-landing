#!/usr/bin/env bash
# Render this site's 1200x630 share cards from scripts/og/*.html into public/og/.
#
#   scripts/build-og-card.sh            both cards
#   scripts/build-og-card.sh seatrade   one of them (front | seatrade)
#
# A card is a page, not a drawing: each one links the vendored design-system tokens, so it carries
# the site's real colours and its real font stack rather than an approximation of them. This script
# is the only way public/og/*.png should ever change; hand-editing a PNG makes the committed HTML a
# lie about what is being served, which is exactly how the first Seatrade card ended up with no
# source at all.
#
# Requires ~/.buzz/bin/page-probe (headless Chrome over CDP, no npm install). Each card is rendered
# at exactly 1200x630 with deviceScaleFactor 1, which is the size Open Graph consumers expect and
# the size the meta tags declare. Dimensions are checked afterwards, because a card whose size
# drifts from its og:image:width silently degrades to a small square in some clients.
#
# ⛔ THE SEATRADE CARD IS RENDERED WITH NETWORK ACCESS AND WITH A VALUE INJECTED, AND BOTH ARE
# ASSERTED RATHER THAN ASSUMED:
#   * the brand face (Plus Jakarta Sans) is fetched the way globals.css fetches it, so a card
#     rendered offline would silently fall back to the system face and look off-brand next to the
#     site. The check counts LOADED FontFace objects of that family, and the reason is worth the
#     line: document.fonts.check('800 62px "Plus Jakarta Sans"') returns TRUE on a page with no
#     font of any kind, measured 16.09.2026, and it returns true for a family called
#     "Zzz Not A Font 12345" as well. It is not a load test and it cannot fail, so as a guard it
#     was decoration. The loaded-face count is 4 here and 0 on scripts/og/card.html, which links no
#     webfont: a control that proves the assertion can still say no.
#   * the prize is injected from PRIZE_NAME in lib/seatrade/config.ts, never typed into the HTML,
#     so the most-shared surface we own cannot keep advertising last month's prize. The placeholder
#     surviving the injection fails the build rather than shipping "{{PRIZE_NAME}}" to LinkedIn.
set -euo pipefail
cd "$(dirname "$0")/.."
PROBE="${PAGE_PROBE:-$HOME/.buzz/bin/page-probe}"
[ -x "$PROBE" ] || { echo "build-og-card: page-probe not found at $PROBE" >&2; exit 2; }

WANT="${1:-all}"
case "$WANT" in all|front|seatrade) ;; *) echo "build-og-card: unknown card '$WANT' (all|front|seatrade)" >&2; exit 2 ;; esac

mkdir -p public/og

# The card must be exactly what the meta tags promise. `sips` is macOS-native and needs no install.
check_size() {
  local out="$1" w h
  w=$(sips -g pixelWidth "$out" | awk '/pixelWidth/{print $2}')
  h=$(sips -g pixelHeight "$out" | awk '/pixelHeight/{print $2}')
  [ "$w" = 1200 ] && [ "$h" = 630 ] || { echo "build-og-card: FAIL, rendered ${w}x${h}, want 1200x630" >&2; exit 1; }
  echo "build-og-card: OK ${out} ${w}x${h} $(wc -c < "$out" | tr -d ' ') byte"
}

render_front() {
  local out="public/og/portlink-2026-09-16.png"
  "$PROBE" \
    --url "file://$(pwd)/scripts/og/card.html" \
    --viewport 1200x630 \
    --settle 1500 \
    --screenshot "$out" \
    --eval 'document.querySelectorAll("img").length'
  check_size "$out"
}

render_seatrade() {
  local out="public/og/seatrade-2026-09-16.png" prize prize_js result

  # One place to change the prize, and this is a reader of it rather than a second copy. tsx is
  # already a devDependency and already runs the other check scripts; config.ts imports nothing, so
  # there is no alias to resolve. An env SEATRADE_PRIZE_NAME override is respected, because the
  # module reads it.
  prize=$(npx --no-install tsx -e \
    'import { PRIZE_NAME } from "./lib/seatrade/config"; process.stdout.write(PRIZE_NAME)') \
    || { echo "build-og-card: could not read PRIZE_NAME (npm install first?)" >&2; exit 1; }
  [ -n "$prize" ] || { echo "build-og-card: PRIZE_NAME is empty" >&2; exit 1; }
  # As a JSON literal, not as a shell-quoted one: bash's own quoting of an apostrophe is valid
  # shell and invalid JavaScript, and "Sony's" is a prize name nobody would think to test.
  prize_js=$(node -e 'process.stdout.write(JSON.stringify(process.argv[1]))' "$prize")

  result=$("$PROBE" \
    --url "file://$(pwd)/scripts/og/seatrade-card.html" \
    --viewport 1200x630 \
    --settle 2500 \
    --screenshot "$out" \
    --eval "(async () => {
      document.querySelector('.prize').textContent = ${prize_js};
      await document.fonts.ready;
      const art = document.querySelector('.art img');
      return {
        placeholders: (document.body.innerText.match(/{{/g) || []).length,
        font: [...document.fonts].filter(f => f.family === 'Plus Jakarta Sans' && f.status === 'loaded').length,
        art: art.naturalWidth,
        prize: document.querySelector('.prize').textContent,
      };
    })()")
  echo "$result"

  node -e '
    const r = JSON.parse(process.argv[1]);
    const v = r.value || {};
    const fail = (m) => { console.error("build-og-card: FAIL, " + m); process.exit(1) };
    if (!r.ok) fail("render failed: " + r.error);
    if (v.placeholders) fail(v.placeholders + " unreplaced {{placeholder}} left on the card");
    if (!v.font) fail("no loaded Plus Jakarta Sans face; the card would ship in the system face");
    if (!v.art) fail("the prize artwork did not load; the card would ship with an empty right side");
    if (v.prize !== process.argv[2]) fail("prize on the card is " + JSON.stringify(v.prize) + ", config says " + JSON.stringify(process.argv[2]));
  ' "$result" "$prize"

  check_size "$out"
}

# Plainly, and not as a one-line && || chain: that form ends in `|| true`, which would swallow
# every assertion above it and report a broken card as a successful build.
if [ "$WANT" = all ] || [ "$WANT" = front ]; then render_front; fi
if [ "$WANT" = all ] || [ "$WANT" = seatrade ]; then render_seatrade; fi
