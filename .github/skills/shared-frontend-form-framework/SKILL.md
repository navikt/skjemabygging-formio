---
name: shared-frontend-form-framework
description: >-
    Build and consume editable form input components in shared-frontend (the
    non-Formio render path). Use this when adding or extending an input
    component (text-like, choice, date, composite, or layout), working with the
    form contexts/validation/wizard, or allowlisting a fyllut form path for the
    new render soft-launch. Keep this file updated as new patterns and
    conventions emerge.
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
  executed - see "Legacy `validate.custom`" below.
- `formatting/` — on-blur formatters; never reformat onChange, reformat onBlur.

## Two layers — know which one you are writing

1. **Reusable components** — `src/components/<kebab>/<Name>.tsx`.
    - Plain, framework-facing names (no `Input`/`Summary` prefix).
    - Bound to state **only** by a `statePath` string, plus presentational props.
    - **The only place Aksel form inputs are used, directly or via composition.**
      Every input gets a reusable wrapper here; neither an adapter nor a
      composite may import an Aksel form input directly — a composite that
      needs text, choice, date, or helper UI reuses the existing wrapper
      component instead.
    - **Never** take fyllut-specific props (no `pageKey`, `pageComponents`,
      `component`). They read the validation scope from context (see below).
    - Intended for reuse everywhere: fyllut, static-pdf (a full React app, not
      server-side), and eventually bygger. Composites reuse other reusable
      components by nesting a child `statePath` (e.g. `Identity` renders
      `NationalIdentityNumber` at `${statePath}.identitetsnummer`) so formatting
      and validation are identical to the standalone field.
    - Put non-trivial component-specific logic in a colocated util file when it
      improves readability (for example `address/addressUtils.ts`,
      `select/selectUtils.ts`) instead of leaving dense helper logic inline in
      the component file.

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

## Components own what they validate

A component's rules live in **one pure builder colocated with the reusable
component** (`components/<kebab>/<name>Validation.ts`, e.g. `textFieldValidation`,
`addressValidation`, `drivingListValidation`). Everything that validates goes
through it, so a rule is never written twice:

- **The visible input registers exactly one field** for its state path, through
  `useStateField`. There is one owner per concrete path: a composite never
  registers on behalf of the inputs it renders, it only passes the label, the
  `required` flag and any contextual rules down to them (`PhoneNumber` hands the
  selected calling code to its number field, the driving list hands each day to
  its expense field).
- **Paths with no input of their own** (the attachment choice and its uploaded
  files) are declared with `ValidationRegistration`
  (`context/validation/ValidationRegistration.tsx`), which takes nothing but a
  visible label, a state path, a value and rules. The controls that display such
  a value render inside `UnvalidatedFields`
  (`context/validation/ValidationScopeContext.tsx`) and get their error as a
  prop, so the path keeps a single owner.
- **The headless page rebuild** (`form-components/page-validation/`) calls the
  same builders. `validationFieldsRegistry` mirrors `inputComponentRegistry`
  (one entry per component `type`, exhaustive), maps a component definition to
  the props its adapter would pass, and hands them to the component's builder.
  `collectPageValidationFields` walks a page's active components exactly the way
  `RenderInputForm` does - unsupported types fall through to their children,
  hidden components contribute nothing, data grids expand into indexed rows with
  their own row conditions.

Only the headless rebuild knows about form definitions. Generic components,
`src/validation` and `src/context/validation` never import
`ComponentDefinition`, and no Formio expression is evaluated beyond the domain
`checkCondition` used to find the active components.

- `RenderInputForm` wraps the page output in `ValidationScopeProvider`
  (`context/validation/ValidationScopeContext.tsx`) with `{ pageKey, active }`,
  keyed on `pageKey` so every page gets its own scope instance. Nested renders
  (container/row/form-group/data-grid) inherit it.
- `ValidationProvider` takes an optional `resolvePageFields(pageKey)` callback.
  Fyllut injects it (`fyllut/validation/FyllutValidationProvider.tsx`) and it is
  then the source of truth: every `validatePage`/`validatePages` and every error
  lookup rebuilds the page from the **latest** submission. That is what makes a
  page the user never opened report its missing answers, and what keeps an
  earlier page correct when a later page's condition shows or hides one of its
  fields. Without a resolver (other surfaces, isolated tests) the registrations
  are used instead.
