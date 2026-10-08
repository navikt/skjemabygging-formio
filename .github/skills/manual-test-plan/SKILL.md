---
name: manual-test-plan
description: >-
    Analyze an issue and its implementation pull request, or a pull request
    directly (with or without a linked issue), and create a manual test plan
    for skjemabygging-formio,
    including suitable production or generated forms, environment revision
    verification, and a GitHub issue, local HTML for a PDF printed by the
    user, or both for developer-only testing, or local HTML for a printed PDF
    when testing with non-developers.
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
its type. Only if `ARGUMENTS` and the user's message contain no target, ask
for an issue or pull request. A pull request needs no issue, but the skill
checks for one. Do not infer the
target solely from the current branch.

## Terms

- **User**: the person running this skill.
- **Target issue** / **target pull request**: the issue or pull request given
  as `ARGUMENTS`, under analysis. **Test-plan issue**: the GitHub issue this
  skill creates to deliver the plan on the developer path. Where context
  already makes the distinction obvious, this file says "the issue" for
  brevity.
- **Test case**: any case in the plan. **Verification case**: a case that
  asserts a specific expected result. **Exploratory case**: a case where the
  tester records what they observe instead of asserting a fixed result.

## Language

- Tester-facing HTML and GitHub issue content, including the plan fields they
  render, is in Norwegian, using terms from FyllUt, Bygger, the form, and the
  issue.
- Questions to technical users, `internal` setup and evidence fields, local
  instructions, documentation, and code are in English.

## Required workflow

Copy this checklist and check off steps as you complete them:

```
Test plan progress:
- [ ] 1. Read analysis-workflow.md
- [ ] 2. Resolve the target and analyze the committed PR diff
- [ ] 3. Invoke frontend-development / backend-development if affected
- [ ] 4. Build the intent and behavior matrix
- [ ] 5. Present scope and confirm it with the user
- [ ] 6. Ask the collaboration question (branch point)
- [ ] 7. Identify behavior, risk, integrations, evidence
- [ ] 8. Record the head commit and target environment
- [ ] 9. Select or create forms
- [ ] 10. Map case routes
- [ ] 11. Write the plan
- [ ] 12. Render the plan artifacts
- [ ] 13. Read back any imported/created form before finalizing cases
- [ ] 14. Follow the chosen path's delivery steps below
```

1. Read [analysis-workflow.md](references/analysis-workflow.md).
2. For an issue target, fetch the issue and its linked specification, and find
   its implementation pull request using the open-first search in
   [analysis-workflow.md](references/analysis-workflow.md). For a pull request
   target, fetch the pull request and search for the issue it implements
   using the checks in [analysis-workflow.md](references/analysis-workflow.md);
   continue without an issue only when none is found. Analyze
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
   Use the choices "Yes" and "No". Do not infer the answer from case count or
   risk. This choice selects the path you follow below: "Yes" is the
   **non-developer path**, "No" is the **developer path**. On the developer
   path, do not ask about the output format here; ask at delivery.
7. Identify observable behavior, regression risk, integrations, environments,
   failure paths, and evidence that proves each expected result.
   Read [integration-evidence.md](references/integration-evidence.md). Do not
   generate verification cases for an outbound integration until its concrete
   approved evidence method is known. Treat claims about downstream identity
   and upload sessions as integration claims, not UI receipt checks. For
   submissions, show the team-log and Joark options separately. Add a
   no-access handoff option on the non-developer path; omit it on the
   developer path. Do not mark a handoff or a success log as payload
   verification.
8. Record the exact head commit and head branch. Determine whether the PR is
   deployed to `preprod` or `preprod-alt` from deployment evidence and the
   live `git-branch` check in
   [analysis-workflow.md](references/analysis-workflow.md). Use the
   environment carrying the PR. If this is unclear, ask the user which
   environment to target before choosing forms or writing cases. Never default
   to `preprod` just because the deploy workflow does. Testers check the
   deployed branch, not the commit, so later fixes on the same branch do not
   require a new plan.
