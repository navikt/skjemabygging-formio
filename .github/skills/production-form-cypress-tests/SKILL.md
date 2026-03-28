---
name: production-form-cypress-tests
description: >-
    Write Cypress tests for real NAV production forms under
    packages/fyllut/cypress/e2e/production/ by analyzing form JSON and covering
    conditional flows plus one summary path.
---

# Production form Cypress tests

Use this skill for production-form-specific guidance.

For general Cypress test-writing patterns, use `cypress-write-test`.

For running/debugging Cypress in this repo, use `cypress-repo-workflow`.

For local server startup, use `start-dev-servers`.

## Scope

- Source forms: `mocks/mocks/data/forms-api/production-forms/*.json`
- Output tests: `packages/fyllut/cypress/e2e/production/<formPath>.cy.ts`
- Goal: cover important conditional behavior and one summary flow per form

## What to extract from the form JSON

Read only the fields needed to write the test:

1. `path`
2. `properties.submissionTypes`
3. `introPage.enabled`
4. Top-level panels (`type === 'panel'`)
5. Relevant `conditional` / `customConditional`
6. Cross-panel triggers
7. `isAttachmentPanel`

Prefer `PAPER` when available. If not, use the simplest supported submission type.

If a component has both `conditional` and `customConditional`, treat the custom one as authoritative.

## Production-specific test structure

- Organize tests by panel with conditionals
- Use direct panel URLs for same-panel conditional coverage
- Use stepper navigation for cross-panel assertions
- Add one end-to-end summary test with minimum required fields
- Keep one file per form

## Production-specific setup

- `cy.defaultIntercepts()` is the normal baseline setup
- Add `cy.defaultInterceptsExternal()` only when the tested flow actually needs those endpoints
- Only use `cy.configMocksServer()` when the spec uses mocks-server admin commands
- Only use `cy.mocksRestoreRouteVariants()` in `beforeEach` when the spec changes or depends on mock route variants
- Do **not** add a custom intercept for the production form itself; the mock server already serves it

## State and isolation

`cypress.config.ts` still uses `testIsolation: false`.

For production specs, `packages/fyllut/cypress/support/e2e.ts` now clears cookies, `localStorage`, and `sessionStorage` before each test. Do not add per-spec fresh-state helpers by default unless a specific flow proves it still needs one.

DOM/page state is still not auto-reloaded by Cypress, so each `it(...)` must still establish the page it needs with its own `cy.visit(...)` or equivalent setup.

## Production-specific pitfalls

- Attachment panels can be skipped by normal next-step navigation; use the stepper when needed
- Some no-submission-type forms are more stable when summary/setup starts at the first real data panel instead of the root info page
- If a direct-panel visit hangs on `@getConfig` or `@getForm` with "No request ever occurred", first suspect stale page setup or the wrong entry panel, not selectors

## Writing style

- Reuse repo Cypress commands from `packages/fyllut/cypress/cypress.d.ts`
- Prefer accessible queries and visible user behavior
- Keep assertions focused on the conditional branch being tested
- Avoid unused aliases on intercepts
