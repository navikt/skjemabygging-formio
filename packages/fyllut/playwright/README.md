# FyllUt Playwright pilot

This is the step 1b prototype for #2207. It does not replace or disable any Cypress tests or CI jobs. The register in `migration/inventory.json` records 795 declarations in 89 Cypress files at `b637d46d1d84e27ee3229215af5fa54a4589600b`. The earlier 86-file, 787-declaration baseline remains in its reconciliation history. Existing IDs were preserved when new source tests were added. The 38 tests in the original five pilot files have source-specific checklists; an additional data-fetcher test probes mock route variants. Ten tests have Playwright counterparts. Coverage and Playwright-practice review fields remain pending until developers review them.

After installing workspace dependencies and the Chromium browser (`pnpm --dir packages/fyllut exec playwright install chromium`), run from the repository root:

```sh
pnpm playwright:fyllut
pnpm build:fyllut
pnpm playwright:fyllut:built
pnpm playwright:fyllut:verify
pnpm playwright:fyllut -- components-customized/bankaccount.spec.ts
pnpm playwright:fyllut -- components-deprecated-complex/data-fetcher.spec.ts
node --test bin/playwright/check-migration.test.mjs bin/lib/fyllut-test-stack.test.mjs
```

The runner uses Chromium, one worker and no retries. Each executable test gets a fresh epoch with its own mock server and application processes. Dev uses Vite backend/frontend servers. Built uses `fyllut-backend/dist/server.mjs` to serve both API and the compiled frontend, with no Vite server or implicit build. Rebuild after relevant source changes. The fixed test ports are 3440 through 3443; occupied ports fail rather than selecting alternatives or stopping foreign services.

The launcher requires successful bind notifications from its own children and HTTP readiness. Cancellation during readiness or its callback rejects startup and awaits cleanup. The ordinary launcher also waits for in-progress startup before finishing shutdown.

Teardown closes browser contexts, stops the owned backend/frontend processes and awaits their exit while mocks remain available. It then restores variants, checks and releases final mock evidence, and stops the remaining mock process. The final snapshot therefore includes observed calls during application shutdown and restore. Only owned process groups are signalled, with bounded SIGTERM-to-SIGKILL escalation. A dedicated epoch-owner process handles worker loss through IPC disconnect, including SIGKILL of the worker. Failed reset, application shutdown, evidence finalization, cleanup or unexpected owner loss poisons the run and prevents another epoch. Cypress runtime configuration is not written or deleted.

Reports are under `packages/fyllut/.runtime/playwright/<run-id>/`. `run.json` records mode, selected IDs, commit and built-entrypoint timestamps/hashes. `source.diff` records tracked worktree changes, including staged new files; untracked paths are listed separately and must be staged or captured for final review evidence. Each epoch records its immutable test ID, attempt, URLs, owner/child PIDs, startup duration and stop time. JSON results are checked against the exact selected IDs; discovery is not runtime evidence. F029-T002 confirms `get-register-data-activities:success-empty` and checks the backend response and empty-state UI.

The ten source IDs are F004-T005/T006 (bank account), F017-T007 (date boundary), F029-T002 (empty mock variant), F061-T001/T004 (attachment errors/focus and four-file submission), F073-T001/T003 (axe), and F086-T001/T002 (static PDF and compiled-backend routing). Each existing Cypress test keeps running and points to its counterpart; each Playwright test annotates the source path and ID.

Dev must report nine passes and only F086-T002 skipped. Built must report all
ten passed. F086-T002 makes a real HTTP request through the epoch's API context
and requires a 404 from the compiled backend; Vite's fallback is not equivalent.
F061-T004 uploads all four source-fixture files, checks the receipt and requires
completed, body-validated tc07 calls on both observed routes. The backend receives
the deterministic fixture metadata `dev-local/mr-sha/forms@git-sha`; this is not
the tested Git commit.

F004-T006 retains the source's PDF payload assertions and waits for the matching
response to finish; sending a request is not a completed download. F086-T002
first loads the valid static-PDF page and its API data in its own epoch before
checking the normal route's 404. A missing form cannot satisfy that prerequisite.

To verify Playwright's collected test list against the register without starting servers, run:

```sh
pnpm playwright:fyllut --list
pnpm playwright:fyllut:built --list
pnpm playwright:fyllut --grep 'data is empty'
```

`--list` starts no servers. Use the root runners for execution. They allow file selectors and `--grep`, not options that override workers, retries or reporters. Empty selections fail. The checker rejects changed Cypress test logic or shared helpers, missing pointers, incorrect or duplicate Playwright IDs, unexpected skips and incomplete results. It does not establish behavioral equivalence; developers must compare assertions, hooks and helper behavior using the checklists.