- Leaving a page keeps its registrations, so a registration-only surface can
  still validate every visited page. A field that stops rendering **inside** a
  mounted page (hidden conditional, removed data grid row) unregisters itself.
- **Reusable components own their intrinsic rules** (a valid email, account
  number, date, phone number, ...) with a narrow component-specific
  `validation` type — see `frontend-development`'s Forms section for that
  contract (narrow types, `required` always direct, `TextField`'s approved
  constraints). There is no way to opt a rendered field out of validation.
- **The message names the field after its visible label** (or legend). There is
  no separate validation label - if a message should read differently, change
  what the user sees. `PhoneNumber` therefore gives its number input the
  component's own label, visually hidden behind the calling code selector.
- `validate.pattern` is normalized by the adapter into
  `pattern: { expression, message }`, resolving the legacy `customMessage` /
  `patternMessage` properties. `validate.custom` (Formio expressions) is never
  executed: `form-components/custom-validation/` recognizes the published
  scripts declaratively and either drops them (the component already validates
  the same thing) or replaces them with plain value rules. Anything it does not
  recognize keeps the whole form on the old renderer, so never add a rule that
  interprets a script anywhere else.
- A value the form calculates is not something the user can fix, so
  `RenderInputComponent` renders it inside `UnvalidatedFields` and the headless
  rebuild skips it.

If a component genuinely needs the page component list (e.g. a date picker's
sibling `beforeDateInputKey` lookup), read it with `usePageComponents()`
(`form-components/PageComponentsContext.tsx`) inside the **adapter** — do not
thread it as a prop, and do not put form definitions on the validation scope.

## Validation & error behaviour (framework rules)

The behavioral contract (when a page enters/leaves error state, when the error
summary shows/hides/focuses, navigation and focus rules) is defined once in
`frontend-development`'s
[form-interaction-and-validation.md](../frontend-development/references/form-interaction-and-validation.md)
and applies here unchanged. This section only maps that contract onto this
framework's code, plus one implementation-only invariant the reference doc does
not cover.

It is enforced by `context/validation/ValidationContext.tsx`, surfaced by
`components/error-summary/FormErrorSummary.tsx`, and driven from
`wizard/useWizardController.ts`. Any new component must fit this model — it
never implements its own error visibility.

> **Invariant — no re-render loops.** The validation state setters
> (`pagesWithErrors`, `violationsByPage`, `summaryScope`) **must return the same
> reference when nothing actually changes** (`togglePageInSet`/`replacePageSet`/
> `setPageViolations` in `ValidationContext.tsx`). Registrations and value
> updates run from effects, so a setter that always allocates churns the context
> identity and starves react-router transitions. For the same reason,
> registration callbacks are stable and the rules a component builds inline are
> compared by their serialization, not by identity — never register a value that
> is a new object on every render.

Code mapping:

- Per-page error state (`pagesWithErrors`) is set by `validatePage` (next) and
  `validatePages` (submit/instructions). `getError` returns `undefined` unless
  `pagesWithErrors.has(pageKey)`, so a field's error styling depends only on its
  page's error state, not on the summary. Fixing a field clears its error
  onChange via `handleFieldChange` (through the state seam), which recomputes
  the page and drops it from `pagesWithErrors` once empty. Error messages are
  stored untranslated (message key + params) and worded when read, so they
  follow the current language.
- The summary's visibility is `summaryScope`
  (`{ type: 'page', pageKey }` for next, `{ type: 'summary' }` for
  submit/instructions); it is cleared by `hideSummary` (leaving the page) or
  `updatePageValidationState` (errors fixed). It focuses itself with
  `ref.current?.focus()` when it appears — verify with screen readers. Clicking
  an item focuses the field directly by `inputId(statePath)` instead of hash
  navigation (which would change the app-router URL).

## Formatting contract

