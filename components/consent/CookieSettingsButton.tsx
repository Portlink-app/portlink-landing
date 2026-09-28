'use client'

/** Reopens the consent card from any page. Lives in the footer so the choice is one click away. */
import { requestOpen } from '@/lib/consent'

export default function CookieSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={requestOpen}>
      Cookie settings
    </button>
  )
}
