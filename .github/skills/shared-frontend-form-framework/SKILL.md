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
  validation, submission-method, and form-action contexts. Application config is
  limited to the logger and normalized environment; the dynamic submission
  method has its own context.
- `components/` — reusable Aksel-based controls. These may depend on the common
  application, language, state, and submission-method contracts, but never on
  fyllut APIs.
- `fyllut/` — the editable form application: provider composition, wizard,
  routing, input adapters, SendInn actions, no-login handling, and attachments.
- `form-summary/` — summary adapters shared by the new fyllut flow and the
  legacy summary renderer.
- `validation/` — pure `validators` + `deriveValidations` (visible components →
  descriptors). Non-numeric `min/maxLength` (form-builder `''`) are ignored.
- `formatting/` — on-blur formatters; never reformat onChange, reformat onBlur.

## Adding an input component

See the `create-shared-frontend-component` skill for the full recipe and
conventions (two-layer architecture, validation/error rules, formatting
contract). In short:

1. Add the reusable control under `components/<kebab>/`.
2. Add its form-definition adapter under
   `fyllut/form-components/components/<kebab>/`.
3. Register its form type(s) in
   `fyllut/form-components/inputComponentRegistry.tsx`.
4. Cover logic with vitest (`validators`, `formatters`, etc. are isolated).

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
