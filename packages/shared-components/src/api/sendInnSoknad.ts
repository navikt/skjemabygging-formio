import { NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { AppConfigContextType } from "../configContext";

export interface SendInnSoknadResponse {
  innsendingsId: string;
}

export const createSendInnSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string
): Promise<SendInnSoknadResponse | undefined> => {
  const { http, baseUrl, submissionMethod, config } = appConfig;
  return http?.post<SendInnSoknadResponse>(
    `${baseUrl}/api/send-inn/soknad`,
    {
      form,
      submission,
      language,
      submissionMethod,
    },
    {
      "Fyllut-Is-Test": `${config?.isTest}`,
    },
    { redirectToLocation: false }
  );
};

export const updateSendInnSoknad = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: string,
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
        submissionMethod,
      },
      {
        "Fyllut-Is-Test": `${!!config?.isTest}`,
      },
      { redirectToLocation: false }
    );
  } else {
    logger?.error("Kunne ikke mellomlagre søknaden, fordi innsendingsId mangler");
  }
};
