import { Component, Submission, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import {
  getDatePickerFromDate,
  getDatePickerToDate,
  getMonthPickerMaxYear,
  getMonthPickerMinYear,
} from '../form-components/dateDefinitionUtils';
import { ValidationRules } from './validators';

const normalizeCustomValidation = (customValidation?: string) => customValidation?.trim().replace(/;$/, '');

const isRedundantLegacyCustomValidation = (component: Component) => {
  const customValidation = normalizeCustomValidation(component.validate?.custom);

  return (
    (component.type === 'bankAccount' && customValidation === 'valid = instance.validateAccountNumber(input)') ||
    (component.type === 'orgNr' && customValidation === 'valid = instance.validateOrganizationNumber(input)')
  );
};

const toValidationRules = (
  component: Component,
  pageComponents: Component[],
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationRules => ({
  required: component.validate?.required,
  ...(component.validate?.onlyAvailableItems
    ? { onlyAvailableItems: (component.values ?? component.data?.values ?? []).map(({ value }) => value) }
    : {}),
  minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
  maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
  email: component.type === 'email' ? true : undefined,
  coverPageValue: component.type === 'firstName' || component.type === 'surname' ? true : undefined,
  numberType:
    component.type === 'number' || component.type === 'currency'
      ? component.inputType === 'numeric'
        ? 'integer'
        : 'decimal'
      : undefined,
  min: typeof component.validate?.min === 'number' ? component.validate.min : undefined,
  max: typeof component.validate?.max === 'number' ? component.validate.max : undefined,
  year: component.type === 'year' ? true : undefined,
  minYear: typeof component.validate?.minYear === 'number' ? component.validate.minYear : undefined,
  maxYear: typeof component.validate?.maxYear === 'number' ? component.validate.maxYear : undefined,
  digitsOnly: component.validate?.digitsOnly,
  date: component.type === 'navDatepicker' ? true : undefined,
  fromDate:
    component.type === 'navDatepicker' ? getDatePickerFromDate(component, pageComponents, submission) : undefined,
  toDate: component.type === 'navDatepicker' ? getDatePickerToDate(component) : undefined,
  month: component.type === 'monthPicker' ? true : undefined,
  monthMinYear: component.type === 'monthPicker' ? getMonthPickerMinYear(component) : undefined,
  monthMaxYear: component.type === 'monthPicker' ? getMonthPickerMaxYear(component) : undefined,
  organizationNumber: component.type === 'orgNr' ? true : undefined,
  nationalIdentityNumber: component.type === 'fnrfield' ? true : undefined,
  ...(component.type === 'bankAccount' ? { accountNumber: true } : {}),
  ...(component.type === 'iban' ? { iban: true } : {}),
  ...(component.type === 'activities' && submissionMethod === 'digital' ? { required: true } : {}),
  customValidation:
    component.validate?.custom && !isRedundantLegacyCustomValidation(component) ? { component } : undefined,
  ...(component.validate?.customMessage ? { customMessage: component.validate.customMessage } : {}),
});

const hasValidationRules = (rules: ValidationRules) =>
  Object.values(rules).some((rule) => rule !== undefined && rule !== false);

export { hasValidationRules, toValidationRules };
