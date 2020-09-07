import {useParams} from "react-router-dom";
import {Sidetittel} from "nav-frontend-typografi";
import {Form} from "react-formio";
import React from "react";

export const FormPage = ({forms, setSubmission}) => {
  const formRef = React.createRef();
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
          fetch('/skjema/pdf', {
            method: 'POST',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify(submission)
          })
            .then(response => {
              console.log('response', response);
              response.text()
                .then(text => {
                  console.log('text', text)
                });
            });
          /*
          history.push(
            `/${params.formpath}/result`
          );

           */
        }}
          />
          <form ref={formRef} style={{display: "none"}} action="/skjema/pdf-form" method="post" acceptCharset="utf-8" target="_blank">
            <div className="form-example">
              <label htmlFor="json">Enter your json: </label>
              <textarea name="json" id="json" required>
              </textarea>
            </div>
            <div className="form-example">
              <input type="submit" />
            </div>
          </form>
          </>
          );
        };
