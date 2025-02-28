import { SubmissionType } from '../form';

export function isDigitalSubmission(submissionTypes: SubmissionType[]): boolean {
  return submissionTypes.includes('DIGITAL');
}

export function isDigitalSubmissionOnly(submissionTypes: SubmissionType[]): boolean {
  return !submissionTypes.includes('PAPER') && submissionTypes.includes('DIGITAL');
}

export function isPaperSubmission(submissionTypes: SubmissionType[]): boolean {
  return submissionTypes.includes('PAPER');
}

export function isPaperSubmissionOnly(submissionTypes: SubmissionType[]): boolean {
  return submissionTypes.includes('PAPER') && !submissionTypes.includes('DIGITAL');
}

export function isNoneSubmission(submissionTypes: SubmissionType[]): boolean {
  return !submissionTypes.length;
}
