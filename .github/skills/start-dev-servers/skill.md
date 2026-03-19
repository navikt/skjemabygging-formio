---
name: start-dev-servers
description: >-
    Start fyllut or bygger dev servers on automatically allocated free ports.
    Use this when you need to run dev servers without port conflicts, e.g. before
    running Cypress tests or verifying a feature in a running instance.
---

# Starting dev servers

Use `yarn start:fyllut:auto` or `yarn start:bygger:auto` to start servers on free ports.

## Pattern

```
# 1. Start in async bash mode
bash (async): yarn start:fyllut:auto

# 2. Read output — wait for READY=true before proceeding
#   FYLLUT_MOCK_PORT=3042
#   FYLLUT_BACKEND_PORT=3043
#   FYLLUT_FRONTEND_PORT=3044
#   FYLLUT_FRONTEND_URL=http://localhost:3044
#   START_PID=12345
#   READY=true

# 3. Do work using the ports above

# 4. Stop all servers (no permission prompt)
bash: kill <START_PID>
```

## Notes

- `kill <START_PID>` is preferred over `stop_bash` — no user permission prompt required.
- All child processes (mock server, backend, frontend) are in separate process groups and are fully cleaned up on kill.
- For custom ports without auto-allocation, pass `--port` directly: `yarn workspace @navikt/fyllut-backend start -- --port 8181`
