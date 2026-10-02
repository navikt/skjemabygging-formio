---
name: specification
description: >-
    Create a functional or technical specification for fyllut or bygger using
    the shared Fyllut-Sendinn workflow and this repository's frontend and backend
    guidance. Use only when the user explicitly invokes /specification.
disable-model-invocation: true
---

# Specification for skjemabygging-formio

Invoke `fyllut-sendinn-specification` immediately and use it as the source of
truth for discovery, drafting, approval, prototype validation, and handoff.
If that skill is unavailable or cannot be invoked, stop this workflow and
report that the `specification@fyllut-sendinn-plugins` plugin must be installed
and enabled. Do not continue with a local or improvised specification workflow.

Apply this repository's development guidance as additional constraints:

- Invoke `frontend-development` before detailed discovery when frontend
  behavior, forms, validation, focus, accessibility, or Cypress UI tests are
  affected.
- Invoke `backend-development` before detailed discovery when server behavior,
  APIs, integrations, authentication, configuration, logging, metrics, or
  backend tests are affected.
- Invoke both when the change crosses frontend and backend boundaries.
- Follow specialist routing required by those skills.

Treat established rules from the development skills as verified constraints,
not questions for the user. Keep feature-specific behavior, contracts, and
trade-offs in the specification.

## Capture reusable learning

After the specification is approved and before its handoff, check whether the
work established a reusable rule for any of these skills:

| Learning                                                                      | Target                                                                  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Specification discovery, writing, approval, prototype, or handoff method      | `fyllut-sendinn-specification` in `navikt/fyllut-sendinn-local-dev-env` |
| Frontend architecture, interaction, accessibility, or testing                 | `frontend-development` in this repository                               |
| Backend architecture, boundaries, errors, security, observability, or testing | `backend-development` in this repository                                |

A candidate must be approved, cross-cutting, stable, and supported by
repository evidence or a validated prototype. Do not propose feature-specific,
endpoint-specific, or temporary decisions.

Collect all eligible candidates in one `ask_user` multi-select field. Each
option must name the target skill and show the exact proposed wording. Select
no options by default. Update only the selected rules, and never update a skill
without explicit approval for that rule.

For shared specification guidance, make the change in
`navikt/fyllut-sendinn-local-dev-env`; do not copy the shared workflow back into
this repository. Open a pull request there, and increment the specification
plugin and marketplace versions as required by that repository.
