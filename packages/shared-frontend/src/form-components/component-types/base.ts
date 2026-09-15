import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import type { ComponentDefinition } from './index';

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
  | 'id'
  | 'navId'
  | 'key'
  | 'label'
  | 'description'
  | 'input'
  | 'baseSubmissionPath'
  | 'hidden'
  | 'clearOnHide'
  | 'conditional'
  | 'customConditional'
  | 'validate'
  | 'properties'
  | 'calculateValue'
  | 'allowCalculateOverride'
  | 'values'
  | 'data'
  | 'dataSrc'
  | 'valueProperty'
  | 'labelProperty'
  | 'defaultValue'
  | 'prefillKey'
  | 'prefillValue'
  | 'customLabels'
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
  | 'attachmentType'
  | 'otherDocumentation'
  | 'protectedApiKey'
  | 'beforeDateInputKey'
  | 'earliestAllowedDate'
  | 'latestAllowedDate'
  | 'mayBeEqual'
  | 'specificEarliestAllowedDate'
  | 'specificLatestAllowedDate'
> & {
  /**
   * Child components. Narrowed from the legacy `Component[]` to
   * `ComponentDefinition[]` so the definition tree is self-referential and
   * recursing into children keeps full per-type typing.
   */
  components?: ComponentDefinition[];
};

export type { BaseComponentDefinition };
