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
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, logger } = appConfig;
  const attachments = getRelevantAttachments(form, submission);
  const otherDocumentation = hasOtherDocumentation(form, submission);

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
