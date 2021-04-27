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

export function PrepareSubmitPage({ form, submission }) {
  const [allowedToProgress, setAllowedToProgress] = useState(false);
  const { dokumentinnsendingBaseURL, fyllutBaseURL } = useContext(AppConfigContext);
  const [, setHasDownloadedPDF] = useState(false);
  const { loggSkjemaFullfort } = useAmplitude();

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const {
    state: { previousPage },
  } = useLocation();

  return (
    <ResultContent>
      <Sidetittel className="margin-bottom-large" id="form-title">
        {form.title}
      </Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <section
          className="wizard-page"
          aria-label="1. Last ned søknaden (PDF). Du blir bedt om å laste den opp på neste side."
        >
          <Systemtittel id="last-ned-soknad-overskrift" className="margin-bottom-default">
            1. Last ned søknaden (PDF). Du blir bedt om å laste den opp på neste side.
          </Systemtittel>
          <Normaltekst className="margin-bottom-default">
            Når du klikker på “Last ned søknad” åpnes søknaden din i en ny fane i nettleseren. Du må lagre pdf-filen på
            maskinen din på en plass hvor du kan finne den igjen.
          </Normaltekst>
          <Normaltekst className="margin-bottom-default">
            Du trenger pdf-filen i neste steg. Kom deretter tilbake hit for å gå videre til innsending av søknaden.
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
              value="Last ned søknad"
            />
          </div>
        </section>
        <section className="wizard-page" aria-label="2. Instruksjoner for innsending av søknaden.">
          <Systemtittel id="instruksjoner-for-innsending-overskrift" className="margin-bottom-default">
            2. Instruksjoner for innsending av søknaden
          </Systemtittel>
          <Normaltekst className="margin-bottom-default">
            Når du klikker på “Gå videre” nedenfor åpnes det en ny side med en opplastingstjeneste (krever innlogging)
            for å laste opp pdf-filen som du lagret på maskinen din i forrige steg.
          </Normaltekst>
          <BekreftCheckboksPanel
            className="margin-bottom-default"
            label="Jeg har lastet ned PDF-en og lest instruksjonene."
            checked={allowedToProgress}
            onChange={() => {
              setAllowedToProgress(!allowedToProgress);
            }}
          >
            <div className="margin-bottom-default">
              <strong>Etter at du har logget inn:</strong>
            </div>
            <ol>
              <li className="typo-normal">Trykk på "Fyll ut og last opp"</li>
              <li className="typo-normal">Trykk på "Finn filen". (OBS! IKKE trykk på "Åpne skjema"-knappen)</li>
              <li className="typo-normal">Finn og velg søknadsfilen som du lastet ned og lagret på maskinen din</li>
              <li className="typo-normal">
                Følg instruksjonene videre for å laste opp eventuelle vedlegg og fullføre innsendingen
              </li>
            </ol>
          </BekreftCheckboksPanel>
          <div aria-live="polite">
            {!allowedToProgress && (
              <AlertStripe className="margin-bottom-default" type="advarsel" form="inline">
                Du må bekrefte at du har lest instruksjonene over før du kan gå videre.
              </AlertStripe>
            )}
          </div>
          <nav className="list-inline">
            <div className="list-inline-item">
              <Link className="knapp knapp--fullbredde" to={previousPage}>
                Gå tilbake
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
                Gå videre
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
