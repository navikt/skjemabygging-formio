export type DisplayType = 'wizard' | 'form';
export type SubmissionType = 'PAPER' | 'DIGITAL';
export type SubmissionMethod = 'paper' | 'digital';
/**
 * Denne skal fjernes etter uxSignalsInnsending skrives om
 */
export type InnsendingType = 'PAPIR_OG_DIGITAL' | 'KUN_PAPIR' | 'KUN_DIGITAL' | 'INGEN';

export enum DeclarationType {
  none = 'none',
  default = 'default',
  custom = 'custom',
}

export type UsageContext = 'create' | 'edit';
