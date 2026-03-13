---
name: cover-page-request-verification
description: >-
    Verify backend-generated ForstesideRequestBody payloads using the mock server.
    Use this when changing cover-page logic, bruker resolution, or other
    first-page request fields in skjemabygging-formio. Pair this with the
    generic request-body-verification skill for shared compareBodyMiddleware
    patterns and fixture conventions.
---

# Verifying cover-page request bodies

## Goal

Verify the backend-generated `ForstesideRequestBody`, not just the browser call
that triggers PDF generation.

Use this skill when frontend Cypress is not enough because the important
assertion happens in the backend-generated request sent to
`/skjemabygging-proxy/foersteside`.

## Workflow

Use the shared `request-body-verification` skill for the general
`compareBodyMiddleware(...)` pattern, numbered test-case conventions, and common
troubleshooting.

Cover-page verification adds these cover-page-specific expectations on top:

### Example flow

1. Add a route variant such as `success-organizationnumber`.
2. Point it at a fixture like `tc08b-cover-page-body.json`.
3. In Cypress, activate the variant before visiting the form.
4. Run the form normally and let the mocked first-page endpoint validate the
   payload.

## Repo-specific guidance

For cover-page bruker fallback:

- Prefer `yourInformation` when it exists.
- Otherwise use the first marked organization-number component with a submitted
  value.
- Normalize the organization number in the same way production code does before
  asserting the expected request body.

## Troubleshooting

If the generic request-body verification steps succeed but the cover-page test
still fails, inspect cover-page-specific fields first:

1. `bruker.brukerId`
2. `bruker.brukerType`
3. `navSkjemaId`
4. `overskriftstittel`
5. `arkivtittel`
