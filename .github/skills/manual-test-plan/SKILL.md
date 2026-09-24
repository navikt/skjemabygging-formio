---
name: manual-test-plan
description: >-
    Analyze an issue and its implementation pull request, or a pull request when
    no issue exists, and create a manual test plan for skjemabygging-formio,
    including suitable production or generated forms, environment revision
    verification, a GitHub issue, and optional GitHub Pages and Slack Canvas
    artifacts. Use only when the user explicitly invokes /manual-test-plan.
disable-model-invocation: true
---

# Manual test plan

Create an executable manual test plan for a change in this repository. Ask the
caller for the issue URL or number when an issue exists. Ask for the pull request
only when the change has no issue. Do not infer the target solely from the
current branch.

## Required workflow

1. Read [analysis-workflow.md](references/analysis-workflow.md).
2. Fetch the supplied issue, its linked specification, and its implementation
   pull request. When the caller confirms that no issue exists, fetch the
   supplied pull request. Analyze the committed pull request diff in both cases.
   Do not use an uncommitted or local-only diff as the source for a plan.
3. Invoke `frontend-development`, `backend-development`, or both before detailed
   analysis when their areas are affected. Follow any specialist routing those
   skills require.
4. Build the intent and behavior matrix in
   [analysis-workflow.md](references/analysis-workflow.md).
5. Resolve contradictions and undocumented decisions before writing
   verification cases. When no issue or approved specification exists, ask the
   user to confirm the inferred intent.
6. Identify observable behavior, regression risk, integrations, environments,
   failure paths, and evidence that proves each expected result.
   Read [integration-evidence.md](references/integration-evidence.md). Do not
   generate verification cases for an outbound integration until its concrete
   approved evidence method is known.
7. Record the exact head commit and establish a revision check for the target
   application using [analysis-workflow.md](references/analysis-workflow.md).
8. Use `ask_user` to ask: "Skal ikke-utviklere samarbeide om testingen?" Use
   the choices "Ja" and "Nei". Do not infer the answer from case count or risk.
9. Read [form-selection.md](references/form-selection.md). Check Forms API in
   preprod before choosing forms. Reuse a suitable form when one exists.
   Otherwise design and validate the smallest useful generated form set.
   Prefer one clear selector-driven form for related cases. Tell the caller
   which forms will be created or updated and wait for confirmation.
10. Write the plan in Norwegian using terms from FyllUt, Bygger, the form, and
    the issue. Follow [test-plan-model.md](references/test-plan-model.md).
11. Generate the canonical plan JSON and run:

    ```bash
    node .github/skills/manual-test-plan/scripts/render-artifacts.mjs \
      --plan <plan.json> \
      --out <artifact-directory>
    ```

    When generating HTML and Slack Canvas, supply `--page-url` if the Pages
    URL differs from the default `https://<owner>.github.io/<repo>/manual-tests/<slug>`.
    Publication checks the URL against the Pages site and manifest slug.

12. Read [collaborative-output.md](references/collaborative-output.md) and
    produce the output for the caller's collaboration choice.
13. Review public artifacts for sensitive content and redact or omit it before
    asking once whether to publish the HTML or create the issue. Keep
    `internal` setup and evidence only in the local internal-instructions file;
    never substitute vague placeholders in public output.
14. For approved form changes, follow
    [forms-api-import.md](references/forms-api-import.md) and use each script's
    operation-bound confirmation. Do not ask again about the full form list.
15. Use the scripts to publish the page or create the issue after the one
    publication confirmation. Require maintainer approval before enabling
    public Pages. Never publish Canvas or form definitions to `gh-pages`.

## Output requirements

Every test case must include:

- stable case ID and group
- verification or exploratory mode
- links to the behaviors it covers
- purpose and priority
- prerequisites and any required test-user attributes
- numbered actions with an expected result for each meaningful step
- evidence to retain
- cleanup when the case changes shared state
- the production or generated form used

Use [analysis-workflow.md](references/analysis-workflow.md) for expected
results, exploratory cases, regression coverage, and the repeated environment
preflight. Use [integration-evidence.md](references/integration-evidence.md)
for outbound payloads.

## Safety

- Use synthetic identities and organizations approved for testing.
- Never put access tokens, cookies, secrets, personal data, private source
  content, or security-sensitive details in generated artifacts.
- This repository is public. Pages would be public if enabled. Follow the
  review and maintainer-approval gate in
  [collaborative-output.md](references/collaborative-output.md).
- `preprod` and `preprod-alt` share the same Forms API instance. Form creates,
  imports, updates, and deletions affect both.
- Do not import a form, create an issue, or push `gh-pages` without explicit
  confirmation.
- Never put full generated form definitions on GitHub Pages or in a GitHub
  issue. Keep them in the session artifact directory.
- Keep generated plans in the session artifact directory unless the caller
  explicitly requests repository files.

Run script tests locally with
`pnpm exec vitest run .github/skills/manual-test-plan/scripts/*.test.mjs bin/forms-api/*.test.mjs`.
They are intentionally not included in CI.
