import { SubmissionMethod, SubmissionType } from '../../models';

const excludeStaticPdf = (submissionTypes?: SubmissionType[]) =>
  submissionTypes?.filter((submissionType) => submissionType !== 'STATIC_PDF');

const getOnlySubmissionType = (submissionTypes?: SubmissionType[]) => {
  const filteredSubmissionTypes = excludeStaticPdf(submissionTypes);

  if (filteredSubmissionTypes?.length !== 1) {
    return undefined;
  }

  return filteredSubmissionTypes[0];
};

function isDigitalSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL');
}

function isDigitalSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return getOnlySubmissionType(submissionTypes) === 'DIGITAL';
}

function isDigitalNoLoginSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL_NO_LOGIN');
}

function isDigitalNoLoginSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return getOnlySubmissionType(submissionTypes) === 'DIGITAL_NO_LOGIN';
}

function isPaperSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('PAPER');
}

function isPaperSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return getOnlySubmissionType(submissionTypes) === 'PAPER';
}

function isNoneSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes && !submissionTypes.length;
}

function isStaticPdf(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('STATIC_PDF');
}

function asMethod(submissionType: SubmissionType): SubmissionMethod | undefined {
  switch (submissionType) {
    case 'DIGITAL':
      return 'digital';
    case 'DIGITAL_NO_LOGIN':
      return 'digitalnologin';
    case 'PAPER':
      return 'paper';
    default:
      return;
  }
}

const submissionTypesUtils = {
  isDigitalSubmissionOnly,
  isDigitalSubmission,
  isDigitalNoLoginSubmission,
  isDigitalNoLoginSubmissionOnly,
  isNoneSubmission,
  isPaperSubmission,
  isPaperSubmissionOnly,
  isStaticPdf,
  asMethod,
};

export { submissionTypesUtils };
