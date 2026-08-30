import { Component, Form, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { collectInputSubmissionPaths } from '../../form-components/components/data-grid/dataGridRows';
import { createUpdatedSubmission } from '../state/SubmissionStateContext';
import { enrichFormWithBaseSubmissionPath } from './formDefinitionUtils';

/**
 * Component types where the input control does not apply `defaultValue` itself. Checkbox, radio,
 * select and selectboxes controls set their own default when they are rendered, the same way
 * Formio did, so seeding them here would apply the value twice.
 *
 * Data grid children are not seeded: Formio applies row defaults when a row is created, and no
 * published form currently relies on a non-empty default inside a data grid.
 */
const DEFAULT_VALUE_TYPES = ['number', 'currency', 'landvelger', 'valutavelger', 'attachment'];

/**
 * Mirrors Formio, which only applies a default when `component.defaultValue` is truthy, with an
 * explicit exception for the number 0 in number/currency components.
 */
const hasDefaultValue = (component: Component): boolean => {
  const defaultValue = component.defaultValue;

  if (defaultValue === 0) {
    return component.type === 'number' || component.type === 'currency';
  }

  if (!defaultValue) {
    return false;
  }

  if (typeof defaultValue === 'object') {
    return Object.keys(defaultValue).length > 0;
  }

  return true;
};

/**
 * Applies the defaults Formio put into the submission before the user opened a page, so answers
 * such as the string `"0"` for number fields, a preselected country, or a preselected attachment
 * option are part of the submission from the start. Existing answers are never overwritten.
 */
const applyDefaultValuesToSubmission = (form: Form, submission: Submission | undefined): Submission | undefined => {
  const componentsWithDefault = collectInputSubmissionPaths(enrichFormWithBaseSubmissionPath(form).components).filter(
    ({ component }) => DEFAULT_VALUE_TYPES.includes(component.type) && hasDefaultValue(component),
  );

  if (componentsWithDefault.length === 0) {
    return submission;
  }

  const initialSubmission = submission ?? { data: {} };

  return componentsWithDefault.reduce((currentSubmission, { component, submissionPath }) => {
    if (submissionUtils.getSubmissionValue(submissionPath, currentSubmission) !== undefined) {
      return currentSubmission;
    }

    return createUpdatedSubmission(currentSubmission, submissionPath, component.defaultValue);
  }, initialSubmission);
};

export { applyDefaultValuesToSubmission, hasDefaultValue };
