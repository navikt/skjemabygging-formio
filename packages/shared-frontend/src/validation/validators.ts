import { TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';

interface ValidationRules {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
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
  if (rules.minLength !== undefined && typeof value === 'string' && value.length < rules.minLength) {
    return { textKey: TEXTS.validering.minLength, params: { field, length: rules.minLength } };
  }
  if (rules.maxLength !== undefined && typeof value === 'string' && value.length > rules.maxLength) {
    return { textKey: TEXTS.validering.maxLength, params: { field, length: rules.maxLength } };
  }
  return undefined;
};

export { validateValue };
export type { RuleViolation, ValidationRules };
