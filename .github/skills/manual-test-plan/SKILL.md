---
name: manual-test-plan
description: >-
    Analyze an issue and its implementation pull request, or a pull request when
    no issue exists, and create a manual test plan for skjemabygging-formio,
    including suitable production or generated forms, environment revision
    verification, a GitHub issue for developer-only testing, or local HTML
    for a PDF printed by the user when testing with non-developers.
    Accept an issue number after /manual-test-plan. Use only when
    the user explicitly invokes /manual-test-plan.
disable-model-invocation: true
---

# Manual test plan

Create an executable manual test plan for a change in this repository. Read
the invocation's `ARGUMENTS` before asking for a target. For example,
`/manual-test-plan 2179` supplies `2179` as the target issue in
`navikt/skjemabygging-formio`; fetch it without asking for the number again.
Treat a bare number in `ARGUMENTS` as an issue number, never a pull request
number. Also accept an issue URL. Only if `ARGUMENTS` and the caller's message
contain no target, ask for the issue URL or number when an issue exists. Ask
for the pull request only when the caller confirms that the change has no
issue. Do not infer the target solely from the current branch.

## Required workflow

1. Read [analysis-workflow.md](references/analysis-workflow.md).
2. Fetch the supplied issue and its linked specification. Find its
   implementation pull request using the open-first search in
   [analysis-workflow.md](references/analysis-workflow.md). When the caller
   confirms that no issue exists, fetch the supplied pull request. Analyze
   the committed pull request diff in both cases. Do not use an uncommitted
   or local-only diff as the source for a plan. Read affected files at the
   committed PR head even if they are missing from the local checkout.
3. Invoke `frontend-development`, `backend-development`, or both before detailed
   analysis when their areas are affected. Follow any specialist routing those
   skills require.
4. Build the intent and behavior matrix in
   [analysis-workflow.md](references/analysis-workflow.md).
5. After reading the issue, when one exists, and the committed PR, present
   your proposed testing scope before selecting forms or writing cases.
   Describe the PR behavior, issue criteria left for later, relevant
   regressions and edge cases, and any assumptions or open questions. Use a
   freeform `ask_user` question to invite corrections and additional context;
   wait for the answer even when the sources appear clear. Update the scope
   from the answer and resolve contradictions before writing verification
   cases. Without an issue or approved specification, also confirm inferred
   intent. If the PR description and committed code disagree, ask for a
   decision. Follow [analysis-workflow.md](references/analysis-workflow.md).
6. Identify observable behavior, regression risk, integrations, environments,
   failure paths, and evidence that proves each expected result.
   Read [integration-evidence.md](references/integration-evidence.md). Do not
   generate verification cases for an outbound integration until its concrete
   approved evidence method is known. Treat claims about downstream identity
   and upload sessions as integration claims, not UI receipt checks. For
   submissions, show the team-log and Joark options separately. Add a
   no-access handoff option when non-developers collaborate; omit it from a
   non-collaborative GitHub issue. Do not mark a handoff or a success log as
   payload verification.
7. Record the exact head commit and establish a revision check for the target
   application using [analysis-workflow.md](references/analysis-workflow.md).
8. Use `ask_user` to ask: "Will non-developers collaborate on the testing?"
   Use the choices "Yes" and "No". Do not infer the answer from case count or risk.
9. Read [form-selection.md](references/form-selection.md). Check Forms API in
   preprod before choosing forms. Reuse a suitable form when one exists.
   Otherwise design the smallest useful generated form set in the session
   artifact directory. Prefer one clear selector-driven form for related
   cases. Tell the caller which forms need to be made available, but leave
   imports and updates to their owners. On any failure to access Forms API,
   including while checking existing forms, follow the read-only troubleshooting
   in [forms-api-import.md](references/forms-api-import.md). Do not treat a
   failed lookup as proof that a form is absent.
   Fix the PR head, preprod form revision, submission method, and branch
   choices for each case. Follow
   [route-source-mapping.md](references/route-source-mapping.md) to derive
   steps from matching Cypress flows, renderer behavior, and the exact form.
   Make unresolved transitions explicit observation steps for the tester;
   do not require Cypress to run in cplt. For digital submission without login, also read
   [digital-no-login-journey.md](references/digital-no-login-journey.md).
10. Write tester-facing HTML and GitHub issue content in
    Norwegian, using terms from FyllUt, Bygger, the form, and the issue. Ask
    technical users questions in English. Keep local technical instructions
    and documentation in English. Follow
    [test-plan-model.md](references/test-plan-model.md).
