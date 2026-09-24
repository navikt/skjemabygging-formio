# Evidence for outbound integrations

Every outbound integration affected by the change needs one concrete evidence
method before the skill writes verification cases. Name:

- the system receiving the request
- the value or document that proves the expected result
- the approved tool or procedure used to inspect it
- who can perform the inspection

Do not use a successful receipt, HTTP status, or page transition as evidence of
an outbound payload.

Local mock verification is sufficient for the request-body check when the case
does not require observing that payload in preprod. If a case _does_ need to
prove what preprod sent and no approved preprod method is documented, ask the
caller to choose or provide one. Do not invent access to logs, upstream
databases, buckets, admin tools, or production-like data.

## Repository-supported request verification

This repository documents request-body verification through the local mock
server. It is suitable when the same payload can be proved before preprod:

| Integration           | Route variants                              | Expected bodies                                      |
| --------------------- | ------------------------------------------- | ---------------------------------------------------- |
| `innsending-api`      | `mocks/mocks/routes/innsending-api.ts`      | `mocks/mocks/data/test-cases/*innsending*-body.json` |
| `skjemabygging-proxy` | `mocks/mocks/routes/skjemabygging-proxy.ts` | `mocks/mocks/data/test-cases/*cover-page-body.json`  |
| `familie-pdf`         | `mocks/mocks/routes/familie-pdf.ts`         | `mocks/mocks/data/test-cases/*pdf*.json`             |

Follow `.github/skills/request-body-verification/SKILL.md`. The route variants
use `compareBodyMiddleware(...)` and Cypress selects the required variant with
`cy.mocksUseRouteVariant(...)`.

These references do not provide a preprod inspection mechanism. This repository
currently documents no general approved way to inspect outbound preprod
requests for these systems. When a test needs preprod evidence, ask the caller
for an approved method and owner before generating that verification case.
Record approved methods here after the team confirms them, and use the exact
method in the canonical plan.

Before citing a numbered fixture as evidence, compare its form, sender and
subject roles, submission mode, selected route variant, and relevant values
with the planned case. Confirm that the Cypress test actually exercises that
fixture and that the mock middleware compares the claimed fields. A fixture
for a form without a person-sender cannot prove a case using one. If no
exact scenario match exists, add matching local verification first or state
that the request body remains unverified; do not cite a nearby fixture as
proof. Do not call a local fixture evidence of what preprod sent.
