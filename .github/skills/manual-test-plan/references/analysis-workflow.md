# Analysis workflow

## Inputs

First read the skill invocation's `ARGUMENTS` and any target in the caller's
message. Ask only if neither contains a target:

> Provide the issue or pull request for the change.

Issues and pull requests share one number sequence. Resolve a bare number with
`gh api repos/navikt/skjemabygging-formio/issues/<number> --jq 'has("pull_request")'`:
`true` is a pull request, `false` an issue. Accept an issue or pull request
URL directly. If the lookup fails, ask the caller what the number refers to
rather than guessing.

When the caller supplies an issue, inspect its linked pull requests and search
the repository's **open** pull requests for the issue number, URL, and related
terms before searching merged pull requests. Check the PR body and diff to
confirm that it implements the issue; a mention alone does not establish that
link. Search merged pull requests only if no matching open implementation PR
exists. If several plausible PRs remain, ask the caller which one to test.
Ask for the PR when no implementation can be identified. Do not produce an
implementation test plan from the issue alone.

A pull request is a valid starting input whether or not an issue exists, but
always check whether one does. Never conclude "no issue" from the PR body alone.
Look in:

- the PR's closing references
  (`gh pr view <number> --json closingIssuesReferences,body,title,headRefName`)
- issue numbers and URLs in the PR title, body, branch name, review comments,
  and commit messages
- issues that mention the PR, from the timeline
  (`gh api repos/navikt/skjemabygging-formio/issues/<number>/timeline`) and
  `gh issue list --repo navikt/skjemabygging-formio --state all --search '<PR number or URL>'`
- open and closed issues matching the PR's title and terms, when the sources
  above give no candidate

A mention alone does not establish that the PR implements the issue; compare
the issue's criteria with the PR description and diff. If a confirmed issue is
found, use it and its specification as the primary intent source and record it
as `source.issue`. If several issues are plausible, or a candidate is only
weakly related, ask the caller which one describes the intent to test. Tell the
caller which sources you checked. Only when none is found, continue from the PR
alone: treat the PR description as unconfirmed intent and confirm the inferred
intent with the caller before writing verification cases.

Do not accept a local branch, working-tree diff, patch file, or commit range as
the only input. Read the committed PR diff and any affected file content at
its head commit through GitHub. The local checkout may be on another branch
and may not contain the changed files; do not substitute its contents for the
PR head.

For the implementation pull request, read:

- title, body, labels, review discussion, base and head refs
- linked issues and specifications
- committed diff against the PR base
- changed and existing automated tests
- commit history when it explains why the current diff changed

Do not assume any single source is complete or current. The issue, PR body,
review comments, commit messages, tests, and implementation can disagree.

Resolve the exact head commit to test. Plans are not valid with only a branch
name because the branch can move after the plan is written.

## Establish intent before expected results

This is the core rule: derive expected results from confirmed intent, not from
the implementation diff.

Use sources for distinct purposes:

- Issues, approved specifications, acceptance criteria, and explicit product
  decisions are evidence of intent.
- The base revision establishes previous behavior.
- The pull request head establishes implemented behavior.
- Existing tests and external contracts establish behavior the system already
  promises, but a new or changed test does not prove new product intent.
- Review comments and commit messages can explain a decision. They are
  historical evidence, not authority by themselves.

Check the timestamp and context of review comments and commits. Determine
whether later commits, replies, resolved or outdated threads, edited
descriptions, or newer decisions supersede them. Never resurrect an abandoned
suggestion merely because it remains in the history.

When sources conflict, do not silently choose one. Record the conflict and ask
the user or named decision owner which behavior is intended.

Compare each issue criterion with the committed PR head. Record what this PR
actually implements and what remains for later work in `scope.included` and
`scope.excluded`. Do not present later work as covered by this deployment.
When the PR description and committed behavior differ, flag the discrepancy
and ask for a decision before labeling the behavior aligned.

Before choosing forms or drafting test cases, share a short, provisional
testing scope with the user. Identify the PR behavior to test, issue criteria
outside this PR, directly affected regression paths, relevant edge cases,
and assumptions or unresolved questions. Distinguish what the sources say
from what you inferred. Present this scope in a freeform `ask_user` question
asking what the user would correct or add. Wait for their answer even if the
issue and PR seem complete. Incorporate their context into the scope and
behavior matrix. If it conflicts with the issue or committed PR, clarify
the intended behavior rather than silently replacing either source. If the
user has nothing to add, continue with the proposed scope. For a PR without
an issue or approved specification, explicitly confirm inferred intent before
writing verification cases.

## Build a behavior matrix

Create this matrix before selecting test cases:

| Behavior            | Before        | Intended after                 | Implemented after | Evidence          | Confidence           | Status                                      |
| ------------------- | ------------- | ------------------------------ | ----------------- | ----------------- | -------------------- | ------------------------------------------- |
| Observable behavior | Base behavior | Confirmed intent or unresolved | Head behavior     | Source references | High, medium, or low | Aligned, suspected defect, or open question |

Use `suspected defect` when implemented behavior conflicts with confirmed
intent. A verification case may assert that confirmed intent and expose the
defect. Use `open question` when intent is missing or contradictory; do not turn
it into a verification case with an invented expected result.

## Trace behavior

For each changed behavior:

1. Locate the user or operator entry point.
2. Trace data through frontend, backend, shared packages, and integrations.
3. Note feature flags, authentication modes, submission methods, loading paths,
   and environment-specific behavior.
