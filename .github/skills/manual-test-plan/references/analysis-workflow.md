# Analysis workflow

## Inputs

Ask for the issue URL or number first:

> Provide the issue for the change. If no issue exists, provide the pull request
> instead.

When the caller supplies an issue, find and inspect its implementation pull
request. Ask for the pull request when no implementation can be identified. Do
not produce an implementation test plan from the issue alone.

Accept a pull request as the starting input only when the caller says that no
issue exists. If a supplied pull request links an issue, use that issue as the
primary intent source.

Do not accept a local branch, working-tree diff, patch file, or commit range as
the only input.

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
the user or named decision owner which behavior is intended. When a pull request
has no linked issue or approved specification, summarize the inferred intent
and require user confirmation before drafting verification cases.

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

Use `fyllut-deploy-topology` when deployment or version identity matters. Use
`form-definition-loading` when the change depends on form metadata or component
fields.

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

For FyllUt in preprod and preprod-alt, use `/fyllut/api/config` and compare
`gitVersion`. In these environments it identifies the monorepo application
commit. Use repository evidence to choose the endpoint and field for another
application.

## Coverage

Prefer a compact risk-based set:

- one normal case per distinct mapping or behavior
- boundary cases introduced by the change
- directly affected legacy and modern representations
- expected failures and recovery
- a regression case for unchanged common behavior

Do not multiply cases only to cover equivalent input values. Parameterize a case
or use one scenario-driven form when the execution and expected result are the
same.

Verification cases assert confirmed intent, an established contract, or
unchanged baseline behavior. Exploratory cases may record unresolved behavior
when observation is useful, but they must say that no outcome is yet accepted
as correct and link to the open question.

Write tester-facing behavior at a functional level. Include a technical detail
only when the tester needs it to perform the action, recognize the result, or
collect useful evidence.

## Collaboration

Do not infer the output from change size or risk. Ask whether non-developers
will collaborate:

- With non-developers, produce a GitHub Pages document for instructions and a
  separate Slack Canvas file for coordination.
- Without non-developers, produce one GitHub issue document that contains both
  instructions and test tracking.
