import { Component, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import {
  enrichComponentsWithBaseSubmissionPath,
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
  email: component.type === 'email' ? true : undefined,
  coverPageValue: component.type === 'firstName' || component.type === 'surname' ? true : undefined,
  numberType:
    component.type === 'number' || component.type === 'currency'
      ? component.inputType === 'numeric'
        ? 'integer'
        : 'decimal'
      : undefined,
  min: typeof component.validate?.min === 'number' ? component.validate.min : undefined,
  max: typeof component.validate?.max === 'number' ? component.validate.max : undefined,
  year: component.type === 'year' ? true : undefined,
  minYear: typeof component.validate?.minYear === 'number' ? component.validate.minYear : undefined,
  maxYear: typeof component.validate?.maxYear === 'number' ? component.validate.maxYear : undefined,
});

const hasRules = (rules: ValidationRules) => Object.values(rules).some((rule) => rule !== undefined && rule !== false);

const collectValidationDescriptors = (components: Component[], submission?: Submission): ValidationDescriptor[] =>
  components.flatMap((component) => {
    const rules = toRules(component);
    const submissionPath = getResolvedSubmissionPath(component);

    if (component.type === 'datagrid') {
      const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
      if (!Array.isArray(rows) || !component.components?.length) {
        return [];
      }

      return rows.flatMap((_, index) =>
        collectValidationDescriptors(
          enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
          submission,
        ),
      );
    }

    return [
      ...(hasRules(rules) ? [{ submissionPath, field: component.label ?? component.key, rules }] : []),
      ...collectValidationDescriptors(component.components ?? [], submission),
    ];
  });

/** Builds validation descriptors for the currently visible input components. */
const deriveValidations = (activeComponents: Component[], submission?: Submission): ValidationDescriptor[] => {
  const pathAwareComponents = activeComponents.some((component) => 'baseSubmissionPath' in component)
    ? activeComponents
    : enrichComponentsWithBaseSubmissionPath(activeComponents);

  return collectValidationDescriptors(pathAwareComponents, submission);
};

export { deriveValidations };
export type { ValidationDescriptor };
