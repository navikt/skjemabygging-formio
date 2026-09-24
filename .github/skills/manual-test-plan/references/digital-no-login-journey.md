# Digital submission without login

Before writing test steps, inspect the form definition at the PR head, the
imported preprod form, and the relevant FyllUt journey. Follow
[preprod-browser-probe.md](preprod-browser-probe.md) to observe the actual
browser route for each case. The entry URL can redirect to `/legitimasjon`;
follow the redirect and record its destination. A 302 is not proof of an
access barrier, and a 200 does not prove the rest of the route. If the
read-only probe stops at ID upload, record that blocker and the unseen
introduction and form pages. Do not infer their sequence from this reference
or another Cypress spec. Request approval before uploading an approved
synthetic ID in preprod. Mark the case's `journeyCheck` as `unverified` until
its required transitions have been observed.

Existing mock-based tests take the tester through `Legitimasjon`, ID upload,
and the introduction after selecting `Send digitalt uten å logge inn`.
These tests identify what to check in the browser; they do not prove that
this form's preprod route works. When the browser confirms an upload is
required, do not say "upload if prompted." If the form enables a
self-declaration, check its actual text and placement before naming the
next page. See
`packages/fyllut/cypress/e2e/other/digitalnologin.cy.ts:90-121`,
`packages/fyllut/cypress/e2e/digital-submission/nologin.cy.ts:17-36`, and
`packages/shared-components/src/pages/intro/IntroPageButtonRow.tsx:27-38`.

The first panel is defined by the form, not by the submission method.
For example, `nologin.cy.ts:31-36` goes through `Veiledning` before
`Dine opplysninger`, while `digitalnologin.cy.ts:119-121` starts at
`Dine opplysninger`. Inspect whether the specific preprod form has
`Veiledning`, `Dine opplysninger`, `Avsender`, or other pages. Name each
transition only after observing it on that branch. Keep the chosen
identities distinct when checking the summary.

Do not treat a receipt as evidence of the identities sent downstream.
For a preprod payload claim, follow
[integration-evidence.md](integration-evidence.md). If no approved method
can inspect the matching submission, limit the case to observable FyllUt
behavior and state that the downstream payload remains unverified.
