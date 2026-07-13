---
name: create-shared-frontend-component
description: >-
    Step-by-step recipe and accumulated conventions for adding a new input
    component to the shared-frontend form framework. Use this whenever you
    implement or extend a form component (text-like, choice, date, composite, or
    layout). Keep this file updated as new patterns emerge while building the
    remaining components.
---

# Creating a shared-frontend form component

The editable form framework lives in `packages/shared-frontend/src`. See the
`shared-frontend-form-framework` skill for the big picture (contexts, wizard,
allowlisting). This skill is the hands-on recipe for adding a component and the
conventions we've settled on.

## Two layers — know which one you are writing

1. **Reusable components** — `src/components/<kebab>/<Name>.tsx`
   (`TextField`, `TextArea`, `Select`, `RadioGroup`, `CheckboxGroup`,
   `DatePicker`, `MonthPicker`, `Identity`, `NationalIdentityNumber`,
   `Alert`, `Fieldset`, ...).
    - Plain, framework-facing names (no `Input`/`Summary` prefix).
    - Bound to state **only** by a `statePath` string, plus presentational props.
    - **The only place Aksel input components are used.** Every input component
      gets a reusable wrapper here so it can be reused across the app — never call
      Aksel form inputs (`TextField`, `Combobox`, `RadioGroup`, `Checkbox`,
      `Textarea`, `Alert`, `Fieldset`, ...) directly from an adapter.
    - **Never** take fyllut-specific props (no `pageKey`, `pageComponents`,
      `component`). They read the validation scope from context (see below).
    - Intended for reuse everywhere: fyllut, static-pdf (a full React app, not
      server-side), and eventually bygger. Composites reuse other reusable
      components by nesting a child `statePath` (e.g. `Identity` renders
      `NationalIdentityNumber` at `${statePath}.identitetsnummer`) so formatting
      and validation are identical to the standalone field.
    - **Complex/composite components must compose existing shared-frontend
      wrappers, not import Aksel form components directly.** If a composite
      needs text, choice, date, or helper UI, it should use `TextField`,
      `RadioGroup`, `CheckboxGroup`, `Select`, `DatePicker`, `MonthPicker`,
      `ReadMore`, etc.

2. **Form-definition adapters** — `form-components/components/<kebab>/Input<Name>.tsx`
    - Thin JSON→props adapters. Take `InputComponentProps`
      (`{ component, submissionPath?, componentRegistry? }`) and map a
      form-definition `Component` to the reusable component's props.
    - Registered by form `type` in `inputComponentRegistry.tsx`.
    - The summary counterpart `Summary<Name>.tsx` lives in the **same folder**.

Adapters call the reusable component **directly**, mapping
`statePath={resolveSubmissionPath(component, submissionPath)}` plus the
presentational props. There is no `BaseInput*` indirection layer — the reusable
component under `src/components/<kebab>/` is the single seam for every input, and
the only place Aksel form inputs are used.

## State binding is pluggable and non-crashing

Reusable components bind to a value by `statePath` through a **generic state
store** (`context/state/StateContext.tsx`, `FieldStateStore` = `getValue` +
`setValue`). They never depend on a specific store. Each surface provides its own
implementation and wraps the tree with it; the components pick it up
automatically:

- Fyllut provides it from `SubmissionStateContext` (maps `statePath` to the
  submission). Other surfaces (e.g. a future static-pdf state) supply their own
  `FieldStateStore` the same way.
- `useStateField({ statePath })` (`context/state/useStateField.ts`) is the
  generic binding. It returns `{ stateValue, error, setStateValue }` and reads
  **all** dependencies optionally — state store, validation, and validation
  scope — so a component never crashes when a context is missing. With none
  present the field is inert (value `undefined`, no error, no-op setter).
- Missing contexts are a **supported** mode, not an error: never `console`/log a
  warning when a store/validation/scope is absent. The `language` context also
  falls back to an identity `translate` (returns the original text unchanged, no
  warning) so labels/descriptions render standalone. Graceful, silent
  degradation everywhere.
- `useStateField({ statePath })` is the single binding used by every reusable
  component. Text-like fields inline their onChange/onBlur formatting on top of
  it (raw value while typing, reformat on blur via `toInputFormat`).

## Validation scope comes from context, never props

