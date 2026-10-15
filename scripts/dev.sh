#!/bin/sh
# `npm run dev`: secrets come from 1Password at runtime (.env.op), never from a plaintext .env.local.
# Used when `op` is installed and .env.op exists; plain `next dev` otherwise, or with PL_DEV_NO_OP=1
# (a machine whose 1Password cannot reach the Portlink vault). Netlify builds never run this.
if [ -z "$PL_DEV_NO_OP" ] && [ -f .env.op ] && command -v op >/dev/null 2>&1; then
  exec op run --env-file=.env.op -- next dev "$@"
fi
exec next dev "$@"
