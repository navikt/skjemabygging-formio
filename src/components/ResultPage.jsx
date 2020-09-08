import {Innholdstittel, Sidetittel} from "nav-frontend-typografi";
import {Form} from "react-formio";
import React from "react";

export function ResultPage({form, submission}) {
  const resultForm =
    form.display === "wizard" ? {...form, display: "form"} : form;
  return (
    <>
      <Sidetittel>{form.title}</Sidetittel>
      <Innholdstittel>Din søknad</Innholdstittel>
      <form action="/skjema/pdf-form" method="post" acceptCharset="utf-8" target="_blank">
        <Form
          key="2"
          form={resultForm}
          options={{readOnly: true}}
          submission={submission}
        />
        <button onClick={window.print}>Skriv ut</button>
        <input type="submit" value="Lag pdf"/>
        <textarea hidden={true} name="json" id="json" readOnly={true} required value={JSON.stringify(submission)}/>
      </form>

    </>
  );
}