9. Read [form-selection.md](references/form-selection.md). Check Forms API in
   preprod before choosing forms. Prefer a suitable production form and treat
   its production definition as the reference: when the preprod copy differs,
   ask the user to import the production form through Bygger rather than
   testing the outdated copy. When no production form suits, design the
   smallest useful generated form set in the session artifact directory,
   preferring one selector-driven form for related cases. Tell the user
   which forms will be reused, imported, created, or need updating. Create
   `MANUALTEST-` forms only as described in
   [forms-api-import.md](references/forms-api-import.md), following the
   create/update rules in Safety below. A failed lookup is not
   proof that a form is absent.
10. Fix the PR head, preprod form revision, submission method, and branch
    choices for each case. Derive its steps with
    [route-source-mapping.md](references/route-source-mapping.md), which also
    covers digital submission without login. Write fill steps in the order
    `bin/forms-api/form-flow.mjs` prints for the case's fills, after it reports
    no errors.
11. Write the plan following the Language rules above and
    [test-plan-model.md](references/test-plan-model.md).
12. Generate the canonical plan JSON and run:

    ```bash
    node .github/skills/manual-test-plan/scripts/render-artifacts.mjs \
      --plan <plan.json> \
      --out <artifact-directory>
    ```

    This writes `github-issue.md` on the developer path, or `index.html` on
    the non-developer path, plus `internal-instructions.md` and
    `manifest.json` in both cases. On the developer path, `--format html` or
    `--format both` renders `index.html` instead of or alongside the issue;
    use it only after the delivery choice below. See the delivery steps for
    your path below for how to turn this output into a shared artifact.

13. After a confirmed import or the user importing a required production
    form, read back its stored path, revision, components,
    submission methods, and conditional choices before finalizing cases.
    Update only the local plan and rendered artifacts if they differ.
    If the form or PR disagrees with the approved intent, report the
    inconsistency; do not edit the source to make it match the plan.
14. Review the rendered output before delivery, on either path:
    - **Sensitive content:** redact or omit it before sharing. Keep `internal`
      setup and evidence only in `internal-instructions.md`; never substitute
      vague placeholders in public output.
    - **Routes:** compare every rendered step, including required actions and
      intermediate pages, with that case's source map or recorded browser
      observation. Label source-mapped routes as untested in preprod. Give
      the tester an exact observation task for an unsupported transition,
      mark that part exploratory, and keep independently supported cases as
      verification cases. Reject conditional wording for mandatory actions
      and unsupported downstream claims.
    - **Wording:** write short tester-facing sentences and limit expected
      results to the case's actual checks. Link the related "Bakgrunn for
      testene" points in each case where testers can see them without
      expanding "Om testløpet".
    - **Submissions:** handle the receipt PDF as described in
      [analysis-workflow.md](references/analysis-workflow.md).
    - **Coverage:** check the coverage section against the behavior matrix,
      edge cases, failure paths, and regression candidates.
15. Follow the delivery steps for the path chosen in step 6.

### Developer path: GitHub issue, HTML, or both

