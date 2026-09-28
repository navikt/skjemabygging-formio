import {
  Language,
  localizationUtils,
  NavFormType,
  ResponseError,
  Submission,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { AppConfigContextType } from '../../context/config/configContext';
import { getRelevantAttachments, hasOtherDocumentation } from '../../util/attachment/attachmentsUtil';

export interface SendInnSoknadResponse {
  innsendingsId: string;
  hoveddokumentVariant: {
    document: { data: Submission; language: Language | TranslationLang } | null;
  };
  shouldUploadAttachmentsInFyllut: boolean;
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
  forceMellomlagring?: boolean,
): Promise<SendInnSoknadResponse | InnsendingApiStatusResponse | undefined> => {
  const { http, baseUrl, submissionMethod } = appConfig;
  const url = forceMellomlagring
    ? `${baseUrl}/api/send-inn/soknad?forceMellomlagring=true`
    : `${baseUrl}/api/send-inn/soknad`;
  return http?.post<SendInnSoknadResponse>(url, {
    formPath: form.path,
    submission,
    language: localizationUtils.getLanguageCodeAsIso639_1(language),
    submissionMethod,
  });
};

export const updateSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  innsendingsId?: string,
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod } = appConfig;
  if (innsendingsId) {
    return http?.put<SendInnSoknadResponse>(`${baseUrl}/api/send-inn/soknad`, {
      innsendingsId,
      formPath: form.path,
      submission,
      language: localizationUtils.getLanguageCodeAsIso639_1(language),
      submissionMethod,
    });
  } else {
    throw new ResponseError('ERROR', 'Draft submission ID is missing');
  }
};

export const updateUtfyltSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  innsendingsId: string | undefined,
  setRedirectLocation: (location: string) => void,
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod } = appConfig;
  if (!innsendingsId) {
    throw new ResponseError('ERROR', 'Draft submission ID is missing');
  }
  const attachments = getRelevantAttachments(form, submission);
  const otherDocumentation = hasOtherDocumentation(form, submission);

  return http?.put<SendInnSoknadResponse>(
    `${baseUrl}/api/send-inn/utfyltsoknad`,
    {
      innsendingsId,
      formPath: form.path,
      submission,
      language: localizationUtils.getLanguageCodeAsIso639_1(language),
      submissionMethod,
      attachments,
      otherDocumentation,
    },
    {},
    { setRedirectLocation },
  );
};

export const deleteSoknad = async (
  appConfig: AppConfigContextType,
  innsendingsId: string,
): Promise<void | undefined> => {
  const { http, baseUrl, logger } = appConfig;
  if (innsendingsId) {
    return http?.delete(`${baseUrl}/api/send-inn/digital-application/${innsendingsId}`);
  } else {
    logger?.info('Kunne ikke slette søknaden fordi innsendingsId mangler');
  }
};
