# Handover for the Playwright pilot in FyllUt

Snapshot dated 13 October 2026. The accepted executable revision is
`a526e5d1615d0b7e0b9f414b9322e8a0fd777c88`.
This document hands over the bounded pilot for
[#2207](https://github.com/navikt/skjemabygging-formio/issues/2207).
It does not declare the full migration complete or approve removing Cypress.

Use the [operating guide](README.md) for commands, ports, existing mode,
fixtures, troubleshooting and CI verification requirements.
The [migration register](migration/inventory.json) is the source of truth for
IDs, source hashes, checklists and review status. Counts below are a snapshot;
reconcile the register again after renderer merges.

## Result and recommendation

The pilot can run through the CLI in an approved CPLT environment and on
GitHub, using the existing mock server and real FyllUt backend. Separate
checkouts and concurrent stacks have been exercised. Tests have explicit
identities, fresh process epochs, checked results and owned cleanup.

Continue only as a staged migration after developers review the pilot.
Agent execution and test control are demonstrated benefits. Faster CI is not.
The current isolated Playwright benchmark is slower than Cypress.
Do not copy this implementation across the remaining suite before reviewing
its assertions, fixtures and lifecycle.

| Scope                              | Current state                                                                                                              |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Active FyllUt source catalogue     | 816 declarations in 93 Cypress files                                                                                       |
| Implemented pilot                  | 43 declarations, expanded into 46 Playwright cases                                                                         |
| Remaining active migration         | 773 declarations in 88 files, including the partially migrated data-fetcher file                                           |
| Remaining build-only declarations  | 12 of the catalogue's 13                                                                                                   |
| Known remaining runtime expansion  | 775 registered cases; saved-language parameterization adds two. This is not a complete count of all dynamic Cypress cases. |
| Historical upstream removals       | Nine reserved IDs, all requirement decisions pending                                                                       |
| Human coverage and practice review | Pending for every pilot declaration                                                                                        |

Cypress and its existing CI remain active. Bygger, more migrated files,
shared CI builds, sharding and process reuse are not delivered by this pilot.
No skill changes or new agent permissions are part of this handover.

## Accepted execution evidence

[GitHub run 38402028109](https://github.com/navikt/skjemabygging-formio/actions/runs/38402028109)
passed on the accepted revision. Its downloaded reports were checked against
the exact migration IDs and source/build fingerprints, not just the green
workflow badge.

| Check                      | Accepted result                                                                                          |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| Full built pilot           | 46 passed, no skips or retries                                                                           |
| Matching benchmark         | 45 passed in each framework, five whole Cypress files                                                    |
| Support tests              | 57 Node tests and five mock unit tests passed                                                            |
| Technical browser controls | 20 groups passed their outer verification                                                                |
| Submission evidence        | F061-T004 has completed, body-comparator-passed tc07 records for both outbound routes                    |
| Source and build           | Clean tested Git source, matching entrypoint hashes across pilot and benchmark                           |
| Complete GitHub job        | 19 minutes 48 seconds, including installation, build, verification, both runs and artifact/post-job work |

The catalogue baseline is `9acb96336a262241301d0d235efa98f444684103`, not the
executable revision above. Fixture footer values such as `git-sha` are
deliberate test data, not provenance for the tested code.

Earlier local acceptance at `985a12b1e7edb77a9fc2ca63d1e63e6c185b851e`
included full dev execution, three built runs and three whole-six-file
Cypress comparisons. Dev had 45 passes and only the expected F086-T002 skip.
Each Cypress run had 66 passes, including 20 additional data-fetcher cases
outside the pilot selection. Those totals are not a speed comparison.
They also do not establish three green comparisons on the later accepted
revision, which changed test-support instrumentation and CI controls.

The first GitHub run on `eff5ca433` failed before pilot execution.
The default shallow checkout lacked the register's baseline revision.
A controller-SIGKILL test also treated an orphan PID as running after exit.
Both failures were reproduced locally before correction. Full-history
checkout fixed the first. Controlled delayed Linux reaping reproduced the
second with an exited zombie owner. The corrected check rejects live owners
and still requires absent server children and free ports.
The corrected workflow sequence then passed in an independent checkout with
its own frozen offline installation and fresh build before the green
GitHub run. Do not discard this failed run from the review record.

## Performance baseline

The one GitHub benchmark sample used the same build, runner and 1280x1000
viewport, with zero test retries. It excludes F029-T002 so both frameworks
execute exactly the same 45 cases.

| Measured work                    | Seconds |
| -------------------------------- | ------- |
| Playwright command wall time     | 357.80  |
| Cypress command wall time        | 136.04  |
| Playwright epoch startup, summed | 139.79  |
| Playwright test scope, summed    | 73.73   |
| Playwright teardown, summed      | 140.82  |

Playwright uses Chromium and a new app/mock process epoch per case. Cypress
uses Electron and one shared epoch per benchmark sample. Most Playwright
time is startup and teardown. Its test-scope timing includes dependent
fixture work, not just user actions, and differs from Cypress test-duration
boundaries.

Command times exclude dependency installation, build and artifact upload.
One sample does not establish variance or full-suite performance. The pilot
job also runs technical controls and both frameworks, so its total duration
is not the cost of a future Playwright-only suite.

A later optimization investigation should measure process startup/shutdown
and bounded sharding before considering shared processes. Existing Cypress
CI already distributes FyllUt across twelve folder jobs. Compare wall time
and total runner consumption at the same resource budget. Any optimization
must retain late-request, mock-comparator and cleanup controls.

## Human review

All 43 pilot declarations remain `implemented`, with `coverageReview` and
`playwrightReview` set to `pending`. Green runs and this handover do not
approve either field.

| Review group           | Source and counterpart                                                                                                                                          | Declarations / cases |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| F004-T001 through T007 | [Bank account source](../cypress/e2e/components-customized/bankaccount.cy.ts), [counterpart](e2e/components-customized/bankaccount.spec.ts)                     | 7 / 7                |
| F017-T001 through T011 | [Date picker source](../cypress/e2e/components-date/datePicker.cy.ts), [counterpart](e2e/components-date/datePicker.spec.ts)                                    | 11 / 11              |
| F029-T002              | [Data-fetcher source](../cypress/e2e/components-deprecated-complex/data-fetcher.cy.ts), [counterpart](e2e/components-deprecated-complex/data-fetcher.spec.ts)   | 1 / 1                |
| F061-T001 through T005 | [Attachment source](../cypress/e2e/digital-submission/digital-attachment-upload.cy.ts), [counterpart](e2e/digital-submission/digital-attachment-upload.spec.ts) | 5 / 8                |
| F073-T001 through T008 | [Axe source](../cypress/e2e/other/a11y-axe.cy.ts), [counterpart](e2e/other/a11y-axe.spec.ts)                                                                    | 8 / 8                |
| F086-T001 through T011 | [Static PDF source](../cypress/e2e/pdf/static-pdf.cy.ts), [counterpart](e2e/pdf/static-pdf.spec.ts)                                                             | 11 / 11              |

For each declaration, read its `coverageChecklist` in the register and:

1. Compare the source test, applicable hooks, shared commands, fixtures and target helpers at the reviewed revision. Include renderer/config overrides, clock, focus and request-completion behavior.
2. Map every source check to an awaited target assertion or documented equivalent. Record prerequisite, negative, count/order and recovery checks explicitly. Unchanged titles and hashes alone do not prove this mapping.
3. Evaluate Playwright practice separately. Check locator scope, web-first assertions, awaited actions, independent setup and error propagation. Reject sleeps, forced interactions or broad interception used to conceal application failures.
4. Record the reviewed commit, per-ID decisions, relevant source/target locations, defects and reviewer/PR reference. Link runtime and negative-control evidence to that revision.

Use the [official Playwright practices](https://playwright.dev/docs/best-practices)
alongside repository requirements. They take precedence over a supplementary
skill. Preserve event-sensitive typing behavior; `fill` is not automatically
equivalent to the source's keyboard sequence.

F061-T005 is one declaration with four concrete outcomes, C001 through C004.
Approval must cover pending upload/delete and success/failure, not just one
green outcome. F004-T006 needs a completed PDF response, F086-T002 needs a
valid static-form prerequisite before its compiled 404, and F061-T004 needs
completed body-comparator evidence, not variant selection or HTTP 200 alone.
Axe checks do not replace manual accessibility review or visual PDF checks.

Only developers grant approval. Keep `implemented` while either review is
pending or defects remain. The current checker accepts `planned`,
`implemented` and `verified`; it has no `reviewed` intermediate status.
Before `verified`, require both review fields to be `approved` and an
`evidence` array referencing actual decisions and at least three consecutive
green source/counterpart comparisons on the same reviewed commit without
test retries. The one accepted GitHub sample does not meet that repetition
gate by itself. Source, target, helper or relevant mock changes require fresh
review/evidence. The checker requires approvals and nonempty evidence; reviewers
must assess that evidence, including repetition and assertion parity.
No status automatically retires Cypress.

## Remaining work and effort

The published first-delivery plan does not set an effort estimate.
No implementation/review person-time was recorded consistently in this
pilot, so it does not support a reliable number of days for full migration.
Test execution time is not implementation effort. AI-generated test code
does not eliminate review and parity verification.

| Remaining area                | Files | Declarations |
| ----------------------------- | ----- | ------------ |
| components-customized         | 15    | 142          |
| components-date               | 3     | 22           |
| components-deprecated-basic   | 6     | 30           |
| components-deprecated-complex | 6     | 73           |
| components-deprecated         | 11    | 77           |
| components-group              | 4     | 32           |
| components-standard           | 11    | 89           |
| components-system             | 3     | 30           |
| digital-submission            | 6     | 62           |
| form                          | 11    | 93           |
| other                         | 10    | 103          |
| pdf                           | 2     | 20           |
| Total                         | 88    | 773          |

The launcher, runner, mock observation, evidence checks and CI foundation can
be reused. Remaining work is source/helper analysis, counterpart authoring,
runtime-case reconciliation, failure controls, comparison execution and
human review for each file. Complex widgets, stateful navigation/session
tests and outbound payloads need different helpers and proof than simple
field assertions. Current runner guards pin the 43 pilot declarations;
expansion must deliberately update those guards and their tests.

After pilot review, authorize a small additional batch of whole files across
simple components and complex form/submission behavior. Record implementation,
debugging, comparison and human-review time separately. Use that measured
throughput and the area totals to estimate subsequent batches, including
CI/parallelization work. Do not budget this as a mechanical rename of 773 tests.

Open requirement decisions remain separate from the 773 active declarations:

- The nine `historicalTests` entries reserve removed IDs. Eight relate to unsupported arbitrary scripts; retirement/replacement decisions remain pending. F056-T011's empty-optional-field guarantee needs supported replacement coverage.
- Current production form definitions have not been inspected because access was blocked in the agent environment. Do not bypass that restriction or claim production compatibility from mock fixtures alone.
- Windows named-pipe execution has not been verified. Linux/CPLT success does not prove all developer environments work.
- The specification's MCP and supplementary Currents-skill requirements remain unfulfilled where operator-approved tooling/revision evidence is unavailable. Do not install tools, invent origins/version evidence or broaden sandbox permissions to close them.
- Required-check policy, later full-suite CI optimization and Cypress retirement need explicit team decisions. Existing coverage/CodeQL branch filters were not changed by the pilot.

## Starting a new developer or agent session

Read this document and the operating guide, then check the actual branch,
HEAD and worktree changes. The accepted revision above is a historical
reference, not an instruction to reset or overwrite later work.
Follow existing repository skills before changing frontend/backend behavior.
For ordinary UI work outside this specifically authorized pilot, the
repository's Cypress policy still applies.

Confirm dependencies, shared builds, browser execution and approved localhost
ports before running. Use the root runners, never raw Playwright options
that override isolation, workers, retries or result checking. Do not attach
to shared mock processes; existing mode consumes a dedicated one-use lease.
Stage intended new source files before acceptance so provenance includes
them, and keep unrelated worktree changes intact.

For CI changes, require an independent checkout with the workflow's actual
history depth, its own dependency installation and fresh build. Reproduce
failure controls before claiming a fix. Distinguish locally tested,
CI prerequisites checked and actual GitHub acceptance. State missing checks
before delivery; do not substitute a syntax check or local green badge for
remote evidence.

Developers control remote publication and workflow reruns. A handover or
autopilot instruction is not permission to push, publish review comments,
merge, change skills or approve human review. At this handover, the next
decision is pilot review, then authorization of a bounded follow-up batch.
