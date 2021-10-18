import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import AlertStripe from "nav-frontend-alertstriper";
import { BekreftCheckboksPanel } from "nav-frontend-skjema";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { genererVedleggKeysSomSkalSendes } from "../util/forsteside";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";
import DownloadPdfButton from "./DownloadPdfButton";

export const computeDokumentinnsendingURL = (dokumentinnsendingBaseURL, form, submissionData) => {
  let url = `${dokumentinnsendingBaseURL}/opprettSoknadResource?skjemanummer=${encodeURIComponent(
    form.properties.skjemanummer
  )}&erEttersendelse=false`;
  if (!submissionData) {
    return url;
  }

  const vedleggsIder = genererVedleggKeysSomSkalSendes(form, submissionData);

  if (vedleggsIder.length > 0) {
    url = url.concat("&vedleggsIder=", vedleggsIder.join(","));
  }
  return url;
};

export function PrepareSubmitPage({ form, submission, formUrl }) {
  const [allowedToProgress, setAllowedToProgress] = useState(false);
  const { dokumentinnsendingBaseURL, fyllutBaseURL } = useAppConfig();
  const [, setHasDownloadedPDF] = useState(false);
  const [goBackUrl, setGoBackURL] = useState("");
  const { loggSkjemaFullfort } = useAmplitude();
  const { translate } = useLanguages();
  const { state, search } = useLocation();

  console.log("PrepareSubmitPage", state, search);
  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  return (
    <ResultContent>
      <Sidetittel className="margin-bottom-large" id="form-title">
        {translate(form.title)}
      </Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <section className="wizard-page" aria-label={translate(TEXTS.statiske.prepareSubmitPage.firstSectionTitle)}>
          <Systemtittel id="last-ned-soknad-overskrift" className="margin-bottom-default">
            {translate(TEXTS.statiske.prepareSubmitPage.firstSectionTitle)}
          </Systemtittel>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.statiske.prepareSubmitPage.firstSectionDescription)}
          </Normaltekst>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.statiske.prepareSubmitPage.firstSectionInstruction)}
          </Normaltekst>
          <DownloadPdfButton
            form={form}
            submission={submission}
            actionUrl={`${fyllutBaseURL}/pdf-form`}
            label={translate(form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication)}
            onClick={() => setHasDownloadedPDF(true)}
            classNames="knapp"
          />
        </section>
        <section className="wizard-page" aria-label={translate(TEXTS.statiske.prepareSubmitPage.secondSectionTitle)}>
          <Systemtittel id="instruksjoner-for-innsending-overskrift" className="margin-bottom-default">
            {translate(TEXTS.statiske.prepareSubmitPage.secondSectionTitle)}
          </Systemtittel>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.statiske.prepareSubmitPage.secondSectionInstruction)}
          </Normaltekst>
          <BekreftCheckboksPanel
            className="margin-bottom-default"
            label={translate(TEXTS.grensesnitt.prepareSubmitPage.confirmCheckboxLabel)}
            checked={allowedToProgress}
            onChange={() => {
              setAllowedToProgress(!allowedToProgress);
            }}
          >
            <div className="margin-bottom-default">
              <strong>{translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxDescription)}</strong>
            </div>
            <ol>
              <li className="typo-normal">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionOne)}
              </li>
              <li className="typo-normal">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionTwo)}
              </li>
              <li className="typo-normal">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionThree)}
              </li>
              <li className="typo-normal">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionFour)}
              </li>
            </ol>
          </BekreftCheckboksPanel>
          <div aria-live="polite">
            {!allowedToProgress && (
              <AlertStripe className="margin-bottom-default" type="advarsel" form="inline">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxWarning)}
              </AlertStripe>
            )}
          </div>
          <nav className="list-inline">
            <div className="list-inline-item">
              <Link className="knapp knapp--fullbredde" to={{ pathname: goBackUrl, search }}>
                {translate(TEXTS.grensesnitt.goBack)}
              </Link>
            </div>
            <div className="list-inline-item">
              <a
                className="knapp knapp--hoved"
                href={computeDokumentinnsendingURL(dokumentinnsendingBaseURL, form, submission.data)}
                onClick={(event) => {
                  if (!allowedToProgress) {
                    event.preventDefault();
                    event.stopPropagation();
                    //} else if (!hasDownloadedPDF) {
                    // Gi beskjed til bruker
                  } else {
                    loggSkjemaFullfort("dokumentinnsending");
                  }
                }}
                target="_blank"
                rel="noopener noreferrer"
              >
                {translate(TEXTS.grensesnitt.moveForward)}
              </a>
            </div>
          </nav>
        </section>
      </main>
    </ResultContent>
  );
}

PrepareSubmitPage.propTypes = {
  form: PropTypes.object.isRequired,
  submission: PropTypes.object.isRequired,
};

const ResultContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
