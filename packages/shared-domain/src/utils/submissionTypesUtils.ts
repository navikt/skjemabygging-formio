import { SubmissionType } from '../form';

function isDigitalSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('DIGITAL');
}

function isDigitalSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return !submissionTypes?.includes('PAPER') && !!submissionTypes?.includes('DIGITAL');
}

function isPaperSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('PAPER');
}

function isPaperSubmissionOnly(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes?.includes('PAPER') && !submissionTypes?.includes('DIGITAL');
}

function isNoneSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes && !submissionTypes.length;
}

const submissionTypesUtils = {
  isDigitalSubmissionOnly,
  isDigitalSubmission,
  isNoneSubmission,
  isPaperSubmission,
  isPaperSubmissionOnly,
};

export default submissionTypesUtils;
