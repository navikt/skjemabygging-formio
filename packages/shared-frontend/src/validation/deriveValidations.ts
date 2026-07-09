import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import {
  enrichComponentsWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from '../context/form-definition/formDefinitionUtils';
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
const deriveValidations = (activeComponents: Component[]): ValidationDescriptor[] => {
  const pathAwareComponents = activeComponents.some((component) => 'baseSubmissionPath' in component)
    ? activeComponents
    : enrichComponentsWithBaseSubmissionPath(activeComponents);

  return flattenComponentsWithBaseSubmissionPath(pathAwareComponents)
    .filter((component) => component.input)
    .map((component) => ({
      submissionPath: getResolvedSubmissionPath(component),
      field: component.label ?? component.key,
      rules: toRules(component),
    }))
    .filter(({ rules }) => Object.values(rules).some((rule) => rule !== undefined && rule !== false));
};

export { deriveValidations };
export type { ValidationDescriptor };
