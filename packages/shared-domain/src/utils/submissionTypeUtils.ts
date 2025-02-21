import { InnsendingType } from '../form';

export function isDigitalSubmission(submissionTypes: InnsendingType[]): boolean {
  return submissionTypes.includes('KUN_DIGITAL') || submissionTypes.includes('PAPIR_OG_DIGITAL');
}

export function isPaperSubmission(submissionTypes: InnsendingType[]): boolean {
  return submissionTypes.includes('PAPIR_OG_DIGITAL') || submissionTypes.includes('KUN_PAPIR');
}
