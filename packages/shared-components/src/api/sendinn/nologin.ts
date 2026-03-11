import {
  Language,
  NavFormType,
  PdfFormData,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
} from '@navikt/skjemadigitalisering-shared-domain';
export const postNologinSoknad = async (
  appConfig: AppConfigContextType,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
  translation: any,
  submissionMethod: SubmissionMethod | undefined,
  pdfFormData?: PdfFormData,
  innsendingsId?: string,
): Promise<{ pdfBase64: string; receipt: ReceiptSummary }> => {
  const { http, baseUrl } = appConfig;
  const type = submissionMethod === 'digitalnologin' ? 'nologin' : 'digital';
  const url = `${baseUrl}/api/send-inn/${type}-application${innsendingsId ? `/${innsendingsId}` : ''}`;
  return await http!.post<{ pdfBase64: string; receipt: ReceiptSummary }>(
    url,
    {
      form,
      submission,
      language,
      translation,
      pdfFormData,
    },
    {
      NologinToken: nologinToken,
    },
  );
};

import { AppConfigContextType } from '../../context/config/configContext';
