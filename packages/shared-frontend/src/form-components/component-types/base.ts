import { Component } from '@navikt/skjemadigitalisering-shared-domain';

/**
 * Cross-cutting fields shared by (essentially) every form component, independent
 * of `type`. Derived from the legacy `Component` interface via `Pick` so the
 * field types stay in sync with shared-domain and every definition variant is
 * structurally assignable to `Component`.
 *
 * The set intentionally covers the fields that shared-frontend reads
 * *generically* - i.e. off a component whose concrete type is not (yet) known:
 * the tree-walkers (validation, conditional eval, prefill, calculated/default
 * values) and the shared input/date utilities. Fields that only a single
 * component's renderer reads live on that component's own `*Definition` variant
 * instead, which is where the per-type strictness pays off.
 *
 * `type` is intentionally excluded: each variant declares its own `type`
 * literal, which is the discriminant of the `ComponentDefinition` union.
 */
type BaseComponentDefinition = Pick<
  Component,
  // Identity / structure
  | 'id'
  | 'navId'
  | 'key'
  | 'label'
  | 'description'
  | 'components'
  | 'input'
  | 'baseSubmissionPath'
  // Visibility / logic
  | 'hidden'
  | 'clearOnHide'
  | 'conditional'
  | 'customConditional'
  | 'validate'
  | 'properties'
  | 'calculateValue'
  | 'allowCalculateOverride'
  // Values / data source
  | 'values'
  | 'data'
  | 'dataSrc'
  | 'valueProperty'
  | 'labelProperty'
  | 'defaultValue'
  // Prefill
  | 'prefillKey'
  | 'prefillValue'
  | 'customLabels'
  // Shared input presentation
  | 'inputType'
  | 'fieldSize'
  | 'readOnly'
  | 'selectType'
  | 'autocomplete'
  | 'spellCheck'
  | 'hideLabel'
  | 'additionalDescriptionLabel'
  | 'additionalDescriptionText'
  | 'content'
  | 'tree'
  // Attachment / prefill metadata read generically by walkers
  | 'attachmentType'
  | 'otherDocumentation'
  | 'protectedApiKey'
  // Date constraints (read by the shared date utilities)
  | 'beforeDateInputKey'
  | 'earliestAllowedDate'
  | 'latestAllowedDate'
  | 'mayBeEqual'
  | 'specificEarliestAllowedDate'
  | 'specificLatestAllowedDate'
>;

export type { BaseComponentDefinition };
