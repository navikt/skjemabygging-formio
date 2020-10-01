import { Innholdstittel, Normaltekst, Sidetittel } from "nav-frontend-typografi";
import NavForm from "./NavForm";
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import Panel from "nav-frontend-paneler";
import styled from "@material-ui/styles/styled";
import Hovedknapp from "nav-frontend-knapper";
import i18nData from "../i18nData";
import { AppConfigContext } from "../configContext";

export function ResultPage({ form, submission }) {
  const [isNextDisabled, setIsNextDisabled] = useState(true);
  const resultForm = form.display === "wizard" ? { ...form, display: "form" } : form;
  const { dokumentinnsendingBaseURL } = useContext(AppConfigContext);

  const goToDokumentinnsendingWithNAV760710AndVedlegg = () => {
    //Hardkodet midlertidig inngang til dokumentinnsending
    let url = `${dokumentinnsendingBaseURL}/opprettSoknadResource?skjemanummer=NAV%2076-07.10&erEttersendelse=false`;
    if (submission && submission.data) {
      const vedleggMedSvar = { Q7: submission.data.vedleggQ7, O9: submission.data.vedleggO9 };
      const kommaseparertVedleggsliste = Object.keys(vedleggMedSvar)
        .filter((vedleggsID) => vedleggMedSvar[vedleggsID] === "leggerVedNaa")
        .join(",");

      if (kommaseparertVedleggsliste) {
        url = url.concat("&vedleggsIder=", kommaseparertVedleggsliste);
      }
    }
    window.location.href = url;
  };

  return (
    <ResultContent>
      <Sidetittel>Oppsummering av søknaden din</Sidetittel>
      <ResultPanel border>
        <Innholdstittel>1. Se over svarene dine</Innholdstittel>
        <Normaltekst>
          Vennligst sjekk at alle svarene dine er riktige. Hvis du finner noe som må korrigeres trykker du på
          "Rediger"-knappen nedenfor. Hvis alle svarene er riktige går du videre til steg 2.
        </Normaltekst>
        <form id={form.path} action="/skjema/pdf-form" method="post" acceptCharset="utf-8" target="_blank">
          <NavForm
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
        <Normaltekst>
          Søknaden (pdf) åpnes i en nye fane i nettleseren. Du må lagre pdf-filen på maskinen din og deretter komme
          tilbake hit for å gå videre til steg 3.
        </Normaltekst>
        <input
          form={form.path}
          className="knapp"
          type="submit"
          value="Last ned PDF"
          onClick={() => setIsNextDisabled(false)}
        />
      </ResultPanel>
      <ResultPanel border>
        <Innholdstittel>3. Gå videre til innsending av søknaden</Innholdstittel>
        <Normaltekst>
          Når du trykker på knappen nedenfor blir du sendt videre til en opplastingstjeneste for å laste opp søknaden
          din (krever innlogging). Etter at du har logget inn:
        </Normaltekst>
        <ol>
          <li className="typo-normal">Trykk på "Fyll ut og last opp"</li>
          <li className="typo-normal">Trykk på "Finn filen". (OBS! IKKE trykk på "Åpne skjema"-knappen)</li>
          <li className="typo-normal">Finn og velg søknadsfilen som du lastet ned og lagret på maskinen din</li>
          <li className="typo-normal">
            Følg instruksjonene videre for å laste opp eventuelle vedlegg og fullføre innsendingen
          </li>
        </ol>
        <Hovedknapp disabled={isNextDisabled} onClick={() => goToDokumentinnsendingWithNAV760710AndVedlegg()}>
          Gå videre
        </Hovedknapp>
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
