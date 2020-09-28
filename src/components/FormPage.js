import { useParams, useHistory } from "react-router-dom";
import { Sidetittel } from "nav-frontend-typografi";
import NavForm from "./NavForm";
import React from "react";

export const FormPage = ({ forms, submission, setSubmission }) => {
  const params = useParams();
  const history = useHistory();
  const form = forms.find((form) => form.path === params.formpath);
  if (!form) {
    return <h1>Finner ikke skjemaet '{params.formpath}'</h1>;
  }
  return (
    <>
      <Sidetittel>{form.title}</Sidetittel>
      <form>
        <NavForm
          key="1"
          form={form}
          submission={submission[form.path]}
          onSubmit={(submission) => {
            setSubmission({ [form.path]: submission });
            history.push(`/${params.formpath}/result`);
          }}
        />
      </form>
    </>
  );
};
