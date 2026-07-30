import {
  Language,
  localizationUtils,
  NavFormType,
  ReceiptSummary,
  Submission,
  SubmissionMethod,
} from '@navikt/skjemadigitalisering-shared-domain';
import { FyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';

const postNologinSoknad = async (
  appConfig: FyllutAppConfig,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
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
      language: localizationUtils.getLanguageCodeAsIso639_1(language),
      submissionMethod,
    },
    { NologinToken: nologinToken },
  );
};

export { postNologinSoknad };
