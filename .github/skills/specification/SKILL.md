---
name: specification
description: >-
  Create a functional or technical specification for fyllut or bygger, then
  publish it as a GitHub issue or hand it to Copilot plan. Use only when the
  user explicitly invokes /specification.
disable-model-invocation: true
---

# Specification

Use this skill to create one of two documents:

- A **functional specification** defines who needs a change, why they need it,
  and what the product must do.
- A **technical specification** defines how approved behavior will fit the
  existing system.

Keep the modes separate. Both use the workflow below.

## Start

Ask one question at a time with `ask_user`.

1. **Choose the mode.** Always ask whether the user wants a functional or
   technical specification, even when the prompt suggests one.
2. **Get the topic.** If no change or problem was provided, ask:

   > What would you like to specify? A rough description is enough.

3. **Frame the work.** Investigate the current state, then summarize the
   problem, outcome, and boundary. Ask the user to correct the framing.

## Discovery method

- **Find facts; ask for decisions.** Read documentation, code, tests, current
  behavior, terminology, issue conventions, and prior art. Do not ask the user
  for facts available through tools.
- **Follow dependencies.** Ask only a decision whose prerequisites are settled.
  Reassess the remaining questions after each answer.
- **Ask one decision at a time.** Number questions continuously. Do not combine
  decisions in one field.
- **Give a recommendation.** State a preferred option and a short reason. It is
  advice, not an assumed answer.
- **Accept uncertainty.** "I don't know" is valid. If research, a prototype,
  user testing, policy, content, or another owner is needed, stop that branch
  and record the dependency.
- **Name the owner.** For an external decision, record who must answer, what
  they must decide, what it affects, and when it is needed.
- **Use consistent terms.** Resolve vague or overloaded language before using
  it in the document.
- **Track status.** Separate verified facts, confirmed decisions, accepted
  assumptions with risks, and open questions.

Use this question format:

```md
**Question Q<n> — <title>**
<Why the decision matters.>

**Recommendation:** <choice and reason>
```

Do not draft while a blocking question remains.

## Writing standard

Write for people who need to understand and act quickly.

- Use short sentences, familiar words, and concrete verbs.
- State decisions directly.
- Keep each bullet, requirement, criterion, and table row to one idea.
- Use bullets and tables only when they improve scanning.
- Do not repeat a point unless repetition adds useful traceability.
- Do not invent benefits, risks, or requirements to fill a section.
- Avoid filler such as "seamless", "robust", "flexible", "intuitive",
  "appropriate", "comprehensive", "leverage", and "best practice".
- Use "Not applicable" with a short reason when a required section does not
  apply.

Before approval, remove repetition, vague wording, irrelevant detail, long
sentences, and unnecessary formality. The document must stand on its own
without the discovery conversation.

## Functional mode

### Audience and scope

Write for functional architects and designers. Use plain product language.
Discuss users, tasks, journeys, business rules, content, states, and recovery.

When the request proposes a component, API, field type, or other technical
solution, first establish:

1. who needs it;
2. what they cannot do today;
3. what successful behavior looks like;
4. why the current product is insufficient.

Treat the proposed solution as context, not as an approved requirement.

Do not ask the user to choose internal components, APIs, schemas, storage,
algorithms, timeouts, event timing, expression syntax, or safeguards. Ask for
observable behavior and leave implementation to technical planning.

### Discovery

Confirm:

- affected users and their goal;
- current behavior and problem;
- product surface and entry point;
- desired outcome and success signal.

Use the
[functional discovery question bank](references/functional-discovery-question-bank.md)
selectively. Use concrete examples when a broad answer hides ambiguity.

When frontend behavior is affected, invoke `frontend-development` before asking
detailed questions. Treat its Aksel, accessibility, form interaction, and
validation defaults as verified constraints rather than user decisions. An
Aksel name may identify the affected surface, but it must not prescribe
implementation.

When backend or API behavior is affected, invoke `backend-development` before
asking detailed questions. Treat its package, boundary, error handling,
security, observability, and testing defaults as verified constraints rather
than user decisions. Continue to ask about feature-specific behavior and API
contracts that are not already defined.

