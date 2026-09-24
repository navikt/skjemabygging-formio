# Evidence for outbound integrations

Every outbound integration affected by the change needs a concrete evidence
method before the skill writes verification cases. Name:

- the system receiving the request
- the value or document that proves the expected result
- the approved tool or procedure used to inspect it
- who can perform the inspection

Do not use a successful receipt, HTTP status, or page transition as evidence of
an outbound payload.

Local mock verification can support a separate automated request-body check,
but it never verifies what a manual preprod submission sent. For a submission
case, offer three paths in `integrations[].evidence.options`. Give each option
its own owner, ordered actions, and observable expected result. Ask who can
perform the follow-up; do not assume the current tester has log or Joark
access.

### Team logs in GCP

A developer can open
<https://console.cloud.google.com/logs?project=team-soknad-dev>. Choose a
short time range around the recorded test time and check the logs from both
`innsending-api` and `soknadsarkiverer`. If the submission ID is known, use
`SEARCH("INNSENDINGS_UUID")` in Logs Explorer with the actual ID substituted.
Otherwise use the form number and test time to find candidates. Confirm that
the entries belong to the same submission before comparing anything. Record
what each service shows; do not assume that both services log the same fields.
If the logs expose `bruker` and `avsender` for the same submission, compare
each with the corresponding synthetic identity used in the form. The expected
result must say which role has which value and that they are different. If the
logs only show a successful request, or the fields or an unambiguous match are
missing, mark the identity check **unverified** and try Joark or hand it off.
Do not claim that the logs expose payload fields without inspecting them:
this repo's FyllUt logs only identify the submission, form number, request
path, and outcome
(`packages/shared-backend/src/services/application/applicationClient.ts:341-367`,
`packages/fyllut-backend/src/routers/api/send-inn/application/common.ts:38-43`).
FyllUt itself is not deployed in the team's `team-soknad-dev` project.

### Joark

If the tester has access to the team's approved Joark view, find the
corresponding journalpost using the available submission reference, form
number, and test time. Confirm that the record matches this submission.
Inspect the documents or fields that identify the person the application
concerns and the person who submitted it. Compare both with the synthetic
identities used in the form. State precisely what should match. If Joark
does not expose both identities or no record can be matched unambiguously,
the downstream identity check remains unverified; do not infer it from the
receipt. This repo does not document Joark field names or a lookup API, so
use the actual approved view rather than inventing an endpoint.

### No access

Tell the tester to record the environment, exact test time and time zone,
form number and path, submission method, which synthetic identity was
entered as `bruker` and which as `avsender`, visible receipt status or
reference, and any error. A no-login receipt may not show `innsendingsId`:
the backend maps its date and attachments but not that ID
(`packages/fyllut-backend/src/services/nologin/receiptMapper.ts:9-16`).
Record the ID only if available; do not tell the tester to find it on the
receipt. Share the synthetic identity numbers with the team member who
will do the follow-up. Assign the check to someone with team-log or Joark
access. The expected result for this path is a traceable handoff, **not**
proof that the payload is correct. Leave downstream verification pending
until that person records what they actually saw.

Approved synthetic identity numbers can be shared within the team. Do not
put filled-in test-user numbers in a public GitHub Page or issue.

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

These references do not provide a preprod inspection mechanism for
`skjemabygging-proxy` or `familie-pdf`. For a submission, the `innsending-api`
and `soknadsarkiverer` logs and the Joark path above are places to look, not
a guarantee that both identities are visible. When a case needs preprod
evidence, establish an owner and confirm that the chosen path exposes the
claimed fields. If it does not, report that claim as pending rather than
passed.

Before citing a numbered fixture as evidence, compare its form, sender and
subject roles, submission mode, selected route variant, and relevant values
with the planned case. Confirm that the Cypress test actually exercises that
fixture and that the mock middleware compares the claimed fields. A fixture
for a form without a person-sender cannot prove a case using one. If no
exact scenario match exists, add matching local verification first or state
that the request body remains unverified; do not cite a nearby fixture as
proof. Do not call a local fixture evidence of what preprod sent.
An unexplained identifier such as `tc23a` is not evidence. Check what it
refers to before citing it. If it is a local mock test-case fixture, give
its full file path, scenario, and purpose in internal developer instructions.
Do not place a fixture ID in a tester-facing case or suggest that a fixture
verifies that tester's preprod submission.
