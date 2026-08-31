# Typed form components — migration (TEMPORARY DOC)

> Status: **implemented** across `packages/shared-frontend/src`. Delete this file
> once the pattern is captured in a skill (`create-shared-frontend-component` /
> `shared-frontend-form-framework`).
> Branch: `lotorvik/typed-form-components` (from `fyllut2-render`).

## Problem

`Component` (`packages/shared-domain/src/models/form/component.ts`) is a ~150-property
"god interface": nearly everything is optional and `type` is just `string`. The legacy
Formio code and the new render both used it, so every `Input*` / `Summary*` adapter and
every tree-walker could read any of the 150 props with no guarantee the prop was valid
for that component `type`.

## Goal

Type form components in the new render precisely, keyed on their `type`, and remove
`Component` from shared-frontend except a **single ingestion boundary**. Legacy Formio
code keeps using `Component` untouched.

## Design: discriminated union + mapped registry (Option B), `Definition` naming

Per-type interfaces with a literal `type` discriminant, combined into a discriminated
union. An adapter/walker declares the variant it handles and receives that exact type —
no cast, no runtime `type` re-check.

**Naming:** every type/interface carries a `Definition` suffix so it is never confused
with a React component (e.g. `TextField.tsx` is a component; `TextFieldDefinition` is its
form-definition shape).

```
BaseComponentDefinition                 // Pick<Component, ...> cross-cutting fields (no `type`)
  ├ TextFieldDefinition   extends BaseComponentDefinition { type: 'textfield'; ...extras }
  ├ DataGridDefinition    extends BaseComponentDefinition { type: 'datagrid'; ... }
  └ ... (~40 variants)
TypedComponentDefinition   = TextFieldDefinition | ...            // the typed union
TypedComponentType         = TypedComponentDefinition['type']
GenericComponentDefinition = distributive fallback for Exclude<FormComponentType, TypedComponentType>
ComponentDefinition        = TypedComponentDefinition | GenericComponentDefinition   // TOTAL
ComponentDefinitionByType<K> = Extract<ComponentDefinition, { type: K }>
```

Given `c: ComponentDefinition`, `switch (c.type)` / `if (c.type === …)` narrows
automatically to the matching variant.

### Self-referential tree (key detail)

Both `BaseComponentDefinition.components` and `GenericComponentDefinition.components` are
`ComponentDefinition[]` (NOT `Component[]`). This unifies the tree and removes the
pervasive `Component[] | ComponentDefinition[]` union errors while walking children.
Arrays are covariant, so variants remain assignable to `Component`.

### Mapped, exhaustive registries

Adapter props are contravariant, so once an adapter's prop is a narrow variant, a plain
`Record<string, ComponentType<{component: Component}>>` registry no longer accepts it. The
registries are **mapped types** that tie each key to its variant and are therefore
exhaustive (a missing key is a compile error):

```ts
type InputComponentRegistry = {
    [K in InputComponentType]: ComponentType<InputComponentProps<ComponentDefinitionByType<K>>>;
};
```

- `InputComponentType   = Exclude<FormComponentType, 'formioTextArea' | 'password' | 'panel'>`
- `SummaryComponentType = Exclude<FormComponentType, 'formioTextArea' | 'password'>` (includes `panel`)

Dispatch sites (`RenderInputComponent.tsx`, `RenderComponent.tsx`) do exactly ONE
documented cast: `registry[type as XType] as ComponentType<Props> | undefined` (indexing a
mapped registry by a runtime string yields a union of incompatible-prop adapters JSX can't
spread). Adapters themselves stay cast-free.

### `ComponentDefinition` is assignable to `Component`

Every variant is built from `Pick<Component, …>` plus a literal `type`, so the union flows
**into** shared-domain utilities typed as `Component` with no cast. The boundary stays
one-directional.

## The single ingestion boundary

`Form.components` (shared-domain) and `navFormUtils` helpers return `Component[]`. The
sanctioned conversion is one exported helper in
`context/form-definition/formDefinitionUtils.ts`:

```ts
export const toComponentDefinitions = (components: Component[] = []): ComponentDefinition[] =>
    components as ComponentDefinition[]; // documented boundary cast
```

