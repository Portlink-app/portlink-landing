# Mission Control account context

Updated 19.09.2026. Repository: `/Users/nyx/Projects/portlink/portlink-landing`.

The verified routing table and credential references are in `CLAUDE.md`, under Services and connections (the one service table; `AGENTS.md` routes to it). Origin is `https://github.com/Portlink-app/portlink-landing.git`. Use the named GitHub login declared there and Netlify site `portlin-landing-2` only.

The central registry is `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/registry.json`; its helper is `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/bin/mc-account`. Its Supabase Portlink entry describes the product database, not this marketing repository. No database operation is needed here.

Read secrets through the secret wrapper (`~/.claude/bin/secret`, same file as `~/.codex/bin/secret`), using the exact references in CLAUDE.md. Never store or display values. The publishing ruling from 17.09.2026 in CLAUDE.md supersedes this file's old blanket approval reservation.
