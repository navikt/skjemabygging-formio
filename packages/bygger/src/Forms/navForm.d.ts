export type Display = 'wizard' | 'form';
export type Innsending = 'PAPIR_OG_DIGITAL' | 'KUN_PAPIR' | 'KUN_DIGITAL' | 'INGEN';

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
  innsending?: Innsending;
  /**
   * @deprecated hasPapirInnsendingOnly blir erstattet av innsending
   */
  hasPapirInnsendingOnly?: boolean;
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
