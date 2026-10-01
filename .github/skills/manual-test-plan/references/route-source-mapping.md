# Map case routes from source

Start with the committed PR head, the form revision actually present in
preprod, the submission method, and the case's conditional choices. Read
relevant Cypress specs and application code at the PR head even when the
local checkout differs. Look for existing FyllUt specs under
`packages/fyllut/cypress/e2e/form/`, `digital-submission/`, `other/`, and
`pdf/`. Read their setup and commands as well as assertions. A test using a
mock form or route can establish shared navigation behavior, but not the
exact pages of a different preprod form.

Build an ordered route map **for each case**:

| Part of the route | Match against                                                                                                      | Record                                                                       |
| ----------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Before the form   | Submission method, login or ID upload, feature flags, introduction, and relevant Cypress flow or implementation    | Entry URL, redirects, required actions, visible pages, and source file/lines |
| In the form       | Exact preprod form revision, active panels, conditionals, required components, their labels, and renderer behavior | Choices, active fields, page order, and source for each transition           |
| After the form    | Summary, attachments, PDF, submit action, receipt, and relevant Cypress flow or implementation                     | Ordered actions, visible results, and source file/lines                      |

Check the chosen values against form conditionals and `clearOnHide`; do not
assume a branch is active because its components exist in Forms API. Match
submission method and settings when using a Cypress flow. If no spec covers
the exact form, use matching tests for shared before/after behavior and the
form definition plus renderer code for its specific pages. Note which tests
use mocks and what they mock. Do not copy test fixture identities, labels,
or panel order into a case that uses a different form. A redirect is a
navigation step: inspect its `Location` before treating it as an error.

For each proposed numbered step, record the action, next page, and the
specific source that supports that transition. Keep this mapping with the
canonical plan and cite the PR head, preprod form revision, and source paths
in `journeyCheck.evidence`. Mark a complete, consistent route
`source-mapped`. This means the steps are grounded in sources, **not** that
the preprod browser journey has been exercised. The first tester action
should confirm the entry page and branch in preprod. Label that distinction
in the plan.

If a transition depends on runtime behavior the sources do not establish,
name the missing transition and why it is unknown. Give the tester a concrete
exploratory observation task: where to start, which approved choices to make,
what page or control to look for, and what to record. Do not predict an unseen
page or turn a question into a pass criterion. Keep independently supported
cases as verification cases rather than downgrading the entire plan. A manual
browser observation by someone with access can resolve the gap; record the
ordered pages, choices, actions, and next page without entered identities or
document contents. Never write "if prompted" for a required action or skip an
intervening page. Cypress does not need to run in cplt.

The map tells the tester **what to do**. Derive **what should happen** from
the issue, approved specification, established contract, or unchanged
baseline behavior. When implemented behavior differs from confirmed intent,
keep the intended result and report the discrepancy. Neither an observed
page nor a Cypress assertion on new behavior establishes product intent.
Keep outbound payload evidence separate from UI and receipt evidence.
Keep all necessary navigation actions in order, but add an expected result
only where the case tests an outcome. Avoid checks that merely restate the
next navigation step.

## Digital submission without login

Map the preprod form revision's submission settings against the no-login
Cypress flows and implementation at the committed PR head. The entry URL can
redirect to `/legitimasjon`; follow or inspect the `Location`. A 302 is not
proof of an access barrier, and a 200 does not prove the rest of the route.

Existing mock-based tests show `Legitimasjon`, ID upload, and the
introduction after `Send digitalt uten å logge inn`. Use them for the shared
flow only after checking that the case uses the matching method and settings;
they do not prove this form's preprod behavior. Write a required ID upload as
a required step. Check the form and implementation for the actual
self-declaration and later page sequence. See
`packages/fyllut/cypress/e2e/other/digitalnologin.cy.ts:90-121`,
`packages/fyllut/cypress/e2e/digital-submission/nologin.cy.ts:17-36`, and
`packages/shared-components/src/pages/intro/IntroPageButtonRow.tsx:27-38`.

The first panel is defined by the form, not by the submission method. For
example, `nologin.cy.ts:31-36` goes through `Veiledning` before
`Dine opplysninger`, while `digitalnologin.cy.ts:119-121` starts at
`Dine opplysninger`. Inspect the specific form revision and conditionals
before naming `Veiledning`, `Dine opplysninger`, `Avsender`, or other pages.
If the sources cannot establish the sequence, tell the tester which page to
inspect after upload, what to record, and mark that transition exploratory.
Keep the chosen identities distinct when checking the summary.

Do not treat a receipt as evidence of the identities sent downstream; follow
[integration-evidence.md](integration-evidence.md). If no approved method can
inspect the matching submission, limit the case to observable FyllUt behavior
and state that the downstream payload remains unverified.
