# FyllUt Playwright pilot

This is the full-file pilot for #2207, with a separate step 4 CI workflow and matching-case measurements. It does not replace or disable any Cypress tests or CI jobs. The register in `migration/inventory.json` records 816 active declarations in 93 Cypress files at `9acb96336a262241301d0d235efa98f444684103`. Earlier baselines remain in its reconciliation history. All 42 declarations in the five representative files now have Playwright counterparts, alongside F029-T002's empty mock variant. These 43 declarations produce 46 runtime cases. The other 773 declarations remain planned. Coverage and Playwright-practice review fields remain pending until developers review them.

New files and tests append IDs rather than renumbering earlier cases. Explicit
source-order mappings preserve inserted cases and existing title changes.
`historicalTests` reserves nine upstream removals, with their original titles,
hashes and source references. Their requirement decisions remain pending.
Eight involve unsupported arbitrary scripts; F056-T011's empty-optional-field
guarantee still needs supported replacement coverage. Recording a removal does
not approve retiring its requirement or prove coverage equivalence.

These are static declaration counts, not runtime case counts. F082-T013's
saved-language declaration generates three cases, recorded in `runtimeCases`.
F061-T005 generates four pending-upload/delete cases across success and failure,
also recorded separately. The October 12 merge adds seven declarations with
ten runtime cases: five image cases, four pending attachment cases and one
personal-ID upload layout case. It removes none. Three no-login navigation
cases now collect the required identity without changing their IDs.
The pending attachment cases are included in this pilot. Image and personal-ID
upload cases outside the representative files remain planned.
Build-only classification includes inherited
hooks and excludes commented-out calls; thirteen current declarations require
built routing. A later migration must preserve parameterized cases and their
distinct outcomes, rather than translating one declaration into one test.

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

The runner uses Chromium, one worker and no retries. Each executable test gets a fresh epoch with its own mock server and application processes. Dev uses Vite backend/frontend servers. Built uses `fyllut-backend/dist/server.mjs` to serve both API and the compiled frontend, with no Vite server or implicit build. Rebuild after relevant source changes.

Ordinary runs allocate four available ports inside 3440 through 3499. Use
`--port-range 3440:3447` to constrain that pool to ports approved for your CPLT
session, or `--ports 3440,3441,3442,3443` for an exact assignment. Permission
failures stop immediately; the launcher never changes sandbox configuration.
Automatic allocation retries a bind collision at most twice after confirmed
cleanup of its own partial stack. Explicit ports fail on collision. This is
startup recovery, not a retry of a test action.
Each retry avoids the earlier attempted ports, since a competing launcher may
still be starting its slower processes. A pool with no remaining quartet fails
explicitly rather than searching outside the configured range.

`pnpm start:fyllut:mocks -- --no-runtime-config` uses the same bounded allocation
and collision recovery and accepts those port options. Bygger startup is
unchanged. Every manifest records the actual ports, URLs, worktree root and
startup attempts. Commands and build paths resolve from that worktree; install
dependencies there separately before using it. No shared dotenv or Cypress
runtime file is needed by Playwright. Concurrent runs still have one worker and
fresh process epochs per test, rather than sharing a mock server.
The tuple order is mock, admin, backend, frontend. Built mode uses the backend
origin for both API and frontend and does not bind the fourth port.

```sh
pnpm playwright:fyllut --port-range 3440:3447
pnpm playwright:fyllut:built --ports 3440,3441,3442,3443
```

## An existing dedicated epoch

Existing mode consumes one fresh epoch prepared by the managed launcher for one
named test. It is not an attachment to an arbitrary URL or to the ordinary
interactive Cypress stack. The manifest delegates lifecycle control of that
dedicated epoch only. The launcher keeps ownership of its child processes and
executes quiesce/stop requests over a local control socket. Playwright never
signals the controller or unrelated processes.

In one terminal, prepare the test's setup and wait for `START_PID`:

```sh
pnpm playwright:fyllut:prepare F029-T002 --built --port-range 3440:3447
```

In another terminal, use the printed `PLAYWRIGHT_EXISTING_MANIFEST` path:

```sh
pnpm playwright:fyllut:existing <manifest-path> --grep 'data is empty'
```

The manifest supplies the explicit dev/built mode. An optional `--built` must
agree with it. The selected run must contain exactly the manifest's test, with
no retry, port override or technical fault injection. Source changes, a new
commit, changed built entrypoints, another worktree, stale/expired manifests
and concurrent or repeated claims are rejected. `--list` does not claim the
epoch. An unused setup expires after ten minutes and stops its owned services.
Do not visit or mutate the prepared setup before its test.

