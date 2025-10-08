import { Language, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

declare const atob: (data: string) => string;

export type SendInnReceiptAttachment = {
  vedleggsnr: string;
  tittel: string;
};

export type SendInnReceiptMetadata = {
  label?: string;
  status?: string;
  mottattdato?: string;
  hoveddokumentRef?: string | null;
  innsendteVedlegg?: SendInnReceiptAttachment[];
  skalEttersendes?: SendInnReceiptAttachment[];
  skalSendesAvAndre?: SendInnReceiptAttachment[];
  levertTidligere?: SendInnReceiptAttachment[];
  sendesIkkeInn?: SendInnReceiptAttachment[];
  navKanInnhente?: SendInnReceiptAttachment[];
  ettersendingsfrist?: string | null;
  [key: string]: unknown;
};

export type NologinSubmissionResult = {
  innsendingId: string;
  fileName: string;
  pdfBlob: Blob;
  kvittering: SendInnReceiptMetadata;
};

type NologinSubmissionApiResponse = {
  innsendingId: string;
  fileName?: string;
  pdf: string;
  kvittering: SendInnReceiptMetadata;
};

const base64ToBlob = (base64: string, contentType: string): Blob => {
  const binaryString = atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i += 1) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: contentType });
};

export const postNologinSoknad = async (
  appConfig: AppConfigContextType,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
  translation: any,
): Promise<NologinSubmissionResult> => {
  const { http, baseUrl } = appConfig;
  const response = await http!.post<NologinSubmissionApiResponse>(
    `${baseUrl}/api/send-inn/nologin-soknad`,
    {
      form,
      submission,
      language,
      translation,
    },
    {
      NologinToken: nologinToken,
      Accept: http!.MimeType.JSON,
    },
  );

  const fileName = response.fileName ?? `${form.path}.pdf`;
  const pdfBlob = base64ToBlob(response.pdf, 'application/pdf');

  return {
    innsendingId: response.innsendingId,
    fileName,
    pdfBlob,
    kvittering: response.kvittering,
  };
};
