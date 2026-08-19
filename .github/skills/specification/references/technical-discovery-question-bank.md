# Technical specification discovery question bank

Use this selectively after the functional basis and technical boundary are
known. Investigate repository facts before asking the developer. Ask one
decision at a time and explain the relevant trade-off. Apply defaults from the
relevant development skill without asking the user to choose them.

## Current state and boundaries

- Within the established package direction, which service or module should own
  the responsibility, and why?
- What current behavior or contract must remain compatible?
- Is there an existing abstraction or integration that should be reused?
- Does the proposal deepen an existing module or create a competing path?
- Which upstream and downstream consumers are affected?
- What is deliberately unchanged?

## Interfaces and data

- What inputs, outputs, errors, and guarantees cross each boundary?
- Which system owns each piece of data and its lifecycle?
- Are ordering, idempotency, concurrency, or consistency guarantees required?
- How are invalid, missing, stale, duplicated, or conflicting inputs handled?
- Does data require migration, retention, deletion, encryption, or audit?
- How will old and new producers or consumers coexist during rollout?

## Failure and recovery

- What can fail at each external or state-changing step?
- Which failures are retryable, and how are duplicate effects prevented?
- What must fail closed, degrade, queue, or surface to an operator?
- How is partial completion detected and recovered?
- What rollback or manual recovery path is required?
- Which timeout, capacity, or dependency outage changes the design?

## Security and privacy

- What trust boundaries, identities, roles, and permissions are involved?
- What sensitive or personal data enters logs, storage, events, or external
  services?
- What abuse cases or untrusted inputs require controls?
- Are consent, retention, audit, or compliance requirements applicable?
- Which security decision needs specialist review?

## Observability and operations

- Which signals prove success, degradation, and failure?
- What logs, metrics, or traces let an operator diagnose the flow end to end?
- Which conditions require an alert, and who owns the response?
- Is a dashboard, runbook, or support procedure required?
- What capacity, cost, or service-level constraint matters?

## Testing

- What is the highest stable seam that proves the behavior?
- Which existing tests provide the closest prior art?
- What contract, compatibility, failure, and recovery cases need coverage?
- At which repository-approved test seam can each behavior be proved?
- How will the design be verified in a realistic environment before rollout?

## Migration and rollout

- Can the change be introduced incrementally while keeping the system working?
- Is expand-contract, backfill, dual-read, dual-write, or versioning needed?
- How are existing forms, drafts, submissions, or integrations affected?
- What feature gating or staged rollout is required?
- What is the rollback point, and what state remains after rollback?

## Alternatives and decisions

- What is the simplest viable design consistent with repository direction?
- Which meaningful alternative was rejected, and why?
- Is the decision hard to reverse or expensive to change later?
- Which assumption carries the greatest implementation or operational risk?
- What evidence or prototype would resolve the remaining uncertainty?