The behavioral contract (never reformat onChange, reformat on blur, convert to
input format on entering a page, keep representations separate, idempotent
formatters) is defined once in `frontend-development`'s
[form-interaction-and-validation.md](../frontend-development/references/form-interaction-and-validation.md)
and applies here unchanged; the per-component formats (identity number, date,
integer, decimal, phone) are listed there too.

This framework implements it in `formatting/inputFormat.ts` +
`formatting/formatters/index.ts`: the displayed value is reformatted to input
format via `toInputFormat` on blur, while the value **stored in state** is
normalized to submission format on every change
(`setValue(toSubmissionFormat(raw, formatKey))`) so validation, conditionals,
and autosave always see canonical data — only the _displayed_ value stays raw
until blur. Add a formatter to `formatting/formatters/index.ts` and reference it
by `formatKey`; cover it with vitest for idempotency on partial/invalid input.

## Recipe: add a component

1. **Always add the reusable component** under `src/components/<kebab>/` — every
   input component has one, and it is the only place Aksel inputs are used. Then
   add the JSON→props adapter that maps `component` to its props (`statePath` from
   `resolveSubmissionPath`).
2. **Reusable component** (always): only `statePath` + presentational props;
   extend the shared `BaseFieldProps` (`src/components/types.ts`). Declare a
   narrow component-specific `validation` prop only when the component has
   legitimate caller-supplied constraints; do not reuse a broad validation
   type, and keep `required` separate. Then add input-specific props on top
   (narrow `label` to required where needed);
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
5. **Validation**: implement the rule in `validation/validators.ts` (value +
   rules → `TEXTS.*` message key), then write the component's pure builder in
   `components/<kebab>/<name>Validation.ts`: merge its intrinsic rules with the
   caller's through `toFieldValidation` (`components/shared/fieldValidation.ts`)
   and pass the result to `useStateField`. A composite's builder describes the
   fields **its inputs** register, with `toValidationFields` (see `Identity`,
   `Address`, `PhoneNumber`, the driving list), and the composite itself renders
   those inputs with the same labels and rules. Finally add the component's entry
   to `form-components/page-validation/validationFieldsRegistry.ts` so the
   headless page rebuild uses the same builder. Non-numeric `min/max/Length`
   (form-builder `''`) are ignored.
6. **Summary parity**: add/verify `Summary<Name>.tsx` in the same folder and its
   registry entry so input and summary stay aligned.
7. **Tests (vitest)**: cover the isolated logic — validators, formatters,
   registration behaviour (`context/validation/ValidationContext.test.tsx`,
   `form-components/RenderInputForm.test.tsx`), the headless rebuild
   (`form-components/page-validation/collectPageValidationFields.test.ts`) and,
   for anything with nested paths, the parity between the two sources
   (`form-components/page-validation/registrationParity.test.tsx`). UI behaviour
   goes to Cypress.

## System/derived and hidden components

Some form types are not ordinary visible inputs. They may:

- render nothing and only keep a value in sync
- fetch system data and write a derived submission shape
- coordinate several nested values behind one feature

For those cases:

1. Keep the same overall seams: reusable behavior in `src/components/` when it
   is genuinely reusable, form-definition mapping in
   `form-components/components/<kebab>/`.
2. Prefer a small generic helper for cross-cutting behavior (for example a
   hidden computed field), with feature-specific logic colocated near the
   feature adapter.
3. Preserve the submission contract that validation, conditionals, summary, and
   backend integrations already depend on.
4. Do not force every special case into the prop shape of a normal text/choice
   input just for consistency — use the shared architecture, but let the
   implementation match the feature's real responsibility.

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

## Verify

From `packages/shared-frontend`:
`pnpm exec tsc --noEmit && pnpm exec vitest run && pnpm exec eslint src && pnpm build`.
After editing shared-domain, rebuild it **and** run `pnpm install` from the repo
root so vitest picks up the refreshed `file:` copy.

## Notes for maintaining this skill

- Keep this document **generic and evergreen**. Do not track per-component
  backlog, migration status, or "what is left" here.
- Add new examples or rules only when they describe a reusable pattern that
  should guide future component work.
- If you need current repository coverage, inspect
  `inputComponentRegistry.tsx`, `RenderSummaryForm.tsx`, and the feature folders
  directly instead of turning temporary status into skill content.
