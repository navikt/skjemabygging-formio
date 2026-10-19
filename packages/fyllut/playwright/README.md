# FyllUt Playwright pilot

Six files cover 46 cases. Cypress remains active, including the migrated
tests. Bygger's launcher and Cypress workflow keep their existing behavior.
These are representative tests, not a complete Cypress migration.

## Branch scope

The slim pilot changes 33 files relative to its main-branch starting point.
18 are new files and 15 are edits to existing files.

| Group                              | Files | Why they are included                                                                                 |
| ---------------------------------- | ----: | ----------------------------------------------------------------------------------------------------- |
| Playwright specs                   |     6 | The 46 representative cases.                                                                          |
| Cypress source pointers            |     6 | Comments linking the original declarations to their replacements. No executable Cypress changes.      |
| Test fixtures, helpers and startup |     8 | Six Playwright modules, one shared command recipe, and the existing launcher's import of that recipe. |
| Support tests                      |     1 | Verify process isolation/cleanup and body-check wiring.                                               |
| Mock implementation                |     1 | Prevent expected fixture mutation, log only mismatch paths and forward asynchronous handler errors.   |
| Configuration, dependencies and CI |     9 | Runner config, two TypeScript configs, ESLint, three package manifests, lockfile and workflow.        |
| Documentation                      |     2 | This guide and two command entries in the root README.                                                |
| Total                              |    33 |                                                                                                       |

The earlier pilot's CLI wrapper, migration register/hash gates, observation API,
ownership protocol, benchmark commands and separate technical Playwright suite
are not included.

## Run

Install dependencies and Chromium once:

```sh
pnpm install --frozen-lockfile
pnpm --dir packages/fyllut exec playwright install chromium
```

The two commands start and stop their own real FyllUt backend and existing
mock server. Do not start separate servers first.

```sh
pnpm playwright:fyllut
pnpm playwright:fyllut digital-submission/digital-attachment-upload.spec.ts --grep "submits attachments"

pnpm build:fyllut
pnpm playwright:fyllut:built
```

Development mode uses Vite and skips one built-routing case. Built mode uses
the compiled backend and frontend and runs all 46 cases. Rebuild after
application changes; the command does not rebuild for you.

These commands use the standard Playwright CLI. `--list`, `--headed`,
`--debug`, `--ui` and test selection are available. Visible browser tools need
a graphical display. The default is one worker, no retries and Chromium.

If Vite exits with `EMFILE` while creating file watchers, use polling for that
invocation: `CHOKIDAR_USEPOLLING=true pnpm playwright:fyllut`. This changes how
Vite watches local files, not test readiness or retries.

## What starts, and why?

```text
Playwright config
  -> spec imports fixtures/test.ts
    -> fixtures/servers.ts starts mocks and backend, plus Vite frontend in dev
      -> bin/fyllut-server-config.mjs supplies the shared FyllUt commands and environment
    -> browser actions and assertions
    -> close browser, stop app, stop mocks
```

Each test has fresh processes, mock state and a fresh browser context.
Tests cannot inherit pending backend work from the previous test.
Ports are selected from 3440 through 3499. Separate runs and worktrees use
their own processes, ports and output directories. Occupied ports are skipped;
startup errors fail the test instead of attaching to an existing server.
If another process takes a selected port before startup finishes, the fixture
stops its own processes and tries new ports, at most three attempts within the
same startup deadline. It does not retry failed tests.
Readiness requires both successful HTTP checks and confirmation that the
expected child processes accepted connections on their assigned ports.
`fixtures/server-readiness.mjs` records those connections through Node's native
socket diagnostics. Another process returning HTTP 200 cannot make a test's
servers appear ready. The observer does not replace `listen()` or add endpoints.

Servers stop with SIGINT, the signal used by Ctrl+C in local development.
This avoids the backend's production SIGTERM delay without changing production
code. Failure to stop within five seconds causes forced cleanup **and a failing
test**, not a silently successful run. Playwright fixture teardown handles
ordinary failure, timeout and interruption; forcibly killing the worker or
machine bypasses that teardown.

Mocks run with transpilation only and file watching disabled during browser
tests. CI separately checks their TypeScript types. There are no extra controller processes, IPC ownership
protocols, manifest files, runtime-config rewrites or `prepare`/`existing` mode.
`bin/start.mjs` only reuses the extracted FyllUt command recipe; its Bygger
branch and process lifecycle are not rewritten.

