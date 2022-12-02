import { styled } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import DownloadPdfButton from "./components/DownloadPdfButton";
import NavigateButtonComponent from "./NavigateButtonComponent";

export interface Props {
  form: any;
  submission: any;
  formUrl: string;
  translations: { [key: string]: string } | {};
}

export function PrepareIngenInnsendingPage({ form, submission, formUrl, translations }: Props) {
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
      <main id="maincontent" className="fyllut-layout" tabIndex={-1}>
        <section className="main-col" aria-label={translate(form.properties.innsendingOverskrift)}>
          <div className="wizard-page">
            <Systemtittel className="margin-bottom-default">
              {translate(form.properties.innsendingOverskrift)}
            </Systemtittel>
            <Normaltekst>{translate(form.properties.innsendingForklaring)}</Normaltekst>
            <DownloadPdfButton
              form={form}
              submission={submission}
              actionUrl={`${fyllutBaseURL}/pdf-form-papir`}
              label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
              onClick={() => loggSkjemaFullfort("ingeninnsending")}
              translations={translations}
            />
          </div>
          <NavigateButtonComponent translate={translate} goBackUrl={goBackUrl} />
        </section>
      </main>
    </ResultContent>
  );
}

const ResultContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
