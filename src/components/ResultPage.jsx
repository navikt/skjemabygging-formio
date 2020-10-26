import { Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import NavForm from "./NavForm";
import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import Panel from "nav-frontend-paneler";
import styled from "@material-ui/styles/styled";
import Hovedknapp from "nav-frontend-knapper";
import i18nData from "../i18nData";
import { AppConfigContext } from "../configContext";

function formatValue(component, value) {
  switch (component.type) {
    case "radio":
      const valueObject = component.values.find((valueObject) => valueObject.value === value);
      if (!valueObject) {
        console.log(`'${value}' is not in ${JSON.stringify(component.values)}`);
        return "";
      }
      return valueObject.label;
    case "signature": {
      console.log("rendering signature not supported");
      return "";
    }
    case "navDatepicker": {
      if (!value) {
        return "";
      }
      const date = new Date(value);
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`; // TODO: month is zero based.
    }
    default:
      return value;
  }
}

const filterNonFormContent = (components, submission = []) =>
  components
    .filter((component) => component.type !== "content")
    .filter((component) => component.type !== "htmlelement")
    .filter(
      (component) =>
        component.type !== "container" ||
        filterNonFormContent(component.components, submission[component.key]).length > 0
    )
    .filter((component) =>
      component.conditional.when ? submission[component.conditional.when] === component.conditional.eq : true
    )
    .filter((component) => submission[component.key] !== "")
    .filter((component) => submission[component.key] !== undefined);

const FormSummaryField = ({ component, value }) => (
  <>
    <dt>{component.label}</dt>
    <dd>{formatValue(component, value)}</dd>
  </>
);

const FormSummaryFieldset = ({ component, submission }) => (
  <>
    <dt>{component.legend}</dt>
    <dd>
      <dl>
        {filterNonFormContent(component.components, submission).map((subComponent) => (
          <FormSummaryField key={subComponent.key} component={subComponent} value={submission[subComponent.key]} />
        ))}
      </dl>
    </dd>
  </>
);

const FormSummary = ({ form, submission }) => {
  return form.components.map((panel) => {
    if (!panel.components || filterNonFormContent(panel.components, submission).length === 0) {
      return null;
    }
    return (
      <section key={panel.title}>
        <h3>{panel.title}</h3>
        <dl>
          {filterNonFormContent(panel.components, submission).map((component) => {
            if (component.type === "container") {
              return filterNonFormContent(component.components, submission[component.key]).map((subComponent) => (
                <FormSummaryField
                  key={subComponent.key}
                  component={subComponent}
                  value={submission[component.key][subComponent.key]}
                />
              ));
            } else if (component.type === "fieldset") {
              return <FormSummaryFieldset key={component.key} component={component} submission={submission} />;
            }
            if (component.type === "radio") {
              return <FormSummaryField key={component.key} component={component} value={submission[component.key]} />;
            } else {
              return <FormSummaryField key={component.key} component={component} value={submission[component.key]} />;
            }
          })}
        </dl>
      </section>
    );
  });
};

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
    window.open(url, "_blank", "noopener");
  };

  return (
    <ResultContent>
      <Sidetittel>Oppsummering av søknaden din</Sidetittel>
      <ResultPanel border>
        <Systemtittel>1. Se over svarene dine</Systemtittel>
        <Normaltekst>
          Vennligst sjekk at alle svarene dine er riktige. Hvis du finner noe som må korrigeres trykker du på
          "Rediger"-knappen nedenfor. Hvis alle svarene er riktige går du videre til steg 2.
        </Normaltekst>
        <FormSummary submission={!!submission ? submission.data : {}} form={resultForm} />
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
        <Link className="knapp" to={`/${form.path}`}>
          Rediger
        </Link>
      </ResultPanel>
      <ResultPanel border>
        <Systemtittel>2. Last ned som PDF</Systemtittel>
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
        <Systemtittel>3. Gå videre til innsending av søknaden</Systemtittel>
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

const ResultContent = styled("main")({
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