## Backend request bodies

The attachment submission test selects the existing tc07 variants.
`compareBodyMiddleware` still compares backend bodies with the same JSON
fixtures and the same excluded fields as Cypress.

The selected mocks return HTTP 400 for mismatched bodies. The test checks
successful submission and the expected attachments on the receipt, following
the existing Cypress pattern. There is no separate assertion that both
external mock handlers were called, and no file-based verification mechanism.

The comparator copies nested expected data before excluding variable fields,
logs only mismatch paths and forwards asynchronous response-handler errors
to Express.

## Coverage and review

| Playwright file                                        | Cases |
| ------------------------------------------------------ | ----: |
| `components-customized/bankaccount.spec.ts`            |     7 |
| `components-date/datePicker.spec.ts`                   |    11 |
| `components-deprecated-complex/data-fetcher.spec.ts`   |     1 |
| `digital-submission/digital-attachment-upload.spec.ts` |     8 |
| `other/a11y-axe.spec.ts`                               |     8 |
| `pdf/static-pdf.spec.ts`                               |    11 |
| Total                                                  |    46 |

Each migrated Cypress declaration has a comment with the target file, title
and stable ID. The Playwright test has matching annotations. One attachment
declaration expands into four cases, so 43 source declarations become 46 cases.
Only one data-fetcher test is migrated; that entire Cypress file is not covered.

During review, compare assertions, setup hooks and shared helpers in each pair.
Keep focus checks, language variants, request checks and negative assertions.
Do not infer equivalent coverage from a matching count or a green run.
There is no generated migration register or source-hash gate in this pilot.

## Reports and support checks

Each invocation writes to `packages/fyllut/.runtime/playwright/<run>/`.
Open its `html/index.html` with Playwright's `show-report` command.
The HTML report includes failure traces and screenshots. `results.json` is
the standard machine-readable result.

Failed tests retain `servers/servers-1.log` in their test output directory.
Raw server logs are local only, not uploaded by CI.
Startup retries have separate numbered server logs.

Run the focused support checks after building:

```sh
pnpm exec vitest run packages/fyllut/playwright/fixtures/servers.test.ts
```

They exercise real mock handlers, unknown variants, body mismatch,
concurrent independent server setups and cleanup. These are ordinary Vitest
tests, not nested deliberately failing Playwright runs.
The startup regression deliberately occupies a selected port with another
HTTP server before the owned backend starts. It verifies that startup rejects
that server's health response, chooses new ports and leaves the other server
running.

The new workflow runs on push alongside unchanged Cypress jobs. It installs
only Chromium and builds FyllUt once. It runs these support checks and the built
pilot with one worker. Reports are uploaded only on failure and retained for
seven days.
It does not run a repeated benchmark.

## Remaining work

The fresh-process-per-test policy is intentionally conservative and still
costs startup time. Measure complete comparable runs before claiming faster CI.
Evaluate safe server reuse and further parallelism before expanding the full
migration, without weakening body validation or allowing late work to leak
between tests.
Shared builds across Cypress/Playwright jobs are not included here.

## Support files to review

| File                                    | Job                                                                                        |
| --------------------------------------- | ------------------------------------------------------------------------------------------ |
| `../playwright.config.ts`               | Standard runner options and report locations.                                              |
| `tsconfig.json`                         | Type-check the tests separately from application code.                                     |
| `fixtures/test.ts`                      | Bind server lifecycle, page setup and mock helpers to each test.                           |
| `fixtures/servers.ts`                   | Select ports, start direct child processes, await HTTP readiness and stop owned processes. |
| `fixtures/server-readiness.mjs`         | Record which ports each child process actually serves, using Node socket diagnostics.      |
| `fixtures/mock-client.ts`               | Select/reset variants through the existing admin API.                                      |
| `helpers/form.ts`                       | Reusable form actions and network assertions from Cypress.                                 |
| `helpers/attachments.ts`                | Reusable attachment actions with complete upload waits.                                    |
| `fixtures/servers.test.ts`              | Exercise server isolation, body-check wiring and cleanup.                                  |
| `../../../bin/fyllut-server-config.mjs` | The FyllUt server configuration shared with the existing developer launcher.               |

The remaining changes are the six specs and six source pointers, dependencies,
mock comparator fixes, lint configuration and CI.
There is no `bin/playwright` framework or separate technical Playwright suite.
