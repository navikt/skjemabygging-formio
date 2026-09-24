# Digital submission without login

Before writing steps, inspect the preprod form revision and map its
submission settings against the no-login Cypress flows and implementation
at the committed PR head. Follow
[route-source-mapping.md](route-source-mapping.md). The entry URL can
redirect to `/legitimasjon`; follow or inspect the `Location`. A 302 is
not proof of an access barrier, and a 200 does not prove the rest of
the route. A source-mapped route is still untested in preprod.

Existing mock-based tests show `Legitimasjon`, ID upload, and the
introduction after `Send digitalt uten å logge inn`. Use them for the
shared flow only after checking that the case uses the matching method
and settings. They do not prove this form's preprod behavior. If ID
upload is required by that flow, write it as a required step, not
"upload if prompted." Check the form and implementation for the actual
self-declaration and later page sequence. See
`packages/fyllut/cypress/e2e/other/digitalnologin.cy.ts:90-121`,
`packages/fyllut/cypress/e2e/digital-submission/nologin.cy.ts:17-36`, and
`packages/shared-components/src/pages/intro/IntroPageButtonRow.tsx:27-38`.

The first panel is defined by the form, not by the submission method.
For example, `nologin.cy.ts:31-36` goes through `Veiledning` before
`Dine opplysninger`, while `digitalnologin.cy.ts:119-121` starts at
`Dine opplysninger`. Inspect the specific form revision and conditionals
before naming `Veiledning`, `Dine opplysninger`, `Avsender`, or other
pages. Do not copy one test's panel order to another form. If the
sources cannot establish the sequence, tell the tester which page to
inspect after upload, what to record, and mark that transition exploratory.
Request approval before uploading a synthetic ID in preprod.
Keep the chosen identities distinct when checking the summary.

Do not treat a receipt as evidence of the identities sent downstream.
For a preprod payload claim, follow
[integration-evidence.md](integration-evidence.md). If no approved method
can inspect the matching submission, limit the case to observable FyllUt
behavior and state that the downstream payload remains unverified.
