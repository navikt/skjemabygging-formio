import {useParams} from "react-router-dom";
import {Sidetittel} from "nav-frontend-typografi";
import {Form} from "react-formio";
import React from "react";

const formRef = React.createRef();

export const FormPage = ({forms, setSubmission}) => {
  const params = useParams();
  // const history = useHistory();
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
          const inputs = formRef.current.elements;
          inputs.json.value = JSON.stringify(submission);
          formRef.current.submit();
        }}
      />
      <form ref={formRef} action="/skjema/pdf-form" method="post" acceptCharset="utf-8" target="_blank">
              <textarea hidden="hidden" name="json" id="json" required>
              </textarea>
      </form>
    </>
  );
};