Call it at every point where shared-domain `Component[]` enters a `ComponentDefinition`
walker (context ingestion, `enrich*` outputs, etc.). Pre-boundary utilities that operate
on the raw `Form` (`getResolvedSubmissionPath`, `enrich*BaseSubmissionPath`, `formPrefill`)
stay on `Component`; their outputs are wrapped at the call site.

## Implemented state

`packages/shared-frontend/src/form-components/component-types/`:

- `base.ts` — `BaseComponentDefinition = Pick<Component, ...>` (rich generic-read set incl.
  `hideLabel`) `& { components?: ComponentDefinition[] }`. Type-only import of
  `ComponentDefinition` (cycle is fine).
- `definitions.ts` — all ~40 `<Name>Definition` variants, `TypedComponentDefinition`,
  `TypedComponentType`. Distinctive fields added via `Pick<Component, …>` /
  `Pick<DataFetcherComponent, …>`.
- `generic.ts` — `GenericComponentDefinition` distributive fallback; children typed
  `ComponentDefinition[]`.
- `index.ts` — `ComponentDefinition`, `ComponentDefinitionByType`, re-exports.

Adapters & registries:

- `inputComponentRegistryUtils.ts` — `InputComponentProps<T extends ComponentDefinition>`;
  `InputComponentType`; mapped `InputComponentRegistry`.
- Every `Input*` adapter typed `InputComponentProps<XDefinition>` (local-props adapters —
  Container/FormGroup/DataGrid/Alert/HtmlElement/Row — updated by hand).
- `types.ts` — generic `FormComponentProps<T>`, mapped `FormComponentRegistry` over
  `SummaryComponentType`; every `Summary*` adapter typed to its variant.

Walkers / contexts / validation / utils: all migrated from `Component` to
`ComponentDefinition`, with `toComponentDefinitions` at the boundaries
(`FormDefinitionContext`, `calculatedValues`, `defaultValues`, `hiddenSubmissionPaths`,
`deriveValidations`, `dataGridRows`, `InputDataGrid`, `useFormPageController`,
`FormErrorSummary`, `FormPage`, `SummaryContent`, validation descriptors/rules/validators).

`components/error-summary/FormErrorSummary.tsx` imports only the **type**
`ComponentDefinition` (not the boundary helper), respecting the generic-`components` rule.

## Verified

- Typecheck (whole package): `node ../../node_modules/typescript/bin/tsc -p tsconfig.json`
  in `packages/shared-frontend` → **EXIT 0**.
- Vitest (migrated suites): pass, except `validators.test.ts` which fails identically on
  the baseline (`validatorUtils.isNationalIdentityNumber is not a function`, env/module
  drift — unrelated to typing). `InputSelect.test.tsx` also pre-fails on baseline.
- Negative 1 (safety): accessing an unknown prop on a narrowed variant → `TS2339`.
- Negative 2 (exhaustiveness): dropping a key from a mapped registry → `TS2741`.

## Tooling note (worktree quirk)

Checked out at `/Users/torvik/Dev/skjemabygging-formio`. `pnpm exec tsc` resolves a stale
TS path. Run tsc/vitest directly **from the package dir**:
`node ../../node_modules/typescript/bin/tsc -p tsconfig.json` and
`node ../../node_modules/vitest/vitest.mjs --run <file>`.

## Migrating a future new type (recipe)

1. Grep every `component.` access in its `Input*`/`Summary*` adapters and any util they
   pass `component` to, to ground the variant in real usage.
2. Add `<Name>Definition extends BaseComponentDefinition { type: '<literal>'; ...only-its-fields }`
   in `definitions.ts` (union literal if one adapter serves several types). Recursive
   children are already `ComponentDefinition[]`.
3. Add it to `TypedComponentDefinition`; it drops out of `GenericComponentDefinition`
   automatically.
4. Type the adapter `InputComponentProps<XDefinition>` (input) / the summary equivalent;
   remove ad-hoc `as X` casts.
5. Typecheck; fix now-invalid property accesses (that is the point).

## Open decisions

- Location: kept in `shared-frontend/src/form-components/component-types/` until the render
  leaves soft-launch (vs. a new shared-domain module).
- Whether the ingestion boundary stays a pure cast or adds runtime validation (Zod/guards).
