---
name: mock-forms-and-test-cases
description: >-
    Create or update mock forms and numbered test cases used by Cypress and mock
    route validation in skjemabygging-formio. Use this when adding scenario-
    specific forms, request bodies, or tcNN documentation.
---

# Mock forms and test-case fixtures

## Goal

Add scenario-specific mock forms and numbered test-case fixtures without
accidentally coupling unrelated Cypress suites together.

Use this skill when a Cypress test needs a dedicated mocked form or a mock route
must verify an expected request body.

## Workflow

### Prefer dedicated mock forms for scenario-specific tests

Do not overload a shared component showcase form when a test needs special
behavior that only one spec or Cypress area cares about.

Important:

- Never add new mock forms under `mocks/mocks/data/formio-api`.
- Avoid reusing or extending those legacy JSON forms for new test scenarios.
- Those files are legacy fixtures that we want to phase out. New work should use
  `mocks/mocks/data/forms-api/...` instead.
- One Cypress spec can have multiple dedicated mock forms if needed, but they
  should not be shared across specs.

Instead:

1. Create a dedicated form under `mocks/mocks/data/forms-api/...`.
2. Place the form in a folder named after the Cypress spec it belongs to. For
   example, `cover-page.cy.ts` should keep its dedicated mock forms under
   `mocks/mocks/data/forms-api/cover-page/`.
3. Register the form in `mocks/mocks/routes/formio-api.ts`.
4. Point the Cypress spec at the dedicated form path.

This keeps shared component test forms reusable and avoids accidental coupling
between unrelated Cypress suites.

### Test-case naming convention

Expected request bodies live in `mocks/mocks/data/test-cases/`.

When adding a new test case:

1. Reuse the existing numbered family when the assertion belongs to the same
   scenario.
2. Use suffixes like `tc08a`, `tc08b` for closely related variants.
3. Add or update the shared `tc08.md`-style description file for the numbered
   group.
4. Keep the JSON filename descriptive after the prefix, for example:

```text
tc08a-cover-page-body.json
tc08b-cover-page-body.json
```

In this repo, `tc08a` and `tc08b` are a good model:

- `tc08a` verifies `bruker` as `PERSON`
- `tc08b` verifies `bruker` as `ORGANISASJON`
- `tc08.md` explains the shared purpose of the pair

### Building the mock form

Model new mock forms after existing helpers in:

- `mocks/mocks/form-builder/components`
- `mocks/mocks/form-builder/form/form`
- `mocks/mocks/form-builder/shared/utils`

Keep the form as small as possible while still exercising the scenario. Include
only the pages and fields needed by the spec.

If a mock form needs a new component property, make sure the mock form-builder
types also allow it. For example, mock component base types may need updating so
properties like `coverPageBruker` compile inside `mocks`.

## Troubleshooting

When a new mock form does not load:

1. Check that it is added to `allForms` in `mocks/mocks/routes/formio-api.ts`.
2. Check that `form.path` matches the path used in Cypress.
3. Avoid invalid `formPath` values if backend validation only accepts a subset
   of characters.
4. Verify the form can be fetched through the mocked forms API before debugging
   the frontend.
