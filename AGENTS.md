# AGENTS.md — portlink-landing

<!-- mission-control-account-context:start -->
## Mission Control Account Context

Before touching Supabase, GitHub, Netlify, Cloudflare, or other external accounts for this repo:

1. Read repo-local context: `.mission-control/account-context.md`
2. Use the central non-secret registry:
   `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/registry.json`
3. Use helper CLI:
   `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/bin/mc-account`
4. Default account id for this repo: _(none — no Supabase backend; Resend key in the `Portlink` vault)_
5. Secrets live in 1Password only. Store/use `op://...` references, never raw secret values.
6. Do not rely on cloud MCP/browser login account switching; select accounts from the registry.
7. Production writes require explicit human approval.
<!-- mission-control-account-context:end -->

## Connections

This repo is the **public marketing landing** site. No Supabase backend; its only
secret is the Resend API key used for the contact/waitlist form.

| Aspect | Value |
|---|---|
| GitHub | `portlinkadmin/portlink-landing` |
| Netlify site | `portlink-landing-v2` |
| Supabase | none |
| Email | Resend — `op://cypqkqoeuibf4f6aud47v3qooa/lhylbglnfx7vy7yenlxn2tfehm/credential` (vault `Portlink`, item "Resend — Portlink — API key") |
| 1Password vault | `Portlink` |

Run with secrets injected from 1Password (never committed):

```bash
op run --env-file=.env.op -- npm run dev
```
