import { Form, Submission, SubmissionMethod, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { getPrefilledAddress } from '../../components/address/addressUtils';
import { getPrefilledSender } from '../../components/sender/senderValidation';
import { ComponentDefinition } from '../../form-components/component-types';
import {
  collectDataGridRowScopes,
  collectInputSubmissionPaths,
} from '../../form-components/components/data-grid/dataGridRows';
import { resolveDefaultSubmissionValue } from '../../form-components/defaultSubmissionValue';
import { clearSubmissionPathsFromSubmission, createUpdatedSubmission } from '../state/SubmissionStateContext';
import { isSameSubmissionValue } from '../state/stateHelpers';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from './formDefinitionUtils';
import { collectHiddenSubmissionPaths } from './hiddenSubmissionPaths';

type PrefillMode = 'missing' | 'overwrite';

interface ApplyInitialValuesOptions {
  prefillMode?: PrefillMode;
  submissionMethod?: SubmissionMethod;
}

const getComponentPrefillValue = (component: ComponentDefinition, currentLanguage: string) => {
  if (typeof component.prefillValue === 'string' && component.prefillValue.trim() !== '') {
    if (component.type === 'identity') {
      return { identitetsnummer: component.prefillValue };
    }

    return component.prefillValue;
  }

  if (component.type === 'navAddress') {
    return getPrefilledAddress(component, currentLanguage);
  }

  if (
    component.type === 'sender' &&
    component.senderRole !== 'organization' &&
    typeof component.prefillValue === 'object' &&
    component.prefillValue !== null
  ) {
    return getPrefilledSender('person', component.prefillValue);
  }

  return undefined;
};

const collectActiveComponentsWithInitialValues = (
  form: Form,
  submission: Submission | undefined,
  submissionMethod: SubmissionMethod | undefined,
) => {
  const activeComponents = toComponentDefinitions(getActivePanels(form, submission, { submissionMethod }));
  const dataGridRowScopes = collectDataGridRowScopes({
    components: activeComponents,
    submission,
    form,
    submissionMethod,
    includeImplicitRows: true,
  });

  const componentsWithInitialValues = [
    ...collectInputSubmissionPaths(toComponentDefinitions(form.components)),
    ...dataGridRowScopes.flatMap((scope) => collectInputSubmissionPaths(scope.activeComponents)),
  ].flatMap(({ component, submissionPath }) => {
    const defaultValue = resolveDefaultSubmissionValue(component);
    return component.prefillValue !== undefined || defaultValue !== undefined
      ? [{ component, submissionPath, defaultValue }]
      : [];
  });

  return {
    activeComponents,
    componentsWithInitialValues,
  };
};

const clearInactiveSubmissionValues = (
  form: Form,
  activeComponents: ComponentDefinition[],
  submission: Submission | undefined,
  submissionMethod: SubmissionMethod | undefined,
) =>
  clearSubmissionPathsFromSubmission(
    submission,
    collectHiddenSubmissionPaths({
      form,
      activeComponents,
      submission,
      submissionMethod,
    }),
  );

/**
 * Performs one reconciliation pass. In the mounted flow, updating the submission causes the form
 * definition provider to calculate active components and invoke this again when necessary.
 */
const reconcileSubmissionValues = (
  form: Form,
  submission: Submission | undefined,
  currentLanguage: string,
  { prefillMode = 'overwrite', submissionMethod }: ApplyInitialValuesOptions = {},
): Submission | undefined => {
  const formWithBaseSubmissionPath = enrichFormWithBaseSubmissionPath(form);
  const { componentsWithInitialValues } = collectActiveComponentsWithInitialValues(
    formWithBaseSubmissionPath,
    submission,
    submissionMethod,
  );
  const withInitialValues = componentsWithInitialValues.reduce(
    (currentSubmission, { component, submissionPath, defaultValue }) => {
      const prefillValue = getComponentPrefillValue(component, currentLanguage);
      const currentValue = submissionUtils.getSubmissionValue(submissionPath, currentSubmission);

      if (prefillValue !== undefined && (prefillMode === 'overwrite' || currentValue === undefined)) {
        return isSameSubmissionValue(currentValue, prefillValue)
          ? currentSubmission
          : createUpdatedSubmission(currentSubmission, submissionPath, prefillValue);
      }

      if (defaultValue === undefined || currentValue !== undefined) {
        return currentSubmission;
      }

      return createUpdatedSubmission(currentSubmission, submissionPath, defaultValue);
    },
    submission,
  );
  const activeComponentsWithInitialValues = toComponentDefinitions(
    getActivePanels(formWithBaseSubmissionPath, withInitialValues, { submissionMethod }),
  );

  return clearInactiveSubmissionValues(
    formWithBaseSubmissionPath,
    activeComponentsWithInitialValues,
    withInitialValues,
    submissionMethod,
  );
};

/**
 * Settles prefills and defaults to a stable state before the submission is published. The mounted
 * form also uses this function so cyclic conditionals cannot trigger alternating state updates.
 */
const applyInitialValuesToSubmission = (
  form: Form,
  submission: Submission | undefined,
  currentLanguage: string,
  options: ApplyInitialValuesOptions = {},
): Submission | undefined => {
  const formWithBaseSubmissionPath = enrichFormWithBaseSubmissionPath(form);
  const maximumPasses =
    flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).filter(
      (component) =>
        component.input &&
        (component.prefillValue !== undefined || resolveDefaultSubmissionValue(component) !== undefined),
    ).length + 1;
  let currentSubmission = submission;

  for (let pass = 0; pass < maximumPasses; pass += 1) {
    const nextSubmission = reconcileSubmissionValues(
      formWithBaseSubmissionPath,
      currentSubmission,
      currentLanguage,
      options,
    );
    if (nextSubmission === currentSubmission) {
      return currentSubmission;
    }
    currentSubmission = nextSubmission;
  }

  const { activeComponents } = collectActiveComponentsWithInitialValues(
    formWithBaseSubmissionPath,
    currentSubmission,
    options.submissionMethod,
  );
  const settledSubmission = clearInactiveSubmissionValues(
    formWithBaseSubmissionPath,
    activeComponents,
    currentSubmission,
    options.submissionMethod,
  );
  return isSameSubmissionValue(settledSubmission, submission) ? submission : settledSubmission;
};

export { applyInitialValuesToSubmission };
export type { ApplyInitialValuesOptions, PrefillMode };
