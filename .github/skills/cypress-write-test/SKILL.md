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

## Core rules

- Reuse existing custom commands before inventing new helpers
- Prefer accessible queries such as `findByRole` and `findByLabelText`
- Use regexes when labels vary slightly, for example optional `(valgfritt)` suffixes
- Avoid class selectors unless there is no stable user-facing alternative

## Intercepts and waits

- Use existing shared intercept and wait helpers where available
- `cy.defaultIntercepts()` is a shared pattern in both `fyllut` and `bygger`
- Prefer `cy.defaultWaits()` when the repo already provides the waits you need
- Add custom intercepts only when the test needs them
- Do not add aliases you never wait on or assert against
- Prefer waiting on meaningful UI cues or known aliases over arbitrary sleeps

### Fyllut-specific mock handling

- For normal `fyllut` specs, prefer `cy.defaultIntercepts()`
- Add `cy.defaultInterceptsExternal()` only when the flow actually needs those endpoints
- If a spec uses mocks-server admin commands or route variants, call `cy.configMocksServer()` in `before`
- If a spec changes or depends on mock route variants, call `cy.mocksRestoreRouteVariants()` in `beforeEach`

## Interaction patterns

- Re-query after navigation or rerender when subjects may detach
- Use repo helpers like `findByRoleWhenAttached` when needed
- Prefer existing flow helpers for repeated navigation, for example `cy.clickNextStep()`, `cy.clickPreviousStep()`, and `cy.clickSaveAndContinue()`
- Avoid overusing `{ force: true }`; only use it when the UI genuinely requires it

## Keep it maintainable

- Follow nearby test patterns in the same folder
- Keep setup small and local to the suite
- Do not expand unrelated suites while fixing one behavior
