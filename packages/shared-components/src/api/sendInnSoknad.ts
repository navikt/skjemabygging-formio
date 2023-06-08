import { Language, NavFormType, Submission } from "@navikt/skjemadigitalisering-shared-domain";
import { AppConfigContextType } from "../configContext";

export const updateMellomlagring = async (
  appConfig: AppConfigContextType,
  form: NavFormType,
  submission: Submission,
  language: Language,
  innsendingsId?: string
) => {
  const { http, baseUrl, submissionMethod, config, logger } = appConfig;
  console.log("innsendingsId", innsendingsId);
  if (innsendingsId) {
    http
      ?.put(
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
      )
      .then((response) => {
        console.log(response);
      });
  } else {
    logger?.error("Kunne ikke mellomlagre søknaden, fordi innsendingsId mangler");
  }
};
