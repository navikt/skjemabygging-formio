export type DisplayType = 'wizard' | 'form';
export type FormType = 'form' | 'resource';
export type SubmissionType = 'PAPER' | 'DIGITAL';
export type SubmissionMethod = 'paper' | 'digital';
/**
 * Denne skal fjernes etter migrering
 */
export type InnsendingType = 'PAPIR_OG_DIGITAL' | 'KUN_PAPIR' | 'KUN_DIGITAL' | 'INGEN';

export enum DeclarationType {
  none = 'none',
  default = 'default',
  custom = 'custom',
}

export type AddressType = 'NORWEGIAN_ADDRESS' | 'POST_OFFICE_BOX' | 'FOREIGN_ADDRESS';
export type InputMode = 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';

export type UsageContext = 'create' | 'edit';