The ordinary fixture still closes browser contexts, asks the launcher to stop
application producers, restores variants, finalizes mock evidence and stops
mocks, in that order. Worker loss disconnects the lease and triggers owned
cleanup. The epoch cannot be reused. Its original startup log remains beside
the preparation manifest; the test run records the same epoch identity, process
metadata, teardown barriers and mock evidence in its own report directory.
The controller remains alive after normal consumption so the caller can inspect
it, then stop it with Ctrl-C or `kill <START_PID>`. No backend reset or process
reuse is claimed.

On Unix, existing mode uses a socket inside the worktree's `.runtime` directory.
An overlong socket path fails explicitly before starting services. Windows uses
a named pipe; its execution has not been verified in this Linux environment.

Main and technical runs use the same 1280x1000 viewport as FyllUt Cypress.
This aligns rendering dimensions, not browser engines or manual accessibility
coverage.

The launcher requires successful bind notifications from its own children and HTTP readiness. Cancellation during readiness or its callback rejects startup and awaits cleanup. The ordinary launcher also waits for in-progress startup before finishing shutdown.

Teardown closes browser contexts, stops the owned backend/frontend processes and awaits their exit while mocks remain available. It then restores variants, checks and releases final mock evidence, and stops the remaining mock process. The final snapshot therefore includes observed calls during application shutdown and restore. Only owned process groups are signalled, with bounded SIGTERM-to-SIGKILL escalation. A dedicated epoch-owner process handles worker loss through IPC disconnect, including SIGKILL of the worker. Failed reset, application shutdown, evidence finalization, cleanup or unexpected owner loss poisons the run and prevents another epoch. Cypress runtime configuration is not written or deleted.

Reports are under `packages/fyllut/.runtime/playwright/<run-id>/`. `run.json` records mode, selected IDs, commit and built-entrypoint timestamps/hashes. `source.diff` records tracked worktree changes, including staged new files; untracked paths are listed separately and must be staged or captured for final review evidence. Each epoch records its immutable test ID, attempt, URLs, owner/child PIDs, startup duration and stop time. JSON results are checked against the exact selected IDs; discovery is not runtime evidence. F029-T002 confirms `get-register-data-activities:success-empty` and checks the backend response and empty-state UI.

The full-file source IDs are F004-T001 through T007 (bank account), F017-T001
through T011 (dates), F029-T002 (empty mock variant), F061-T001 through T005
(attachments), F073-T001 through T008 (axe), and F086-T001 through T011
(static PDF). Each existing Cypress test keeps running and points to its
counterpart; each Playwright test annotates the source path and ID.

F061-T005 keeps its source declaration ID and maps to F061-T005-C001 through
C004, ordered upload/success, upload/failure, delete/success, delete/failure.
Each case has its own epoch, result, title and source backlink. Missing,
duplicated or reordered outcomes fail the register/result controls. Existing
mode accepts a concrete case ID, not the ambiguous F061-T005 declaration.

Dev must report 45 passes and only F086-T002 skipped. Built must report all
46 passed. F086-T002 makes a real HTTP request through the epoch's API context
and requires a 404 from the compiled backend; Vite's fallback is not equivalent.
F061-T004 uploads all four source-fixture files, checks the receipt and requires
completed, body-validated tc07 calls on both observed routes. The backend receives
the deterministic fixture metadata `dev-local/mr-sha/forms@git-sha`; this is not
the tested Git commit.

The upload helper waits for the HTTP 201 response to finish and for the matching
file item's delete button. That button appears only after the application has
registered the uploaded file. A filename is visible during an in-progress upload
and is not a completion signal.

F004-T006 retains the source's PDF payload assertions and waits for the matching
response to finish; sending a request is not a completed download. F086-T002
first loads the valid static-PDF page and its API data in its own epoch before
checking the normal route's 404. A missing form cannot satisfy that prerequisite.
F086-T001 also requires the normal static-PDF request to omit `type`, preserving
the source's distinction from an `ETTERSENDELSE` request.

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

The delayed-upload control holds application consumption of the fourth real
HTTP 201 response. It observes forbidden continuation attempts during a bounded
hold, then releases the JSON and requires successful summary navigation. The
outer verifier checks that continuation happened only after consumption. This
control does not replace the backend upload or change ordinary form behavior.

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

The separate CI workflow does not introduce sharding, process reuse or Cypress
removal. Green runtime comparisons and human review remain separate acceptance
gates.

Fresh process epochs have a startup cost. Record `startupMs` from epoch
manifests separately from test actions, teardown and total runner time. Compare
the same cases, viewport, build and retry policy before claiming a speedup.
Changing to shared processes or sharding requires preserving delayed-request,
mock-evidence and cleanup guarantees; it is not part of this bounded pilot.

## GitHub Actions

`.github/workflows/playwright-tests.yaml` runs on push, separately from the
unchanged Cypress workflow. It uses the same `ubuntu-latest-8-cores` runner
class, Node version and dependency-installation pattern as existing CI.
Permissions are limited to reading contents and packages. The automatic
`GITHUB_TOKEN` is passed only to the dependency-installation step, not to the
application or mock processes.

