/**
 * Scheduled every hour at :05. Calls /api/intel/cron on the production site with the shared
 * secret; the route decides what is due (hot-lead alerts every run, the digest once a day after
 * 07.00 Oslo, the retention sweep with the digest). Netlify runs scheduled functions on published
 * production deploys only. Entry doc: docs/VISITOR-INTELLIGENCE.md.
 */
const intelCron = async () => {
  const base = process.env.URL
  const secret = process.env.INTEL_SECRET
  if (!base || !secret) {
    console.error('[intel-cron] URL or INTEL_SECRET missing')
    return new Response('not configured', { status: 500 })
  }
  const res = await fetch(`${base}/api/intel/cron/`, { method: 'POST', headers: { 'x-intel-secret': secret } })
  const text = await res.text()
  console.log(`[intel-cron] ${res.status} ${text.slice(0, 500)}`)
  return new Response(null, { status: res.ok ? 200 : 502 })
}

export default intelCron

// Netlify reads the schedule from this export; no @netlify/functions dependency needed for it.
export const config = { schedule: '5 * * * *' }
