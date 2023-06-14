import { Button } from "@navikt/ds-react";
import { useState } from "react";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { addBeforeUnload, removeBeforeUnload } from "../../util/unload";
import { getRelevantAttachments, hasOtherDocumentation } from "./attachmentsUtil";

export interface Props {
  form: object;
  submission: object;
  translations: object;
  onError: Function;
  onSuccess?: Function;
  children: string;
}

const noop = () => {};

const postToSendInn = async (
  http,
  baseUrl,
  form,
  submission,
  translations,
  currentLanguage,
  submissionMethod,
  isTest
) => {
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
    {
      "Fyllut-Is-Test": isTest,
    },
    { redirectToLocation: true }
  );
};

const DigitalSubmissionButton = ({ form, submission, translations, onError, onSuccess = noop, children }: Props) => {
  const { currentLanguage } = useLanguages();
  const { loggNavigering } = useAmplitude();
  const { baseUrl, http, config = {}, app } = useAppConfig();
  const [loading, setLoading] = useState(false);
  const sendInn = async () => {
    if (app === "bygger") {
      onError(new Error("Digital innsending er ikke støttet ved forhåndsvisning i byggeren."));
      return;
    }
    try {
      setLoading(true);
      loggNavigering({ lenkeTekst: children, destinasjon: "/sendinn" });
      removeBeforeUnload();
      const response = await postToSendInn(
        http,
        baseUrl,
        form,
        submission,
        translations,
        currentLanguage,
        "digital",
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

  return (
    <Button onClick={sendInn} loading={loading}>
      {children}
    </Button>
  );
};

export default DigitalSubmissionButton;
