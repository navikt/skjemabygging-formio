# Prototype validation

Use this only after a complete specification or plan brief exists. The
prototype tests the draft before handoff; it does not replace discovery or
become production code.

## Define the check

State in one sentence what the prototype must verify. Tie it to named
requirements, decisions, or journeys from the draft.

Choose no more than three representative scenarios:

- the main successful journey;
- one meaningful alternate state;
- one failure or recovery state.

If the question cannot be judged through interaction or observable state, stop
and continue without a prototype. Policy, content ownership, permissions, and
other stakeholder decisions need their owners, not a mock-up.

## Build the smallest useful artifact

Create the prototype as a temporary session artifact, not production code.
Keep it outside the repository unless using the real application is necessary
to answer the question.

- For UI and form journeys, create a clickable view containing only the
  affected surface and scenarios.
- For logic or state behavior, create a simple interactive walkthrough that
  shows the current state after each action.
- For technical feasibility, build only enough of a spike to prove or disprove
  the disputed design constraint.

Use realistic labels, content, and data density where they affect the verdict.
Mock integrations and keep state in memory. Do not add persistence, tests,
abstractions, production error handling, or unrelated polish.

Mark the artifact clearly as a disposable prototype and provide one simple way
to run or open it.

## Present it to the user

For an interactive prototype, use a browser as the default presentation:

1. Start the prototype on an automatically selected free localhost port.
2. Verify that the prototype responds before presenting it.
3. Open the URL in the user's default browser when the environment supports it.
4. Also print the full URL so the user can reopen it.
5. Keep the server running until the user records a verdict.

If the prototype needs the real fyllut or bygger application, use the
`start-dev-servers` skill and provide the exact prototype route. Otherwise,
prefer a standalone HTML prototype served from the session folder.

For a non-visual technical spike, present the runnable command and a short
result view that shows the evidence for the disputed constraint. Do not ask the
user to inspect source code to understand the result.

## Collect the verdict

Show the artifact and use `ask_user` to record one result:

- **Validated:** the draft describes the intended behavior or design.
- **Revise:** the prototype exposed a wrong or missing decision.
- **Inconclusive:** the prototype did not answer the question.

Ask for the smallest explanation needed to understand a revision or
inconclusive result.

## Return to the specification

- For **Validated**, record the question, scenarios, and verdict in the
  relevant requirements, decisions, or notes. Do not claim broader validation.
- For **Revise**, reopen the affected discovery branch, update the draft, and
  check related requirements and acceptance criteria for contradictions.
- For **Inconclusive**, record what remains unknown and whether it blocks the
  issue or plan handoff.

After the verdict, stop the prototype server using its recorded process ID.
Remove temporary prototype files unless the user asks to keep them. Never merge
prototype code into the production change.
