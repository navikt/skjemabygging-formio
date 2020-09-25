import {useParams, useHistory} from "react-router-dom";
import {Sidetittel} from "nav-frontend-typografi";
import {Form} from "react-formio";
import React from "react";
import i18nData from "../i18nData";


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
          i18n: i18nData
          }
        }
        onSubmit={(submission) => {
          setSubmission({[form.path]: submission});
          history.push(
            `/${params.formpath}/result`);
        }}
        onNextPage={focusAndScrollToNextAndPreviousPage}
        onPrevPage={focusAndScrollToNextAndPreviousPage}
      />
    </>
  );
};

function focusAndScrollToNextAndPreviousPage() {
  const nextOrPreviousPage = document.querySelector("main");
  const nextOrPreviousTitle = document.querySelector(".typo-innholdstittel");
  nextOrPreviousTitle.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
  nextOrPreviousPage.focus({ preventScroll: true });
}
