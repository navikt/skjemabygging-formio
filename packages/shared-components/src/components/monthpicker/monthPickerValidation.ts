import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';

interface ValidationOptions {
  label: string;
  translate: TFunction;
  required?: boolean;
  minYear?: number;
  maxYear?: number;
}

const validateDate = (date: string | undefined, options: ValidationOptions): string | undefined => {
  const { label, translate, required, minYear, maxYear } = options;

  if (!date && required) {
    return translate('required', { field: label });
  }

  if (!date) return;

  if (!dateUtils.isValidMonthSubmission(date)) {
    return translate('invalid_date', { field: label });
  }

  const minYearIso = minYear && dateUtils.startOfYear(String(minYear))?.toISO();
  const maxYearIso = maxYear && dateUtils.endOfYear(String(maxYear))?.toISO();

  if (minYearIso && dateUtils.isBeforeDate(date, minYearIso)) {
    return translate('minYear', {
      field: label,
      minYear,
    });
  }

  if (maxYearIso && dateUtils.isAfterDate(date, maxYearIso)) {
    return translate('maxYear', {
      field: label,
      maxYear,
    });
  }
};

export { validateDate };
