---
name: start-dev-servers
description: >-
    Start fyllut or bygger dev servers on automatically allocated free ports.
    Use this when you need to run dev servers without port conflicts, e.g. before
    running Cypress tests or verifying a feature in a running instance.
---

# Starting dev servers

## Commands

### Fyllut

- AI/dev-server flow: `pnpm start:fyllut:mocks -- --no-runtime-config`
- User/Cypress flow that should write runtime config: `pnpm start:fyllut:mocks`

Starts:

- mocks server
- fyllut-backend
- fyllut frontend

### Bygger

- AI/dev-server flow: `pnpm start:bygger:mocks -- --no-runtime-config`
- User/Cypress flow that should write runtime config: `pnpm start:bygger:mocks`

Starts:

- bygger-backend
- bygger frontend

## Pattern

```
# 1. Start in async bash mode
bash (async): pnpm start:fyllut:mocks -- --no-runtime-config

# 2. Read output — ALWAYS WAIT UNTIL `START_PID` appears before proceeding
#   FYLLUT_MOCK_URL=http://127.0.0.1:3042
#   FYLLUT_MOCK_ADMIN_PORT=3043
#   FYLLUT_BACKEND_URL=http://127.0.0.1:3044
#   FYLLUT_FRONTEND_URL=http://127.0.0.1:3045/fyllut
#   START_PID=12345

# 3. Run Cypress — use FYLLUT_FRONTEND_URL as baseUrl (strip the /fyllut suffix):
cd packages/fyllut && XDG_CONFIG_HOME="$PWD/.cypress-home" pnpm exec cypress run \
  --config "baseUrl=http://127.0.0.1:3045" \
  --env "MOCKS_ADMIN_PORT=3043" \
  --browser electron \
  --spec cypress/e2e/path/to/spec.cy.ts

# 4. Stop all servers (no permission prompt)
bash: kill <START_PID>
```

For bygger, use the same pattern:

```
bash (async): pnpm start:bygger:mocks -- --no-runtime-config

# Wait for:
#   BYGGER_BACKEND_URL=http://127.0.0.1:3042
#   BYGGER_FRONTEND_URL=http://127.0.0.1:3043
#   START_PID=12345

cd packages/bygger && XDG_CONFIG_HOME="$PWD/.cypress-home" pnpm exec cypress run \
  --config "baseUrl=http://127.0.0.1:3043" \
  --browser electron \
  --spec cypress/e2e/path/to/spec.cy.ts
```

## When to use this skill vs. the preview flow

**Use this skill (dev-server flow) for all Cypress runs.** It starts real servers with the current source code and is the standard approach. No build step is required.

Do NOT reach for `pnpm preview:fyllut` / `pnpm mocks:fyllut:no-cli` as an alternative — that flow requires a manual build first, the servers are not port-conflict safe, and they are harder to manage as background processes.

## Recovering node_modules after a failed install

Some `@navikt` packages come from GitHub Packages (`npm.pkg.github.com`). In
an environment without GitHub Packages credentials, such as an agent sandbox,
any install that needs to download a package fails with HTTP 401. pnpm then
leaves `node_modules` empty.

pnpm starts an install on its own when `node_modules` does not match the
lockfile, also from `pnpm <script>` and from the pre-commit hook
(`pnpm lint:staged`). This happens after switching to a branch with a
different `pnpm-lock.yaml`.

To restore `node_modules` without network access, install from the local
store:

```bash
pnpm install --offline --frozen-lockfile --store-dir "$HOME/Library/pnpm/store"
```

- `$HOME/Library/pnpm/store` is the default store on macOS. On Linux it is
  `$HOME/.local/share/pnpm/store`.
- Pass `--store-dir` explicitly. A sandbox can point pnpm at an empty store,
  for example `.pnpm-store/` in the repository.
- If the offline install reports a missing package, the store does not have
  it. Ask the user to run `pnpm install`.

Run this after switching branches and before the next `pnpm` command or
commit. Do not retry the online install, because it wipes `node_modules`
again.

## Notes

- `kill <START_PID>` is preferred over `stop_bash` — no user permission prompt required.
- `START_PID` is printed **last and is the only reliable ready marker** — never run tests without confirming this marker has appeared.
- Killing `START_PID` triggers launcher cleanup of the child processes it started.
- `-- --no-runtime-config` keeps AI-started servers from creating or deleting `.runtime/cypress.mocks.json`; omit it for normal user/Cypress flows that should manage runtime config.
- `pnpm` forwards the separator literally, so keep the command in the `pnpm start:*:mocks -- --no-runtime-config` form for the AI/dev-server flow.
