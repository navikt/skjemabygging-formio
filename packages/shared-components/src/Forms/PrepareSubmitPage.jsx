import { styled } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import AlertStripe from "nav-frontend-alertstriper";
import { BekreftCheckboksPanel } from "nav-frontend-skjema";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import { genererVedleggKeysSomSkalSendes } from "../util/forsteside";
import DownloadPdfButton from "./components/DownloadPdfButton";

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

export function PrepareSubmitPage({ form, submission, formUrl, translations }) {
  const [allowedToProgress, setAllowedToProgress] = useState(false);
  const { dokumentinnsendingBaseURL, fyllutBaseURL } = useAppConfig();
  const [hasDownloadedPDF, setHasDownloadedPDF] = useState(false);
  const [errorMessage, setErrorMessage] = useState(undefined);
  const [goBackUrl, setGoBackURL] = useState("");
  const { loggSkjemaFullfort } = useAmplitude();
  const { translate } = useLanguages();
  const { state, search } = useLocation();

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  useEffect(() => {
    if (!state) setGoBackURL(`${formUrl}/oppsummering`);
    else setGoBackURL(state.previousPage);
  }, [state, formUrl]);

  const downloadPdfButtonText = form.properties.downloadPdfButtonText || TEXTS.grensesnitt.downloadApplication;
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
          <ul>
            <li>
              {translate(TEXTS.statiske.prepareSubmitPage.firstSectionInstruction1, {
                downloadApplication: downloadPdfButtonText,
              })}
            </li>
            <li>{translate(TEXTS.statiske.prepareSubmitPage.firstSectionInstruction2)}</li>
            <li>{translate(TEXTS.statiske.prepareSubmitPage.firstSectionInstruction3)}</li>
          </ul>
          <DownloadPdfButton
            form={form}
            submission={submission}
            actionUrl={`${fyllutBaseURL}/pdf-form`}
            label={translate(downloadPdfButtonText)}
            onClick={() => {
              setHasDownloadedPDF(true);
              setErrorMessage(undefined);
            }}
            classNames="navds-button navds-button navds-button--secondary"
            translations={translations}
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
            <ul className="margin-bottom-default">
              <li className="typo-normal">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionOne)}
              </li>
              <li className="typo-normal">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionTwo)}
              </li>
              <li className="typo-normal, margin-bottom-default">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionThree)}
              </li>
            </ul>
            <Normaltekst>{translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxInstructionFour)}</Normaltekst>
          </BekreftCheckboksPanel>
          <div aria-live="polite">
            {!allowedToProgress && (
              <AlertStripe className="margin-bottom-default" type="advarsel" form="inline">
                {translate(TEXTS.statiske.prepareSubmitPage.confirmCheckboxWarning)}
              </AlertStripe>
            )}
            {errorMessage && (
              <AlertStripe className="margin-bottom-default" type="advarsel" form="inline">
                {translate(errorMessage)}
              </AlertStripe>
            )}
          </div>
          <nav className="form-nav">
            <Link className="navds-button navds-button--secondary" to={{ pathname: goBackUrl, search }}>
              {translate(TEXTS.grensesnitt.goBack)}
            </Link>
            <a
              className="navds-button navds-button--primary"
              href={computeDokumentinnsendingURL(dokumentinnsendingBaseURL, form, submission.data)}
              onClick={(event) => {
                if (!allowedToProgress) {
                  event.preventDefault();
                  event.stopPropagation();
                } else if (!hasDownloadedPDF) {
                  setErrorMessage(TEXTS.statiske.prepareSubmitPage.confirmDownloadedPdf);
                  event.preventDefault();
                  event.stopPropagation();
                } else {
                  loggSkjemaFullfort("dokumentinnsending");
                }
              }}
              target="_blank"
              rel="noopener noreferrer"
            >
              {translate(TEXTS.grensesnitt.moveForward)}
            </a>
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