## Outbound mock evidence

Playwright epochs opt into observation of `post-familie-pdf` and
`post-digital-soknad`. The executed handler records its actual variant, response
status, completion and request-bound comparator result. Only the comparator can
report a passed body comparison. Selecting a variant or receiving HTTP 200 is
not proof.

The mock server binds to loopback in this mode. Its `/__playwright` control
router supports one owner per immutable process epoch, expected route variants,
snapshots and release. Concurrent owners, old epochs and reused leases are
rejected. Ordinary mock startup does not expose this router. The existing JSON,
middleware and text responses retain their contracts.

Evidence contains IDs, status and mismatch field paths, never request bodies.
The tc07 fixtures and their excluded fields remain unchanged. Expected and
actual bodies are both copied before filtering, so repeated comparisons cannot
mutate shared fixtures. The mock loader can reload modules; this does not
reset the process's epoch or reassign its requests to another test.

The isolated HTTP contract test runs without a browser:

```sh
node --test bin/playwright/mock-protocol.test.mjs
pnpm exec vitest run --config mocks/vitest.playwright.config.ts
```

The HTTP test compares instrumented and ordinary response statuses, body hashes
and headers. It normalizes only generated request IDs and transport timestamps.
Do not run it concurrently with another local stack using ports 3440–3443.

## Technical failure controls

`pnpm playwright:fyllut:verify` requires the same prior FyllUt build. It runs
Node lifecycle/register/result/HTTP tests and isolated mock Vitest tests, then
separate real Playwright runs. These technical cases are not migration IDs.
Inner failures are intentional; the outer command succeeds only when each
case has the expected ID, nonzero exit and specific error, without retry or
timeout standing in for the intended failure.

The controls cover unknown variants, missing outbound calls, wrong variants
returning HTTP 200, an actual body mismatch returning HTTP 400, reset/restore
failures, combined test/teardown errors, cleanup poisoning, a foreign port
collision, a second owner, forbidden `.only`, and an empty selection. A held
real backend PDF call tests teardown across two epochs without a fixed sleep.
Worker SIGTERM/SIGKILL tests verify that owned servers exit and that a new epoch
is refused after ownership loss.

Review regressions cover a valid and a mismatching tc07 call during fixture
teardown, rejected downloads with a held real backend PDF call, and a controlled
missing static form. The outer verifier checks the final snapshot for both the
original and teardown request, the exact mismatch field, confirmed application
shutdown and the specific positive-prerequisite failure. The missing-form fault
is opt-in per test epoch and does not alter ordinary mock startup.

Reports are under `.runtime/playwright/verify-<run-id>/`; `summary.json` records
the checked outcomes. The hold-PDF hook is enabled only by technical-test
configuration. Ordinary mock startup has neither that hook nor its control
endpoint. If a run fails, inspect its epoch `stack.log`, mock metadata and
Playwright trace. A `fatal-cleanup.txt` marker means the run cannot continue
with another stack. Do not delete it to make the same run proceed.

## Checks before expanding the migration

Compare each source test together with its inherited hooks and the helpers it
calls. Record prerequisites, action order, response completion, negative
assertions, focus and outbound comparator expectations separately. A shared hook
or a response wait is part of the source contract, not disposable setup.

For each claim, include a control that would catch its loss. A 404 must not pass
because its form is missing; a PDF request must not pass without a response.
Exercise cancellation and late requests at asynchronous lifecycle boundaries,
not only before startup or during the test body. Keep the producer alive when
testing the old race, and require confirmed producer exit before final evidence.
One green source/counterpart pair does not establish equivalent failure coverage.

All commands are local. There is no new CI workflow, sharding, existing-server
mode or Cypress removal. Final Cypress/Playwright comparisons and human review
remain separate acceptance gates.

In CPLT, the documented `sandbox.allow_cache_exec = ["ms-playwright"]` setting permits running Playwright's Chromium. Localhost access must also be active for the app and mock server. All eight browser journeys passed in an AI-run CPLT session. The mock-server log confirmed that `success-empty` handled the activities request. A negative-control run using `success` instead failed on the empty-array assertion, receiving three activities. Developer coverage and Playwright-practice review is still pending.

CPLT resolves permissions when it starts. Launching from a parent directory does not automatically apply this repository's approved `.cplt.toml`; resuming a conversation or changing directories later does not change those permissions. Successful runs in one approved environment do not establish general CPLT compatibility. On Linux, port grants also permit connections to remote hosts on those ports. The Playwright runner requires its four ports to be free and does not expand permissions. Native pnpm and Chromium must already be executable, workspace dependencies installed, and the ordinary Git hook readable for local commits. Resolve registry authentication outside the agent session; never put credentials in test configuration.
