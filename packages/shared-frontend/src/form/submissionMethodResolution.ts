import { SubmissionMethod, SubmissionType, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';

const resolveDefaultSubmissionMethod = (submissionTypes?: SubmissionType[]): SubmissionMethod | undefined => {
  if (submissionTypes?.length === 0) {
    return undefined;
  }

  if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
    return 'paper';
  }

  if (submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) {
    return 'digital';
  }

  if (submissionTypesUtils.isDigitalNoLoginSubmissionOnly(submissionTypes)) {
    return 'digitalnologin';
  }

  if (submissionTypesUtils.isPaperNoCoverPageSubmissionOnly(submissionTypes)) {
    return 'papernocoverpage';
  }

  return undefined;
};

export { resolveDefaultSubmissionMethod };
