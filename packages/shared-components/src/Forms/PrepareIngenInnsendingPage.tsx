import { styled } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import Lenke from "nav-frontend-lenker";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import DownloadPdfButton from "./components/DownloadPdfButton";

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
  const { state, search } = useLocation();
  const [goBackUrl, setGoBackURL] = useState("");
  const { loggSkjemaFullfort } = useAmplitude();

  const linkBtnStyle = {
    textDecoration: "none",
  };

  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  return (
    <ResultContent>
      <Sidetittel className="margin-bottom-large">{translate(form.title)}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <section className="wizard-page" aria-label={translate(form.properties.innsendingOverskrift)}>
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
            classNames="knapp knapp--fullbredde"
            translations={translations}
          />
        </section>
        <div>
          <Link className="knapp knapp--fullbredde" to={{ pathname: goBackUrl, search }}>
            {translate(TEXTS.grensesnitt.goBack)}
          </Link>
          <Lenke className="knapp" style={linkBtnStyle} href="https://www.nav.no">
            {TEXTS.grensesnitt.navigation.cancel}
          </Lenke>
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
