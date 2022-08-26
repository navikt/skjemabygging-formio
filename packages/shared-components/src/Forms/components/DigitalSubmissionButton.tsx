import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Hovedknapp } from "nav-frontend-knapper";
import React, { useState } from "react";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import { getRelevantAttachments } from "./attachmentsUtil";

export interface Props {
  form: object;
  submission: object;
  translations: object;
  onError: Function;
  onSuccess?: Function;
}

const noop = () => {};

const postToSendInn = async (http, baseUrl, form, submission, translations, currentLanguage, isTest) => {
  const translationsForPDF = currentLanguage !== "nb-NO" && translations ? translations[currentLanguage] : {};
  const attachments = getRelevantAttachments(form, submission);
  return http.post(
    `${baseUrl}/api/send-inn`,
    {
      form,
      submission,
      translations: translationsForPDF,
      language: currentLanguage,
      attachments,
    },
    {
      "Fyllut-Is-Test": isTest,
    },
    { redirectToLocation: true }
  );
};

const DigitalSubmissionButton = ({ form, submission, translations, onError, onSuccess = noop }: Props) => {
  const { translate, currentLanguage } = useLanguages();
  const { baseUrl, http, config = {} } = useAppConfig();
  const [loading, setLoading] = useState(false);

  const sendInn = async () => {
    try {
      setLoading(true);
      const response = await postToSendInn(
        http,
        baseUrl,
        form,
        submission,
        translations,
        currentLanguage,
        config.isDelingslenke
      );
      onSuccess(response);
    } catch (err: any) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Hovedknapp onClick={sendInn} spinner={loading}>
      {translate(TEXTS.grensesnitt.moveForward)}
    </Hovedknapp>
  );
};

export default DigitalSubmissionButton;
