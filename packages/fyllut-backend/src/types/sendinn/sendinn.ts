export type BrukerDto = { id: string; idType: 'FNR' };
export type AvsenderId = { navn?: string; id?: string; idType?: 'FNR' };

export interface SubmitApplicationRequest {
  bruker?: string | null;
  avsender?: AvsenderId | null;
  formNumber: string;
  title: string;
  tema: string;
  language: 'nb' | 'nn' | 'en';
  mainDocument: string;
  mainDocumentAlt: string;
  attachments: Attachment[];
  otherUploadAvailable: boolean;
}

export interface Attachment {
  attachmentCode: string;
  label: string;
  title: string;
  uploadStatus: OpplastingsStatus;
  description: string;
  formNumberPath: string;
  fileIds?: string[] | null;
}

export interface SubmitApplicationResponse {
  innsendingsId: string;
  submittedAt: string;
  title: string;
  mainDocumentFileId?: string;
  attachments: Attachment[];
  subsequentSubmissionDeadline?: string | null;
  ettersendingsId?: string | null;
}

export type OpplastingsStatus =
  | 'IkkeValgt'
  | 'LastetOpp'
  | 'Innsendt'
  | 'SendSenere'
  | 'SendesAvAndre'
  | 'SendesIkke'
  | 'LastetOppIkkeRelevantLenger'
  | 'LevertDokumentasjonTidligere'
  | 'HarIkkeDokumentasjonen'
  | 'NavKanHenteDokumentasjon';
