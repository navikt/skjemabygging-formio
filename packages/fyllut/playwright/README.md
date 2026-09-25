# FyllUt Playwright pilot (steps 0 and 1a)

This is the development-mode prototype for #2207. It does not replace or disable any Cypress tests. The register in `migration/inventory.json` records the 787 tests in 86 Cypress files at baseline commit `c87c61631b4687e96eb8481179938eb342a396ee`: 786 published IDs plus F063-T027. The 38 tests in the original five pilot files have source-specific checklists; an additional data-fetcher test probes mock route variants. Eight tests now have Playwright counterparts. Coverage and Playwright-practice review fields remain pending until developers review them.

After installing workspace dependencies and the Chromium browser (`pnpm --dir packages/fyllut exec playwright install chromium`), run from the repository root:

```sh
pnpm playwright:fyllut
pnpm playwright:fyllut -- components-customized/bankaccount.spec.ts
pnpm playwright:fyllut -- components-deprecated-complex/data-fetcher.spec.ts
node --test bin/playwright/check-migration.test.mjs bin/lib/fyllut-test-stack.test.mjs
```

The runner starts its own mock server, backend and frontend on selected ports. It prints the run ID, `dev` mode, service URLs, owning launcher PID and artifact directory. It waits for HTTP readiness, runs Chromium with one worker and no retries, and stops only the stack it launched. HTML reports and failure traces/screenshots are under `packages/fyllut/.runtime/playwright/<run-id>/`. The mock-admin fixture awaits variant reset before and after each test. F029-T002 selects and confirms the non-default `get-register-data-activities:success-empty` variant, then checks the browser's backend response and empty-state UI. It does not verify mock-server request history or submission request bodies.

The eight source IDs are F004-T005/T006 (bank account), F017-T007 (date boundary), F029-T002 (empty mock variant), F061-T001 (attachment errors and focus), F073-T001/T003 (axe), and F086-T001 (static PDF). Each existing Cypress test keeps running and points to its counterpart; each Playwright test annotates the source path and ID.

To verify Playwright's collected test list against the register without starting servers, run:

```sh
FYLLUT_PLAYWRIGHT_BASE_URL=http://127.0.0.1:1 FYLLUT_PLAYWRIGHT_MOCK_ADMIN_URL=http://127.0.0.1:1 \
  pnpm --dir packages/fyllut exec playwright test --config playwright.config.ts --list --reporter=json > /tmp/fyllut-playwright-list.json
node bin/playwright/check-migration.mjs /tmp/fyllut-playwright-list.json
```

Those URLs are placeholders for **discovery only**; actual execution must use `pnpm playwright:fyllut`. The checker rejects changed Cypress test logic or shared helpers, missing pointers, and incorrect or duplicate Playwright IDs. It does not establish behavioral equivalence; developers must compare assertions, hooks, and helper behavior using the checklists. Test only this step in development mode. Built mode, submission mock-use evidence, and further prototype tests belong to step 1b after the 1a developer review.

In CPLT, the documented `sandbox.allow_cache_exec = ["ms-playwright"]` setting permits running Playwright's Chromium. Localhost access must also be active for the app and mock server. All eight browser journeys passed in an AI-run CPLT session. The mock-server log confirmed that `success-empty` handled the activities request. A negative-control run using `success` instead failed on the empty-array assertion, receiving three activities. Developer coverage and Playwright-practice review is still pending.

CPLT resolves permissions when it starts. Launching from a parent directory does not automatically apply this repository's approved `.cplt.toml`; resuming a conversation or changing directories later does not change those permissions. A separately configured parent-directory profile was also verified with required Bubblewrap, read access to its `/proc`, the existing Playwright cache permission, and localhost ports 3440–3443. This is not an automatic repository setup or a recommendation to grant global permissions. On Linux, these port grants also permit connections to remote hosts on those ports. Restricting access to those four ports supports one stack only when they are free; the launcher can otherwise select higher ports that the profile does not permit. Do not interpret mock-server startup logs alone as HTTP readiness.
