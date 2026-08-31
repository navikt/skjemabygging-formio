# Typed form components — migration plan (TEMPORARY DOC)

> Delete this file once the pattern is established / documented in a skill.
> Branch: `lotorvik/typed-form-components` (from `fyllut2-render`).

## Problem

`Component` (`packages/shared-domain/src/models/form/component.ts`) is a ~150-property
"god interface": nearly everything is optional and `type` is just `string`. Both the legacy
Formio code and the new render in `packages/shared-frontend` use it, so every `Input*` /
`Summary*` adapter and every tree-walker can read any of the 150 props with no guarantee the
prop is valid for that component `type`.

## Goal

Type form components in the new render precisely, keyed on their `type`, and — ultimately —
**remove `Component` from shared-frontend entirely except a single ingestion boundary**.
Legacy Formio code keeps using `Component` untouched.

## Chosen design: discriminated union + typed ("mapped") registry (Option B)

Per-type interfaces with a literal `type` discriminant, combined into a discriminated union.
An adapter declares the variant it renders and receives that exact type — no cast, no runtime
`type` re-check inside the adapter.

```
BaseComponent                       // Pick<Component, ...> of cross-cutting fields (no `type`)
  ├ TextFieldComponent  extends BaseComponent { type: 'textfield'; ...render extras }
  ├ RadioPanelComponent extends BaseComponent { type: 'radiopanel'; ... }   (future)
  └ ...
FormComponent    = TextFieldComponent | ...                 // the MIGRATED union (grows)
GenericComponent = distributive legacy-shaped fallback for not-yet-migrated types
AnyFormComponent = FormComponent | GenericComponent          // TOTAL over FormComponentType
```

Why a discriminated union: given `c: AnyFormComponent`, `switch (c.type)` / `if (c.type === …)`
**narrows automatically** to the matching variant. `Extract<AnyFormComponent, { type: K }>`
resolves to the exact variant for any `K`.

### Why the mapped registry is essential

Adapter props are contravariant, so once `InputTextField`'s prop is `TextFieldComponent`, a
plain `Record<string, ComponentType<{component: Component}>>` registry no longer accepts it.
The registry must be a **mapped type** that ties each key to its variant:

```ts
type InputComponentRegistry = {
    [K in InputComponentType]: ComponentType<InputComponentProps<ComponentOfType<K>>>;
};
```

This also makes the registry **exhaustive**: a missing key is a compile error (same guarantee
`FORM_COMPONENT_TYPES` already gives the PDF/Summary registries).

### `AnyFormComponent` is assignable to `Component`

Every variant is built from `Pick<Component, …>` and a literal `type` (assignable to `string`),
with `key`/`label` present. So the union flows **into** shared-domain utilities typed as
`Component` (`checkCondition`, `submissionUtils`, `getResolvedSubmissionPath`, …) with **no
cast**. The boundary to shared-domain stays one-directional and free.

## What this branch implements (vertical slice: `textfield`, Option B)

`packages/shared-frontend/src/form-components/component-types/`:

- `base.ts` — `BaseComponent = Pick<Component, ...>` of the universally-shared fields. `type`
  is intentionally excluded so each variant declares its own discriminant literal.
- `textfield.ts` — `TextFieldComponent extends BaseComponent { type: 'textfield'; ... }`,
  only the fields the textfield adapters actually read.
- `generic.ts` — `GenericComponent`: distributive `{ [K in Exclude<FormComponentType,
MigratedComponentType>]: Omit<Component,'type'> & { type: K } }[…]`. One legacy-shaped member
  per not-yet-migrated literal, so `AnyFormComponent` stays total and `Extract` works per key.
  Shrinks to `never` once everything is migrated.
- `index.ts` — `FormComponent` (migrated union, currently `= TextFieldComponent`),
  `MigratedComponentType`, `AnyFormComponent`, and `ComponentOfType<K> =
Extract<AnyFormComponent, { type: K }>`. **No `narrowComponent` helper** — the earlier
  cast-based slice was removed.

`inputComponentRegistryUtils.ts`:

- `InputComponentProps<T extends Component = Component>` — generic; migrated adapters pass
  their variant, un-migrated adapters keep the `Component` default (untouched).
- `InputComponentType = Exclude<FormComponentType, 'formioTextArea' | 'password' | 'panel'>`
  — the exact set the input registry supports (40 keys).
- `InputComponentRegistry` — the mapped/exhaustive type shown above.

`components/text-field/InputTextField.tsx`:

