import { PRIZE_NAME } from '@/lib/seatrade/config'

/**
 * The draw prize, as one asset with two presentations.
 *
 * ONE COMPONENT ON PURPOSE. The prize appears on the front page and at the top of the funnel, and
 * those are different shapes: a wide banner has room on a marketing section, and a phone about to
 * answer seven questions does not. A second copy of the markup would be a second place to get the
 * alt text, the licensing rule and the dimensions wrong.
 *
 * WHY IT IS OUR OWN ARTWORK, WHICH IS A DECISION AND NOT A PROHIBITION. David authorised Apple
 * product imagery on 16.09.2026 ("I allow you to use the image you create or iPhone images from
 * Apple"), so both are permitted and the earlier ban is lifted. Ours is still the one that ships,
 * for two reasons that outlive the permission: it carries no licensing question at any point in the
 * campaign, and the draw terms on this same site state that the draw is not sponsored or endorsed
 * by Apple - their product photography sitting beside that sentence is the exact reading the
 * sentence exists to prevent. If that is ever revisited, take the image from Apple's own product
 * pages rather than a third party, keep the non-endorsement line in the same view, and never place
 * it so it reads as co-branding with the Portlink mark. Naming the prize in text is unrelated and
 * unchanged; that is what PRIZE_NAME is for.
 *
 * WIDTH AND HEIGHT ARE ALWAYS SET. `images: { unoptimized: true }` in next.config means there is no
 * image optimizer computing an intrinsic ratio for us, so the attributes are what stop the text
 * below from jumping when the file lands.
 */

const SRC = '/seatrade/prize.webp'
const W = 1376
const H = 768
const ALT = `The prize in the draw: ${PRIZE_NAME}.`

/** Wide, full width of its container. For the front page's draw section. */
export function PrizeBanner({ style }: { style?: React.CSSProperties }) {
  return (
    <img
      src={SRC}
      alt={ALT}
      width={W}
      height={H}
      loading="lazy"
      decoding="async"
      style={{
        display: 'block', width: '100%', height: 'auto',
        borderRadius: '16px', border: '1px solid var(--border)',
        ...style,
      }}
    />
  )
}

/**
 * Square thumbnail, centre-cropped. For the funnel intro, where every pixel of height is spent
 * before the first question and a full-width banner pushed the first option off a 390x844 screen
 * (measured: first option bottom 866 with the banner, 559 without).
 */
export function PrizeChip({ size = 96 }: { size?: number }) {
  return (
    <img
      src={SRC}
      alt={ALT}
      width={W}
      height={H}
      decoding="async"
      style={{
        display: 'block', width: size, height: size, flexShrink: 0,
        objectFit: 'cover', objectPosition: 'center',
        borderRadius: 'var(--ds-radius-md)', border: '1px solid var(--border)',
      }}
    />
  )
}
