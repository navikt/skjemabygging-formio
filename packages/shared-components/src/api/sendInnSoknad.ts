import { I18nTranslationMap, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { getRelevantAttachments, hasOtherDocumentation } from "../Forms/components/attachmentsUtil";
import { AppConfigContextType } from "../configContext";

export interface SendInnSoknadResponse {
  innsendingsId: string;
}

export const createSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translation: I18nTranslationMap = {}
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, config } = appConfig;
  return http?.post<SendInnSoknadResponse>(
    `${baseUrl}/api/send-inn/soknad`,
    {
      form,
      submission,
      language,
      translation,
      submissionMethod,
    },
    {
      "Fyllut-Is-Test": `${config?.isTest}`,
    },
    { redirectToLocation: false }
  );
};

export const updateSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translation: I18nTranslationMap = {},
  innsendingsId?: string
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, config, logger } = appConfig;
  if (innsendingsId) {
    return http?.put<SendInnSoknadResponse>(
      `${baseUrl}/api/send-inn/soknad`,
      {
        innsendingsId,
        form,
        submission,
        language,
        translation,
        submissionMethod,
      },
      {
        "Fyllut-Is-Test": `${!!config?.isTest}`,
      },
      { redirectToLocation: false }
    );
  } else {
    logger?.error("Kunne ikke mellomlagre søknaden fordi innsendingsId mangler");
  }
};

export const updateUtfyltSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translation: I18nTranslationMap = {},
  innsendingsId?: string
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, config, logger } = appConfig;
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
      {
        "Fyllut-Is-Test": `${!!config?.isTest}`,
      },
      { redirectToLocation: true }
    );
  } else {
    logger?.error("Kunne ikke sende inn søknaden fordi innsendingsId mangler");
  }
};

// Deprecated. Uses old end-point for submitting until mellomlagring is turned on.
export const createSoknadWithoutInnsendingsId = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
  translations: I18nTranslationMap = {}
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, config } = appConfig;
  const attachments = getRelevantAttachments(form, submission);
  const otherDocumentation = hasOtherDocumentation(form, submission);
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
    {
      "Fyllut-Is-Test": `${!!config?.isTest}`,
    },
    { redirectToLocation: true }
  );
};
