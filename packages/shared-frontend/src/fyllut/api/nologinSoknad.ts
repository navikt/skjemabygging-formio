import {
  NavFormType,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutContextValue } from '../context/fyllut/FyllutContext';

const postNologinSoknad = async (
  appConfig: FyllutContextValue,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: TranslationLang,
  submissionMethod: SubmissionMethod | undefined,
  innsendingsId?: string,
): Promise<{ pdfBase64: string; receipt: ReceiptSummary }> => {
  if (!appConfig.http) {
    throw new Error('Fyllut HTTP client is required to submit a form.');
  }

  const type = submissionMethod === 'digitalnologin' ? 'nologin' : 'digital';
  const url = `${appConfig.baseUrl}/api/send-inn/${type}-application${innsendingsId ? `/${innsendingsId}` : ''}`;

  return appConfig.http.post<{ pdfBase64: string; receipt: ReceiptSummary }>(
    url,
    {
      formPath: form.path,
      submission,
      language,
      submissionMethod,
    },
    { NologinToken: nologinToken },
  );
};

export { postNologinSoknad };
