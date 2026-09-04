import {
  checkCondition,
  Submission,
  SubmissionMethod,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from '../context/form-definition/formDefinitionUtils';
import { ComponentDefinition } from '../form-components/component-types';
import { getRenderedDataGridRows } from '../form-components/components/data-grid/dataGridRows';
import { collectAddressDescriptors, collectAddressValidityDescriptors } from './addressValidationDescriptors';
import {
  collectDrivingListDescriptors,
  collectIdentityDescriptors,
  collectPhoneNumberDescriptors,
  collectSenderDescriptors,
  shouldValidateDataFetcher,
} from './specializedValidationDescriptors';
import { createValidationDescriptor, ValidationDescriptor } from './validationDescriptorTypes';
import { hasValidationRules, toValidationRules } from './validationRules';

const getConditionRow = (component: ComponentDefinition, submission?: Submission) =>
  component.baseSubmissionPath
    ? submissionUtils.getSubmissionValue(component.baseSubmissionPath, submission)
    : undefined;

const collectValidationDescriptors = (
  components: ComponentDefinition[],
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
  pageComponents: ComponentDefinition[] = components,
): ValidationDescriptor[] =>
  components.flatMap((component) => {
    if (component.calculateValue) {
      return collectValidationDescriptors(component.components ?? [], submission, submissionMethod, pageComponents);
    }

    const submissionPath = getResolvedSubmissionPath(component);
    const isVisible =
      !component.hidden &&
      checkCondition(
        component,
        getConditionRow(component, submission),
        submission?.data,
        undefined,
        undefined,
        submission,
        { submissionMethod },
      );

    if (!isVisible) {
      return [];
    }

    switch (component.type) {
      case 'identity':
        return collectIdentityDescriptors(component, submission);
      case 'navAddress':
        return collectAddressDescriptors(component, submission, submissionMethod);
      case 'addressValidity':
        return collectAddressValidityDescriptors(component, submission);
      case 'phoneNumber':
        return collectPhoneNumberDescriptors(component, submission);
      case 'sender':
        return collectSenderDescriptors(component);
      case 'drivinglist':
        return collectDrivingListDescriptors(component, submission, submissionMethod);
      case 'attachment':
        return [
          createValidationDescriptor(
            component,
            submissionPath,
            component.label ?? component.key,
            toValidationRules(component, pageComponents, submission, submissionMethod),
          ),
        ];
      case 'dataFetcher':
        return shouldValidateDataFetcher(component, submissionPath, submission, submissionMethod)
          ? [
              createValidationDescriptor(component, submissionPath, component.label ?? component.key, {
                required: true,
                dataFetcherSelection: true,
              }),
            ]
          : [];
      case 'datagrid': {
        if (!component.components?.length) {
          return [];
        }
        const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
        return getRenderedDataGridRows(Array.isArray(rows) ? rows : [], component.initEmpty).flatMap((_, index) =>
          collectValidationDescriptors(
            toComponentDefinitions(
              enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
            ),
            submission,
            submissionMethod,
            pageComponents,
          ),
        );
      }
      default: {
        const rules = toValidationRules(component, pageComponents, submission, submissionMethod);
        return [
          ...(component.input !== false && hasValidationRules(rules)
            ? [createValidationDescriptor(component, submissionPath, component.label ?? component.key, rules)]
            : []),
          ...collectValidationDescriptors(component.components ?? [], submission, submissionMethod, pageComponents),
        ];
      }
    }
  });

const deriveValidations = (
  activeComponents: ComponentDefinition[],
  submission?: Submission,
  submissionMethod?: SubmissionMethod,
): ValidationDescriptor[] => {
  const pathAwareComponents = activeComponents.some((component) => 'baseSubmissionPath' in component)
    ? activeComponents
    : toComponentDefinitions(enrichComponentsWithBaseSubmissionPath(activeComponents));

  return collectValidationDescriptors(pathAwareComponents, submission, submissionMethod);
};

export { deriveValidations };
export type { ValidationDescriptor };
