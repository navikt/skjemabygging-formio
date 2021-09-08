import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { useAmplitude } from "../context/amplitude";
import { useAppConfig } from "../configContext";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";
import {NavFormType} from "../../../bygger/src/Forms/navForm";

const LastNedSoknadFragment = ({ form, submission, fyllutBaseURL, translate }) => {
  const [hasDownloadedPDF, setHasDownloadedPDF] = useState(false);
  const { loggSkjemaFullfort } = useAmplitude();
  useEffect(() => {
    if (hasDownloadedPDF) {
      loggSkjemaFullfort("ingeninnsending");
    }
  }, [hasDownloadedPDF, loggSkjemaFullfort]);
  return (
    <>
      <form
        id={form.path}
        action={`${fyllutBaseURL}/pdf-form-papir`}
        method="post"
        acceptCharset="utf-8"
        target="_blank"
        hidden
      >
        <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
        <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
      </form>
      <div>
        <input
          form={form.path}
          className="knapp knapp--fullbredde"
          onClick={() => setHasDownloadedPDF(true)}
          type="submit"
          value={translate(TEXTS.downloadApplication)}
        />
      </div>
    </>
  );
};

export interface Props {
  form: NavFormType;
  submission: any;
  formUrl: string;
}

export function PrepareIngenInnsendingPage({ form, submission, formUrl }: Props) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL } = useAppConfig();
  const { translate } = useLanguages();
  const { state } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");

  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  return (
    <ResultContent>
      <Sidetittel className="margin-bottom-large">{translate(form.title)}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <section className="wizard-page" aria-label={translate(form.properties.innsendingOverskrift)}>
          <Systemtittel className="margin-bottom-default">{translate(form.properties.innsendingOverskrift)}</Systemtittel>
          <Normaltekst>{translate(form.properties.innsendingForklaring)}</Normaltekst>
          <LastNedSoknadFragment
            form={form}
            submission={submission}
            fyllutBaseURL={fyllutBaseURL}
            translate={translate}
          />
        </section>
        <div>
          <Link className="knapp knapp--fullbredde" to={goBackUrl}>
            {translate(TEXTS.goBack)}
          </Link>
        </div>
      </main>
    </ResultContent>
  );
}

const ResultContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
