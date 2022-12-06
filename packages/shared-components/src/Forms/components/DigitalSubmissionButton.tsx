import { Button } from "@navikt/ds-react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React, { useState } from "react";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import { addBeforeUnload, removeBeforeUnload } from "../../util/unload";
import { getRelevantAttachments, hasRelevantAttachments } from "./attachmentsUtil";

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
  const { baseUrl, http, config = {}, app } = useAppConfig();
  const [loading, setLoading] = useState(false);
  const hasAttachments = hasRelevantAttachments(form, submission);
  const sendInn = async () => {
    if (app === "bygger") {
      onError(new Error("Digital innsending er ikke støttet ved forhåndsvisning i byggeren."));
      return;
    }
    try {
      setLoading(true);
      removeBeforeUnload();
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
      addBeforeUnload();
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasAttachments) {
    return (
      <Button onClick={sendInn} loading={loading}>
        {translate(TEXTS.grensesnitt.submitToNav)}
      </Button>
    );
  }

  return (
    <Button onClick={sendInn} loading={loading}>
      {translate(TEXTS.grensesnitt.moveForward)}
    </Button>
  );
};

export default DigitalSubmissionButton;
