# Mission Control Account Context

Repo: `/Users/nyx/Projects/portlink/portlink-landing`
Remote: `https://github.com/portlinkadmin/portlink-landing.git`
Default account id: _(none — no Supabase backend; Resend key in the `Portlink` vault)_

## How agents/tools should find account information

```bash
MC=/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/bin/mc-account
$MC show supabase-portlink
$MC dashboard supabase-portlink
$MC env-template supabase-portlink
```

If the account id is `TODO:select-account-id-from-registry`, choose the correct account from:

```bash
/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/bin/mc-account list
```

## Safety

- Do not store secrets in this repo.
- Use `.env.op` with 1Password references when needed.
- Use `op run --env-file .env.op -- <command>` only when explicitly needed.
- Read operations are preferred by default.
- Production writes require explicit David approval.

## Registry files

- Registry: `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/registry.json`
- 1Password convention: `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/onepassword-convention.md`
- Local bridge plan: `/Users/nyx/.openclaw/workspace-nyx/mission-control/account-registry/local-bridge-plan.md`
