# Typed form components — migration plan (TEMPORARY DOC)

> Delete this file once the migration pattern is established / documented in a skill.
> Branch: `lotorvik/typed-form-components` (from `fyllut2-render`).

## Problem

`Component` (in `packages/shared-domain/src/models/form/component.ts`) is a ~150-property
"god interface" where nearly everything is optional and `type` is just `string`. It is used
by both the **legacy Formio code** and the **new render** in `packages/shared-frontend`. In
the new render this means every `Input*` / `Summary*` adapter can read any of the 150 props
with zero guarantee the prop is valid for that component `type` (e.g. reading
`component.values` on a textfield). The only prior narrowing was an unsound
`component as DataFetcherComponent` cast.

## Chosen approach: discriminated union, scoped to shared-frontend

Introduce per-type interfaces with a literal `type` discriminant, combined into a
`FormComponent` discriminated union. Keep these **new types layered on top of `Component`**
so the legacy `Component` interface and all legacy code stay untouched. The two type systems
meet only at the render boundary.

Key properties:

- **DRY**: variants derive shared fields from the existing `Component` via `Pick`
  (`BaseComponent`), so shared sub-types (`ComponentValidate`, `ComponentConditional`, ...)
  are reused, not forked.
- **Incremental**: `FormComponent` starts with one member and grows one component at a time.
  Anything not yet migrated keeps flowing through as legacy `Component`.
- **Legacy intact**: no change to `shared-domain` `Component` or any Formio code.

## What has been done in this branch (the vertical slice: `textfield`)

New module `packages/shared-frontend/src/form-components/component-types/`:

- `base.ts` — `BaseComponent`, a `Pick<Component, ...>` of the universally-shared fields.
  `type` is intentionally excluded so each variant declares its own discriminant literal.
- `textfield.ts` — `TextFieldComponent extends BaseComponent { type: 'textfield'; ... }`.
  Only fields actually read by the textfield adapters are declared.
- `index.ts` — the `FormComponent` union (currently `= TextFieldComponent`),
  `MigratedComponentType`, and `narrowComponent(component, type)`: the single documented
  boundary bridge from legacy `Component` to the typed variant.

Adapter wired:

- `components/text-field/InputTextField.tsx` now calls
  `const component = narrowComponent(rawComponent, 'textfield')` at the top and works with
  the typed `TextFieldComponent` for the rest of the adapter.
- `SummaryTextField.tsx` was left as-is (it only forwards props / reads no component fields).

### Why an internal `narrowComponent` call (and not typed registries yet)

The registries (`inputComponentRegistry`, the summary registry in `RenderSummaryForm.tsx`)
are typed as `Record<string, ComponentType<{ component: Component }>>`. Changing a single
adapter's _prop signature_ to `TextFieldComponent` would break the registry assignment
(props are contravariant) and the `registry[component.type]` dispatch + JSX spread. So the
slice keeps adapter signatures unchanged and narrows **inside** the adapter. This compiles
with zero changes to shared plumbing and is genuinely incremental.

### Verified

- `pnpm exec tsc` in `packages/shared-frontend` → passes.
- Negative test: adding `component.values` inside `InputTextField` produces
  `TS2339: Property 'values' does not exist on type 'TextFieldComponent'` → the safety bites.

## How to migrate the next component (repeatable recipe)

1. Pick a component type (e.g. `radiopanel`). Grep every `component.` access in its
   `Input*` and `Summary*` adapters **and** any util they pass `component` to
   (`inputComponentRegistryUtils.ts`, `formDefinitionUtils.ts`, summary `shared/`), so the
   variant is grounded in real usage.
2. Add `component-types/<name>.ts` with `interface XComponent extends BaseComponent { type: '<literal>'; ...only-its-fields }`.
    - If one adapter serves several `type` values (e.g. `fieldset` + `navSkjemagruppe` →
      `InputFormGroup`), use a union literal: `type: 'fieldset' | 'navSkjemagruppe'`.
    - Recursive children should be typed `FormComponent[]`, not `Component[]`, so narrowing
      propagates down the tree.
3. Add the variant to the `FormComponent` union in `component-types/index.ts` and re-export it.
4. In the adapter(s), narrow at the top: `const component = narrowComponent(raw, '<literal>')`.
5. `pnpm exec tsc` in `packages/shared-frontend`. Fix any now-invalid property accesses
   (that is the point). Retire any related ad-hoc `as XComponent` casts (e.g. the
   `DataFetcherComponent` cast in `InputDataFetcher.tsx`).

## Target end state (do this once several components are migrated)

Replace the internal `narrowComponent` calls with **typed registries** so each adapter
receives its narrowed variant directly and the discriminant is enforced by the registry:

```ts
// A generic "catch-all" for not-yet-migrated types keeps the union total:
interface GenericComponent extends Component {
  type: Exclude<FormComponentType, MigratedComponentType>;
}
type FormComponent = TextFieldComponent | /* ...migrated... */ | GenericComponent;

type InputComponentRegistry = {
  [K in FormComponent['type']]: ComponentType<{
    component: Extract<FormComponent, { type: K }>;
    submissionPath?: string;
    componentRegistry?: InputComponentRegistry;
  }>;
};
```

This gives compile-time **exhaustiveness** (a missing registry key is an error, mirroring the
guarantee `FORM_COMPONENT_TYPES` already gives the PDF/Summary registries) and removes the
need for internal narrowing. Two dispatch sites need a one-time adjustment when switching to
the mapped type:

- `RenderInputComponent.tsx` / `RenderComponent.tsx`: `registry[component.type]` — index with
  `component.type as keyof InputComponentRegistry`.
- The JSX `<RegistryComponent component={component} />` becomes a union-of-components with
  divergent props; cast `RegistryComponent` to `ComponentType<{ component: Component }>` at
  the single call site.

Do the mapped-registry switch in a dedicated pass (it touches shared dispatch, so it deserves
its own review), not while migrating individual adapters.

## Open decisions for the next session

- Location: types currently live in `shared-frontend/src/form-components/component-types/`
  (max isolation from legacy). Alternative: a new `shared-domain` module that does NOT touch
  the existing `Component`. Recommendation: keep in shared-frontend until the render is out of
  soft-launch.
- Whether `narrowComponent` should stay a pure type assertion or add real runtime validation
  (Zod / hand-rolled guards) at the boundary. Currently it is an assert-with-defensive-throw.
- When to introduce `GenericComponent` + the mapped registry (see target end state).
