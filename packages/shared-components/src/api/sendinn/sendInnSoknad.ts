import { I18nTranslationMap, Language, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import { FormContextType } from '../../context/form/FormContext';
import { LanguageContextType } from '../../context/languages/languages-context';
import renderPdfForm from '../../form-components/RenderPdfForm';
import { getRelevantAttachments, hasOtherDocumentation } from '../../util/attachment/attachmentsUtil';

export interface SendInnSoknadResponse {
  innsendingsId: string;
  hoveddokumentVariant: {
    document: { data: Submission; language: Language };
  };
  endretDato: string;
  skalSlettesDato: string;
}

export interface InnsendingApiStatusResponse {
  status: string;
  info: string;
}

export const soknadAlreadyExists = (response: any): response is InnsendingApiStatusResponse =>
  response.status === 'soknadAlreadyExists';

export const getSoknad = async (
  innsendingsId: string,
  appConfig: AppConfigContextType,
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl } = appConfig;
  return http?.get<SendInnSoknadResponse>(`${baseUrl}/api/send-inn/soknad/${innsendingsId}`);
};

export const createSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translation: I18nTranslationMap = {},
  forceMellomlagring?: boolean,
): Promise<SendInnSoknadResponse | InnsendingApiStatusResponse | undefined> => {
  const { http, baseUrl, submissionMethod } = appConfig;
  const url = forceMellomlagring
    ? `${baseUrl}/api/send-inn/soknad?forceMellomlagring=true`
    : `${baseUrl}/api/send-inn/soknad`;
  return http?.post<SendInnSoknadResponse>(url, {
    form,
    submission,
    language,
    translation,
    submissionMethod,
  });
};

export const updateSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translation: I18nTranslationMap = {},
  innsendingsId?: string,
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, logger } = appConfig;
  if (innsendingsId) {
    return http?.put<SendInnSoknadResponse>(`${baseUrl}/api/send-inn/soknad`, {
      innsendingsId,
      form,
      submission,
      language,
      translation,
      submissionMethod,
    });
  } else {
    logger?.info('Kunne ikke mellomlagre søknaden fordi innsendingsId mangler');
  }
};

export const updateUtfyltSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translation: I18nTranslationMap = {},
  innsendingsId: string | undefined,
  setRedirectLocation: (location: string) => void,
  formContextValue: FormContextType,
  languagesContextValue: LanguageContextType,
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, logger, config } = appConfig;
  const attachments = getRelevantAttachments(form, submission);
  const otherDocumentation = hasOtherDocumentation(form, submission);

  console.log('Send inn');
  console.log(
    formContextValue,
    languagesContextValue,
    !!config?.isDelingslenke,
    String(config?.gitVersion),
    submissionMethod,
  );
  console.log(
    renderPdfForm({
      formContextValue,
      languagesContextValue,
      isDelingslenke: !!config?.isDelingslenke,
      gitVersion: String(config?.gitVersion),
      submissionMethod,
    }),
  );

  if (innsendingsId) {
    return http?.put<SendInnSoknadResponse>(
      `${baseUrl}/api/send-inn/utfyltsoknad`,
      {
        innsendingsId,
        form,
        submission,
        language,
        translation,
        submissionMethod,
        attachments,
        otherDocumentation,
        pdfFormData: renderPdfForm({
          formContextValue,
          languagesContextValue,
          isDelingslenke: !!config?.isDelingslenke,
          gitVersion: String(config?.gitVersion),
          submissionMethod,
        }),
      },
      {},
      { setRedirectLocation },
    );
  } else {
    logger?.info('Kunne ikke sende inn søknaden fordi innsendingsId mangler');
  }
};

export const deleteSoknad = async (
  appConfig: AppConfigContextType,
  innsendingsId: string,
): Promise<{ status: string; info: string } | undefined> => {
  const { http, baseUrl, logger } = appConfig;
  if (innsendingsId) {
    return http?.delete(`${baseUrl}/api/send-inn/soknad/${innsendingsId}`);
  } else {
    logger?.info('Kunne ikke slette søknaden fordi innsendingsId mangler');
  }
};
