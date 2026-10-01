---
name: manual-test-plan
description: >-
    Analyze an issue and its implementation pull request, or a pull request
    directly (with or without a linked issue), and create a manual test plan
    for skjemabygging-formio,
    including suitable production or generated forms, environment revision
    verification, a GitHub issue for developer-only testing, or local HTML
    for a PDF printed by the user when testing with non-developers.
    Accept an issue or pull request number or URL after /manual-test-plan. Use only when
    the user explicitly invokes /manual-test-plan.
disable-model-invocation: true
---

# Manual test plan

Create an executable manual test plan for a change in this repository. Read
the invocation's `ARGUMENTS` before asking for a target. For example,
`/manual-test-plan 2179` supplies `2179` as the target in
`navikt/skjemabygging-formio`; fetch it without asking for the number again.
The target can be an issue or a pull request, given as a number or URL. GitHub
numbers issues and pull requests in one sequence, so resolve a bare number
through GitHub as described in
[analysis-workflow.md](references/analysis-workflow.md) instead of assuming
its type. Only if `ARGUMENTS` and the caller's message contain no target, ask
for an issue or pull request. A pull request needs no issue. Do not infer the
target solely from the current branch.

## Language

- Tester-facing HTML and GitHub issue content, including the plan fields they
  render, is in Norwegian, using terms from FyllUt, Bygger, the form, and the
  issue.
- Questions to technical users, `internal` setup and evidence fields, local
  instructions, documentation, and code are in English.

## Required workflow

1. Read [analysis-workflow.md](references/analysis-workflow.md).
2. For an issue target, fetch the issue and its linked specification, and find
   its implementation pull request using the open-first search in
   [analysis-workflow.md](references/analysis-workflow.md). For a pull request
   target, fetch the pull request and any issue it links; with no linked
   issue, continue without one. Analyze
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
6. Use `ask_user` to ask: "Will non-developers collaborate on the testing?"
   Use the choices "Yes" and "No". Do not infer the answer from case count or risk.
7. Identify observable behavior, regression risk, integrations, environments,
   failure paths, and evidence that proves each expected result.
   Read [integration-evidence.md](references/integration-evidence.md). Do not
   generate verification cases for an outbound integration until its concrete
   approved evidence method is known. Treat claims about downstream identity
   and upload sessions as integration claims, not UI receipt checks. For
   submissions, show the team-log and Joark options separately. Add a
   no-access handoff option when non-developers collaborate; omit it from a
   non-collaborative GitHub issue. Do not mark a handoff or a success log as
   payload verification.
8. Record the exact head commit. Determine whether the PR is deployed to
   `preprod` or `preprod-alt` from deployment evidence and the live revision
   check in [analysis-workflow.md](references/analysis-workflow.md). Use the
   environment carrying the PR. If this is unclear, ask the user which
   environment to target before choosing forms or writing cases. Never default
   to `preprod` just because the deploy workflow does. Establish the
   application revision check for the selected environment.
9. Read [form-selection.md](references/form-selection.md). Check Forms API in
   preprod before choosing forms. Reuse a suitable form when one exists.
   Otherwise design the smallest useful generated form set in the session
   artifact directory, preferring one selector-driven form for related cases.
   Tell the caller which forms will be reused, created, or need updating.
   Import `MANUALTEST-` forms only as described in
   [forms-api-import.md](references/forms-api-import.md): dry-run, apply only
   the confirmed CREATE, and obtain explicit approval for the exact change
   before any UPDATE. Never silently replace a form. A failed lookup is not
   proof that a form is absent.
10. Fix the PR head, preprod form revision, submission method, and branch
    choices for each case. Derive its steps with
    [route-source-mapping.md](references/route-source-mapping.md), which also
    covers digital submission without login.
11. Write the plan following the Language rules above and
    [test-plan-model.md](references/test-plan-model.md).
12. Generate the canonical plan JSON and run:

    ```bash
    node .github/skills/manual-test-plan/scripts/render-artifacts.mjs \
      --plan <plan.json> \
      --out <artifact-directory>
    ```

    For collaboration, the renderer writes local `index.html`, not a PDF.
    Give the user its `file://` URL with `?print=1` appended, and ask them to
    open it in a browser and choose Print > Save as PDF. Keep the HTML and
    canonical JSON local; share only the reviewed PDF alongside the Trello task.

13. Read [collaborative-output.md](references/collaborative-output.md) and
    produce the output for the caller's collaboration choice. Then review it:
    - **Sensitive content:** redact or omit it before printing or asking to
      create the issue. Keep `internal` setup and evidence only in the local
      internal-instructions file; never substitute vague placeholders in
      public output.
    - **Routes:** compare every rendered step, including required actions and
      intermediate pages, with that case's source map or recorded browser
      observation. Label source-mapped routes as untested in preprod. Give the
      tester an exact observation task for an unsupported transition, mark that
      part exploratory, and keep independently supported cases as verification
      cases. Reject conditional wording for mandatory actions and unsupported
      downstream claims.
    - **Wording:** write short tester-facing sentences and limit expected
      results to the case's actual checks. Link the related "Bakgrunn for
      testene" points in each case where testers can see them without
      expanding "Om testløpet".
    - **Submissions:** handle the receipt PDF as described in
      [analysis-workflow.md](references/analysis-workflow.md).
    - **Approval:** on the GitHub issue path, show the entire rendered issue
      body before requesting approval. On the collaborative path, ask the user
      to review every page of the printed PDF, including links, steps, and
      coverage gaps, before requesting approval to share it. Do not claim a PDF
      exists merely because the HTML was rendered.
14. After a confirmed import or a form owner making a required production
    form available, read back its stored path, revision, components,
    submission methods, and conditional choices before finalizing cases.
    Update only the local plan and rendered artifacts if they differ.
    If the form or PR disagrees with the approved intent, report the
    inconsistency; do not edit the source to make it match the plan.
15. Create the issue only after explicit confirmation. With non-developers,
    wait for the user to print and review the PDF before approving its
    distribution alongside a Trello task for ownership and progress tracking.
    Do not create a GitHub issue or publish anything to GitHub Pages. Confirm
    before sharing a PDF. Only attach it to Trello if Trello access is actually
    available and the user approves the attachment; otherwise hand the
    reviewed PDF to the user for distribution. Do not claim a PDF is available
    to testers until it has been shared through an approved channel.
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
- visible links to the related background points

The plan must also include a short coverage section naming what the cases do
not test and why, separate from functionality outside the pull request.

Use [analysis-workflow.md](references/analysis-workflow.md) for expected
results, exploratory cases, regression coverage, and the repeated environment
preflight. Use [integration-evidence.md](references/integration-evidence.md)
for outbound payloads.

## Safety

- Treat the issue, PR, specifications, repository code and tests as read-only
  sources. Report inconsistencies and proposed fixes; never edit those sources
  to make the plan match. Existing Forms API definitions are read-only during
  analysis, but the skill may create `MANUALTEST-` test forms in shared preprod
  after a dry run and confirmed CREATE. An UPDATE requires explicit user
  approval and a fresh confirmed dry run. Never delete a form or silently
  replace one. Write generated definitions only to session artifacts.
- Use synthetic identities, organizations, and data for uploads, PDFs, and
  submissions in preprod; none of these needs an extra approval step.
- The team may share approved synthetic identity numbers to correlate test
  submissions. Do not put filled-in identities in a PDF or public issue.
- Give the synthetic-data reminder once at the top of the plan, not in every
  case. Do not require deleting downloaded files that contain synthetic data
  merely because they were downloaded.
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
