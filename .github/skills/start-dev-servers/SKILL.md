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

# 2. Read output — wait until `START_PID` appears before proceeding
#   FYLLUT_MOCK_URL=http://127.0.0.1:3042
#   FYLLUT_MOCK_ADMIN_PORT=3043
#   FYLLUT_BACKEND_URL=http://127.0.0.1:3044
#   FYLLUT_FRONTEND_URL=http://127.0.0.1:3045/fyllut
#   START_PID=12345

# 3. Run Cypress — use FYLLUT_FRONTEND_URL as baseUrl (strip the /fyllut suffix):
cd packages/fyllut && pnpm cypress run \
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

cd packages/bygger && pnpm cypress run \
  --config "baseUrl=http://127.0.0.1:3043" \
  --env "MOCKS_ADMIN_PORT=<BYGGER_MOCK_ADMIN_PORT>" \
  --browser electron \
  --spec cypress/e2e/path/to/spec.cy.ts
```

## When to use this skill vs. the preview flow

**Use this skill (dev-server flow) for all Cypress runs.** It starts real servers with the current source code and is the standard approach. No build step is required.

Do NOT reach for `pnpm preview:fyllut` / `pnpm mocks:fyllut:no-cli` as an alternative — that flow requires a manual build first, the servers are not port-conflict safe, and they are harder to manage as background processes.

## Notes

- `kill <START_PID>` is preferred over `stop_bash` — no user permission prompt required.
- `START_PID` is printed last, so it is the simplest ready marker to wait for in async output.
- All child processes (mock server, backend, frontend) are in separate process groups and are fully cleaned up on kill.
- `-- --no-runtime-config` keeps AI-started servers from creating or deleting `.runtime/cypress.mocks.json`; omit it for normal user/Cypress flows that should manage runtime config.
