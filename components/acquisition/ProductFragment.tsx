import type { AcquisitionAudience, AcquisitionProduct } from '@/lib/acquisition-preferences'
import type { DemoRecord } from './journey-content'
import styles from './ProductJourney.module.css'

/** Focused, synthetic product fragments. Source provenance: docs/ACQUISITION.md.
 * These preserve the real products' separate review, capacity and payment states.
 * They are presentation only; the shared session owns every sample operation. */
export default function ProductFragment({ product, audience, topic, record, reviewed }: {
  product: AcquisitionProduct; audience: AcquisitionAudience; topic: string; record: DemoRecord; reviewed: boolean
}) {
  if (record.unavailable) return <dl>{record.rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  if (product === 'platform' && topic === 'planning') return <div className={styles.productFragment} data-ui>
    <p className={styles.fragmentContext}>Itinerary · Aster Brisa · Summer 2028</p>
    <ol className={styles.reviewRail} aria-label="Itinerary review stages">{['Draft', 'Marine operations', 'Shorex', 'Commercial', 'Published'].map((stage, index) => <li key={stage} aria-current={index === (reviewed ? 1 : 0) ? 'step' : undefined}>{stage}<span>{index === (reviewed ? 1 : 0) ? 'Current stage' : index < (reviewed ? 1 : 0) ? 'Reviewed' : 'Not started'}</span></li>)}</ol>
    <div className={styles.callLeg}><span className={styles.portMarker} aria-hidden="true" /><div><strong>Bergen</strong><p>Proposed call · Berth to be arranged</p></div><span className={styles.fragmentStatus}>Not confirmed</span></div>
    <p>External commitment: not requested</p>
  </div>
  if (product === 'embark' && topic !== 'bookings') {
    const capacity = topic === 'capacity' ? 10 : 12
    return <div className={styles.productFragment} data-ui>
      <div className={styles.departureHeader}><div><span>Departure</span><h4>Coastal kayaking</h4><p>10.00 · Guide assigned</p></div><span className={styles.fragmentStatus}>{topic === 'capacity' ? 'Capacity needs review' : reviewed ? 'Plan reviewed' : 'Ready for review'}</span></div>
      <div className={styles.capacityMeter}><strong>12 <span>/ {capacity} seats</span></strong><div className={styles.seatTicks} role="img" aria-label={`12 booked guests against ${capacity} seats; ${12 - capacity} unresolved`}>{Array.from({ length: capacity }, (_, i) => <span key={i} aria-hidden="true" />)}</div><p>{capacity === 10 ? '2 guests need a decision' : 'All booked guests fit the departure'}</p></div>
      <div className={styles.fragmentRows}><div><strong>Guest bookings</strong><span>12 guests retained</span></div><div><strong>Guide preparation</strong><span>Assignment unchanged</span></div></div>
    </div>
  }
  if (product === 'platform' && topic === 'accounts') return <div className={styles.productFragment} data-ui>
    <div className={styles.fragmentRows}><div><strong>Approved proforma</strong><span>412 380,00 kr</span></div><div><strong>Unused tug overtime</strong><span>−11 130,00 kr</span></div><div className={styles.accountTotal}><strong>Final account</strong><span>401 250,00 kr</span></div></div>
    <p className={styles.fragmentStatus}>{reviewed ? 'Difference reviewed' : 'Awaiting quantity review'}</p><p>Account acceptance and payment remain separate decisions.</p>
  </div>
  return <div className={styles.productFragment} data-ui>
    <p className={styles.fragmentContext}>{product === 'embark' ? 'Bookings · Group request' : audience === 'tour' ? 'Shore programme · Quote response' : 'Port call · Service record'}</p>
    <div className={styles.fragmentRows}>{record.rows.map(([label,value]) => <div key={label}><strong>{label}</strong><span>{value}</span></div>)}</div>
    <p className={styles.fragmentStatus}>{reviewed ? 'Sample review complete' : 'Awaiting review'}</p>
  </div>
}
