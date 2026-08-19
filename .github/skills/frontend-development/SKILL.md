---
name: frontend-development
description: >-
  Mandatory repository guidance for every frontend change or review. Always use
  for TSX/JSX, browser-facing TypeScript or JavaScript, styles, UI components,
  hooks, state, forms, validation, focus, accessibility, and Cypress UI tests in
  fyllut, bygger, or shared frontend packages.
---

# Frontend development

Use this skill before investigating, planning, editing, or reviewing frontend
behavior. It contains repository defaults that are not user decisions. Do not
ask the user how to solve something already defined here.

## Scope

This skill applies to:

- `.tsx` and `.jsx`;
- browser-facing `.ts` and `.js`;
- CSS and other styling;
- components, hooks, contexts, and client state;
- form rendering, validation, errors, and focus;
- frontend logging;
- Cypress tests of UI behavior.

It does not apply to a backend-only TypeScript change merely because the file
extension is `.ts`.

## Package direction

- Put new shared UI, hooks, frontend services, and form behavior in
  `packages/shared-frontend` when more than one surface needs them.
- Keep `packages/shared-frontend/src/components` generic. Components there may
  be used across packages and must not depend on fyllut-specific form flow,
  submission, routing, or application code.
- Keep `packages/shared-frontend/src/fyllut` for fyllut-specific orchestration,
  form-definition adapters, submission flows, wizard behavior, and host
  integration. It must expose the fyllut experience so both the fyllut and
  bygger frontends can host it without duplicating the flow.
- Dependencies point from `fyllut` to generic `components`, never the reverse.
- Keep app-specific behavior in `packages/fyllut` or `packages/bygger`.
- Treat `packages/shared-components` as legacy. Extend it only when changing an
  existing legacy flow and moving the behavior first is not practical.
- Reuse an existing shared component or helper before creating another path.
- Keep form-definition adapters thin. Shared behavior belongs in the reusable
  component or domain layer, not repeated in each renderer.

## Aksel and accessibility

Use Aksel components and patterns for user-facing UI. Before choosing or
configuring an Aksel component, token, layout, or interaction, consult
`aksel-agent`. It must fetch current Aksel documentation; do not rely on model
memory or copy Aksel API details into this skill.

Apply these stable rules to every UI change:

- Use semantic elements and meaningful accessible names.
- Support keyboard operation for every action.
- Keep labels and necessary guidance visible. Do not use placeholder text as a
  label or instruction.
- Do not communicate state, errors, or results through color alone.
- Preserve useful focus. Do not steal focus during ordinary typing or updates.
- Move focus when navigation or error recovery requires it.
- Keep content usable with zoom, reflow, and assistive technology.
- Use clear text for icons whose meaning is not otherwise available.
- Do not override Aksel internals or claim WCAG compliance.

When a change affects UI behavior, validate the applicable WCAG 2.2 AA outcome
through observable acceptance criteria and Cypress coverage.

## Form interaction and validation

Read
[the form interaction rules](references/form-interaction-and-validation.md)
for any input, form, validation, error, conditional visibility, navigation, or
focus change. These are repository defaults. Ask the user only when the product
requirement intentionally needs different behavior.

## State and data

- Keep the displayed value, client state, summary, submission, and PDF
  representation consistent.
- Treat display, state/submission, summary, and PDF formats as separate
  contracts for the same value. Do not assume their strings are identical.
- Preserve user input after failed validation or navigation.
- Do not silently normalize, clear, or discard input unless established
  product behavior requires it.
- Respect existing conditional visibility and `clearOnHide` behavior. A change
  to those semantics needs an explicit product decision and end-to-end tests.
- Do not log form answers, personal data, tokens, or other sensitive values.
- Use the existing frontend logger for reportable failures instead of adding
  ad hoc console logging.

## Frontend testing

- Use Cypress for UI behavior, interactions, focus, accessibility-visible
  outcomes, and end-to-end flows.
- Use Vitest only for isolated non-UI logic such as mappers, formatters,
  validators, and reducers.
- Do not add or expand `@testing-library` tests. When changing behavior covered
  only there, prefer replacing that coverage with Cypress.
- Cover the normal journey and any changed failure or recovery behavior.

Use `cypress-write-test` as the source of truth for Cypress authoring,
`start-dev-servers` for local startup, and `cypress-repo-workflow` for running
or debugging the test.

## Before asking the user

Check this skill, the relevant reference, nearby behavior, and current Aksel
documentation first. Treat established rules as facts. Ask only about product
behavior or a deliberate exception.

If a requested exception conflicts with a rule here:

1. explain the existing default and why it applies;
2. confirm that the user intends to change it;
3. record the scope of the exception;
4. add tests that distinguish the exception from the default.

## Maintaining this skill

This skill may be updated from an approved specification only when the decision
is:

- cross-cutting across frontend features or surfaces;
- stable enough to guide future work;
- verified through repository evidence, an approved specification, or a
  prototype;
- not a one-off feature requirement or temporary implementation detail.

Never update the skill silently. Show the proposed rule and ask for explicit
approval. Keep one rule in one place and remove or replace outdated guidance.
