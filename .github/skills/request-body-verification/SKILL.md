---
name: request-body-verification
description: >-
    Verify backend-generated request bodies sent from fyllut-backend to external
    systems by comparing them against numbered test-case fixtures in the mock
    server. Use this for skjemabygging-proxy, innsending-api, familie-pdf, and
    similar integrations.
---

# Verifying outbound request bodies

## Goal

Verify the actual request body that `fyllut-backend` sends to external systems,
not just the browser action that triggered the backend call.

Use this skill when a Cypress test must prove that a request to an external
dependency such as `skjemabygging-proxy`, `innsending-api`, or `familie-pdf`
contains the expected payload.

## Workflow

### Preferred verification pattern

Do not rely only on a browser intercept when the behavior you care about happens
after the request reaches `fyllut-backend`.

Instead:

1. Create or update an expected JSON body in `mocks/mocks/data/test-cases/`.
2. Reuse the existing numbered test-case family when the scenario is related to
   an existing request verification.
3. Add or update the shared `tcNN.md` file when the numbered family needs a
   short explanation.
4. Add a route variant in the relevant mock route file, for example:
    - `mocks/mocks/routes/skjemabygging-proxy.ts`
    - `mocks/mocks/routes/innsending-api.ts`
    - `mocks/mocks/routes/familie-pdf.ts`
5. Use `compareBodyMiddleware(...)` to compare the actual backend request body
   with the expected fixture.
6. Select that route variant from Cypress with `cy.mocksUseRouteVariant(...)`.

### Route examples in this repo

- `skjemabygging-proxy.ts` verifies cover-page request bodies
- `innsending-api.ts` verifies soknad request bodies
- `familie-pdf.ts` verifies PDF request bodies

### When to ignore fields

Pass ignored paths to `compareBodyMiddleware(...)` only for unstable or
environment-dependent values, such as generated IDs or dynamic document fields.

Do not ignore the field that is the point of the test.

## Test-case conventions

Expected bodies live in `mocks/mocks/data/test-cases/`.

Use the existing grouped naming style:

```text
tc01-innsending-nologin-soknad-body.json
tc07-pdf-body.json
tc08a-cover-page-body.json
tc08b-cover-page-body.json
```

Use suffixes such as `a` and `b` when a test case family covers the same kind
of assertion with different expected values.

## Troubleshooting

When a request-verification spec fails:

1. Read the mock-server logs and inspect the logged `req.body`.
2. Compare the logged body to the JSON fixture before changing production code.
3. Confirm the route variant was actually selected in Cypress.
4. Confirm the fixture is imported by the correct route file.
5. If the request body matches but the spec still fails, the failure is likely
   later in the response, merge, or download flow rather than in request-body
   generation.
