import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { useAmplitude } from "../context/amplitude";
import { useAppConfig } from "../configContext";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";
import DownloadPdfButton from "./DownloadPdfButton";

export interface Props {
  form: any;
  submission: any;
  formUrl: string;
}

export function PrepareIngenInnsendingPage({ form, submission, formUrl }: Props) {
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const { fyllutBaseURL } = useAppConfig();
  const { translate } = useLanguages();
  const { state } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");
  const { loggSkjemaFullfort } = useAmplitude();

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
          <DownloadPdfButton
            form={form}
            submission={submission}
            actionUrl={`${fyllutBaseURL}/pdf-form-papir`}
            label={translate(TEXTS.downloadApplication)}
            onClick={() => loggSkjemaFullfort("ingeninnsending")}
            classNames="knapp knapp--fullbredde"
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
