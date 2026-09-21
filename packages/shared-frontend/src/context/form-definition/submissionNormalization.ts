import { Form, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from '../../form-components/component-types';
import { createUpdatedSubmission } from '../state/SubmissionStateContext';
import {
  enrichComponentsWithBaseSubmissionPath,
  enrichFormWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from './formDefinitionUtils';

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeDataGridRows = (form: Form, submission: Submission | undefined): Submission | undefined => {
  if (!submission?.data) {
    return submission;
  }

  const enrichedForm = enrichFormWithBaseSubmissionPath(form);
  let normalizedSubmission = submission;

  const normalizeComponents = (components: ComponentDefinition[]) => {
    components.forEach((component) => {
      if (component.type !== 'datagrid') {
        normalizeComponents(toComponentDefinitions(component.components ?? []));
        return;
      }

      const submissionPath = getResolvedSubmissionPath(component);
      const value = submissionUtils.getSubmissionValue(submissionPath, normalizedSubmission);
      if (!Array.isArray(value)) {
        return;
      }

      const normalizedRows = value.map((row) => (isObjectRecord(row) ? row : {}));
      if (normalizedRows.some((row, index) => row !== value[index])) {
        normalizedSubmission = createUpdatedSubmission(normalizedSubmission, submissionPath, normalizedRows);
      }

      normalizedRows.forEach((_, index) => {
        normalizeComponents(
          toComponentDefinitions(
            enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
          ),
        );
      });
    });
  };

  normalizeComponents(toComponentDefinitions(enrichedForm.components));
  return normalizedSubmission;
};

export { normalizeDataGridRows };
