import { InputMode } from '@navikt/skjemadigitalisering-shared-domain';
import { BaseComponent } from './base';

/**
 * Editable single-line text input (`type: 'textfield'`).
 *
 * Only the fields actually consumed by the textfield adapters
 * (`InputTextField` / `SummaryTextField`) are declared. Before adding a field,
 * grep `component.` in those adapters (and any util they call) so the variant
 * stays grounded in real usage rather than guesses.
 */
interface TextFieldComponent extends BaseComponent {
  type: 'textfield';
  autocomplete?: string;
  inputType?: InputMode;
  spellCheck?: boolean;
  fieldSize?: string;
  readOnly?: boolean;
  prefillValue?: string | object;
  additionalDescriptionLabel?: string;
  additionalDescriptionText?: string;
}

export type { TextFieldComponent };
