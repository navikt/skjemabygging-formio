import type { FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
import type { ValidationRules } from '../validation/validators';
import type { ReadMoreProps } from './read-more/ReadMore';
import { Spacing } from './shared/FormElementBox';

/**
 * The constraints a form-definition adapter maps from what the form author declared. Rules that
 * follow from what the component *is* (a valid email, a valid account number, a date within the
 * picker range, ...) are owned by the component itself and are merged with these.
 */
type FieldConstraints = Pick<
  ValidationRules,
  'minLength' | 'maxLength' | 'min' | 'max' | 'minYear' | 'maxYear' | 'digitsOnly' | 'pattern'
>;

/**
 * Internal rule shape used while components compose validation. It deliberately excludes `required`:
 * required is always an explicit component prop, so callers cannot provide conflicting requirements.
 */
type FieldValidationProp = Omit<ValidationRules, 'required'>;

/** Constraints that a normal text field can legitimately receive from a caller. */
type TextFieldValidation = Pick<
  FieldValidationProp,
  'minLength' | 'maxLength' | 'digitsOnly' | 'pattern' | 'coverPageValue' | 'notEqual'
>;

type TextAreaValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
type ChoiceValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;
type DatePickerValidation = Pick<FieldValidationProp, 'fromDate' | 'toDate' | 'dateMessages'>;
type MonthPickerValidation = Pick<FieldValidationProp, 'monthMinYear' | 'monthMaxYear'>;
type PhoneNumberValidation = Pick<FieldValidationProp, 'minLength' | 'maxLength' | 'pattern' | 'notEqual'>;

interface BaseFieldProps {
  statePath: string;
  label?: string;
  description?: string;
  required?: boolean;
  readOnly?: boolean;
  fieldSize?: FieldSize;
  marginBottom?: Spacing;
  readMore?: ReadMoreProps;
}

export type {
  BaseFieldProps,
  ChoiceValidation,
  DatePickerValidation,
  FieldConstraints,
  FieldValidationProp,
  MonthPickerValidation,
  PhoneNumberValidation,
  TextAreaValidation,
  TextFieldValidation,
};
