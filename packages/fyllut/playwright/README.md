# FyllUt Playwright pilot

Five files cover 38 cases. Cypress remains active, including the migrated
tests. Bygger's launcher and Cypress workflow keep their existing behavior.
These are representative tests, not a complete Cypress migration.

## Branch scope

The slim pilot changes 28 files relative to its main-branch starting point.
13 are new files and 15 are edits to existing files.

| Group                              | Files | Why they are included                                                                                           |
| ---------------------------------- | ----: | --------------------------------------------------------------------------------------------------------------- |
| Playwright specs                   |     5 | The 38 representative cases.                                                                                    |
| Cypress comments                   |     6 | Counterpart pointers in five files and a deferred-migration note in the attachment file. No executable changes. |
| Test fixtures, helpers and startup |     5 | Three Playwright modules, one shared command recipe, and the existing launcher's import of that recipe.         |
| Mock implementation                |     1 | Prevent expected fixture mutation, log only mismatch paths and forward asynchronous handler errors.             |
| Configuration, dependencies and CI |     9 | Runner config, two TypeScript configs, ESLint, three package manifests, lockfile and workflow.                  |
| Documentation                      |     2 | This guide and two command entries in the root README.                                                          |
| Total                              |    28 |                                                                                                                 |

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
pnpm playwright:fyllut components-customized/bankaccount.spec.ts --grep "should have description"

pnpm build:fyllut
pnpm playwright:fyllut:built
```

Development mode uses Vite and skips one built-routing case. Built mode uses
the compiled backend and frontend and runs all 38 cases. Rebuild after
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
  -> bin/fyllut-server-config.mjs supplies the same command recipe as start:fyllut:mocks
  -> Playwright webServer starts mocks and backend, plus Vite frontend in dev
  -> each test gets a fresh browser context and reset mock variants
  -> Playwright webServer stops the processes after the run
```

Each run shares one app/mock environment across its tests. Keep one worker:
mock route variants are server-wide and must not be changed by parallel tests.
An automatic fixture resets variants before every test, including request-only
tests. Browser cookies and storage are isolated by Playwright's browser contexts.
Backend caches and in-flight work are not reset between tests; tests must await
the operations they start rather than rely on process termination.

The OS allocates available loopback ports at startup. The config passes these
ports to worker processes through `FYLLUT_PLAYWRIGHT_PORTS`, an internal run
variable. Separate CLI invocations/worktrees get separate ports and reports.
Playwright checks each server's HTTP readiness with `reuseExistingServer: false`;
it does not intentionally attach to an existing environment. Port allocation
does not reserve ports until startup, so a collision can fail the run. There is
no custom collision retry or process-ownership observer.

Playwright owns startup and teardown through its standard `webServer` option.
It sends SIGINT and allows five seconds for shutdown before forcing termination
on platforms supporting signals. Unlike the removed controller, a forced stop
does not itself fail the test. There are no per-test server processes or
custom process-lifecycle tests.

Mocks run with transpilation only and file watching disabled. CI separately
checks their TypeScript types. No Cypress runtime config is written.
`pnpm start:fyllut:mocks` remains the interactive development/Cypress launcher;
it shares the command recipe, not the test runner's lifecycle.

## Shared mock fixes

The existing mock body comparator remains in use by Cypress and other mock
routes. It copies nested expected data before excluding variable fields, logs
only mismatch paths and forwards asynchronous response-handler errors to
Express. These shared fixes are retained independently of the deferred
attachment migration.

## Coverage and review

| Playwright file                                      | Cases |
| ---------------------------------------------------- | ----: |
| `components-customized/bankaccount.spec.ts`          |     7 |
| `components-date/datePicker.spec.ts`                 |    11 |
| `components-deprecated-complex/data-fetcher.spec.ts` |     1 |
| `other/a11y-axe.spec.ts`                             |     8 |
| `pdf/static-pdf.spec.ts`                             |    11 |
| Total                                                |    38 |

Each migrated Cypress declaration has a comment with the target file and title.
The pilot covers 38 source declarations and 38 runtime cases.
Only one data-fetcher test is migrated; that entire Cypress file is not covered.

The digital attachment upload suite remains in Cypress. Its Playwright
migration is deferred for manual review and rework; the eight attachment
cases are not part of this pilot.

During review, compare assertions, setup hooks and shared helpers in each pair.
Keep focus checks, language variants, request checks and negative assertions.
Do not infer equivalent coverage from a matching count or a green run.
There is no generated migration register or source-hash gate in this pilot.

## Reports

Each invocation writes to `packages/fyllut/.runtime/playwright/<run>/`.
Open its `html/index.html` with Playwright's `show-report` command.
The HTML report includes failure traces and screenshots. `results.json` is
the standard machine-readable result.

Server stderr is reported by Playwright in the terminal. For startup diagnostics,
run with `DEBUG=pw:webserver`. There are no per-test server log files.

The new workflow runs on push alongside unchanged Cypress jobs. It installs
only Chromium and builds FyllUt once. It runs the built
pilot with one worker. Reports are uploaded only on failure and retained for
seven days.
It does not run a repeated benchmark.

## Remaining work

Measure complete comparable runs before claiming faster CI. Parallel workers
would need isolated mock state and are outside this pilot. New tests that leave
backend work pending need a separate design, not extra lifecycle machinery
added to the common fixture.
Shared builds across Cypress/Playwright jobs are not included here.

## Support files to review

| File                                    | Job                                                                          |
| --------------------------------------- | ---------------------------------------------------------------------------- |
| `../playwright.config.ts`               | Port allocation, native webServer lifecycle, runner options and reports.     |
| `tsconfig.json`                         | Type-check the tests separately from application code.                       |
| `fixtures/test.ts`                      | Reset mock variants per test, prepare pages and expose mock helpers.         |
| `fixtures/mock-client.ts`               | Select/reset variants through the existing admin API.                        |
| `helpers/form.ts`                       | Reusable form actions and network assertions from Cypress.                   |
| `../../../bin/fyllut-server-config.mjs` | The FyllUt server configuration shared with the existing developer launcher. |

The remaining changes are the five specs and Cypress comments, dependencies,
mock comparator fixes, lint configuration and CI.
There is no `bin/playwright` framework or separate technical Playwright suite.
