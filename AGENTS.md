# Portlink landing

## Services and connections

The one authoritative service table for this repository is [CLAUDE.md, Services and connections](CLAUDE.md#services-and-connections). This file deliberately keeps no second copy: two tables drift (consolidated 01.10.2026). Read that section before any external action, then confirm the exact account, site and project with a scoped read.

Run `python3 /Users/nyx/Projects/_assessment-2026-10-01/scripts/project-route.py "$PWD"` first, and `python3 /Users/nyx/Projects/_assessment-2026-10-01/scripts/verify-service-routes.py --project <this root>` for a live, value-free identity check of the declared services. Portfolio gaps: /Users/nyx/Projects/_assessment-2026-10-01/SERVICE-ROUTING.md.

## Homepage work entry point

Read `docs/LANDING-DIRECTION.md` for the design rationale, Refero references, component map, verification evidence and current progress. Do not edit generated `app/_ds/*`. The product explorer's chapter registry is `components/scenes/chapters.ts`; keep every scene's separate Wide and Narrow composition. Contact forms and the Seatrade campaign are independent of this visual upgrade.

Run `npm run build` and `npm run verify`. The build checks rendered scene pairs and excludes film from server markup. `check:viz-type` covers authored TSX and CSS, including the new CSS modules. Browser verification still owns actual layout, keyboard, fragment links and playback.

## Preview links

Always include a verified Tailscale URL when sharing this preview. Current private endpoint:
`https://nyxs-mac-studio.tail79b0ec.ts.net:4320/`, forwarding to `http://127.0.0.1:4320/`.
The same URL is used from the Mac Studio, MacBook and iPhone when connected to Tailscale.
Manage the persistent optimized preview with `node scripts/preview-service.mjs start|stop|restart|status`.
The script installs `app.portlink.landing-preview-4320` as a user LaunchAgent with automatic restart.
Never share a preview backed only by a tool-owned foreground or background process.
Before rebuilding: `node scripts/preview-service.mjs stop`; after a successful build, use `start`.
Before sharing: `node scripts/preview-service.mjs check https://nyxs-mac-studio.tail79b0ec.ts.net:4320/`,
then verify actual browser rendering. The health check fetches both pages and their scripts/styles/fonts.
Inspect live status with `/Applications/Tailscale.app/Contents/MacOS/Tailscale serve status --json`.
Preserve unrelated routes. This endpoint is private Serve, not public Funnel. Browser loading on
this Mac was verified on 22.09.2026; a remote-device browser test was not performed.
The host must be awake, signed in and connected to Tailscale. Public `https://portlink.app/` is independent of it.
Logs: `~/Library/Logs/PortlinkLandingPreview/server.log` and `server.err`.
The older `app.portlink.landing-preview` label serves a separate legacy worktree on 4611; it does not own 4320.
To remove just this endpoint: `/Applications/Tailscale.app/Contents/MacOS/Tailscale serve --https=4320 off`.
