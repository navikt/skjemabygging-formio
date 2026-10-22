# FyllUt Playwright tests

End-to-end tests for FyllUt's new renderer, using the real backend and the
existing mock server. Cypress remains active alongside Playwright during
migration.

## Run

Run commands from the repository root. Install dependencies and Chromium:

```sh
pnpm install --frozen-lockfile
pnpm --dir packages/fyllut exec playwright install chromium
```

Playwright starts and stops the application and mock server for you.
Do not start separate servers first.

```sh
pnpm playwright:fyllut
pnpm playwright:fyllut --list

pnpm build:fyllut
pnpm playwright:fyllut:built
```

Development mode uses Vite. Tests that require compiled backend routing are
skipped in this mode. Built mode uses the compiled backend and frontend.
Rebuild after application changes; the test command does not rebuild for you.

These commands use the standard Playwright CLI. `--list`, `--headed`,
`--debug`, `--ui`, file selection and `--grep` are available. Visible browser
tools need a graphical display. See [playwright.config.ts](../playwright.config.ts)
for browser settings and
[playwright-app-config.mjs](../../../bin/playwright-app-config.mjs) for runner
settings.

If Vite exits with `EMFILE` while creating file watchers, use polling for that
invocation: `CHOKIDAR_USEPOLLING=true pnpm playwright:fyllut`. This changes how
Vite watches local files, not test readiness or retries.

## Servers and test isolation

```text
Playwright config
  -> bin/playwright-app-config.mjs allocates ports and sets up runner options shared with Sendinn
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

The OS allocates available loopback ports at startup. Separate CLI invocations
and worktrees get separate ports and reports.
Playwright checks each server's HTTP readiness with `reuseExistingServer: false`;
it does not intentionally attach to an existing environment. Port allocation
does not reserve ports until startup, so a collision can fail the run. There is
no automatic collision retry.

Playwright owns startup and teardown through its standard `webServer` option.
It attempts graceful shutdown before forcing termination on platforms supporting
signals. A forced stop does not itself fail the test.

`pnpm start:fyllut:mocks` remains the interactive development/Cypress launcher;
it shares the command recipe, not the test runner's lifecycle.

## Adding and migrating tests

Place specs under `e2e/` and use `test` and `expect` from `fixtures/test.ts`.
Use `readyPage` for browser tests and `useRouteVariant` to select mock responses.
Keep helpers local to a spec unless other specs need the same behavior.
Write locators for the new renderer rather than accepting legacy alternatives.

When migrating a Cypress test, compare assertions, setup hooks and shared helpers.
Keep focus checks, language variants, request checks and negative assertions.
Do not infer equivalent coverage from a matching count or a green run.
Add a counterpart comment to the Cypress test so reviewers can find its
Playwright equivalent.

## Reports

Each invocation writes to `packages/fyllut/.runtime/playwright/<run>/`.
Open its `html/index.html` with Playwright's `show-report` command.
The HTML report includes failure traces and screenshots. `results.json` is
the standard machine-readable result.

Server stderr is reported by Playwright in the terminal. For startup diagnostics,
run with `DEBUG=pw:webserver`.

The [GitHub Actions workflow](../../../.github/workflows/playwright-tests.yaml)
builds FyllUt and runs the tests in built mode alongside the Cypress jobs.
Failure reports are uploaded as workflow artifacts. See the workflow for
triggers and retention settings.

## Configuration and helpers

| File                                                                | Purpose                                                        |
| ------------------------------------------------------------------- | -------------------------------------------------------------- |
| [playwright.config.ts](../playwright.config.ts)                     | Browser settings for FyllUt.                                   |
| [playwright-app-config.mjs](../../../bin/playwright-app-config.mjs) | Ports, server lifecycle, runner options and reports.           |
| [tsconfig.json](tsconfig.json)                                      | Type-check tests separately from application code.             |
| [fixtures/test.ts](fixtures/test.ts)                                | Reset mock variants, prepare pages and expose mock helpers.    |
| [fixtures/mock-client.ts](fixtures/mock-client.ts)                  | Select and reset variants through the mock server's admin API. |
| [helpers/form.ts](helpers/form.ts)                                  | Shared form actions and network assertions.                    |
| [fyllut-server-config.mjs](../../../bin/fyllut-server-config.mjs)   | Server commands shared with the developer launcher.            |
| [app-server-config.mjs](../../../bin/app-server-config.mjs)         | Server commands and health URLs shared by FyllUt and Sendinn.  |
