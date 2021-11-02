import React, { useMemo } from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { useAppConfig } from "../configContext";
import i18nData from "../i18nData";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { featureToggles } = useAppConfig();
  const { currentLanguage, translate, getTranslationsForNavForm } = useLanguages();

  const translationsForNavForm = useMemo(() => getTranslationsForNavForm(), [getTranslationsForNavForm]);

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  const i18nNorskData = { "nb-NO": i18nData["nb-NO"] };

  return (
    <div>
      <Sidetittel>{translate(form.title)}</Sidetittel>
      {form.properties && form.properties.skjemanummer && <p>{form.properties.skjemanummer}</p>}
      <NavForm
        form={form}
        language={featureToggles.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles.enableTranslations ? { ...i18nNorskData, ...translationsForNavForm } : undefined}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onChange={(event) => loggSkjemaSporsmalForSpesialTyper(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          const urlSearchParams = new URLSearchParams(window.location.search).toString();
          history.push(`${formUrl}/oppsummering?${urlSearchParams}`);
        }}
      />
    </div>
  );
};
