import {
  Language,
  localizationUtils,
  NavFormType,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';

export const postNologinSoknad = async (
  appConfig: AppConfigContextType,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
  submissionMethod: SubmissionMethod | undefined,
  innsendingsId?: string,
): Promise<{ pdfBase64: string; receipt: ReceiptSummary }> => {
  const { http, baseUrl } = appConfig;
  const type = submissionMethod === 'digitalnologin' ? 'nologin' : 'digital';
  const url = `${baseUrl}/api/send-inn/${type}-application${innsendingsId ? `/${innsendingsId}` : ''}`;
  return await http!.post<{ pdfBase64: string; receipt: ReceiptSummary }>(
    url,
    {
      formPath: form.path,
      submission,
      language: localizationUtils.getLanguageCodeAsIso639_1(language),
      submissionMethod,
    },
    {
      NologinToken: nologinToken,
    },
  );
};
