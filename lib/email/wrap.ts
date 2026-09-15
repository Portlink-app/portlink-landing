/**
 * wrap — the ONE HTML shell every email sent from portlink.app uses.
 *
 * Email clients do not resolve CSS variables, so this is the single place on the site where
 * literal hex values are allowed. They are the DS v4.1.1 mist + navy palette flattened by hand:
 *   #f4f7fa canvas · #ffffff surface · #e2e8f0 border · #111827 text-1 · #374151 text-2
 *   #94a3b8 text-3 · #3d7daf accent · #1e4a6e primary · #f0f6fb primary-faint
 * Shared by /api/access (pilot form) and /api/seatrade (Seatrade scorecard funnel). Do not
 * fork it per flow; pass `footerNote` for anything flow-specific (an unsubscribe line, etc.).
 */

export interface WrapOptions {
  /** Extra line under the standard footer, e.g. an unsubscribe link. Already-escaped HTML. */
  footerNote?: string
  /** Hidden preheader shown by inbox list views. Plain text; escaped here. */
  preheader?: string
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function wrap(body: string, opts: WrapOptions = {}): string {
  const preheader = opts.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(opts.preheader)}</div>`
    : ''
  const footerNote = opts.footerNote
    ? `<p style="margin:10px 0 0;font-size:12px;color:#94a3b8;line-height:1.5">${opts.footerNote}</p>`
    : ''

  return `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f7fa;font-family:'Plus Jakarta Sans','Inter',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased">
${preheader}
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fa;padding:40px 16px">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0">
  <!-- Header bar -->
  <tr><td style="padding:28px 36px;border-bottom:1px solid #e2e8f0">
    <img src="https://portlink.app/portlink-logo.png" alt="Portlink" width="120" height="32" style="display:block;width:120px;height:auto;border:0" />
  </td></tr>
  <!-- Body -->
  <tr><td style="padding:36px 36px 40px">
    ${body}
  </td></tr>
  <!-- Footer -->
  <tr><td style="padding:20px 36px;border-top:1px solid #e2e8f0;background:#f8fafc">
    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.5">
      Portlink &middot; Port call coordination, simplified.<br>
      <a href="https://portlink.app" style="color:#3d7daf;text-decoration:none">portlink.app</a>
    </p>
    ${footerNote}
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`
}

/** A pill-shaped CTA button that renders in every major client. */
export function ctaButton(href: string, label: string): string {
  return `<div style="margin:28px 0 0;text-align:center">
      <a href="${href}" style="display:inline-block;background:#3d7daf;color:#ffffff;padding:12px 28px;border-radius:9999px;font-size:14px;font-weight:600;text-decoration:none">${label}</a>
    </div>`
}
