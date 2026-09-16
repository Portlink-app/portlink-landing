#!/usr/bin/env bash
# Render the 1200x630 share card from scripts/og/card.html into public/og/.
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

OUT="public/og/portlink-2026-09-16.png"
mkdir -p "$(dirname "$OUT")"

"$PROBE" \
  --url "file://$(pwd)/scripts/og/card.html" \
  --viewport 1200x630 \
  --settle 1500 \
  --screenshot "$OUT" \
  --eval 'document.querySelectorAll("img").length'

# The card must be exactly what the meta tags promise. `sips` is macOS-native and needs no install.
W=$(sips -g pixelWidth "$OUT" | awk '/pixelWidth/{print $2}')
H=$(sips -g pixelHeight "$OUT" | awk '/pixelHeight/{print $2}')
[ "$W" = 1200 ] && [ "$H" = 630 ] || { echo "build-og-card: FAIL, rendered ${W}x${H}, want 1200x630" >&2; exit 1; }
echo "build-og-card: OK ${OUT} ${W}x${H} $(wc -c < "$OUT" | tr -d ' ') byte"
