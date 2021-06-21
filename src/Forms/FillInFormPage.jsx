import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { useAmplitude } from "../context/amplitude";
import { useTranslations } from "../context/i18n";
import { useLanguages } from "../context/languages";
import { SANITIZE_CONFIG } from "../template/sanitizeConfig";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { translationsForNavForm } = useTranslations();
  const { initialLanguage, updateInitialLanguage } = useLanguages();
  useEffect(() => updateInitialLanguage(), [updateInitialLanguage]);

  if (!translationsForNavForm) {
    return null;
  }
  return (
    <div>
      <Sidetittel>{form.title}</Sidetittel>
      {form.properties && form.properties.skjemanummer && <p>{form.properties.skjemanummer}</p>}
      <NavForm
        key="1"
        form={form}
        options={{
          language: initialLanguage.current,
          i18n: translationsForNavForm,
          sanitizeConfig: SANITIZE_CONFIG,
        }}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onChange={(event) => loggSkjemaSporsmalForSpesialTyper(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          history.push(`${formUrl}/oppsummering`);
        }}
      />
    </div>
  );
};
