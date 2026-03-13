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

For `fyllut`, ensure the backend uses mocks:

```bash
cd packages/fyllut-backend && MOCKS_ENABLED=true yarn start
cd packages/fyllut && yarn start --host 0.0.0.0 --port 3001
yarn mocks:fyllut:no-cli
cd packages/fyllut && yarn cypress run --browser electron --spec cypress/e2e/<spec>
```

Important:

- `MOCKS_ENABLED=true` is required for local `fyllut` Cypress runs that depend
  on mocked forms and backend responses.
- If `fyllut` opens a "Beklager, fant ikke siden" page, the mock server is
  usually down or returning the wrong form path.
- If PDF download calls fail with `500`, check whether the local send-inn/PDF
  dependency is mocked or proxied correctly before changing the test itself.

For `bygger`, a normal local loop is:

```bash
cd packages/bygger && yarn start --host 0.0.0.0 --port 3000
cd packages/bygger && yarn cypress run --browser electron --spec cypress/e2e/<spec>
```

## Repo-specific habits

1. Use focused specs while iterating.
2. Rebuild shared packages if Cypress does not see changes coming from
   `shared-components`, `shared-domain`, or `shared-backend`.
3. Prefer accessible queries in tests such as `findByRole` and tolerate
   optional-label suffixes like `(valgfritt)` with regexes when needed.
4. Keep tests close to the behavior you changed and avoid editing unrelated
   Cypress suites.

## Troubleshooting

- `http://localhost:3001/fyllut/internal/isready` should answer when preview
  mode is running.
- `http://localhost:3000/internal/isready` should answer for `bygger`.
- `http://localhost:3300` should answer when mocks are running.
- If a form loads in backend probes but not in the browser, check the route path
  and whether the backend allows that `formPath`.
