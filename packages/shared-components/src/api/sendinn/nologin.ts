import { Language, NavFormType, ReceiptSummary, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import { FormContextType } from '../../context/form/FormContext';
import { LanguageContextType } from '../../context/languages/languages-context';
import renderPdfForm from '../../form-components/RenderPdfForm';

export const postNologinSoknad = async (
  appConfig: AppConfigContextType,
  nologinToken: string,
  form: NavFormType,
  submission: Submission,
  language: Language,
  translation: any,
  formContextValue: FormContextType,
  languagesContextValue: LanguageContextType,
): Promise<{ pdfBase64: string; receipt: ReceiptSummary }> => {
  const { http, baseUrl, config, submissionMethod } = appConfig;
  return await http!.post<{ pdfBase64: string; receipt: ReceiptSummary }>(
    `${baseUrl}/api/send-inn/nologin-soknad`,
    {
      form,
      submission,
      language,
      translation,
      pdfFormData: renderPdfForm({
        formContextValue,
        languagesContextValue,
        isDelingslenke: !!config?.isDelingslenke,
        gitVersion: String(config?.gitVersion),
        submissionMethod,
      }),
    },
    {
      NologinToken: nologinToken,
    },
  );
};
