import React from "react";
import { useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "./NavForm";

export const FillInFormPage = ({ form, submission, setSubmission }) => {
  const history = useHistory();

  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        submission={submission[form.path]}
        onSubmit={(submission) => {
          setSubmission({ [form.path]: submission });
          history.push(`/${form.path}/oppsummering`);
        }}
      />
    </main>
  );
};
