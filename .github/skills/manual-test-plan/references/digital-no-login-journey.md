# Digital submission without login

Before writing test steps, inspect the form definition at the PR head, the
imported preprod form, and the relevant FyllUt journey. An enabled submission
method or a successful form URL response does not prove which pages appear.
Walk the exact form when possible. If you cannot, mark its `journeyCheck` as
`unverified` and do not assert unobserved transitions.

For the standard digital-without-login flow, FyllUt takes the tester through
`Legitimasjon` after they choose `Send digitalt uten å logge inn`. They must
select a document type and upload the ID file before continuing. Do not say
"upload if prompted." After the upload comes the introduction page. If the
form enables a self-declaration, confirm it before continuing. Only then
does the tester reach the form's first panel. See
`packages/fyllut/cypress/e2e/other/digitalnologin.cy.ts:90-121`,
`packages/fyllut/cypress/e2e/digital-submission/nologin.cy.ts:17-36`, and
`packages/shared-components/src/pages/intro/IntroPageButtonRow.tsx:27-38`.

The first panel is defined by the form, not by the submission method.
For example, `nologin.cy.ts:31-36` goes through `Veiledning` before
`Dine opplysninger`, while `digitalnologin.cy.ts:119-121` starts at
`Dine opplysninger`. Inspect whether the specific form has `Veiledning`,
`Dine opplysninger`, `Avsender`, or other pages, and name each relevant
transition and expected result in order. Keep the chosen identities distinct
when checking the summary.

Do not treat a receipt as evidence of the identities sent downstream.
For a preprod payload claim, follow
[integration-evidence.md](integration-evidence.md). If no approved method
can inspect the matching submission, limit the case to observable FyllUt
behavior and state that the downstream payload remains unverified.
