import { Form, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from '../../form-components/component-types';
import { createUpdatedSubmission } from '../state/SubmissionStateContext';
import {
  enrichComponentsWithBaseSubmissionPath,
  enrichFormWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from './formDefinitionUtils';

const normalizeSubmissionData = (form: Form, submission: Submission | undefined): Submission | undefined => {
  if (!submission?.data) {
    return submission;
  }

  const enrichedForm = enrichFormWithBaseSubmissionPath(form);
  let normalizedSubmission: Submission = { ...submission, data: {} };

  const normalizeComponents = (components: ComponentDefinition[]) => {
    components.forEach((component) => {
      const submissionPath = getResolvedSubmissionPath(component);

      if (component.type === 'datagrid') {
        const value = submissionUtils.getSubmissionValue(submissionPath, submission);
        if (!Array.isArray(value)) {
          return;
        }

        normalizedSubmission = createUpdatedSubmission(
          normalizedSubmission,
          submissionPath,
          value.map(() => ({})),
        );

        value.forEach((_, index) => {
          normalizeComponents(
            toComponentDefinitions(
              enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
            ),
          );
        });
        return;
      }

      if ((component.input || component.type === 'attachment') && component.type !== 'container') {
        const value = submissionUtils.getSubmissionValue(submissionPath, submission);
        if (value !== undefined) {
          normalizedSubmission = createUpdatedSubmission(normalizedSubmission, submissionPath, value);
        }
      }

      normalizeComponents(toComponentDefinitions(component.components ?? []));
    });
  };

  normalizeComponents(toComponentDefinitions(enrichedForm.components));
  return normalizedSubmission;
};

export { normalizeSubmissionData };