Read [collaborative-output.md](references/collaborative-output.md) ("Without
non-developers" and "Review before sharing").

1. After the step 14 review, and before showing or creating any issue, use
   `ask_user` to ask: "How should the test plan be delivered?" Use the
   choices "GitHub issue", "HTML for printing to PDF", and "Both". Do not
   ask this earlier in the workflow.
2. For "HTML for printing to PDF" or "Both", rerender into the same artifact
   directory with `--format html` or `--format both`. The manifest removes a
   `github-issue.md` that is no longer requested.
3. For a GitHub issue ("GitHub issue" or "Both"):
    1. Show the user the entire rendered test-plan issue title and body and
       request approval before creating anything.
    2. Run a dry run first, then create the test-plan issue only after
       explicit confirmation:

        ```bash
        node .github/skills/manual-test-plan/scripts/create-issue.mjs \
          --repo navikt/skjemabygging-formio \
          --title '<issue-title>' \
          --body <artifact-directory>/github-issue.md
        ```

    3. Share the test-plan issue URL only after it has been created.
4. For HTML ("HTML for printing to PDF" or "Both"), follow steps 1 and 2 of
   the non-developer path: give the `file://` URL with `?print=1` and ask the
   user to review every page of the printed PDF. Hand the reviewed PDF to the
   user for distribution. Do not publish it to GitHub Pages.
5. Give the user local links to the generated files and the canonical plan.

### Non-developer path: printed PDF

Read [collaborative-output.md](references/collaborative-output.md) ("With
non-developers" and "Review before sharing").

1. The renderer writes local `index.html`, not a PDF. Give the user its
   `file://` URL with `?print=1` appended, and ask them to open it in a
   browser and choose Print > Save as PDF. The print URL expands all
   sections, including alternative integration checks.
2. Ask the user to review every page of the printed PDF, including long
   cases, links, and page breaks. Do not claim a PDF exists merely because
   the HTML was rendered.
3. Request explicit approval before sharing. Share only the reviewed PDF
   alongside a Trello task for ownership and progress tracking, through an
   approved channel. Only attach it to Trello if Trello access is actually
   available and the user approves the attachment; otherwise hand the
   reviewed PDF to the user for distribution.
4. Never create a GitHub issue or publish anything to GitHub Pages for this
   path. Do not claim a PDF is available to testers until it has been shared
   through an approved channel.
5. Give the user local links to `index.html` and the canonical plan.

## Scripts

These scripts are executed, not read for logic:

- `scripts/render-artifacts.mjs --plan <plan.json> --out <dir> [--format <issue|html|both>]`:
  validates the canonical plan against `plan.schema.json`, then writes
  `github-issue.md`, `index.html`, or both (see step 12), plus
  `internal-instructions.md` and `manifest.json`. The format defaults to
  `html` with non-developers and `issue` otherwise; plans with non-developers
  accept only `html`.
- `scripts/create-issue.mjs --repo <owner/name> --title <title> --body <path>`:
  dry run by default; add `--apply --confirm '<token from the dry run>'` to
  create the test-plan issue. Developer path only.
- `bin/forms-api/inspect-preprod-forms.mjs --query '<title-or-number>'` or
  `--path '<form-path>'`: reads a form from preprod Forms API without exposing
  the token or full definition. See [form-selection.md](references/form-selection.md).
- `bin/forms-api/import-form.mjs --form <form.json>`: dry run by default; add
  `--apply --confirm '<operation>'` to create, or `--replace-existing` first
  to update. See [forms-api-import.md](references/forms-api-import.md).
- `bin/forms-api/form-flow.mjs --path '<form-path>' [--fills <fills.json>]`
  (or `--form <file>`): prints pages, fields, and conditionals, or checks a
  case's fill sequence against form order and conditionals. Exits 1 when the
  sequence has errors. See [route-source-mapping.md](references/route-source-mapping.md).
- `pnpm test:skills`: runs this skill's and the Forms API tools' own tests.
  Run it after changing any script in this skill; CI runs it in
  `build-and-test.yaml`.

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

- Treat the target issue, PR, specifications, repository code and tests as
  read-only sources. Report inconsistencies and proposed fixes; never edit
  those sources to make the plan match. Existing Forms API definitions are
  read-only during analysis, but the skill may create `MANUALTEST-` test
  forms in shared preprod after a dry run and confirmed CREATE. An UPDATE
  requires explicit user approval and a fresh confirmed dry run. Never delete
  a form or silently replace one. Write generated definitions only to
  session artifacts.
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
  [collaborative-output.md](references/collaborative-output.md). Create the
  test-plan issue, or share the PDF, only as described in the delivery path
  sections above; never do either without the explicit confirmation they
  require.
- Never put full generated form definitions in HTML, a PDF, or GitHub issue.
  Keep them in the session artifact directory.
- Keep generated plans in the session artifact directory unless the user
  explicitly requests repository files.
