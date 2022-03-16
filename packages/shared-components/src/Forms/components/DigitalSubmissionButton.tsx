import { navFormUtils, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import FormioUtils from "formiojs/utils";
import { Hovedknapp } from "nav-frontend-knapper";
import React, { useState } from "react";
import http from "../../api/http";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import { sanitizeJavaScriptCode } from "../../formio-overrides";

interface Props {
  form: object;
  submission: object;
  translations: object;
  onError: Function;
}

const postToSendInn = async (baseUrl, form, submission, translations, currentLanguage) => {
  const translationsForPDF = currentLanguage !== "nb-NO" ? translations[currentLanguage] : {};
  const vedleggComponents = navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .map((component) => {
      const clone = JSON.parse(JSON.stringify(component));
      clone.customConditional = sanitizeJavaScriptCode(clone.customConditional);
      return clone;
    });

  const attachments = vedleggComponents.filter((comp) => FormioUtils.checkCondition(comp, undefined, submission, form));
  return http.post(
    `${baseUrl}/api/send-inn`,
    {
      form,
      submission,
      translations: translationsForPDF,
      language: currentLanguage,
      attachments: attachments.map((comp) => ({
        vedleggsnr: comp.properties.vedleggskode,
        tittel: comp.properties.vedleggstittel,
        label: comp.label,
        mimetype: "application/pdf",
        pakrevd: comp.properties.vedleggErValgfritt !== "ja",
        document: [],
      })),
    },
    {},
    { redirectToLocation: true }
  );
};

const DigitalSubmissionButton = ({ form, submission, translations, onError }: Props) => {
  const { translate, currentLanguage } = useLanguages();
  const { baseUrl } = useAppConfig();
  const [loading, setLoading] = useState(false);

  const sendInn = async () => {
    try {
      setLoading(true);
      await postToSendInn(baseUrl, form, submission, translations, currentLanguage);
    } catch (err: any) {
      setLoading(false);
      onError(err);
    }
  };

  return (
    <Hovedknapp onClick={sendInn} spinner={loading}>
      {translate(TEXTS.grensesnitt.moveForward)}
    </Hovedknapp>
  );
};

export default DigitalSubmissionButton;
