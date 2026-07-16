import {
  Component,
  Form,
  Submission,
  submissionUtils,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { getPrefilledAddress } from '../../components/address/addressUtils';
import { createUpdatedSubmission } from '../state/SubmissionStateContext';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from './formDefinitionUtils';

const getComponentPrefillValue = (component: Component, currentLanguage: string) => {
  if (typeof component.prefillValue === 'string' && component.prefillValue.trim() !== '') {
    if (component.type === 'identity') {
      return { identitetsnummer: component.prefillValue };
    }

    return component.prefillValue;
  }

  if (component.type === 'navAddress') {
    return getPrefilledAddress(component, currentLanguage);
  }

  return undefined;
};

const applyPrefilledValuesToSubmission = (
  form: Form,
  submission: Submission | undefined,
  currentLanguage: string,
): Submission | undefined => {
  const prefilledComponents = flattenComponentsWithBaseSubmissionPath(
    enrichFormWithBaseSubmissionPath(form).components,
  ).filter((component) => component.input && component.prefillValue !== undefined);

  if (prefilledComponents.length === 0) {
    return submission;
  }

  const initialSubmission = submission ?? { data: {} };
  let nextSubmission = initialSubmission;

  prefilledComponents.forEach((component) => {
    const submissionPath = getResolvedSubmissionPath(component);
    const currentValue = submissionUtils.getSubmissionValue(submissionPath, nextSubmission);

    if (!validatorUtils.isEmpty(currentValue)) {
      return;
    }

    const prefillValue = getComponentPrefillValue(component, currentLanguage);
    if (prefillValue === undefined) {
      return;
    }

    nextSubmission = createUpdatedSubmission(nextSubmission, submissionPath, prefillValue);
  });

  return nextSubmission === initialSubmission ? submission : nextSubmission;
};

export { applyPrefilledValuesToSubmission };
