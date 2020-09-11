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
        options={{
          readOnly: false,
          language: 'nb-NO',
          i18n: {
            'nb-NO': {
              alertMessage: '{{label}}: {{message}}',
              "error" : "Vennligst fiks følgende feil:",
              "invalid_date" :"{{field}} er ikke en gyldig dato.",
              "invalid_email" : "{{field}} må være en gyldig epost-adresse.",
              "invalid_regex" : "{{field}} passer ikke til uttrykket {{regex}}.",
              "mask" : "Dette er ikke et gyldig {{field}}.",
              "max" : "{{field}} kan ikke være større enn {{max}}.",
              "maxLength" : "{{field}} må være kortere enn {{length}} tegn.",
              "min" : "{{field}} kan ikke være mindre enn {{min}}.",
              "minLength" : "{{field}} må være lengre enn {{length}} tegn.",
              "next" : "Neste",
              "pattern" : "{{field}} stemmer ikke med {{pattern}}",
              "previous" : "Forrige",
              "required" : "Du må fylle ut dette feltet"
            }
          }
        }}
        onSubmit={(submission) => {
          setSubmission({[form.path]: submission});
          history.push(
            `/${params.formpath}/result`);
        }}
      />
    </>
  );
};
