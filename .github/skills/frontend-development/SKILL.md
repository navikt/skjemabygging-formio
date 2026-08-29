---
name: frontend-development
description: >-
    Mandatory repository guidance for every frontend change or review. Always use
    for browser code, styles, UI components, hooks, state, forms, validation,
    focus, accessibility, and Cypress UI tests in fyllut, bygger, or shared
    frontend packages.
---

# Frontend development

Use this skill before investigating, planning, editing, or reviewing frontend
behavior. Its rules are repository defaults, not questions for the user.

This applies to browser-facing TypeScript and JavaScript, TSX/JSX, styles, UI
state, and Cypress tests. A `.ts` extension alone does not make backend code
frontend work.

## Package direction

- Put reusable UI, hooks, frontend services, and form behavior in
  `packages/shared-frontend`.
- Keep `packages/shared-frontend/src/components` generic and independent of
  form-definition and fyllut types. Bind reusable controls through generic state
  paths and presentational props.
- Keep `packages/shared-frontend/src/form-components` for thin form-definition
  adapters. Co-locate editable and summary adapters by component type and keep
  their registries aligned.
- Keep `packages/shared-frontend/src/fyllut` for fyllut-specific orchestration,
  routing, submission, wizard behavior, attachments, and host integration. Keep
  this flow hostable by both fyllut and bygger.
- Dependencies may point from `fyllut` to generic `components`, never the
  reverse. Keep application-specific behavior in `packages/fyllut` or
  `packages/bygger`.
- Treat `packages/shared-components` as legacy. Extend it only when changing a
  legacy flow that cannot reasonably be moved first.
- Reuse shared behavior before adding another path. Keep form-definition
  adapters thin.

## Styling

- Use CSS Modules for all new frontend styling and in new frontend packages.
  Treat JSS (`react-jss`, `makeStyles`, and `createUseStyles`) as legacy; do not
  introduce it in new code. When changing existing JSS-based styling, migrate
  the affected styles to CSS Modules when reasonably scoped.

## Aksel and accessibility

Use Aksel for user-facing UI. Consult `aksel-agent` before choosing or changing
an Aksel component, token, layout, or interaction. It must use current Aksel
documentation; do not rely on remembered APIs.

- Target the latest finalized WCAG Recommendation at level AA, currently WCAG
  2.2 AA. Do not treat working drafts, including WCAG 3.0, as required unless
  explicitly adopted.
- Use semantic elements, meaningful accessible names, visible labels, and
  keyboard-operable actions.
- Do not use placeholders as labels or instructions.
- Do not communicate state, errors, or results through color alone.
- Preserve focus during ordinary updates. Move it only for navigation, dialogs,
  or error recovery.
- Keep the UI usable with zoom, reflow, keyboard navigation, and assistive
  technology.
- Do not override Aksel internals.

Describe affected accessibility behavior as observable acceptance criteria.
Automate stable UI behavior in Cypress, but use manual checks where a browser
test cannot verify the outcome, such as screen-reader announcements or reflow.

## Forms

Read
[the form interaction rules](references/form-interaction-and-validation.md)
for changes to inputs, formatting, validation, errors, conditional visibility,
navigation, or focus. Apply those defaults without asking unless the requirement
intentionally changes them.

- When adding or changing a form component, preserve parity across editable
  input, validation, summary, PDF, autosave, and submission behavior.
- Keep one validation layer. Extend the shared validation rules and error text
  resolution instead of adding a parallel validator, error shape, or address
  and identity taxonomy for a new host or package.
- Reuse the `shared-domain` validators and normalizers for identity numbers,
  organization numbers, postal codes, and cover-page characters. Do not restate
  a rule that already has a definition.

## Host services, content, and logging

- Give shared components HTTP and other host dependencies through adapters,
  context, or props. Do not add direct `fetch`, `window`, or hard-coded
  `/fyllut` dependencies. Existing cases are migration debt; do not extend them.
- Route user-facing form text through the shared language and translation
  context. Do not hard-code display text in reusable components.
- Sanitize form-authored or translated HTML with the existing helper before
  passing it to `dangerouslySetInnerHTML`. Do not add another sanitizer.
- Preserve entered values after failed validation or navigation.
- Do not log form answers, personal data, tokens, or other sensitive values.
- Use the existing frontend logger for reportable failures instead of adding
  console logging.

## Testing

- Use Cypress for UI behavior, interactions, focus, and end-to-end flows.
- Use Vitest only for isolated non-UI logic such as mappers, formatters,
  validators, and reducers.
- Do not add or expand `@testing-library` tests. Prefer replacing affected
  legacy coverage with Cypress.
- Cover changed failure and recovery behavior as well as the normal journey.
- Treat an existing test as the record of current behavior. When a change makes
  one fail, fix the change. Editing its input or expectation is a behavior
  change that needs the same approval and scope note as any other.

Use `cypress-write-test` for test authoring, `start-dev-servers` for startup,
and `cypress-repo-workflow` for execution and debugging.

## Asking and exceptions

Check this skill, its reference, nearby behavior, and current Aksel
documentation before asking the user. Ask only about product behavior or a
deliberate exception.

For an exception, explain the default, confirm the intended change, record its
scope, and add tests that distinguish it from the default.

## Maintaining this skill

Add a rule only when it is approved, cross-cutting, stable, and supported by
repository evidence or a validated prototype. Do not add feature-specific or
temporary decisions. Show the exact wording and require explicit approval.
