import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface DateValidationObject {
  value: string;
  label: string;
  required?: boolean;
  fromDate?: string;
  toDate?: string;
}

const validateDate = (dateValidationObject: DateValidationObject, translate): string | undefined => {
  const label = translate(dateValidationObject.label);

  if ((dateValidationObject.value ?? '') === '') {
    if (dateValidationObject.required) {
      return translate('required', { field: label });
    }
  } else if (!dateUtils.isValid(dateValidationObject.value, 'submission')) {
    return translate('invalid_date', { field: label });
  } else if (
    dateValidationObject.fromDate &&
    dateUtils.isBeforeDate(dateValidationObject.value, dateValidationObject.fromDate)
  ) {
    return translate('minDate', {
      field: label,
      minDate: dateUtils.toLocaleDate(dateValidationObject.fromDate),
    });
  } else if (
    dateValidationObject.toDate &&
    dateUtils.isBeforeDate(dateValidationObject.toDate, dateValidationObject.value)
  ) {
    return translate('maxDate', {
      field: label,
      maxDate: dateUtils.toLocaleDate(dateValidationObject.toDate),
    });
  }
};

export { validateDate };
