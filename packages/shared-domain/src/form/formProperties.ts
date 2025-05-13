import { Enhetstype } from '../enhet';
import { PrefillKey } from './prefill';
import { FormSignaturesType, NewFormSignatureType } from './signature';
import { DeclarationType, SubmissionType } from './types';

/**
 * @property {SubmissionType[]} submissionTypes - Innsending.
 * @property {SubmissionType[]} subsequentSubmissionTypes - Ettersending.
 */
export interface FormPropertiesType {
  skjemanummer: string;
  tema: string;
  modified?: string;
  modifiedBy?: string;
  published?: string;
  publishedBy?: string;
  publishedLanguages?: string[];
  unpublished?: string;
  unpublishedBy?: string;
  downloadPdfButtonText?: string;
  submissionTypes: SubmissionType[];
  subsequentSubmissionTypes: SubmissionType[];
  ettersendelsesfrist?: string;
  innsendingForklaring?: string;
  innsendingOverskrift?: string;
  isTestForm?: boolean;
  isLockedForm?: boolean;
  lockedFormReason?: string;
  declarationType?: DeclarationType;
  declarationText?: string;
  mottaksadresseId?: string;
  enhetMaVelgesVedPapirInnsending?: boolean;
  enhetstyper?: Enhetstype[];
  hasLabeledSignatures?: boolean;
  signatures?: NewFormSignatureType[] | FormSignaturesType;
  descriptionOfSignatures?: string;
  descriptionOfSignaturesPositionUnder?: boolean;
  prefill?: PrefillKey[];
  uxSignalsId?: string;
  uxSignalsSubmissionTypes?: SubmissionType[];
  hideUserTypes?: boolean;
  mellomlagringDurationDays?: string;
}

export type FormPropertiesPublishing = Pick<
  FormPropertiesType,
  'modified' | 'modifiedBy' | 'published' | 'publishedBy' | 'publishedLanguages' | 'unpublished' | 'unpublishedBy'
>;
