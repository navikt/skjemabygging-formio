---
name: start-dev-servers
description: >-
    Start fyllut or bygger dev servers on automatically allocated free ports.
    Use this when you need to run dev servers without port conflicts, e.g. before
    running Cypress tests or verifying a feature in a running instance.
---

# Starting dev servers

Use `yarn start:fyllut:mocks` or `yarn start:bygger:mocks` to start servers on free ports.

When starting these from an AI workflow, pass `-- --no-runtime-config` so the agent does not overwrite a user's existing `.runtime/cypress.mocks.json`.

## Pattern

```
# 1. Start in async bash mode
bash (async): yarn start:fyllut:mocks -- --no-runtime-config

# 2. Read output — wait until `START_PID` appears before proceeding
#   FYLLUT_MOCK_URL=http://127.0.0.1:3042
#   FYLLUT_BACKEND_URL=http://127.0.0.1:3043
#   FYLLUT_FRONTEND_URL=http://127.0.0.1:3044
#   START_PID=12345

# 3. Do work using the URLs above

# 4. Stop all servers (no permission prompt)
bash: kill <START_PID>
```

## Notes

- `kill <START_PID>` is preferred over `stop_bash` — no user permission prompt required.
- `START_PID` is printed last, so it is the simplest ready marker to wait for in async output.
- All child processes (mock server, backend, frontend) are in separate process groups and are fully cleaned up on kill.
- `-- --no-runtime-config` keeps AI-started servers from creating or deleting `.runtime/cypress.mocks.json`; omit it for normal user/Cypress flows that should manage runtime config.
- For custom ports without auto-allocation, pass `--port` directly: `yarn workspace @navikt/fyllut-backend start -- --port 8181`
