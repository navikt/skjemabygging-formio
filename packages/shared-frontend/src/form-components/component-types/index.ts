import { FormComponentType } from '@navikt/skjemadigitalisering-shared-domain';
import { GenericComponent } from './generic';
import { TextFieldComponent } from './textfield';

/**
 * Discriminated union of the form components that have been migrated to
 * type-safe variants, keyed on the `type` literal discriminant.
 *
 * Grow this union one entry at a time as each component type is migrated:
 *
 *   type FormComponent = TextFieldComponent | RadioPanelComponent | ...;
 */
type FormComponent = TextFieldComponent;

/** The set of `type` literals that already have a dedicated typed variant. */
type MigratedComponentType = FormComponent['type'];

/**
 * Total union over every `FormComponentType`: the migrated variants plus the
 * `GenericComponent` fallback for everything not yet migrated.
 *
 * This is the type the render registries and the shared-frontend tree-walkers
 * should consume. Because it is total and distributive,
 * `Extract<AnyFormComponent, { type: K }>` resolves to the exact variant for any
 * component type `K` - `TextFieldComponent` for migrated types, and the
 * legacy-shaped fallback member otherwise. Legacy `Component` therefore only
 * needs to appear at the single ingestion boundary that converts incoming form
 * JSON into `AnyFormComponent`.
 */
type AnyFormComponent = FormComponent | GenericComponent;

/**
 * The typed variant for a given component `type` literal. Resolves to the
 * migrated variant when one exists, otherwise to the generic fallback member.
 */
type ComponentOfType<K extends FormComponentType> = Extract<AnyFormComponent, { type: K }>;

export type { BaseComponent } from './base';
export type { GenericComponent } from './generic';
export type { TextFieldComponent } from './textfield';
export type { AnyFormComponent, ComponentOfType, FormComponent, MigratedComponentType };