One job installs Chromium and Cypress, checks support types, builds FyllUt
once, runs the technical failure controls, and executes all 46 built pilot
cases. It then measures 45 matching cases in both frameworks on that same
build. There is no background service outside the job, production deployment
or external Cypress dashboard recording. A newer push cancels an older
Playwright job on the same branch. The job has a 60-minute timeout; owned
process cleanup still runs through the existing epoch lifecycle.
The GitHub-hosted runner is discarded when the job ends.

Each push takes one benchmark sample. `workflow_dispatch` offers one or three
samples, defaulting to three. GitHub requires a dispatchable workflow to exist
on the default branch before its "Run workflow" button is available. Push
execution on the pilot branch does not depend on that button or a merge.
No agent push or remote run is implied by adding this workflow locally.
Remote acceptance requires inspecting an actual GitHub run after the user
pushes.

The Actions summary separates dependency installation, browser installation,
build and elapsed work through artifact upload. For the complete job duration,
including post-job cache actions, use the completed job's duration in Actions
or its `started_at` and `completed_at` API fields. Benchmark command wall times
are not whole-job timings and do not measure queueing or runner provisioning.

Reports are uploaded even after test failure, with seven-day retention.
Uploads include HTML reports and their failure attachments, result/provenance
JSON, phase timings, technical-control summaries, mock-evidence metadata and
the benchmark summary. They deliberately exclude raw server logs, source
diffs and Cypress's complete API result/config object. Browser failure
attachments can contain the synthetic form data and network traffic from the
test. Do not introduce real credentials or personal data into these fixtures.
The workflow does not grant human review approval or change `verified`.

## Matching-case measurements

Run after building, with all intended new files staged so the recorded Git diff
includes them:

```sh
pnpm playwright:fyllut:measure
pnpm playwright:fyllut:measure --repetitions 3
pnpm playwright:fyllut:measure --repetitions 1 --output packages/fyllut/.runtime/playwright-measurements/my-run
```

The output directory must be fresh. These commands start and stop their own
built stacks, never attach to shared servers or alter Cypress runtime config.
They execute five entire, unchanged Cypress source files and the exact
corresponding 45 Playwright runtime cases. F029-T002 remains in the separate
46-case pilot run. Excluding it from the benchmark avoids comparing its one
Playwright case with all 21 cases in the data-fetcher Cypress file.

Every comparison validates exact source files, titles and IDs, one passed
attempt per case, unchanged Git source/build hashes, confirmed owner/child
exits, free selected ports and unchanged ordinary Cypress runtime config.
Playwright tc07 still requires completed body-comparator evidence for both
outbound routes. Missing cases, unexpected skips, failures, retries, incomplete
cleanup and missing/non-finite duration fields fail the measurement command.

Reports are under `.runtime/playwright-measurements/<run-id>/`. `summary.json`
records the selected IDs, source/build fingerprints, browser versions, runner
class, execution order and per-case durations. `summary.md` is the readable
comparison. Three-sample runs alternate framework order to reduce ordering
bias. Partial/failed runs are explicitly marked and never count as successful
comparisons.

Playwright epochs also write `timings.json`: setup, test scope, teardown and
total fixture time. Setup includes epoch startup and variant reset. Test scope
includes dependent fixture setup/teardown, not only user actions. Cypress
records shared-stack startup, execution, teardown and its own reported
per-test durations; those per-test boundaries are not interchangeable with
Playwright's. Command wall time includes framework startup and owned cleanup.
Neither framework retries test actions.

Both use the same 1280x1000 viewport and built frontend/backend entrypoints.
Chromium versus Electron and fresh-per-case versus shared-per-sample epochs
remain intentional differences and are stated in the report. A single sample
or this pilot selection cannot establish a whole-suite speedup. Repeat
measurements on the same runner class before deciding on optimization.

In CPLT, the documented `sandbox.allow_cache_exec = ["ms-playwright"]` setting permits running Playwright's Chromium. Localhost access must also be active for the app and mock server. All eight browser journeys passed in an AI-run CPLT session. The mock-server log confirmed that `success-empty` handled the activities request. A negative-control run using `success` instead failed on the empty-array assertion, receiving three activities. Developer coverage and Playwright-practice review is still pending.

CPLT resolves permissions when it starts. Launching from a parent directory does not automatically apply this repository's approved `.cplt.toml`; resuming a conversation or changing directories later does not change those permissions. Successful runs in one approved environment do not establish general CPLT compatibility. On Linux, port grants also permit connections to remote hosts on those ports. The Playwright runner requires its four ports to be free and does not expand permissions. Native pnpm and Chromium must already be executable, workspace dependencies installed, and the ordinary Git hook readable for local commits. Resolve registry authentication outside the agent session; never put credentials in test configuration.
