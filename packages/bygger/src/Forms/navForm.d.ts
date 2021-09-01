export type Display = 'wizard' | 'form';

export interface FormSignatures {
  signature1?: string;
  signature2?: string;
  signature3?: string;
  signature4?: string;
  signature5?: string;
}

export interface FormProperties {
  skjemanummer: string;
  tema: string;
  hasPapirInnsendingOnly: boolean;
  hasLabeledSignatures: boolean;
  signatures?: FormSignatures;
}

export interface NavForm {
  tags: string[];
  type: string;
  display: Display;
  name: string;
  title: string;
  path: string;
  properties: FormProperties;
  components: any[];
}
