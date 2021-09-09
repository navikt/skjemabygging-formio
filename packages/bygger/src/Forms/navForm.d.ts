export type DisplayType = 'wizard' | 'form';

export interface FormSignaturesType {
  signature1?: string;
  signature2?: string;
  signature3?: string;
  signature4?: string;
  signature5?: string;
}

export interface FormPropertiesType {
  skjemanummer: string;
  tema: string;
  hasPapirInnsendingOnly: boolean;
  hasLabeledSignatures: boolean;
  signatures?: FormSignaturesType;
}

export interface NavFormType {
  tags: string[];
  type: string;
  display: DisplayType;
  name: string;
  title: string;
  path: string;
  properties: FormPropertiesType;
  components: any[];
}
