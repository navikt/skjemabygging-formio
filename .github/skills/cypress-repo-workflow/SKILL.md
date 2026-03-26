---
name: cypress-repo-workflow
description: >-
    Run and debug Cypress tests in skjemabygging-formio. Use this when adding or
    fixing Cypress tests for fyllut or bygger, especially when tests depend on
    the local mock server or built preview mode.
---

# Cypress workflow for this repository

## Goal

Run and debug Cypress tests in this repo with the same assumptions used by the
existing workflows.

Use this skill when you need to add, update, or run tests in
`packages/fyllut/cypress` or `packages/bygger/cypress`.

## Workflow

### Prefer the same mode as CI

The GitHub workflow in `.github/workflows/cypress-tests.yaml` runs Cypress
against built apps, not plain development mode.

For `fyllut`, the CI-aligned flow is:

```bash
yarn build:fyllut
yarn mocks:fyllut:no-cli
yarn preview:fyllut
cd packages/fyllut && yarn cypress run --browser electron --spec cypress/e2e/<folder-or-spec>
```

For `bygger`, the CI-aligned flow is:

```bash
yarn build:bygger
yarn preview:bygger
cd packages/bygger && yarn cypress run --browser electron --spec cypress/e2e/<spec>
```

### Local development mode

Use development mode when you need faster iteration or when editing frontend
code and rerunning the same spec repeatedly.

Preferred way to start the server under test:

- Use the `start-dev-servers` skill.
- Treat that skill as the source of truth for local startup commands and runtime-config handling.

Important:

- `MOCKS_ENABLED=true` is required for local `fyllut` Cypress runs that depend
  on mocked forms and backend responses. The `start-dev-servers` skill handles
  this for you.
- If you have changed files under `mocks/mocks/`, assume the mock server may
  have crashed or needs a restart. Always verify that it is running before
  starting Cypress.
- If `fyllut` opens a "Beklager, fant ikke siden" page, the mock server is
  usually down or returning the wrong form path.
- If PDF download calls fail with `500`, check whether the local send-inn/PDF
  dependency is mocked or proxied correctly before changing the test itself.

## Repo-specific habits

1. Use focused specs while iterating.
2. Rebuild shared packages if Cypress does not see changes coming from
   `shared-components`, `shared-domain`, or `shared-backend`.
3. Prefer accessible queries in tests such as `findByRole`, tolerate
   optional-label suffixes like `(valgfritt)` with regexes when needed, and
   avoid using component classnames in queries.
4. Keep tests close to the behavior you changed and avoid editing unrelated
   Cypress suites.
5. Shut down any local servers you started for testing before finishing the
   task, including `fyllut`, `bygger`, mock servers, and helper proxies.
6. Prefer route-path form visits over `formPath` query usage:
    - Use `cy.visit('/fyllut/<formPath>')` to open a form.
    - Add `?sub=digital`, `?sub=digitalnologin`, or `?sub=paper` when testing a
      specific submission method.
    - Do not use `formPath` query param in normal tests unless the explicit test
      purpose is to verify `formPath` query-param behavior itself.

## Troubleshooting

- `http://localhost:3001/fyllut/internal/isready` should answer when preview
  mode is running.
- `http://localhost:3000/internal/isready` should answer for `bygger`.
- `http://localhost:3300` should answer when mocks are running.
- After changes under `mocks/mocks/`, explicitly re-check `http://localhost:3300`
  before running Cypress.
- If a form loads in backend probes but not in the browser, check the route path
  and whether the backend allows that `formPath`.
