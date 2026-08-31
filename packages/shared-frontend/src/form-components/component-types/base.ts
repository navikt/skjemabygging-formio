import { Component } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * Fields shared by (nearly) every rendered form component, independent of `type`.
 *
 * Derived from the legacy `Component` "god interface" via `Pick` so we reuse the
 * existing sub-type definitions (`ComponentValidate`, `ComponentConditional`,
 * `ComponentProperties`, ...) instead of forking them. This keeps the typed
 * variants DRY and automatically in sync with the shared-domain sub-types.
 *
 * `type` is intentionally NOT included here: each variant must declare its own
 * `type` literal so it can act as the discriminant of the `FormComponent` union.
 *
 * Add a field here only when it is meaningful for essentially all component
 * types. Anything type-specific belongs on the individual variant instead.
 */
type BaseComponent = Pick<
  Component,
  | 'id'
  | 'navId'
  | 'key'
  | 'label'
  | 'description'
  | 'hidden'
  | 'clearOnHide'
  | 'conditional'
  | 'customConditional'
  | 'validate'
  | 'properties'
  | 'baseSubmissionPath'
>;

export type { BaseComponent };
