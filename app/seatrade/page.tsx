import Scorecard from '@/components/seatrade/Scorecard'
import SeatradeShell from '@/components/seatrade/Shell'

/**
 * portlink.app/seatrade/ — the Seatrade Cruise Med 2026 lead funnel.
 * Reached from a QR code on a phone on a show floor, so: no persona gate, no wave hero, no GSAP.
 * One column, big tap targets, the quiz starts on screen one.
 */
export default function SeatradePage() {
  return (
    <SeatradeShell>
      <Scorecard />
    </SeatradeShell>
  )
}
