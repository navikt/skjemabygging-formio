import { formatUtils, numberUtils, TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';

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
}

interface RuleViolation {
  textKey: string;
  params: Record<string, string | number>;
}

/**
 * Pure validation: returns the first violation (message key + params) for a value, or undefined.
 * Translation happens at the boundary (ValidationContext), so these stay framework-decoupled.
 */
const validateValue = (value: unknown, field: string, rules: ValidationRules): RuleViolation | undefined => {
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
export type { RuleViolation, ValidationRules };
