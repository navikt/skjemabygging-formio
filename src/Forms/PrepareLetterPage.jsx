import React, { useEffect } from "react";
import { styled } from "@material-ui/styles";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import PropTypes from "prop-types";
import { genererFoerstesideData, getVedleggsFelterSomSkalSendes } from "../util/forsteside";
import { lastNedFilBase64 } from "../util/pdf";
import { Link, useLocation } from "react-router-dom";

const LeggTilVedleggSection = ({ index, vedleggSomSkalSendes }) => {
  return (
    <section className="margin-bottom-default">
      <Systemtittel className="margin-bottom-default">{index}. Du må legge ved disse vedleggene</Systemtittel>
      <ul>
        {vedleggSomSkalSendes.map((vedlegg) => (
          <li>{vedlegg.label}</li>
        ))}
      </ul>
    </section>
  );
};

function lastNedFoersteside(form, submission) {
  fetch("/fyllut/foersteside", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(genererFoerstesideData(form, submission.data)),
  })
    .then((response) => {
      if (response.ok) {
        return response;
      } else {
        throw new Error("Failed to retrieve foersteside from soknadsveiviser " + JSON.stringify(response.body));
      }
    })
    .then((response) => response.json())
    .then((json) => json.foersteside)
    .then((base64EncodedPdf) => {
      lastNedFilBase64(base64EncodedPdf, "Førstesideark", "pdf");
    })
    .catch((e) => console.log("Failed to download foersteside", e));
}

const LastNedSoknadSection = ({ form, index, submission }) => (
  <section className="margin-bottom-default">
    <Systemtittel className="margin-bottom-default">{index}. Last ned søknadspapirene til saken din</Systemtittel>
    <Normaltekst className="margin-bottom-default">
      Førstesidearket inneholder viktig informasjon om hvilken enhet i NAV som skal motta dokumentasjonen. Den
      inneholder også adressen du skal sende dokumentene til.
    </Normaltekst>
    {process.env.NODE_ENV === "development" && (
      <div className="margin-bottom-default">
        <button className="knapp knapp--fullbredde" onClick={() => lastNedFoersteside(form, submission)}>
          Last ned førsteside
        </button>
      </div>
    )}
    <form id={form.path} action="/fyllut/pdf-form" method="post" acceptCharset="utf-8" target="_blank" hidden>
      <textarea hidden={true} name="submission" readOnly={true} required value={JSON.stringify(submission)} />
      <textarea hidden={true} name="form" readOnly={true} required value={JSON.stringify(form)} />
    </form>
    <div>
      <input form={form.path} className="knapp knapp--fullbredde" type="submit" value="Last ned Søknad" />
    </div>
  </section>
);

const SendSoknadIPostenSection = ({ index, vedleggSomSkalSendes }) => (
  <section className="margin-bottom-default">
    <Systemtittel className="margin-bottom-default">{index}. Send søknaden i posten</Systemtittel>
    <Normaltekst className="margin-bottom-default">
      Følg instruksjonene på førstesiden for å sende søknaden i posten.
      {vedleggSomSkalSendes.length > 0 &&
        ` Husk å legge ved ${vedleggSomSkalSendes.length > 1 ? "vedleggene" : "vedlegget"} som nevnt i punkt 1 over.`}
    </Normaltekst>
  </section>
);

const HvaSkjerVidereSection = ({ index }) => (
  <section className="margin-bottom-default">
    <Systemtittel className="margin-bottom-default">{index}. Hva skjer videre?</Systemtittel>
    <Normaltekst className="margin-bottom-default">
      Du hører fra oss så fort vi har sett på saken din. Vi tar kontakt med deg om vi mangler noe.
    </Normaltekst>
  </section>
);

export function PrepareLetterPage({ form, submission }) {
  useEffect(() => scrollToAndSetFocus("main"), []);
  const {
    state: { previousPage },
  } = useLocation();

  const sections = [<Innholdstittel className="margin-bottom-large">Last ned søknadspapirene</Innholdstittel>];
  const vedleggSomSkalSendes = getVedleggsFelterSomSkalSendes(submission.data, form);
  if (vedleggSomSkalSendes.length > 0) {
    sections.push(<LeggTilVedleggSection vedleggSomSkalSendes={vedleggSomSkalSendes} />);
  }
  sections.push(<LastNedSoknadSection form={form} submission={submission} />);
  sections.push(<SendSoknadIPostenSection vedleggSomSkalSendes={vedleggSomSkalSendes} />);
  sections.push(<HvaSkjerVidereSection />);
  return (
    <ResultContent tabIndex={-1}>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
      {sections.map((section, index) => React.cloneElement(section, { index }))}
      <div>
        <Link className="knapp knapp--fullbredde" to={previousPage}>
          Gå tilbake
        </Link>
      </div>
    </ResultContent>
  );
}

PrepareLetterPage.propTypes = {
  form: PropTypes.object.isRequired,
  submission: PropTypes.object.isRequired,
};

const ResultContent = styled("main")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
