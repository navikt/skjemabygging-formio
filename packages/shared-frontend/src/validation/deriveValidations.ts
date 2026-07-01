import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationRules } from './validators';

interface ValidationDescriptor {
  submissionPath: string;
  field: string;
  rules: ValidationRules;
}

const toRules = (component: Component): ValidationRules => ({
  required: component.validate?.required,
  minLength: typeof component.validate?.minLength === 'number' ? component.validate.minLength : undefined,
  maxLength: typeof component.validate?.maxLength === 'number' ? component.validate.maxLength : undefined,
});

/** Builds validation descriptors for the currently visible input components. */
const deriveValidations = (activeComponents: Component[]): ValidationDescriptor[] =>
  navFormUtils
    .flattenComponents(activeComponents)
    .filter((component) => component.input)
    .map((component) => ({
      submissionPath: component.key,
      field: component.label ?? component.key,
      rules: toRules(component),
    }))
    .filter(({ rules }) => Object.values(rules).some((rule) => rule !== undefined && rule !== false));

export { deriveValidations };
export type { ValidationDescriptor };
