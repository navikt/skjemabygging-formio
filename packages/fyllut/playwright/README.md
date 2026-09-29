# FyllUt Playwright pilot

This is the prototype for #2207. It does not replace or disable any Cypress tests. The register in `migration/inventory.json` records 795 declarations in 89 Cypress files at `b637d46d1d84e27ee3229215af5fa54a4589600b`. The earlier 86-file, 787-declaration baseline remains in its reconciliation history. Existing IDs were preserved when new source tests were added. The 38 tests in the original five pilot files have source-specific checklists; an additional data-fetcher test probes mock route variants. Eight tests have Playwright counterparts. Coverage and Playwright-practice review fields remain pending until developers review them.

After installing workspace dependencies and the Chromium browser (`pnpm --dir packages/fyllut exec playwright install chromium`), run from the repository root:

```sh
pnpm playwright:fyllut
pnpm build:fyllut
pnpm playwright:fyllut:built
pnpm playwright:fyllut -- components-customized/bankaccount.spec.ts
pnpm playwright:fyllut -- components-deprecated-complex/data-fetcher.spec.ts
node --test bin/playwright/check-migration.test.mjs bin/lib/fyllut-test-stack.test.mjs
```

The runner uses Chromium, one worker and no retries. Each executable test gets a fresh epoch with its own mock server and application processes. Dev uses Vite backend/frontend servers. Built uses `fyllut-backend/dist/server.mjs` to serve both API and the compiled frontend, with no Vite server or implicit build. Rebuild after relevant source changes. The fixed test ports are 3440 through 3443; occupied ports fail rather than selecting alternatives or stopping foreign services.

The launcher requires successful bind notifications from its own children and HTTP readiness. Teardown closes browser contexts, restores variants, signals only owned process groups, escalates bounded shutdown to SIGKILL if needed, and awaits actual exit before another epoch. Failed cleanup poisons the run. Cypress runtime configuration is not written or deleted.

Reports are under `packages/fyllut/.runtime/playwright/<run-id>/`. `run.json` records mode, selected IDs and commit, `source.diff` records tracked worktree changes, and each epoch records its immutable test ID, attempt, URLs, PIDs, startup duration and stop time. JSON results are checked against the exact selected IDs; discovery is not runtime evidence. F029-T002 confirms `get-register-data-activities:success-empty` and checks the backend response and empty-state UI. Submission body evidence is a separate step.

The eight source IDs are F004-T005/T006 (bank account), F017-T007 (date boundary), F029-T002 (empty mock variant), F061-T001 (attachment errors and focus), F073-T001/T003 (axe), and F086-T001 (static PDF). Each existing Cypress test keeps running and points to its counterpart; each Playwright test annotates the source path and ID.

To verify Playwright's collected test list against the register without starting servers, run:

```sh
pnpm playwright:fyllut --list
pnpm playwright:fyllut:built --list
pnpm playwright:fyllut --grep 'data is empty'
```

`--list` starts no servers. Use the root runners for execution. They allow file selectors and `--grep`, not options that override workers, retries or reporters. Empty selections fail. The checker rejects changed Cypress test logic or shared helpers, missing pointers, incorrect or duplicate Playwright IDs, unexpected skips and incomplete results. It does not establish behavioral equivalence; developers must compare assertions, hooks and helper behavior using the checklists.

In CPLT, the documented `sandbox.allow_cache_exec = ["ms-playwright"]` setting permits running Playwright's Chromium. Localhost access must also be active for the app and mock server. All eight browser journeys passed in an AI-run CPLT session. The mock-server log confirmed that `success-empty` handled the activities request. A negative-control run using `success` instead failed on the empty-array assertion, receiving three activities. Developer coverage and Playwright-practice review is still pending.

CPLT resolves permissions when it starts. Launching from a parent directory does not automatically apply this repository's approved `.cplt.toml`; resuming a conversation or changing directories later does not change those permissions. Successful runs in one approved environment do not establish general CPLT compatibility. On Linux, port grants also permit connections to remote hosts on those ports. The Playwright runner requires its four ports to be free and does not expand permissions. Native pnpm and Chromium must already be executable, workspace dependencies installed, and the ordinary Git hook readable for local commits. Resolve registry authentication outside the agent session; never put credentials in test configuration.