- Signature is `({ component }: InputComponentProps<TextFieldComponent>)`. `component` is a
  `TextFieldComponent` directly — zero casts, zero runtime checks.

`RenderInputComponent.tsx`:

- One documented boundary cast at dispatch: `componentRegistry[component.type as
InputComponentType] as ComponentType<InputComponentProps> | undefined` (indexing the mapped
  registry by a runtime string yields a union of incompatible-prop adapters JSX can't spread).
  This is the ONLY cast in the framework; adapters stay cast-free.

### Verified

- Typecheck: `node ../../node_modules/typescript/bin/tsc -p tsconfig.json` in
  `packages/shared-frontend` → **passes** (EXIT 0).
- Negative test 1 (safety): adding `component.values` inside `InputTextField` →
  `TS2339: Property 'values' does not exist on type 'TextFieldComponent'`.
- Negative test 2 (exhaustiveness): removing the `textfield` key from the registry →
  `TS2741: Property 'textfield' is missing … but required in type 'InputComponentRegistry'`.
- Pre-existing test drift: `InputSelect.test.tsx` fails in THIS worktree on the baseline too
  (dependency drift — TS6/React duplication); unrelated to these changes.

### Worktree / tooling note

This branch is checked out at `/Users/torvik/Dev/skjemabygging-formio`. `pnpm exec tsc` there
resolves a stale `typescript@5.9.3` path; the installed TS is `6.0.3`. Run tsc directly:
`node ../../node_modules/typescript/bin/tsc -p tsconfig.json`. Vitest:
`node ../../node_modules/vitest/vitest.mjs --run <file>`.

## How to migrate the next component (repeatable recipe)

1. Pick a type (e.g. `radiopanel`). Grep every `component.` access in its `Input*`/`Summary*`
   adapters and any util they pass `component` to, so the variant is grounded in real usage.
2. Add `component-types/<name>.ts`: `interface XComponent extends BaseComponent { type:
'<literal>'; ...only-its-fields }`. One adapter serving several types uses a union literal
   (e.g. `type: 'fieldset' | 'navSkjemagruppe'`). Recursive children should be typed
   `AnyFormComponent[]`, not `Component[]`, so narrowing propagates down the tree.
3. Add the variant to `FormComponent` in `component-types/index.ts` and re-export it. It drops
   out of `GenericComponent` automatically.
4. Change the adapter signature to `InputComponentProps<XComponent>` (input) / the summary
   equivalent. Remove any ad-hoc `as XComponent` casts (e.g. `DataFetcherComponent` in
   `InputDataFetcher.tsx`).
5. Typecheck. Fix now-invalid property accesses (that is the point).

## Remaining work toward "no `Component` in shared-frontend"

1. **Summary registry**: apply the same generic-props + mapped-registry treatment to
   `FormComponentProps` / the registry in `RenderSummaryForm.tsx` (mirror `SupportedSummaryComponentType`).
2. **Single ingestion boundary**: convert incoming form JSON (`Component` from `NavFormType`)
   to `AnyFormComponent` once, in the form-definition context where the tree is already walked
   (`enrichFormWithBaseSubmissionPath`). After that, `Component` should appear nowhere else in
   shared-frontend.
3. **Tree-walkers** (validation, conditional eval, prefill, calculated/default values):
   retype params `Component -> AnyFormComponent` / `BaseComponent`. Two observations from the
   audit:
    - `deriveValidations.ts` already `switch (component.type)` — the union upgrades it for free;
      specialized helpers (`collectIdentityDescriptors`, …) take the narrowed variant.
    - `calculatedValues.ts` reads semi-cross-cutting fields (`inputType`) off arbitrary
      components. Per field, decide: promote to `BaseComponent` (if structurally shared) OR turn
      the predicate into a **type guard** (e.g. `isNumericComponent(c): c is NumberComponent |
CurrencyComponent | YearComponent`) and narrow before reading.
4. **`BaseComponent` scope**: expand it to the fields walkers read generically (`validate`,
   `conditional`, `customConditional`, `calculateValue`, `clearOnHide`, `components`, `input`,
   `hidden`, `key`, `label`, `baseSubmissionPath`, probably `inputType`/`properties`). Keep it
   derived via `Pick<Component, …>` so sub-types stay reused.

## Open decisions

- Location: keep types in `shared-frontend/src/form-components/component-types/` (max isolation
  from legacy) vs a new `shared-domain` module that does not touch `Component`. Recommendation:
  keep in shared-frontend until the render is out of soft-launch.
- Whether the ingestion boundary stays a pure cast or adds runtime validation (Zod / guards).
