import React, { useState, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { styled } from "@material-ui/styles";
import AlertStripe from "nav-frontend-alertstriper";
import { BekreftCheckboksPanel } from "nav-frontend-skjema";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { AppConfigContext } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { genererVedleggKeysSomSkalSendes } from "../util/forsteside";
import { useTranslations } from "../context/i18n";
import TEXTS from "../texts";

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
  const { dokumentinnsendingBaseURL, fyllutBaseURL } = useContext(AppConfigContext);
  const [, setHasDownloadedPDF] = useState(false);
  const [goBackUrl, setGoBackURL] = useState("");
  const { loggSkjemaFullfort } = useAmplitude();
  const { translate } = useTranslations();
  const { state } = useLocation();

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
        <section className="wizard-page" aria-label={translate(TEXTS.prepareSubmitPage.firstSectionTitle)}>
          <Systemtittel id="last-ned-soknad-overskrift" className="margin-bottom-default">
            {translate(TEXTS.prepareSubmitPage.firstSectionTitle)}
          </Systemtittel>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.prepareSubmitPage.firstSectionDescription)}
          </Normaltekst>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.prepareSubmitPage.firstSectionInstruction)}
          </Normaltekst>
          <form
            id={form.path}
            action={`${fyllutBaseURL}/pdf-form`}
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
              className="knapp"
              onClick={() => setHasDownloadedPDF(true)}
              type="submit"
              value={translate(TEXTS.downloadApplication)}
            />
          </div>
        </section>
        <section className="wizard-page" aria-label={translate(TEXTS.prepareSubmitPage.secondSectionTitle)}>
          <Systemtittel id="instruksjoner-for-innsending-overskrift" className="margin-bottom-default">
            {translate(TEXTS.prepareSubmitPage.secondSectionTitle)}
          </Systemtittel>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.prepareSubmitPage.secondSectionInstruction)}
          </Normaltekst>
          <BekreftCheckboksPanel
            className="margin-bottom-default"
            label={translate(TEXTS.prepareSubmitPage.confirmCheckboxLabel)}
            checked={allowedToProgress}
            onChange={() => {
              setAllowedToProgress(!allowedToProgress);
            }}
          >
            <div className="margin-bottom-default">
              <strong>{translate(TEXTS.prepareSubmitPage.confirmCheckboxDescription)}</strong>
            </div>
            <ol>
              <li className="typo-normal">{translate(TEXTS.prepareSubmitPage.confirmCheckboxInstructionOne)}</li>
              <li className="typo-normal">{translate(TEXTS.prepareSubmitPage.confirmCheckboxInstructionTwo)}</li>
              <li className="typo-normal">{translate(TEXTS.prepareSubmitPage.confirmCheckboxInstructionThree)}</li>
              <li className="typo-normal">{translate(TEXTS.prepareSubmitPage.confirmCheckboxInstructionFour)}</li>
            </ol>
          </BekreftCheckboksPanel>
          <div aria-live="polite">
            {!allowedToProgress && (
              <AlertStripe className="margin-bottom-default" type="advarsel" form="inline">
                {translate(TEXTS.prepareSubmitPage.confirmCheckboxWarning)}
              </AlertStripe>
            )}
          </div>
          <nav className="list-inline">
            <div className="list-inline-item">
              <Link className="knapp knapp--fullbredde" to={goBackUrl}>
                {translate(TEXTS.goBack)}
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
                {translate(TEXTS.prepareSubmitPage.moveForward)}
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
