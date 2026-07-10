import { dateUtils, formatUtils, numberUtils, TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  email?: boolean;
  coverPageValue?: boolean;
  numberType?: 'integer' | 'decimal';
  min?: number;
  max?: number;
  year?: boolean;
  minYear?: number;
  maxYear?: number;
  date?: boolean;
  fromDate?: string;
  toDate?: string;
  month?: boolean;
  monthMinYear?: number;
  monthMaxYear?: number;
  organizationNumber?: boolean;
  nationalIdentityNumber?: boolean;
}

interface RuleViolation {
  textKey: string;
  params: Record<string, string | number>;
}

const normalizeMonthName = (value: string) => value.toLowerCase().replace(/\.$/, '').trim();

const toSubmissionMonth = (value: string, locale: string) => {
  if (dateUtils.isValidMonthSubmission(value)) {
    return value;
  }

  const trimmedValue = value.trim();
  const numericMonthMatch = /^(\d{2})[./\- ](\d{4})$/.exec(trimmedValue);
  if (numericMonthMatch) {
    const [, month, year] = numericMonthMatch;
    return Number(month) >= 1 && Number(month) <= 12 ? `${year}-${month}` : '';
  }

  const monthNameMatch = /^(.+)\s+(\d{4})$/.exec(trimmedValue);
  if (!monthNameMatch) {
    return '';
  }

  const [, monthName, year] = monthNameMatch;
  const normalizedMonthName = normalizeMonthName(monthName);
  const monthIndex = Array.from({ length: 12 }, (_, index) => index).findIndex((index) => {
    const date = new Date(Date.UTC(2024, index, 1));
    return [
      new Intl.DateTimeFormat(locale, { month: 'long' }).format(date),
      new Intl.DateTimeFormat(locale, { month: 'short' }).format(date),
    ]
      .map(normalizeMonthName)
      .includes(normalizedMonthName);
  });

  return monthIndex >= 0 ? `${year}-${String(monthIndex + 1).padStart(2, '0')}` : '';
};

interface ValidationOptions {
  allowTestTypes?: boolean;
}

/**
 * Pure validation: returns the first violation (message key + params) for a value, or undefined.
 * Translation happens at the boundary (ValidationContext), so these stay framework-decoupled.
 */
const validateValue = (
  value: unknown,
  field: string,
  rules: ValidationRules,
  currentLanguage: string = 'nb',
  options: ValidationOptions = {},
): RuleViolation | undefined => {
  if (rules.required && validatorUtils.isEmpty(value)) {
    return { textKey: TEXTS.validering.required, params: { field } };
  }
  if (validatorUtils.isEmpty(value)) {
    return undefined;
  }
  if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
    return { textKey: TEXTS.validering.minLength, params: { field, length: rules.minLength } };
  }
  if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
    return { textKey: TEXTS.validering.maxLength, params: { field, length: rules.maxLength } };
  }
  if (rules.email && typeof value === 'string' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
    return { textKey: TEXTS.validering.invalid_email, params: { field } };
  }
  if (rules.coverPageValue && typeof value === 'string' && !validatorUtils.isValidCoverPageValue(value)) {
    return { textKey: TEXTS.validering.containsInvalidCharacters, params: { field } };
  }
  if (rules.organizationNumber && typeof value === 'string' && !validatorUtils.isOrganizationNumber(value)) {
    return { textKey: TEXTS.validering.orgNrCustomError, params: { field } };
  }
  if (
    rules.nationalIdentityNumber &&
    typeof value === 'string' &&
    !validatorUtils.isNationalIdentityNumber(value, { allowTestTypes: options.allowTestTypes })
  ) {
    return { textKey: TEXTS.validering.fodselsnummerDNummer, params: { field } };
  }
  if (rules.date && typeof value === 'string') {
    const normalizedDate = dateUtils.isValid(value, 'submission') ? value : dateUtils.toSubmissionDate(value);
    if (!dateUtils.isValid(normalizedDate, 'submission')) {
      return { textKey: 'invalid_date', params: { field } };
    }
    if (rules.fromDate && dateUtils.isBeforeDate(normalizedDate, rules.fromDate)) {
      return {
        textKey: 'minDate',
        params: { field, minDate: dateUtils.toLocaleDate(rules.fromDate) },
      };
    }
    if (rules.toDate && dateUtils.isBeforeDate(rules.toDate, normalizedDate)) {
      return {
        textKey: 'maxDate',
        params: { field, maxDate: dateUtils.toLocaleDate(rules.toDate) },
      };
    }
  }
  if (rules.month && typeof value === 'string') {
    const locale = currentLanguage === 'en' ? 'en-US' : currentLanguage === 'nn' ? 'nn-NO' : 'nb-NO';
    const normalizedMonth = toSubmissionMonth(value, locale);
    if (!dateUtils.isValidMonthSubmission(normalizedMonth)) {
      return { textKey: 'invalid_date', params: { field } };
    }
    if (
      rules.monthMinYear !== undefined &&
      dateUtils.isBeforeDate(normalizedMonth, dateUtils.startOfYear(String(rules.monthMinYear)).toISODate() ?? '')
    ) {
      return {
        textKey: TEXTS.validering.minYear,
        params: { field, minYear: rules.monthMinYear },
      };
    }
    if (
      rules.monthMaxYear !== undefined &&
      dateUtils.isAfterDate(normalizedMonth, dateUtils.endOfYear(String(rules.monthMaxYear)).toISODate() ?? '')
    ) {
      return {
        textKey: TEXTS.validering.maxYear,
        params: { field, maxYear: rules.monthMaxYear },
      };
    }
  }
  if (rules.year && value !== undefined) {
    const normalizedYear = String(value).replace(/\s+/g, '');
    if (!numberUtils.isValidInteger(normalizedYear)) {
      return { textKey: TEXTS.validering.integer, params: { field } };
    }
    if (normalizedYear.length !== 4) {
      return { textKey: TEXTS.validering.yearLength, params: { field } };
    }
    if (!numberUtils.isBiggerOrEqualMin(normalizedYear, rules.minYear)) {
      return { textKey: TEXTS.validering.minYear, params: { field, minYear: rules.minYear ?? '' } };
    }
    if (!numberUtils.isSmallerOrEqualMax(normalizedYear, rules.maxYear)) {
      return { textKey: TEXTS.validering.maxYear, params: { field, maxYear: rules.maxYear ?? '' } };
    }
  }
  if (rules.numberType && typeof value === 'string') {
    const normalizedNumber =
      rules.numberType === 'decimal' ? value.replace(/\s/g, '').replace(',', '.') : formatUtils.removeAllSpaces(value);
    const valid =
      rules.numberType === 'decimal'
        ? numberUtils.isValidDecimal(normalizedNumber)
        : numberUtils.isValidInteger(normalizedNumber);
    if (!valid) {
      return {
        textKey: rules.numberType === 'decimal' ? TEXTS.validering.decimal : TEXTS.validering.integer,
        params: { field },
      };
    }
    if (!numberUtils.isBiggerOrEqualMin(normalizedNumber, rules.min)) {
      return { textKey: TEXTS.validering.min, params: { field, min: rules.min ?? '' } };
    }
    if (!numberUtils.isSmallerOrEqualMax(normalizedNumber, rules.max)) {
      return { textKey: TEXTS.validering.max, params: { field, max: rules.max ?? '' } };
    }
  }
  return undefined;
};

export { validateValue };
export type { RuleViolation, ValidationOptions, ValidationRules };
