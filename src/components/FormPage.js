import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "./NavForm";

export const FormPage = ({ forms, submission, setSubmission }) => {
  const params = useParams();
  const history = useHistory();
  const form = forms.find((form) => form.path === params.formpath);
  const formTitle = form ? form.title : "";
  useEffect(() => {
    document.title = `${formTitle} | www.nav.no`;
  }, [formTitle]);
  if (!form) {
    return <h1>Finner ikke skjemaet '{params.formpath}'</h1>;
  }
  return (
    <main tabIndex={-1}>
      <Sidetittel>{form.title}</Sidetittel>
      <NavForm
        key="1"
        form={form}
        submission={submission[form.path]}
        onSubmit={(submission) => {
          setSubmission({ [form.path]: submission });
          history.push(`/${params.formpath}/oppsummering`);
        }}
      />
    </main>
  );
};
