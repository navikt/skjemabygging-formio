---
name: shared-frontend-form-framework
description: >-
    Build and consume editable form input components in shared-frontend (the
    non-Formio render path). Use this when adding input components, working with
    the form contexts/validation/wizard, or allowlisting a fyllut form path for
    the new render soft-launch.
---

# shared-frontend form framework

The editable form framework lives in `packages/shared-frontend/src`. It renders
forms with our own React + Aksel components instead of Formiojs. Reusable
components and summary rendering are shared across fyllut, the static-PDF page,
and bygger, while the editable form flow is explicitly owned by fyllut. It has no
`shared-components` dependency, no env reads, all config injected.

## Structure

- `context/` — reusable application, language, state, form-definition,
  validation, submission-method, and stepper contexts. Application config is
  limited to the logger and normalized environment; the dynamic submission
  method has its own context.
- `components/` — reusable Aksel-based controls. These may depend on the common
  application, language, state, and submission-method contracts, but never on
  fyllut APIs.
- `form-components/` — form-definition adapters for editable inputs and summary
  rendering, co-located by component type, plus `page-validation/`, the headless
  counterpart of the input registry. Summary rendering is shared by the new
  fyllut flow and the legacy summary renderer.
- `fyllut/` — the editable form application. `RenderForm.tsx` is its public
  entry point; feature folders own routing/form-flow, intro, form pages,
  summary, paper submission, receipt, attachments, and fyllut-only contexts.
- `validation/` — pure `validators`: a concrete value + `ValidationRules` in, a
  message key + params out. No form definitions, no form scripts. Which fields a
  page validates comes from the components that own them: every visible input
  registers exactly one field for its state path (see `context/validation`), and
  `form-components/page-validation/` rebuilds the same fields headlessly from the
  current submission through the same builders, so validation is correct for a
  page the user never opened. An authored `validate.pattern` becomes
  `pattern: { expression, message }` at the form-definition boundary, non-numeric
  `min/maxLength` (form-builder `''`) are ignored, and `validate.custom` is never
  executed - see `form-components/custom-validation/` below.
- `formatting/` — on-blur formatters; never reformat onChange, reformat onBlur.

## Adding an input component

See the `create-shared-frontend-component` skill for the full recipe and
conventions (two-layer architecture, validation/error rules, formatting
contract). In short:

1. Add the reusable control under `components/<kebab>/`.
2. Add its form-definition adapter under
   `form-components/components/<kebab>/`.
3. Register its form type(s) in
   `form-components/inputComponentRegistry.tsx`.
4. Cover logic with vitest (`validators`, `formatters`, etc. are isolated).

## Legacy `validate.custom`

No Formio expression is ever executed: there is no `eval`, no `new Function`,
and validators stay pure. `form-components/custom-validation/` is the only place
that knows the scripts exist:

- `customValidationScripts.ts` recognizes a script by its expression form plus
  the component's own configuration. It classifies each one as `redundant` (the
  component already validates exactly that), `visibility` (a `show = ...` script
  that repeats the component's `customConditional` and never assigned `valid`),
  `rules` (replaced by declarative value rules), or `unsupported`.
- `customValidationRules.ts` turns a recognized script into plain
  `ValidationRules` with every referenced value already resolved
  (`notEqual`, and stricter `fromDate`/`toDate` bounds with `dateMessages`).
  Rendered inputs get them through `useResolvedValidation`, the headless rebuild
  through `toFieldValidationInput` - the same two functions, so the two agree.
- `productionCustomValidationScripts.ts` is a checked-in snapshot of every
  distinct script in the published production forms, and the tests assert the
  mapper still covers all of them.
- `unsupportedCustomValidation.ts` finds anything unrecognized. `fyllut`'s
  `useInitializeRenderForm` calls it right after the form is loaded and, before
  any prefill or draft is created, hands the form back to the old renderer and
  logs it. The feature allowlist is configuration and cannot see the form
  definition, so this is the boundary that decides.

Do not put script recognition anywhere else, and never key it on a form id or
path.

## Unsupported components

`RenderInputComponent` mirrors the summary renderer: always `logger.error`, show
an Aksel `Alert` when the normalized application environment is not
`production`, and skip it in production.
There is no upfront form-support gate — the allowlist is the only switch.

## Allowlisting a fyllut form (soft-launch)

Set env `FEATURE_NEW_RENDER_FORMS` (comma-separated form paths) in
fyllut-backend. It is parsed in `config.ts` → served as `newRenderForms` on
`/fyllut/api/config`. `FormPageWrapper` renders `FillInForm` when the path
is listed, else the untouched Formio path. Purely additive.
