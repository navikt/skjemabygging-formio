import { SubmissionMethod, SubmissionType } from '../../models';

function isDigitalSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL');
}

function isDigitalSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL') && submissionTypes?.length === 1;
}

function isDigitalNoLoginSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL_NO_LOGIN');
}

function isDigitalNoLoginSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL_NO_LOGIN') && submissionTypes?.length === 1;
}

function isPaperSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('PAPER');
}

function isPaperSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('PAPER') && submissionTypes?.length === 1;
}

function isPaperNoCoverPageSubmission(submissionTypes?: SubmissionType[]): boolean {
  if (!submissionTypes) return false;
  if (submissionTypes.length === 0) return true;
  const regularTypes = submissionTypes.filter((t) => t !== 'STATIC_PDF' && t !== 'PAPER_NO_COVER_PAGE');
  return regularTypes.length === 0 && submissionTypes.includes('PAPER_NO_COVER_PAGE');
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
  isPaperNoCoverPageSubmission,
  isPaperSubmission,
  isPaperSubmissionOnly,
  isStaticPdf,
  asMethod,
};

export { submissionTypesUtils };