4. Find existing automated tests. Manual cases should cover observable risk that
   automation does not already prove, or provide deployment confidence for a
   high-risk path.
5. Define concrete evidence. Examples include PDF content, a response payload,
   an integration request visible through an approved tool, UI state, or a
   persisted draft after reload.
6. Read the affected form labels, application text, and Norwegian translations.
   Reuse those terms in tester-facing instructions instead of exposing internal
   type, function, or field names.

Reconstruct the full ordered route for each case, not once per form. Follow
the route-mapping rules (loaded in workflow step 10) for how to map routes,
mark them `source-mapped`, and handle transitions the sources leave unknown.
For a generated form, inspect its exact JSON in the session artifact directory
and follow the Forms API import rules (loaded in workflow step 9) to dry-run
and create it (or explicitly approve an update), then read it back before
sharing the plan.
If the imported form differs, report the discrepancy rather than editing
repository sources.

Use source maps and recorded browser observations to establish what testers
must do. Derive expected results from the issue, approved specification, or
established baseline contract, including when observed behavior differs from
confirmed intent.

For each step, name the page, field, document, or status the tester should
actually see. Keep the route complete, but assess only outcomes relevant to the
case. Navigation steps may have no expected result when the next action already
names the page. Use short, natural sentences, and remove repeated setup and
explanation that does not help the tester act or judge the result.

The receipt offers a downloadable PDF of the submitted application. For each
submission case, decide whether its visible contents matter to the behavior
being tested. When they do, have the tester download and inspect the relevant
pages and values, and check a cover page separately when it matters. When the
PDF is out of scope, briefly say that neither receipt nor PDF proves downstream
registration. A PDF shows submitted values, not the full request payload or
downstream roles. For log or Joark checks, name the specific roles and values
to compare; if the tester can only hand off details, say the downstream result
remains pending.

Use `fyllut-deploy-topology` when deployment or version identity matters. Use
`form-definition-loading` when the change depends on form metadata or component
fields.

If an expected result mentions the identity used by `innsending-api`, the
upload session, or another downstream system, verify the request through an
approved integration method. A receipt proves only the receipt and observable
UI state, not the downstream request body.

Use the integration-evidence rules (loaded in workflow step 7) for every
outbound integration. Require a concrete approved evidence method for each one. If none
is documented, ask the caller to choose or provide the method and inspection
owner before writing verification cases. Do not replace a missing method with
vague instructions such as "check locally" or "verify in logs".

Trace changed shared functions, types, configuration, and integration contracts
to their callers and consumers. Add regression candidates for unchanged flows
that use the affected path. Prioritize cases where the same code handles
different form types, submission modes, identities, environments, or failure
conditions.

## Environment preflight

The developer owns deployment. Do not put deployment workflow steps in the
test plan.

Give the tester one short preflight check instead:

1. Open or query the environment's config endpoint.
2. Read the field that identifies the application revision.
3. Compare it with the exact pull request head commit recorded in the plan.
4. Stop and contact the developer when it differs.

The manual deploy workflow `.github/workflows/manual-deploy.yaml` has separate
`preprod` and `preprod-alt` targets; its default is not evidence of where the
PR is deployed. Find the successful run that deployed the PR head and its
selected environment. Cross-check the live `/fyllut/api/config` `gitVersion`
on that environment against the exact PR head. Use its matching intern and
ansatt ingresses in the plan. If runs are unavailable, ambiguous, or neither
environment reports the head, ask the user which environment to target and
whether deployment is still pending. Do not silently choose an environment
or describe an earlier revision as the PR. Recheck the revision before each
test session; if the environment changed, stop and confirm deployment again.
In these environments `gitVersion` identifies the monorepo application
commit. Bygger's `/api/config` does not expose a revision field
(`packages/bygger-backend/src/routers/api/config.ts`). Its backend reads
`GIT_SHA`, but that value is not available from the config response. For
Bygger-specific testing, ask the developer for an approved, observable method
to identify the deployed application commit. Do not use FyllUt's version as
evidence of a Bygger deployment or generate a Bygger plan without a reliable
preflight method.

## Coverage

Prefer a compact risk-based set:

- one normal case per distinct mapping or behavior
- boundary cases introduced by the change
- directly affected legacy and modern representations
- expected failures and recovery
- a regression case for unchanged common behavior

Inspect edge cases for each changed behavior: empty and invalid input,
conditional branches, boundaries, interrupted or failed integrations, and
retries where relevant. Include cases when they expose a distinct risk.
Otherwise record the gap and a concrete reason in `scope.notCoveredByTests`.
Keep this separate from `scope.excluded`, which lists work outside the PR.
Always render a short coverage section, even when there are no known gaps.

Do not multiply cases only to cover equivalent input values. Parameterize a case
or use one scenario-driven form when the execution and expected result are the
same.

Verification cases assert confirmed intent, an established contract, or
unchanged baseline behavior. Exploratory cases are fine when observation is
useful. Give precise actions, branch choices, and what to record; let testers
assess what they see rather than prescribing every judgment. Do not label an
unconfirmed outcome as accepted or invent a route. Link unresolved intent to
the open question.

Write tester-facing behavior at a functional level. Include a technical detail
only when the tester needs it to perform the action, recognize the result, or
collect useful evidence.

For collaboration output, follow the delivery rules for the chosen path
(workflow steps 14-15 and their path sections).
