import { SubmissionType } from '../form';

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

function isNoneSubmission(submissionTypes?: SubmissionType[]): boolean {
  return !!submissionTypes && !submissionTypes.length;
}

const submissionTypesUtils = {
  isDigitalSubmissionOnly,
  isDigitalSubmission,
  isDigitalNoLoginSubmission,
  isDigitalNoLoginSubmissionOnly,
  isNoneSubmission,
  isPaperSubmission,
  isPaperSubmissionOnly,
};

export default submissionTypesUtils;
