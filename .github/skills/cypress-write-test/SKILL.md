---
name: cypress-write-test
description: >-
    Write maintainable Cypress tests in skjemabygging-formio with the repo's
    preferred structure, selectors, and helper usage. Use this for general test
    authoring, not repo startup or execution workflow.
---

# Writing Cypress tests

Use this skill for general Cypress authoring guidance.

For running/debugging tests in this repo, use `cypress-repo-workflow`.

For local server startup and runtime-config handling, use `start-dev-servers`.

For production-form-specific rules, use `production-form-cypress-tests`.

## Core rules

- Put tests next to the behavior they cover
- Reuse existing custom commands before inventing new helpers
- Prefer accessible queries such as `findByRole` and `findByLabelText`
- Use regexes when labels vary slightly, for example optional `(valgfritt)` suffixes
- Avoid class selectors unless there is no stable user-facing alternative

## Test shape

- Make each `it(...)` establish the state it needs
- Group assertions by user flow or feature area
- Add one happy-path / summary-style flow when that gives useful end-to-end coverage
- Keep tests behavior-focused; do not assert implementation details unless necessary

## Intercepts and waits

- Use existing shared intercept helpers where available
- For normal `fyllut` specs, prefer `cy.defaultIntercepts()`
- Add `cy.defaultInterceptsExternal()` only when the flow actually needs those endpoints
- If a spec uses mocks-server admin commands or route variants, call `cy.configMocksServer()` in `before`
- If a spec changes or depends on mock route variants, call `cy.mocksRestoreRouteVariants()` in `beforeEach`
- Add custom intercepts only when the test needs them
- Do not add aliases you never wait on or assert against
- Prefer waiting on meaningful UI cues or known aliases over arbitrary sleeps

## Interaction patterns

- Re-query after navigation or rerender when subjects may detach
- Use repo helpers like `findByRoleWhenAttached` when needed
- Avoid overusing `{ force: true }`; only use it when the UI genuinely requires it

## Keep it maintainable

- Follow nearby test patterns in the same folder
- Keep setup small and local to the suite
- Do not expand unrelated suites while fixing one behavior
