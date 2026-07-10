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
forms with our own React + Aksel components instead of Formiojs, and is shared
across fyllut, the static-PDF page, and bygger. It is decoupled: no
`shared-components` dependency, no env reads, all config injected.

## Structure

- `context/` — split contexts to limit re-renders: `submission`,
  `form-definition`, `validation`, `language`, `app-config`, `persistence`, and
  the generic pluggable `state` store. Each is exported as its own Provider; the
  host app (fyllut `FillInForm`, bygger preview) composes them inline so each
  surface controls language source, state store, and provider order. The Aksel
  `Provider` (locale) and shared-frontend `LanguageProvider` are fed by the
  caller's language context, so bygger's live editor translations work.
  `submission-init/initializeSubmission` resolves the start state: resumed
  answers win, prefill/defaults fill only empty fields.
- `validation/` — pure `validators` + `deriveValidations` (visible components →
  descriptors). Non-numeric `min/maxLength` (form-builder `''`) are ignored.
- `formatting/` — on-blur formatters; never reformat onChange, reformat onBlur.
- `form-components/` — Aksel inputs, `inputComponentRegistry`, `RenderInputForm`,
  `RenderInputComponent`. `wizard/useWizardController` drives panels/next/prev.

## Adding an input component

See the `create-shared-frontend-component` skill for the full recipe and
conventions (two-layer architecture, validation/error rules, formatting
contract). In short:

1. Add `Input<Component>.tsx` under `form-components/components/<kebab>/`.
2. Register its form type(s) in `inputComponentRegistry.tsx`.
3. Cover logic with vitest (`validators`, `formatters`, etc. are isolated).

## Unsupported components

`RenderInputComponent` mirrors the summary renderer: always `logger.error`, show
an Aksel `Alert` only when `config.NAIS_CLUSTER_NAME !== 'prod-gcp'`, skip in prod.
There is no upfront form-support gate — the allowlist is the only switch.

## Allowlisting a fyllut form (soft-launch)

Set env `FEATURE_NEW_RENDER_FORMS` (comma-separated form paths) in
fyllut-backend. It is parsed in `config.ts` → served as `newRenderForms` on
`/fyllut/api/config`. `FormPageWrapper` renders `FillInForm` when the path
is listed, else the untouched Formio path. Purely additive.
