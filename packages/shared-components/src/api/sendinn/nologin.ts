import { Language, NavFormType, ReceiptSummary, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import { PdfFormData } from '../../form-components/types';

export const postNologinSoknad = async (
  appConfig: AppConfigContextType,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
  translation: any,
  pdfFormData?: PdfFormData,
): Promise<{ pdfBase64: string; receipt: ReceiptSummary }> => {
  const { http, baseUrl } = appConfig;
  return await http!.post<{ pdfBase64: string; receipt: ReceiptSummary }>(
    `${baseUrl}/api/send-inn/nologin-soknad`,
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
