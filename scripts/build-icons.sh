#!/usr/bin/env bash
# Build the home-screen and browser icon set from the wordmark that already ships.
#
#   scripts/build-icons.sh
#
# ## WHY THIS EXISTS AT ALL
#
# app/favicon.ico was Next's default: a black circle with a white triangle, 5 214 byte, grayscale.
# It had never been replaced, so portlink.app's browser tab carried the framework's logo, and
# "Add to Home Screen" on an iPhone gave a generic tile because no apple-touch-icon was declared.
#
# ## WHERE THE MARK COMES FROM, AND WHAT IS NOT BEING INVENTED HERE
#
# Portlink has no square logomark, only the wordmark at public/portlink-logo.png. This crops that
# wordmark's own P and sets it on --ds-primary in --ds-primary-ink: two design-system tokens in
# the pairing the system already defines for them (ink on primary is the site's own button). No new
# colour, no new letterform, no drawing. A purpose-drawn logomark is a design decision and belongs
# with whoever owns the brand; this is the honest derivation available from what exists, and it is
# strictly better than shipping the framework's default.
#
# The crop is by pixel because the wordmark is a raster. 130px of 833 is the P and nothing of the
# following o, checked by eye at three widths before it was fixed here.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v magick >/dev/null || { echo "build-icons: ImageMagick (magick) not found" >&2; exit 2; }

PRIMARY="#1e3a5f"   # --ds-primary, light theme
INK="#ffffff"       # --ds-primary-ink
SRC="public/portlink-logo.png"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# The P, reversed out to the ink colour.
magick "$SRC" -crop 130x219+0+0 +repage -trim +repage \
  -alpha extract -negate -threshold 50% -negate \
  "$TMP/mask.png"
magick -size "$(magick identify -format '%wx%h' "$TMP/mask.png")" "xc:$INK" \
  "$TMP/mask.png" -alpha off -compose CopyOpacity -composite "$TMP/glyph.png"

# One square tile, full bleed. iOS applies its own rounded mask to the apple-touch icon, and a
# maskable Android icon is cropped to a circle, so the glyph sits at 58% of the tile: inside the
# 80% safe zone either way, and still large enough to read at 16px.
tile () {
  local size="$1" out="$2"
  local glyph=$(( size * 58 / 100 ))
  magick -size "${size}x${size}" "xc:$PRIMARY" \
    \( "$TMP/glyph.png" -resize "x${glyph}" \) -gravity center -composite \
    -strip "$out"
  echo "  $out $(magick identify -format '%wx%h' "$out") $(wc -c < "$out" | tr -d ' ') byte"
}

mkdir -p public
echo "build-icons:"
tile 180 public/apple-touch-icon.png
tile 192 public/icon-192.png
tile 512 public/icon-512.png

# The browser tab, replacing the framework default. Multi-resolution so a 16px tab and a 48px
# bookmark bar each get a frame rendered at their own size rather than a downscale of one.
for s in 16 32 48 256; do tile "$s" "$TMP/f$s.png" >/dev/null; done
magick "$TMP/f16.png" "$TMP/f32.png" "$TMP/f48.png" "$TMP/f256.png" app/favicon.ico
echo "  app/favicon.ico $(magick identify app/favicon.ico | wc -l | tr -d ' ') frames $(wc -c < app/favicon.ico | tr -d ' ') byte"
