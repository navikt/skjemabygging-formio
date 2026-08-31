import {} from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from '../form-components/component-types';
import { ValidationRules } from './validators';

interface ValidationDescriptor {
  submissionPath: string;
  field: string;
  rules: ValidationRules;
  component?: ComponentDefinition;
}

const createValidationDescriptor = (
  component: ComponentDefinition,
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