### Ready to draft

Draft when:

- users, problem, journey, scope, and outcome are clear;
- normal, alternate, and recovery behavior is decided;
- relevant conditions have observable outcomes;
- content owners, dependencies, and unchanged behavior are known;
- no blocking functional question remains.

Technical questions do not block this document. List them for technical
planning. After a substantial interview, ask if a user, journey, rule, or
consequence is missing.

### Specification format

```md
# <Outcome-oriented title>

## Context and problem
<Affected users, their goal, and the current problem.>

## Goal and success
<Required outcome and success signal.>

## Scope
### Included
- <Capability or journey change>

### Not included
- <Boundary>

## Users and permissions
| User or role | Need | Access or restriction |
| --- | --- | --- |
| <role> | <need> | <restriction> |

## User journeys and behavior
### <Journey>
1. <Starting context>
2. <User action>
3. <Product behavior>
4. <Completion or recovery>

## Functional requirements
1. **FR-1:** <Observable behavior and conditions.>

## Design and content
<Required experience and content.>

## Accessibility requirements
- <Observable WCAG 2.2 AA requirement.>

## Edge cases and recovery
| Situation | Required behavior | Recovery or information |
| --- | --- | --- |
| <situation> | <behavior> | <recovery> |

## Dependencies and constraints
- <Product dependency or constraint.>
- <Topic for technical planning.>

## Assumptions and open questions
- **Accepted assumption:** <Basis, risk, and owner.>
- **Non-blocking question:** <Decision, owner, and deadline.>

## Acceptance criteria
- [ ] **AC-1 (FR-1):** <Normal outcome.>
- [ ] **AC-2 (FR-1):** <Alternate or failure outcome.>
- [ ] **AC-3 (Accessibility):** <Accessibility outcome.>
```

Requirements must remain useful if the implementation changes.

## Technical mode

### Audience and scope

Write for developers. Use precise engineering language and inspect the
repository before recommending a design.

Identify the functional basis first: an approved specification, issue, explicit
requirement, or verified existing behavior. Do not hide unresolved product
behavior inside a technical decision. Pause and recommend functional discovery
when needed.

Follow `AGENTS.md`. Invoke `frontend-development` for frontend work and
`backend-development` for backend work before asking design questions. Treat
their established package, interaction, boundary, error, security,
observability, and testing rules as constraints. Do not repeat those rules in
the technical specification; describe only how the proposed design applies
them or intentionally differs.

### Discovery

Verify the current design, package direction, dependencies, interfaces,
operational constraints, nearby tests, and prior art. Confirm the proposed
technical boundary before detailed questions.

Use the
[technical discovery question bank](references/technical-discovery-question-bank.md)
selectively. Ask developers to choose trade-offs, not report facts available in
the repository.

Follow the specialist routing in the applicable development skill.

Name stable packages, modules, services, and contracts when useful. Avoid line
references, exhaustive file lists, and production code. Include a small schema,
state transition, or interface only when prose is less precise.

### Ready to draft

Draft when:

- the functional basis and technical goal are clear;
- current state, boundaries, and dependencies are verified;
- normal processing, failures, retries, and recovery are designed;
- compatibility, migration, security, privacy, and operations are resolved or
  marked not applicable;
- testing and rollout can prove the design;
- meaningful alternatives and trade-offs are recorded;
- no blocking technical question remains.

After substantial discovery, ask if a dependency, failure mode, or operational
effect is missing.

### Specification format

