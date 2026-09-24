import type {
  Component,
  ComponentConditional,
  ComponentValidate,
  InputMode,
} from '@navikt/skjemadigitalisering-shared-domain';
import type { ComponentDefinition } from './index';

/**
 * Cross-cutting fields shared by form components, independent of `type`.
 *
 * Keep this deliberately small: fields that belong only to a family of
 * components are expressed through the capability types below and composed by
 * the relevant concrete definitions.
 *
 * This is the transition shape while form definitions enter shared-frontend
 * from the legacy shared-domain `Component` model. The next phase moves this
 * complete discriminated model to shared-domain so shared-backend, the builder,
 * and shared-frontend all consume the same contract. That removes the legacy
 * compatibility intersection on `components` and the ingestion conversion.
 *
 * `type` is intentionally excluded: each variant declares its own `type`
 * literal, which is the discriminant of the `ComponentDefinition` union.
 */
interface BaseComponentDefinition {
  id?: string;
  navId?: string;
  key: string;
  label: string;
  description?: string;
  input?: boolean;
  baseSubmissionPath?: string;
  hidden?: boolean;
  conditional?: ComponentConditional;
  customConditional?: string;
  validate?: ComponentValidate;
  calculateValue?: string;
  prefillValue?: string | object;
  fieldSize?: string;
  readOnly?: boolean;
  hideLabel?: boolean;
  additionalDescriptionLabel?: string;
  additionalDescriptionText?: string;

  /**
   * A self-referential definition tree lets walkers retain the per-type
   * discriminant while recursing.
   */
  components?: ComponentDefinition[] & Component[];
}

interface InputModeDefinition {
  inputType?: InputMode;
}

interface TextInputDefinition extends InputModeDefinition {
  autocomplete?: string;
  spellCheck?: boolean;
}

export type { BaseComponentDefinition, InputModeDefinition, TextInputDefinition };
