import { Innholdstittel, Normaltekst, Sidetittel } from "nav-frontend-typografi";
import { Form } from "react-formio";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import Panel from "nav-frontend-paneler";
import styled from "@material-ui/styles/styled";
import Hovedknapp from "nav-frontend-knapper";
import i18nData from "../i18nData";

export function ResultPage({ form, submission }) {
  const [kanGaVidere, setKanGaVidere] = useState(false);
  const resultForm = form.display === "wizard" ? { ...form, display: "form" } : form;
  return (
    <ResultContent>
      <Sidetittel>Oppsummering for {form.title}</Sidetittel>
      <ResultPanel border>
        <Innholdstittel>1. Se over svarene dine</Innholdstittel>
        <Normaltekst>Her kan du blablabla...</Normaltekst>
        <form action="/skjema/pdf-form" method="post" acceptCharset="utf-8" target="_blank">
          <Form
            key="2"
            form={resultForm}
            options={{ readOnly: true, language: "nb-NO", i18n: i18nData }}
            submission={submission}
          />
          <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
          <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
        </form>
        <Link className="knapp" to={`/${form.path}`}>
          Rediger
        </Link>
      </ResultPanel>
      <ResultPanel border>
        <Innholdstittel>2. Last ned som PDF</Innholdstittel>
        <Normaltekst>Lorem ipsum sit amet..</Normaltekst>
        <input className="knapp" type="submit" value="Last ned PDF" onClick={() => setKanGaVidere(true)} />
      </ResultPanel>
      <ResultPanel border>
        <Innholdstittel>3. Last opp i PDF-opplastingstjeneste</Innholdstittel>
        <Normaltekst>Lorem ipsum sit amet..</Normaltekst>
        <Hovedknapp disabled={!kanGaVidere}>Gå videre</Hovedknapp>
      </ResultPanel>
    </ResultContent>
  );
}

const ResultContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const ResultPanel = styled(Panel)({
  padding: "1rem 2rem",
  marginTop: "2rem",
  "& > *": {
    margin: "1rem 0",
  },
});
