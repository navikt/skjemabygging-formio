import React from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";
import { useAmplitude } from "../context/amplitude";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();
  const { loggSkjemaSporsmalBesvart } = useAmplitude();

  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        submission={submission}
        onBlur={(event) => loggSkjemaSporsmalBesvart(event)}
        onSubmit={(submission) => {
          setSubmission(submission);
          history.push(`${formUrl}/oppsummering`);
        }}
      />
    </main>
  );
};
