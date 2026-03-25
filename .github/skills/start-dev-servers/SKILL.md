---
name: start-dev-servers
description: >-
    Start fyllut or bygger dev servers on automatically allocated free ports.
    Use this when you need to run dev servers without port conflicts, e.g. before
    running Cypress tests or verifying a feature in a running instance.
---

# Starting dev servers

Use this skill when you need a local dev server on automatically allocated free ports.

For AI-driven test or verification flows, always pass `-- --no-runtime-config` so the agent does not overwrite a user's existing `.runtime/cypress.mocks.json`.

## Commands

### Fyllut

- AI/dev-server flow: `yarn start:fyllut:mocks -- --no-runtime-config`
- User/Cypress flow that should write runtime config: `yarn start:fyllut:mocks`

Starts:

- mocks server
- fyllut-backend
- fyllut frontend

### Bygger

- AI/dev-server flow: `yarn start:bygger:mocks -- --no-runtime-config`
- User/Cypress flow that should write runtime config: `yarn start:bygger:mocks`

Starts:

- bygger-backend
- bygger frontend

## Pattern

```
# 1. Start in async bash mode
bash (async): yarn start:fyllut:mocks -- --no-runtime-config

# 2. Read output — wait until `START_PID` appears before proceeding
#   FYLLUT_MOCK_URL=http://127.0.0.1:3042
#   FYLLUT_MOCK_ADMIN_PORT=3043
#   FYLLUT_BACKEND_URL=http://127.0.0.1:3044
#   FYLLUT_FRONTEND_URL=http://127.0.0.1:3045
#   START_PID=12345

# 3. Do work using the URLs above

# 4. Stop all servers (no permission prompt)
bash: kill <START_PID>
```

For bygger, use the same pattern:

```
bash (async): yarn start:bygger:mocks -- --no-runtime-config

# Wait for:
#   BYGGER_BACKEND_URL=http://127.0.0.1:3042
#   BYGGER_FRONTEND_URL=http://127.0.0.1:3043
#   START_PID=12345
```

## Notes

- `kill <START_PID>` is preferred over `stop_bash` — no user permission prompt required.
- `START_PID` is printed last, so it is the simplest ready marker to wait for in async output.
- All child processes (mock server, backend, frontend) are in separate process groups and are fully cleaned up on kill.
- `-- --no-runtime-config` keeps AI-started servers from creating or deleting `.runtime/cypress.mocks.json`; omit it for normal user/Cypress flows that should manage runtime config.
- Use the URLs printed by `bin/start.mjs` instead of assuming default ports.
- For Cypress workflow details, especially built/preview-mode testing, use the `cypress-repo-workflow` skill.
