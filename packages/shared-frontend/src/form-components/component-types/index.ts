import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { TextFieldComponent } from './textfield';

/**
 * Discriminated union of the form components that have been migrated to
 * type-safe variants, keyed on the `type` literal.
 *
 * Extend this union one entry at a time as each component type is migrated:
 *
 *   type FormComponent = TextFieldComponent | RadioPanelComponent | ...;
 *
 * Everything not yet listed here still flows through the render as the legacy
 * `Component` god-interface, so migration is fully incremental and legacy code
 * stays untouched.
 */
type FormComponent = TextFieldComponent;

/** The set of `type` literals that currently have a typed variant. */
type MigratedComponentType = FormComponent['type'];

/**
 * Narrow a legacy `Component` to its typed variant at the render boundary.
 *
 * This is the single, documented bridge between the untyped legacy `Component`
 * and the typed `FormComponent` union. Callers must already have keyed on
 * `component.type` (the registries do), so the throw is a defensive guard for
 * misrouting rather than expected control flow.
 *
 * The eventual end state (see the plan doc) types the registries themselves so
 * each adapter receives its narrowed variant directly and this helper is no
 * longer needed. Until then it lets us migrate one adapter at a time without
 * touching the shared registry plumbing.
 */
const narrowComponent = <T extends MigratedComponentType>(
  component: Component,
  type: T,
): Extract<FormComponent, { type: T }> => {
  if (component.type !== type) {
    throw new Error(`Expected component of type "${type}" but received "${component.type}"`);
  }
  return component as unknown as Extract<FormComponent, { type: T }>;
};

export type { BaseComponent } from './base';
export type { TextFieldComponent } from './textfield';
export { narrowComponent };
export type { FormComponent, MigratedComponentType };
