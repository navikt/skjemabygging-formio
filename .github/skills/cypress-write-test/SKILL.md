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

## Verify roles and responses before asserting them

Check the rendered DOM before you write a role query. A component's look does
not tell you its role, and a wrong guess only shows up as a timeout:

- Aksel `Button as="a"` renders with role `button`, not `link`
- Aksel inline `Alert` has no `alert` role. Query the message text instead,
  for example `cy.findByText(<error message>)`
- When a query fails, read the "accessible roles" list in the Cypress error
  before changing the selector

Do not trust a request just because the test reached the next step. When you
wait on an alias, assert the status code:

```ts
cy.wait('@deleteFile').its('response.statusCode').should('eq', 204);
```

The mocks server does not cover every route. An unmocked request can answer
`404` while the UI still looks fine. If the test needs a specific reply, stub
it with `request.reply(...)`.

## Route selection and preview-only logic

- Prefer explicit route-path visits in `cy.visit(...)` so the test does not depend
  on backend-served `index.html` logic
- Good examples:
    - `cy.visit('/fyllut/<formPath>')`
    - `cy.visit('/fyllut/<formPath>?sub=paper')`
    - `cy.visit('/fyllut/<formPath>/pdf')`
- Avoid tests that only pass because the backend rewrites, redirects, or normalizes
  the initial URL before the frontend boots
- If the test intentionally verifies behavior implemented while the backend serves
  `index.html`, mark it with `cy.skipIfNoIncludeDistTests()`
- Treat `cy.skipIfNoIncludeDistTests()` as required for preview-only entry logic,
  not as a fallback for ordinary form navigation tests

## Intercepts and waits

- Use existing shared intercept and wait helpers where available
- `cy.defaultIntercepts()` is a shared pattern in both `fyllut` and `bygger`
- Prefer `cy.defaultWaits()` when the repo already provides the waits you need
- Add custom intercepts only when the test needs them
- Do not add aliases you never wait on or assert against
- Prefer waiting on meaningful UI cues or known aliases over arbitrary sleeps

### Holding a request to test pending states

To test what the UI does while a request is in flight, return a promise from
the intercept callback and resolve it later in the test. Cypress fails that
callback once the promise has been pending longer than `defaultCommandTimeout`
(4 seconds by default), so:

- raise the timeout on the test, for example
  `it('...', { defaultCommandTimeout: 30000 }, () => { ... })`
- register the intercept with `times: 1` so later requests, such as a retry,
  are not held as well

```ts
let release: () => void = () => {
    throw new Error('Request has not been intercepted');
};
cy.intercept(
    { method: 'DELETE', url: '**/attachments/*/*', times: 1 },
    (request) =>
        new Cypress.Promise<void>((resolve) => {
            release = () => {
                request.reply({ statusCode: 204 });
                resolve();
            };
        }),
).as('pendingDelete');

// ...assert the pending state...
cy.then(() => release());
cy.wait('@pendingDelete').its('response.statusCode').should('eq', 204);
```

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

## Repeated elements (e.g. datagrid rows)

- When a page has multiple structurally-identical elements (datagrid rows, repeated
  groups) and a test needs to target one specific occurrence, prefer
  `findAllByRole(...).eq(index)` over scoping with a container class selector
  and `.within(...)`
- Example: to check the "Ja" radio in the third row of a datagrid, use
  `cy.findAllByRole('radio', { name: 'Ja' }).eq(2).check()` rather than
  `cy.get('.formio-component-<key>').find('.aksel-fieldset__content').eq(2).within(...)`
- To assert no leakage/duplication across rows, prefer asserting the overall count,
  for example `cy.findAllByRole('textbox', { name: '<label>' }).should('have.length', 1)`
  instead of asserting per-row existence with class-scoped selectors
- Only fall back to class/container selectors when rows are not otherwise
  distinguishable via accessible queries (e.g. identical labels with no way to
  disambiguate by role, text, or position)

## Keep it maintainable

- Follow nearby test patterns in the same folder
- Keep setup small and local to the suite
- Do not expand unrelated suites while fixing one behavior
