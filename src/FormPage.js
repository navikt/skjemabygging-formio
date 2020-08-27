import {useParams, useHistory} from "react-router-dom";
import {Innholdstittel, Sidetittel} from "nav-frontend-typografi";
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
      <Innholdstittel>Fyll ut</Innholdstittel>
      <Form
        key="1"
        form={form}
        options={{readOnly: false}}
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
