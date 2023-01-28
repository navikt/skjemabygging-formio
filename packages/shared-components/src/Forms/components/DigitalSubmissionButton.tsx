import { Button } from "@navikt/ds-react";
import React, { useState } from "react";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import { addBeforeUnload, removeBeforeUnload } from "../../util/unload";
import { getRelevantAttachments, hasOtherDocumentation } from "./attachmentsUtil";

export interface Props {
  form: object;
  submission: object;
  translations: object;
  onError: Function;
  onSuccess?: Function;
  children: React.ReactNode;
}

const noop = () => {};

const postToSendInn = async (http, baseUrl, form, submission, translations, currentLanguage, submissionMethod) => {
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
      otherDocumentation: hasOtherDocumentation(form, submission),
      submissionMethod,
    },
    { redirectToLocation: true }
  );
};

const DigitalSubmissionButton = ({ form, submission, translations, onError, onSuccess = noop, children }: Props) => {
  const { currentLanguage } = useLanguages();
  const { baseUrl, http, app } = useAppConfig();
  const [loading, setLoading] = useState(false);
  const sendInn = async () => {
    if (app === "bygger") {
      onError(new Error("Digital innsending er ikke støttet ved forhåndsvisning i byggeren."));
      return;
    }
    try {
      setLoading(true);
      removeBeforeUnload();
      const response = await postToSendInn(http, baseUrl, form, submission, translations, currentLanguage, "digital");
      onSuccess(response);
    } catch (err: any) {
      addBeforeUnload();
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={sendInn} loading={loading}>
      {children}
    </Button>
  );
};

export default DigitalSubmissionButton;
