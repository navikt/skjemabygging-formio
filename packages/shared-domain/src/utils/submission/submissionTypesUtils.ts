import { SubmissionMethod, SubmissionType } from '../../models';

const specialSubmissionTypes: SubmissionType[] = ['STATIC_PDF', 'PAPER_NO_COVER_PAGE'];

const excludeSpecialSubmissionTypes = (submissionTypes?: SubmissionType[]) =>
  submissionTypes?.filter((type) => !specialSubmissionTypes.includes(type)) || [];

const getStandardSingleSubmissionType = (submissionTypes?: SubmissionType[]) => {
  const standardSubmissionTypes = excludeSpecialSubmissionTypes(submissionTypes);
  return standardSubmissionTypes?.length === 1 ? standardSubmissionTypes[0] : undefined;
};

function isDigitalSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL');
}

function isDigitalSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return getStandardSingleSubmissionType(submissionTypes) === 'DIGITAL';
}

function isDigitalNoLoginSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL_NO_LOGIN');
}

function isDigitalNoLoginSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return getStandardSingleSubmissionType(submissionTypes) === 'DIGITAL_NO_LOGIN';
}

function isPaperSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('PAPER');
}

function isPaperSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return getStandardSingleSubmissionType(submissionTypes) === 'PAPER';
}

function isPaperNoCoverPageSubmission(submissionTypes?: SubmissionType[]): boolean {
  if (!submissionTypes) return false;
  return submissionTypes.length === 0 || submissionTypes.includes('PAPER_NO_COVER_PAGE');
}

function isPaperNoCoverPageSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  if (!submissionTypes) return false;
  return submissionTypes.length === 0 || (submissionTypes.length === 1 && submissionTypes[0] == 'PAPER_NO_COVER_PAGE');
}

function isStaticPdf(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('STATIC_PDF');
}

function isStaticPdfOnly(submissionTypes?: SubmissionType[]): boolean {
  return submissionTypes?.length === 1 && submissionTypes?.includes('STATIC_PDF');
}

function containsMultipleStandardSubmissionTypes(submissionTypes?: SubmissionType[]): boolean {
  return excludeSpecialSubmissionTypes(submissionTypes).length > 1;
}

function asMethod(submissionType: SubmissionType): SubmissionMethod | undefined {
  switch (submissionType) {
    case 'DIGITAL':
      return 'digital';
    case 'DIGITAL_NO_LOGIN':
      return 'digitalnologin';
    case 'PAPER':
      return 'paper';
    case 'PAPER_NO_COVER_PAGE':
      return 'papernocoverpage';
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
  isPaperNoCoverPageSubmissionOnly,
  isPaperSubmission,
  isPaperSubmissionOnly,
  isStaticPdf,
  isStaticPdfOnly,
  containsMultipleStandardSubmissionTypes,
  asMethod,
};

export { submissionTypesUtils };
