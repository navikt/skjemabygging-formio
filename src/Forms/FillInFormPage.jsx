import React, { useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { useAmplitude } from "../context/amplitude";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl, translation }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart, loggSkjemaSporsmalForSpesialTyper } = useAmplitude();
  const params = new URLSearchParams(history.location.search);
  const language = params.get("lang");
  const initialLanguage = useRef(language || "nb-NO");
  useEffect(() => {
    if (window.setLanguage !== undefined && language) {
      window.setLanguage(language);
    }
  }, [language]);
  if (!translation) {
    return null;
  }
  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        options={{
          language: initialLanguage.current,
          i18n: translation,
        }}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onChange={(event) => loggSkjemaSporsmalForSpesialTyper(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          history.push(`${formUrl}/oppsummering`);
        }}
      />
    </main>
  );
};
