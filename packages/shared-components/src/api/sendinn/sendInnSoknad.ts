import { I18nTranslationMap, Language, NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import { getRelevantAttachments, hasOtherDocumentation } from '../../util/attachment/attachmentsUtil';

export interface SendInnSoknadResponse {
  innsendingsId: string;
  hoveddokumentVariant: {
    document: { data: Submission; language: Language };
  };
  endretDato: string;
  skalSlettesDato: string;
}

export interface RedirectResponse {
  redirectUrl: string;
}

export const isRedirectResponse = (response: any): response is RedirectResponse => 'redirectUrl' in response;

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
): Promise<SendInnSoknadResponse | RedirectResponse | undefined> => {
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
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, logger } = appConfig;
  const attachments = getRelevantAttachments(form, submission.data);
  const otherDocumentation = hasOtherDocumentation(form, submission.data);

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

// Deprecated. Uses old end-point for submitting until mellomlagring is turned on.
export const createSoknadWithoutInnsendingsId = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translations: I18nTranslationMap = {},
  setRedirectLocation: (location: string) => void,
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod } = appConfig;
  const attachments = getRelevantAttachments(form, submission.data);
  const otherDocumentation = hasOtherDocumentation(form, submission.data);
  return http?.post(
    `${baseUrl}/api/send-inn`,
    {
      form,
      submission,
      translations,
      language,
      attachments,
      otherDocumentation,
      submissionMethod,
    },
    {},
    { setRedirectLocation },
  );
};
