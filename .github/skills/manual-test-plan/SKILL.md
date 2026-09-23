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
4. Establish intended behavior independently from the implementation. Build the
   behavior matrix required by
   [analysis-workflow.md](references/analysis-workflow.md). Never treat the code
   diff as proof of intent.
5. Resolve contradictions and undocumented decisions before writing
   verification cases. When no issue or approved specification exists, ask the
   user to confirm the inferred intent.
6. Identify observable behavior, regression risk, integrations, environments,
   failure paths, and evidence that proves each expected result.
7. Record the exact head commit under test and add a preflight check against the
   target environment's config endpoint. Do not add deployment steps; deployment
   is the developer's responsibility.
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

12. Read [collaborative-output.md](references/collaborative-output.md). When
    non-developers will collaborate, generate a GitHub Pages document and a
    separate Slack Canvas file for the caller to paste into Slack. Otherwise
    generate one GitHub issue document that combines instructions and tracking.
13. Review every generated artifact for internal or sensitive content. Ask
    separately whether each artifact should be redacted, omitted, or published.
14. Ask before importing or updating each generated form. Follow
    [forms-api-import.md](references/forms-api-import.md).
15. Ask before publishing the HTML artifact or creating the GitHub issue. Use
    the provided scripts. Never publish the Canvas file or form definitions to
    `gh-pages`.

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

Expected results in verification cases must come from confirmed intent, an
established contract, or unchanged baseline behavior. Never copy an outcome
from the implementation and present it as correct.

Use an exploratory case when behavior remains unresolved but observing it will
help the decision. State what to record without claiming one result is correct.
Do not use exploratory cases to avoid asking a blocking intent question.

Start every plan with a prominent preflight check that compares the deployed
revision with the exact commit under test. Stop testing on a mismatch.
Present this as a reminder, not a completion checkbox. The tester must repeat it
whenever testing resumes because another deployment may have replaced the
expected revision.

Keep the revision check in a preflight section before setup and test execution.
Setup includes production-form imports, generated-form imports, accounts,
feature flags, and test data. Assume the tester can log in with an arbitrary
test user. Include test-user setup only when a case requires specific
attributes. Do not include instructions for deploying the application to
preprod, preprod-alt, or another environment.

Do not treat a successful page load, HTTP status, or receipt as proof when the
changed behavior is an outbound payload or generated document. State how the
tester can observe the actual mapped value. Use logs only when they are safe and
already available; never ask testers to log form answers or personal data.

## Safety

- Use synthetic identities and organizations approved for testing.
- Never put access tokens, cookies, secrets, personal data, private source
  content, or security-sensitive details in generated artifacts.
- This repository and its GitHub Pages site are public.
- Before publication, ask about each artifact independently: redact, omit, or
  publish unchanged.
- `preprod` and `preprod-alt` share the same Forms API instance. Form creates,
  imports, updates, and deletions affect both.
- Do not import a form, create an issue, or push `gh-pages` without explicit
  confirmation.
- Never put full generated form definitions on GitHub Pages or in a GitHub
  issue. Keep them in the session artifact directory.
- Keep generated plans in the session artifact directory unless the caller
  explicitly requests repository files.
