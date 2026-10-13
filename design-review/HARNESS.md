# Browser verification method

Use the supported CUA browser only. Reuse the local task's browser binding and inspect current tabs before testing. Desktop widths: 1440 and 1024. Tablet: 768. Phones: 390 and 320. Short landscape: 844 × 390. Check both themes on desktop and phone, every explorer chapter and role, all call handoffs, menu dismissal and form steps. Reset temporary viewport overrides afterward.

Capture screenshots at key compositions through CUA and keep measured DOM results in this review's evidence. Wait for the actual visible state through observations; a screenshot during smooth scrolling or an entrance transition is not a settled composition. Each UI action must be followed by a fresh accessibility observation.

Development: npm run dev -- --hostname 127.0.0.1 --port 4319. Shared optimized preview: node scripts/preview-service.mjs start. Check current processes and Tailscale Serve first. Stop with node scripts/preview-service.mjs stop before rebuilding .next, then start after a successful build. Do not use a transient tool-owned process for a shared link.

Before sharing, run node scripts/preview-service.mjs status and node scripts/preview-service.mjs check https://nyxs-mac-studio.tail79b0ec.ts.net:4320/. The check must load the homepage, contact page and every application asset referenced by both. Follow with a CUA screenshot and interaction. A healthy HTTP response alone does not prove rendering. Reversal: stop, then remove only ~/Library/LaunchAgents/app.portlink.landing-preview-4320.plist. Leave Serve and other services unchanged. The host must remain awake, signed in and connected to Tailscale.

Availability trap reproduced on 22.09.2026: the tool-owned Next process disappeared after the earlier turn. No listener remained on loopback:4320, while Serve correctly returned 502. A user LaunchAgent now owns this preview and restarts Next after exit. The old app.portlink.landing-preview service points to a different worktree on 4611. Never infer ownership from a similar label.

Cached browser error-page trap: a failed tab can internally hold a data: error document. Browser policy blocks attaching to that document. Use a fresh HTTPS tab to verify the repaired server; do not retry reading the blocked error document or disable any browser protection.

Required repo verification: npm run verify and npm run build. Form fixtures verify the mail boundary; browser tests exercise validation and movement between steps only. Dummy test details must never be submitted to /api/access. Existing #access links are externally circulated and mandatory.

Known tooling limits: a standalone Playwright launch is not the permitted browser path. Physical device rendering and browser reduced-motion emulation are separate from viewport checks. Record unavailable coverage instead of claiming it passed.


Viewport calibration trap found in this session: a previously emulated tab can retain its old dimensions while the browser-level viewport setting changes another tab. Always assert document.documentElement.clientWidth/clientHeight against the requested size. Reject the whole sample on mismatch. A fresh task-owned tab, followed by viewport.set, produced the accepted matrix. Clear temporary CDP overrides and reset the browser viewport at the end. A screenshot immediately after resizing may show an old compositor frame; inspect the next settled capture before making a visual judgement.

Shared CSS trap: the vendored design-system reset sets html and body to height:100%. A position:sticky header directly under body stops after the body's viewport-sized containing block. Use the shared Nav's fixed inner navigation with its normal-flow 64 px header shell; do not alter generated tokens or add page-specific fixes.

A later inspection confirmed that the selected native tab can differ from the automation tab. After closing a newly created reference tab, viewport.set may apply to that selected tab rather than the reused automation handle. Use a fresh task-owned verification tab, set its viewport, then assert actual dimensions; do not accept a requested-size label as proof. The public smoke test used this calibrated method.
