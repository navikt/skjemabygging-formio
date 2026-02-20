export type DisplayType = 'wizard' | 'form';
export type SubmissionType = 'PAPER' | 'DIGITAL' | 'DIGITAL_NO_LOGIN';
export type SubmissionMethod = 'paper' | 'digital' | 'digitalnologin';

export enum DeclarationType {
  none = 'none',
  default = 'default',
  custom = 'custom',
}

export type UsageContext = 'create' | 'edit';
