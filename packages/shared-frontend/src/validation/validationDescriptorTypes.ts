import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationRules } from './validators';

interface ValidationDescriptor {
  submissionPath: string;
  field: string;
  rules: ValidationRules;
  component?: Component;
}

const createValidationDescriptor = (
  component: Component,
  submissionPath: string,
  field: string,
  rules: ValidationRules,
): ValidationDescriptor => ({
  submissionPath,
  field,
  rules,
  ...(component.type === 'attachment' ? { component } : {}),
});

export { createValidationDescriptor };
export type { ValidationDescriptor };
