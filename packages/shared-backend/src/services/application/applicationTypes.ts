import { TranslationLang, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import type { Histogram } from 'prom-client';

export type BrukerDto = { id: string; idType: 'FNR' };
export type AvsenderId = { navn?: string; id?: string; idType?: 'FNR' | 'ORGNR' };
export type ApplicationType = 'nologin' | 'digital';
export type ApplicationMetricLabel = 'type' | 'error';

export interface DownloadedAttachment {
  body: ReadableStream<Uint8Array>;
  contentType: string;
  contentDisposition?: string;
  contentLength?: string;
}

export interface ApplicationPaths {
  soknad: string;
  utfyltSoknad: string;
}

export interface ApplicationMetrics {
  uploadDuration: Histogram<ApplicationMetricLabel>;
  uploadFileSize: Histogram<ApplicationMetricLabel>;
}

export interface UploadAttachmentResponse {
  id: string;
  name: string;
  size: number;
}

export interface SubmitApplicationRequest {
  bruker?: string | null;
  avsender?: AvsenderId | null;
  formNumber: string;
  title: string;
  tema: string;
  language: TranslationLang;
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
  description: string | null;
  formNumberPath: string | undefined | null;
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

type DraftResponse<T> = {
  status: number;
  body: T;
};

export type { DraftResponse, UploadedFile };
