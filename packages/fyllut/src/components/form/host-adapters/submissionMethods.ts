import type { Form, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';

const getSupportedSubmissionMethod = (form: Form): SubmissionMethod | undefined => {
  const { submissionTypes } = form.properties;

  if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
    return 'paper';
  }
  if (submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) {
    return 'digital';
  }
  if (submissionTypesUtils.isDigitalNoLoginSubmissionOnly(submissionTypes)) {
    return 'digitalnologin';
  }
  if (submissionTypesUtils.isPaperNoCoverPageSubmissionOnly(submissionTypes) && (submissionTypes?.length ?? 0) > 0) {
    return 'papernocoverpage';
  }
  return undefined;
};

const getEffectiveSubmissionMethod = (
  form: Form,
  configuredSubmissionMethod: SubmissionMethod | undefined,
  pathname: string,
): SubmissionMethod | undefined => {
  if (configuredSubmissionMethod !== undefined) {
    return configuredSubmissionMethod;
  }
  if (pathname !== `/${form.path}`) {
    return 'paper';
  }
  return getSupportedSubmissionMethod(form);
};

const requiresSubmissionMethodSelection = (form: Form, submissionMethod: SubmissionMethod | undefined) =>
  submissionMethod === undefined && (form.properties.submissionTypes?.length ?? 0) > 0;

export { getEffectiveSubmissionMethod, requiresSubmissionMethodSelection };
