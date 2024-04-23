import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface DateValidationObject {
  value: string;
  label: string;
  required?: boolean;
  fromDate?: string;
  toDate?: string;
}

const validateDate = (dateValidationObject: DateValidationObject, translate): string | undefined => {
  if ((dateValidationObject.value ?? '') === '') {
    if (dateValidationObject.required) {
      return translate('required', { field: dateValidationObject.label });
    }
  } else if (!dateUtils.isValid(dateValidationObject.value, 'submission')) {
    return translate('invalid_date', { field: dateValidationObject.label });
  } else if (
    dateValidationObject.fromDate &&
    dateUtils.isBeforeDate(dateValidationObject.value, dateValidationObject.fromDate, true)
  ) {
    return translate('minDate', {
      field: dateValidationObject.label,
      minDate: dateUtils.toLocaleDate(dateValidationObject.fromDate),
    });
  } else if (
    dateValidationObject.toDate &&
    dateUtils.isBeforeDate(dateValidationObject.toDate, dateValidationObject.value, true)
  ) {
    return translate('maxDate', {
      field: dateValidationObject.label,
      maxDate: dateUtils.toLocaleDate(dateValidationObject.toDate),
    });
  }
};

export { validateDate };
