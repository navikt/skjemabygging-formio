export type DisplayType = 'wizard' | 'form';
export type SubmissionType = 'PAPER' | 'DIGITAL' | 'DIGITAL_NO_LOGIN' | 'STATIC_PDF' | 'PAPER_NO_COVER_PAGE';
export type SubmissionMethod = 'paper' | 'digital' | 'digitalnologin';

export enum DeclarationType {
  none = 'none',
  default = 'default',
  custom = 'custom',
}

export type UsageContext = 'create' | 'edit';
