import React from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../hooks";
import { useTranslations } from "../context/i18n";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const { initialLanguage, translations } = useTranslations();
  if (!translations) {
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
          i18n: translations,
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
