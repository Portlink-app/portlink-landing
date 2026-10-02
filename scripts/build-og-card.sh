#!/usr/bin/env bash
# Render the 1200x630 share cards (scripts/og/card.html, scripts/og/havn-card.html) into public/og/.
#
# The card is a page, not a drawing: it links the vendored design-system tokens, so it carries the
# site's real colours and its real font stack rather than an approximation of them. This script is
# the only way public/og/*.png should ever change; hand-editing the PNG makes the committed HTML a
# lie about what is being served.
#
#   scripts/build-og-card.sh
#
# Requires ~/.buzz/bin/page-probe (headless Chrome over CDP, no npm install). The card is rendered
# at exactly 1200x630 with deviceScaleFactor 1, which is the size Open Graph consumers expect and
# the size the meta tags declare. It is checked afterwards, because a card whose dimensions drift
# from its og:image:width silently degrades to a small square in some clients.
set -euo pipefail
cd "$(dirname "$0")/.."
PROBE="${PAGE_PROBE:-$HOME/.buzz/bin/page-probe}"
[ -x "$PROBE" ] || { echo "build-og-card: page-probe not found at $PROBE" >&2; exit 2; }

# One function for every card, so they cannot drift apart. Each line: source page, output PNG.
# Bump the date in the output name on every re-cut (the /og/* path is cached immutable for a year)
# and update the reference: lib/metadata.ts for the site card, app/portlink+griegconnect/page.tsx
# for the Havn card.
render() {
  local SRC="$1" OUT="$2"
  mkdir -p "$(dirname "$OUT")"
  # The eval answers which self-hosted faces actually loaded. Both cards link app/_fonts/fonts.css;
  # before 02.10.2026 they did not, and every card shipped in the system fallback because nothing
  # checked. A card with no Plus Jakarta Sans face loaded is refused, not written.
  local RESULT
  RESULT=$("$PROBE" \
    --url "file://$(pwd)/$SRC" \
    --viewport 1200x630 \
    --settle 1500 \
    --screenshot "$OUT" \
    --eval '[...document.fonts].filter(f => f.status === "loaded").map(f => f.family).join(",")')
  case "$RESULT" in
    *"Plus Jakarta Sans"*) ;;
    *) rm -f "$OUT"; echo "build-og-card: FAIL, Plus Jakarta Sans did not load for $SRC: $RESULT" >&2; exit 1 ;;
  esac

  # The card must be exactly what the meta tags promise. `sips` is macOS-native and needs no install.
  local W H
  W=$(sips -g pixelWidth "$OUT" | awk '/pixelWidth/{print $2}')
  H=$(sips -g pixelHeight "$OUT" | awk '/pixelHeight/{print $2}')
  [ "$W" = 1200 ] && [ "$H" = 630 ] || { echo "build-og-card: FAIL, $OUT rendered ${W}x${H}, want 1200x630" >&2; exit 1; }
  echo "build-og-card: OK ${OUT} ${W}x${H} $(wc -c < "$OUT" | tr -d ' ') byte, fonts loaded"
}

render scripts/og/card.html      public/og/portlink-2026-10-02.png
render scripts/og/havn-card.html public/og/havn-2026-10-02.png
