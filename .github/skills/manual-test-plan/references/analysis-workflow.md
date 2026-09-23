# Analysis workflow

## Inputs

Require one pull request or issue URL or number. If the caller supplies an issue,
find its implementation pull request or ask for it when no implementation can
be identified. If the caller supplies a pull request, read:

- title, body, labels, review discussion, base and head refs
- linked issues and specifications
- committed diff against the PR base
- relevant uncommitted changes in the current worktree

Do not assume the PR description is complete. Use it to understand intent and
the diff to establish actual behavior.

Resolve the exact head commit to test. Plans are not valid with only a branch
name because the branch can move after the plan is written.

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

Use `fyllut-deploy-topology` when deployment or version identity matters. Use
`form-definition-loading` when the change depends on form metadata or component
fields.

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

## Significance

Generate collaborative artifacts when the plan would benefit from shared
ownership or durable execution records. Signals include:

- high operational, privacy, submission, PDF, or integration risk
- several independent case groups
- more than one environment or external system
- several expected testers
- setup that changes shared state
- results that require coordination or retained evidence

State why collaborative artifacts are or are not warranted.
