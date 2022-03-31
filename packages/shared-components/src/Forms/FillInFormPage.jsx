import { Sidetittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import LoadingComponent from "../components/LoadingComponent.jsx";
import NavForm from "../components/NavForm.jsx";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { featureToggles } = useAppConfig();
  const { currentLanguage, translate, translationsForNavForm } = useLanguages();
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isSubmitting) {
    return <LoadingComponent />;
  }

  if (featureToggles.enableTranslations && !translationsForNavForm) {
    return null;
  }

  return (
    <div>
      <Sidetittel>{translate(form.title)}</Sidetittel>
      {form.properties && form.properties.skjemanummer && <p>{form.properties.skjemanummer}</p>}
      <NavForm
        form={form}
        language={featureToggles.enableTranslations ? currentLanguage : undefined}
        i18n={featureToggles.enableTranslations ? translationsForNavForm : undefined}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onChange={(event) => loggSkjemaSporsmalForSpesialTyper(event)}
        onSubmit={(submission) => {
          setIsSubmitting(true);
          setSubmission(submission);
          const urlSearchParams = new URLSearchParams(window.location.search).toString();
          history.push(`${formUrl}/oppsummering?${urlSearchParams}`);
        }}
      />
    </div>
  );
};
