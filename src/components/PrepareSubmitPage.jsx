import React, { useState, useContext } from "react";
import styled from "@material-ui/styles/styled";
import AlertStripe from "nav-frontend-alertstriper";
import { BekreftCheckboksPanel } from "nav-frontend-skjema";
import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import i18nData from "../i18nData";
import { AppConfigContext } from "../configContext";
import NavForm from "./NavForm";
import PropTypes from "prop-types";
import RefreshModal from "./RefreshModal";

export const computeDokumentinnsendingURL = (dokumentinnsendingBaseURL, form, submissionData) => {
  let url = `${dokumentinnsendingBaseURL}/opprettSoknadResource?skjemanummer=${encodeURIComponent(
    form.properties.skjemanummer
  )}&erEttersendelse=false`;
  if (!submissionData) {
    return url;
  }
  // basert på at api key for vedlegget er vedlegg<vedleggsId> og at verdien er leggerVedNaa.
  const vedleggsIder = [];
  const prefix = "vedlegg";

  Object.entries(submissionData).forEach(([key, value]) => {
    if (key.startsWith(prefix) && value === "leggerVedNaa" && key.length > prefix.length) {
      vedleggsIder.push(key.substr(prefix.length));
    }
  });

  if (vedleggsIder.length > 0) {
    url = url.concat("&vedleggsIder=", vedleggsIder.join(","));
  }
  return url;
};

export function PrepareSubmitPage({ form, submission }) {
  const [allowedToProgress, setAllowedToProgress] = useState(false);
  const resultForm = form.display === "wizard" ? { ...form, display: "form" } : form;
  const { dokumentinnsendingBaseURL } = useContext(AppConfigContext);

  return (
    <ResultContent>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
      <section className="margin-bottom-large">
        <Systemtittel className="margin-bottom-default">1. For å gå videre må du laste ned PDF</Systemtittel>
        <Normaltekst className="margin-bottom-default">
          Når du klikker på “Last ned pdf” åpnes søknaden din i en ny fane i nettleseren. Du må lagre pdf-filen på
          maskinen din på en plass hvor du kan finne den igjen.
        </Normaltekst>
        <Normaltekst className="margin-bottom-default">
          Du trenger pdf-filen i neste steg. Kom deretter tilbake hit for å gå videre til innsending av søknaden.
        </Normaltekst>
        <form id={form.path} action="/fyllut/pdf-form" method="post" acceptCharset="utf-8" target="_blank" hidden>
          <NavForm
            key="2"
            form={resultForm}
            options={{ readOnly: true, language: "nb-NO", i18n: i18nData }}
            submission={submission}
          />
          <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
          <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
        </form>
        <div>
          <input form={form.path} className="knapp" type="submit" value="Last ned PDF" />
        </div>
      </section>
      <section className="margin-bottom-large">
        <Systemtittel className="margin-bottom-default">2. Gå videre til innsending av søknaden</Systemtittel>
        <Normaltekst className="margin-bottom-default">
          Når du klikker på “Gå videre” nedenfor åpnes det en ny side med en opplastingstjeneste (krever innlogging) for
          å laste opp pdf-filen som du lagret på maskinen din i forrige steg.
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
        <a
          className="knapp knapp--hoved"
          href={computeDokumentinnsendingURL(dokumentinnsendingBaseURL, form, submission.data)}
          onClick={(event) => {
            if (!allowedToProgress) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          target="_blank"
          rel="noopener noreferrer"
        >
          Gå videre
        </a>
      </section>
      <RefreshModal />
    </ResultContent>
  );
}

PrepareSubmitPage.propTypes = {
  form: PropTypes.object.isRequired,
  submission: PropTypes.object.isRequired,
};

const ResultContent = styled("main")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