11. Generate the canonical plan JSON and run:

    ```bash
    node .github/skills/manual-test-plan/scripts/render-artifacts.mjs \
      --plan <plan.json> \
      --out <artifact-directory>
    ```

    For collaboration, the renderer writes local `index.html`, not a PDF.
    Give the user its `file://` URL with `?print=1` appended, and ask them to
    open it in a browser and choose Print > Save as PDF. Keep the HTML and
    canonical JSON local; share only the reviewed PDF alongside the Trello task.

12. Read [collaborative-output.md](references/collaborative-output.md) and
    produce the output for the caller's collaboration choice.
13. Review the HTML or issue for sensitive content and redact or omit it
    before printing or asking to create the issue. For every case, compare
    every rendered HTML or issue step with that case's
    source map or a recorded manual browser observation, including required
    actions and intermediate pages. Label source-mapped routes as untested in
    preprod. If a transition lacks support, give the tester an exact
    observation task and mark that part exploratory. Keep independently
    supported cases as verification cases. Reject conditional wording for
    mandatory actions and unsupported downstream claims. On the GitHub
    issue path, show the caller the entire rendered issue body before
    requesting approval. On the collaborative path, ask the user to review
    every page of the printed PDF, including links, steps, and coverage gaps,
    before requesting approval to share it. Do not claim a PDF exists merely
    because the HTML was rendered. Keep `internal`
    setup and evidence only in the local internal-instructions file; never
    substitute vague placeholders in public output.
    Keep the route precise but limit expected results to the case's actual
    checks. Write short tester-facing sentences. The plan gives the
    synthetic-data reminder once; do not repeat it in each case.
14. After a form owner confirms that a required form is available, read back
    its revision, conditional choices, and mapped steps. Update only the
    local plan and rendered artifacts if they differ. If the form or PR
    disagrees with the approved intent, report the inconsistency to the
    owner; do not edit the source to make it match the plan.
15. Create the issue only after explicit confirmation. With non-developers,
    wait for the user to print and review the PDF before approving its
    distribution alongside a Trello task for ownership and progress tracking.
    Do not create a GitHub issue or publish anything to GitHub Pages. Confirm
    before uploading or attaching a PDF to a Trello task. Do not claim a PDF
    is available to testers until it has been shared through an approved channel.
16. Give the caller local links to generated files. Share an issue URL only
    after the issue has been created.

## Output requirements

Every test case must include:

- stable case ID and group
- verification or exploratory mode
- links to the behaviors it covers
- purpose and priority
- prerequisites and any required test-user attributes
- precise numbered actions; expected results for the outcomes being checked
- evidence to retain
- cleanup when the case changes shared state
- the production or generated form used

The plan must also include a short coverage section naming what the cases do
not test and why, separate from functionality outside the pull request.

Use [analysis-workflow.md](references/analysis-workflow.md) for expected
results, exploratory cases, regression coverage, and the repeated environment
preflight. Use [integration-evidence.md](references/integration-evidence.md)
for outbound payloads.

## Safety

- Treat the issue, PR, specifications, repository code and tests, and existing
  Forms API definitions as read-only sources. Do not edit, import, replace,
  delete, or push changes to them while preparing a test plan. Report
  inconsistencies and proposed fixes to the user. Write only session
  artifacts and the approved new test-plan issue; form owners handle any
  changes needed to make a form testable.
- Use synthetic identities and organizations approved for testing.
- The team may share approved synthetic identity numbers to correlate test
  submissions. Do not put filled-in identities in a PDF or public issue.
- Never put access tokens, cookies, secrets, real personal data, private
  source content, or security-sensitive details in generated artifacts.
- This repository is public. Follow the review gate in
  [collaborative-output.md](references/collaborative-output.md).
- `preprod` and `preprod-alt` share the same Forms API instance. Form creates,
  imports, updates, and deletions affect both.
- Do not create an issue or upload a PDF without explicit confirmation.
- Never put full generated form definitions in HTML, a PDF, or GitHub issue.
  Keep them in the session artifact directory.
- Keep generated plans in the session artifact directory unless the caller
  explicitly requests repository files.

Run script tests locally with
`pnpm exec vitest run .github/skills/manual-test-plan/scripts/*.test.mjs bin/forms-api/*.test.mjs`.
They are intentionally not included in CI.