`RenderInputForm` (`form-components/RenderInputForm.tsx`, the shared-frontend
render entry used by fyllut's `PanelStep`) wraps output in `ValidationScopeProvider`
(`context/validation/ValidationScopeContext.tsx`) with `{ pageKey, components }`.
Nested renders (container/row/form-group/data-grid) omit the scope props and
inherit it. `useStateField` reads the scope with `useOptionalValidationScope()`
(never throws) to resolve the error message and revalidate on change.

If a component genuinely needs the page component list (e.g. a date picker's
sibling `beforeDateInputKey` lookup, or datagrid's `handleFieldChange`), read it
with `useValidationScope()` inside the **adapter** — do not thread it as a prop.

## Validation & error behaviour (framework rules)

These rules are enforced by `context/validation/ValidationContext.tsx`, surfaced
by `components/error-summary/FormErrorSummary.tsx`, and driven from
`wizard/useWizardController.ts`. Any new component must fit this model — it never
implements its own error visibility.

> **Invariant — no re-render loops.** The validation state setters
> (`pagesWithErrors`, `summaryScope`) **must return the same reference when
> nothing actually changes** (`togglePageInSet`/`replacePageSet` in
> `ValidationContext.tsx`). `syncPageValidationState` runs from an effect on the
> live component list, so a setter that always allocates a new `Set` churns the
> context identity and starves react-router transitions. When adding validators
> or components that feed this path, preserve the bail-out; never allocate a new
> Set/object unconditionally in a validation setter.

### Per-page error state ("hasErrors")

- A page enters the error state when the user clicks **next** and the page has
  errors (`validatePage` adds it to `pagesWithErrors`), or clicks
  **submit/instructions** on the summary page (`validatePages` marks every page
  that has errors). The state is kept until the errors are fixed.
- **Input error styling** (red border + red text under the component) is shown
  for a field only when its page is in the error state — `getError` returns
  `undefined` unless `pagesWithErrors.has(pageKey)`. So navigating to an
  already-errored page shows the input errors **without** the ErrorSummary.
- Fixing a field clears its error **onChange**: components call
  `handleFieldChange` (via the state seam), which recomputes the page and drops
  it from `pagesWithErrors` once empty.
- While a page is in the error state, newly surfaced errors also get the error
  state — including components that were previously hidden and are now visible —
  because errors are recomputed from the live visible components each time.

### ErrorSummary

- Shown **only** after a next/submit/instructions trigger sets a `summaryScope`
  (`{ type: 'page', pageKey }` for next, `{ type: 'summary' }` for
  submit/instructions). Never shown merely by entering a page, even one with
  errors.
- Rendered right above the bottom navigation buttons; it **focuses itself** when
  it appears (`ref.current?.focus()` — verify with screen readers).
- Stays live while visible: adding a new error on the page updates the summary
  (errors are recomputed on each render).
- Removed when the page is left (`hideSummary` on navigation) or when all errors
  on the current page are fixed (`updatePageValidationState` clears the scope).
- Clicking an item focuses the field directly by `inputId(statePath)`
  instead of doing hash navigation (which would change the app-router URL).

## Formatting contract

`formatting/inputFormat.ts` + `formatting/formatters/index.ts`. Rules:

- **Never reformat the value the user types onChange** — the _displayed_ value
  keeps the user's raw input.
- **Keep the user's input format until onBlur**, where the displayed value is
  reformatted to the component's default input format (same behaviour as the
  Aksel DatePicker) via `toInputFormat`.
- Input, summary page, PDF and submission may all use **different formats** for
  the same value.
- **On entering a page/panel**, if a value exists in submission, convert it to
  input format (`toInputFormat`) before showing anything to the user (fields
  seed their local value from submission on mount; inputs remount when the
  wizard swaps panels).

Implementation note (not a contradiction of rule 1): the value **stored in
state** is normalized to submission format on every change
(`setValue(toSubmissionFormat(raw, formatKey))`) so validation, conditionals and
autosave always see canonical data. Only the _displayed_ value stays raw until
blur. Formatters must therefore stay **forgiving and idempotent** — a
partial/invalid value passes through ~unchanged until it is valid. Cover this
with vitest.

Add a formatter to `formatting/formatters/index.ts` and reference it by
`formatKey`. The concrete per-component onBlur formatting rules (identity number,
phone, number, decimal, ...) live with the components/formatters and their tests,
not in this skill.

## Recipe: add a component

1. **Always add the reusable component** under `src/components/<kebab>/` — every
   input component has one, and it is the only place Aksel inputs are used. Then
   add the JSON→props adapter that maps `component` to its props (`statePath` from
   `resolveSubmissionPath`).
2. **Reusable component** (always): only `statePath` + presentational props;
   extend the shared `BaseFieldProps` (`src/components/types.ts` —
   `statePath`, `label?`, `description?`, `required?`, `readOnly?`,
   `marginBottom?`, `readMore?`) and
   add input-specific props on top (narrow `label` to required where needed);
   bind with `useStateField`; use `FormElementBox` and the translated helper UI
   from `src/components/shared/`, plus the reusable `ReadMore` wrapper from
   `src/components/read-more/`, and `inputId(statePath)` (from `src/utils/`) for
   the field id.
   By default, editable components should support Formio's
   `additionalDescriptionLabel` + `additionalDescriptionText` through the shared
   `ReadMore` wrapper; only special cases should opt out.
3. **Adapter** `form-components/components/<kebab>/Input<Name>.tsx`: map
   `component` → props with the helpers in `inputComponentRegistryUtils.ts`
   (`resolveSubmissionPath`, `isRequired`, `getValues`, `resolveInputType`,
   `resolveNumberFormatKey`, `resolveTextFormatKey`, `resolveReadMore`).
4. **Register** the form `type`(s) in `inputComponentRegistry.tsx`.
5. **Validation**: add the rule to `toRules` in
   `validation/deriveValidations.ts` (keyed off `component.type`) and implement
   it in `validation/validators.ts` returning the right `TEXTS.*` message.
   Composites that store nested objects emit their own descriptors (see
   `collectIdentityDescriptors`) so each nested value validates and focuses from
   the error summary. Non-numeric `min/max/Length` (form-builder `''`) are
   ignored.
6. **Summary parity**: add/verify `Summary<Name>.tsx` in the same folder and its
   registry entry so input and summary stay aligned.
7. **Tests (vitest)**: cover the isolated logic — validators, formatters,
   derive-validations. UI behaviour goes to Cypress.

## Conventions

- English names; per-feature colocation; kebab folders; one central registry.
- Arrow functions; exports at end of file; keep it DRY.
- Reusable-component styling: Aksel layout primitives / design tokens, or CSS
  Modules — no `react-jss`/`makeStyles`.
- Unsupported types: `RenderInputComponent` logs `logger.error` always, shows an
  Aksel `Alert` only when `config.NAIS_CLUSTER_NAME !== 'prod-gcp'`, skips in prod.

## Verify

From `packages/shared-frontend`:
`pnpm exec tsc --noEmit && pnpm exec vitest run && pnpm exec eslint src && pnpm build`.
After editing shared-domain, rebuild it **and** run `pnpm install` from the repo
root so vitest picks up the refreshed `file:` copy.

## Status: implemented components

Registered in `inputComponentRegistry.tsx` (keep this list current):

- **Text-like**: `textfield`, `textarea`/`formioTextArea`, `email`, `firstName`,
  `surname`, `number`, `currency`, `orgNr`, `year`, `fnrfield`.
- **Choice**: `select`, `navSelect`, `landvelger`, `valutavelger`, `radiopanel`,
  `navCheckbox`, `selectboxes`.
- **Date**: `navDatepicker`, `monthPicker`.
- **Layout/containers**: `container`, `datagrid`, `navSkjemagruppe`/`fieldset`,
  `row`, `alertstripe`, `htmlelement`.
- **Composite**: `identity`.

Not yet implemented — **the "old format" backlog**. These already have a
`Summary<Name>.tsx` and a summary-registry entry (`RenderSummaryForm.tsx`) but
**no `Input<Name>.tsx`** and are **absent from `inputComponentRegistry.tsx`**.
Migrating one = add a reusable component under `src/components/<kebab>/` (always,
so the Aksel input lives only there) plus its input adapter, register the
`type`(s), and add validators. Summary parity already exists, so keep the input
and summary in the same folder aligned.

- **Input pending (summary done)**: `account-number` (`bankAccount`), `iban`,
  `phone-number`, `address-validity`
  (`addressValidity`), `attachment`, `attachment-uploads`, `activities`,
  `driving-list`, `data-fetcher`, `maalgruppe`, `sender`, `accordion`.
  Some are display/derived and may not need an editable input — confirm per
  component before adding an adapter.

Quick way to see what's left: every `type` in `RenderSummaryForm.tsx`'s
`componentRegistry` that is missing from `inputComponentRegistry.tsx` (or any
`components/<kebab>/` folder with a `Summary*.tsx` but no `Input*.tsx`). Update
both lists above as components land.
