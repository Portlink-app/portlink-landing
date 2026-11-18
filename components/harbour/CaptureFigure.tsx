import { CAPTURES } from './script'
import styles from './harbour.module.css'

/**
 * One real product capture, frameless, 10 px radius, phone source under 600 px when it exists.
 * Every capture is demo data from a local seed, and the caption says so. No capture, no figure.
 */
export default function CaptureFigure({
  id,
  className,
  loading = 'lazy',
}: {
  id: string
  className?: string
  loading?: 'lazy' | 'eager'
}) {
  const c = CAPTURES[id]
  if (!c || !c.desktop) return null
  return (
    <figure className={`${styles.capture} ${className ?? ''}`}>
      <picture>
        {c.phone ? <source media="(max-width: 600px)" srcSet={c.phone} width={780} height={1688} /> : null}
        <img src={c.desktop} alt={c.alt} width={2560} height={1600} loading={loading} decoding="async" />
      </picture>
      <figcaption className={styles.captureNote}>Demo data</figcaption>
    </figure>
  )
}
