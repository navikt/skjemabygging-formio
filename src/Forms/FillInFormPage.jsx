import React from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "../components/NavForm.jsx";

export const FillInFormPage = ({ form, submission, setSubmission, formUrl }) => {
  const history = useHistory();

  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        submission={submission}
        onSubmit={(submission) => {
          setSubmission(submission);
          history.push(`${formUrl}/oppsummering`);
        }}
      />
    </main>
  );
};
