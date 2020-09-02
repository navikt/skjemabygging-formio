import {useParams, useHistory} from "react-router-dom";
import {Sidetittel} from "nav-frontend-typografi";
import {Form} from "react-formio";
import React from "react";

export const FormPage = ({forms, setSubmission}) => {
  const params = useParams();
  const history = useHistory();
  const form = forms.find(
    (form) => form.path === params.formpath
  );
  if (!form) {
    return <h1>Finner ikke skjemaet '{params.formpath}'</h1>;
  }
  return (
    <>
      <Sidetittel>{form.title}</Sidetittel>
      <Form
        key="1"
        form={form}
        options={{readOnly: false, language: 'nb-NO'}}
        onSubmit={(submission) => {
          setSubmission({[form.path]: submission});
          history.push(
            `/${params.formpath}/result`
          );
        }}
      />
    </>
  );
};
