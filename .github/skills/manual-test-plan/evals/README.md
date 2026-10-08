# Evaluation scenarios

Scenarios for manually checking this skill against real or representative
targets, following the evaluation-driven approach in the Anthropic Skill
authoring best practices. These are not an automated test suite: there is no
runner, and SKILL.md does not reference this directory, so it never loads
into context. To use a scenario, give its `query` to a fresh Claude session
with this skill available, supply the files it names if relevant, and check
the transcript against `expected_behavior`.

- `eval-issue-with-pr-developer-path.json`: an issue with an open
  implementation PR, developer-only collaboration.
- `eval-pr-without-linked-issue.json`: a PR target with no linked issue.
- `eval-non-developer-outbound-integration.json`: a non-developer plan that
  touches an outbound integration.

When a scenario reveals a gap, fix SKILL.md or the affected reference file,
then rerun the scenario to confirm.