```md
# <Technical outcome title>

## Functional basis
<Approved behavior and source.>

## Technical goal
<Engineering outcome and success measure.>

## Current state
<Verified design, constraints, and prior art.>

## Scope
### Included
- <Technical responsibility>

### Not included
- <Boundary>

## Proposed design
<Design, responsibility split, and rationale.>

## System flow
1. <Input>
2. <Processing and owner>
3. <External call or state change>
4. <Result or recovery>

## Interfaces and contracts
| Boundary | Input | Output or guarantee | Compatibility |
| --- | --- | --- | --- |
| <boundary> | <input> | <output> | <compatibility> |

## Data and state
<Ownership, lifecycle, validation, consistency, and retention.>

## Failure handling and recovery
| Failure | Detection | Handling | Recovery |
| --- | --- | --- | --- |
| <failure> | <signal> | <behavior> | <recovery> |

## Security and privacy
- <Requirement or not-applicable reason.>

## Observability and operations
- <Signal, alert, owner, or not-applicable reason.>

## Migration and compatibility
- <Rollout, compatibility, rollback, or not-applicable reason.>

## Testing strategy
| Seam | Behavior proved | Test level |
| --- | --- | --- |
| <seam> | <guarantee> | <existing test type> |

## Decisions and alternatives
1. **TD-1:** <Decision, reason, trade-off, and rejected alternative.>

## Assumptions and open questions
- **Accepted assumption:** <Basis, risk, validation, and owner.>
- **Non-blocking question:** <Decision, owner, and deadline.>

## Technical acceptance criteria
- [ ] **TAC-1 (TD-1):** <Design or compatibility outcome.>
- [ ] **TAC-2 (Failure):** <Failure and recovery outcome.>
- [ ] **TAC-3 (Operations):** <Operational outcome.>
```

Specify enough to guide implementation without listing every code edit.

## Optional prototype validation

After presenting the complete draft, always include these choices in the
confirmation form:

- **Approve the specification**
- **See a prototype**
- **Revise the draft**

Set **Approve the specification** as the default choice.

Recommend prototype validation when the draft depends on an interaction,
screen, conditional journey, state change, or recovery flow that is easier to
judge by trying it. Otherwise recommend approval or revision.

When prototype validation is selected, follow
[the prototype validation workflow](references/prototype-validation.md). Add
the verdict to the draft, apply any revisions, and show the same confirmation
form again. Do not ask for a handoff until the user approves the specification.

## Approval and handoff

Before approval:

- remove contradictions;
- cover each requirement or decision with acceptance criteria;
- replace vague terms with observable or verifiable outcomes;
- separate facts, decisions, assumptions, and questions;
- remove generated-sounding, promotional, repetitive, or formal wording;
- confirm no blocking question remains.

Only **Approve the specification** is explicit approval. Anything else means
prototype validation or revision.

After approval, check whether the specification established new reusable
development rules. A candidate must meet the maintenance criteria in its target
skill:

- `frontend-development` for frontend rules;
- `backend-development` for backend rules.

Collect all eligible candidates in one `ask_user` multi-select field. Give each
candidate a separate option that names the target skill and shows the exact
proposed wording. Select no options by default.

Update only the selected rules in their named skills. Keep unselected decisions
in the specification. Do not show this question when there are no eligible
rules, and do not include feature-specific, endpoint-specific, or temporary
decisions. Never update a development skill without explicit approval for each
rule.

After approval, use `ask_user` to choose the handoff:

- **Create a GitHub issue**
- **Create a Copilot plan**
- **Exit — no specification handoff is needed because the initial prompt is
  already clear**

Recommend one option in the `ask_user` message and set it as the default:

- Recommend **GitHub issue** when the work is too large for one implementation
  plan, should be split into several plans or tickets, crosses teams or system
  boundaries, needs staged delivery, or requires a lasting decision record.
- Recommend **Copilot plan** when one coherent implementation plan can cover
  the work, the scope is owned by one team, and no product or technical
  decision remains open.
- Recommend **Exit** when the initial prompt was already narrow, unambiguous,
  low-risk, and implementation-ready, so preserving a specification would add
  no useful clarification or coordination.

Do not recommend based only on diff size. Consider behavioral reach,
dependencies, operational risk, and how many independently deliverable pieces
the work contains.

For a GitHub issue:

1. Use the approved draft unchanged.
2. Add only requested labels or labels verified for this issue type.
3. Create one issue with
   `gh issue create --title <title> --body-file <temporary-file>`.
4. Remove the temporary file.
5. Return the issue URL.

For Copilot plan, keep the approved specification in the conversation and tell
the user to enter:

```text
/plan
```

The user does not need to copy the specification. A skill cannot activate an
interactive slash command.

For Exit, do not create an issue or plan. State that no specification handoff
was created because the initial prompt is sufficient.
