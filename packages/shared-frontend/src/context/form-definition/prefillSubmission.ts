import { Form, Submission, SubmissionMethod, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { getPrefilledAddress } from '../../components/address/addressUtils';
import { getPrefilledSender } from '../../components/sender/senderValidation';
import { ComponentDefinition } from '../../form-components/component-types';
import {
  collectDataGridRowScopes,
  collectInputSubmissionPaths,
} from '../../form-components/components/data-grid/dataGridRows';
import { clearSubmissionPathsFromSubmission, createUpdatedSubmission } from '../state/SubmissionStateContext';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from './formDefinitionUtils';
import { collectHiddenSubmissionPaths } from './hiddenSubmissionPaths';

type PrefillMode = 'missing' | 'overwrite';

interface ApplyPrefilledValuesOptions {
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

const collectActivePrefillComponents = (
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
  });

  return {
    activeComponents,
    prefilledComponents: [
      ...collectInputSubmissionPaths(activeComponents),
      ...dataGridRowScopes.flatMap((scope) => collectInputSubmissionPaths(scope.activeComponents)),
    ].filter(({ component }) => component.prefillValue !== undefined),
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
const reconcilePrefilledSubmission = (
  form: Form,
  submission: Submission | undefined,
  currentLanguage: string,
  { prefillMode = 'overwrite', submissionMethod }: ApplyPrefilledValuesOptions = {},
): Submission | undefined => {
  const formWithBaseSubmissionPath = enrichFormWithBaseSubmissionPath(form);
  const { activeComponents, prefilledComponents } = collectActivePrefillComponents(
    formWithBaseSubmissionPath,
    submission,
    submissionMethod,
  );
  const withoutInactiveValues = clearInactiveSubmissionValues(
    formWithBaseSubmissionPath,
    activeComponents,
    submission,
    submissionMethod,
  );

  return prefilledComponents.reduce((currentSubmission, { component, submissionPath }) => {
    const prefillValue = getComponentPrefillValue(component, currentLanguage);
    if (
      prefillValue === undefined ||
      (prefillMode === 'missing' && submissionUtils.getSubmissionValue(submissionPath, currentSubmission) !== undefined)
    ) {
      return currentSubmission;
    }

    return createUpdatedSubmission(currentSubmission, submissionPath, prefillValue);
  }, withoutInactiveValues);
};

/**
 * Settles prefills before a draft or initial form state exists. A mounted form uses
 * {@link reconcilePrefilledSubmission}; this wrapper is only needed before React can trigger
 * follow-up reconciliation passes.
 */
const applyPrefilledValuesToSubmission = (
  form: Form,
  submission: Submission | undefined,
  currentLanguage: string,
  options: ApplyPrefilledValuesOptions = {},
): Submission | undefined => {
  const formWithBaseSubmissionPath = enrichFormWithBaseSubmissionPath(form);
  const maximumPasses =
    flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).filter(
      (component) => component.input && component.prefillValue !== undefined,
    ).length + 1;
  let currentSubmission = submission;

  for (let pass = 0; pass < maximumPasses; pass += 1) {
    const nextSubmission = reconcilePrefilledSubmission(
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

  const { activeComponents } = collectActivePrefillComponents(
    formWithBaseSubmissionPath,
    currentSubmission,
    options.submissionMethod,
  );
  return clearInactiveSubmissionValues(
    formWithBaseSubmissionPath,
    activeComponents,
    currentSubmission,
    options.submissionMethod,
  );
};

export { applyPrefilledValuesToSubmission, reconcilePrefilledSubmission };
export type { ApplyPrefilledValuesOptions, PrefillMode };
