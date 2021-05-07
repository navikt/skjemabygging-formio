import React, { useContext, useEffect } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { AppConfigContext } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { getPanels } from "../util/form";
import navCssVariabler from "nav-frontend-core";
import { createFormSummaryObject } from "../util/formSummaryUtil";

const FormSummaryField = ({ label, value }) => (
  <>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </>
);

const FormSummaryFieldset = ({ label, components }) => (
  <div>
    <dt>{label}</dt>
    <dd>
      <dl className="margin-left-default">
        <ComponentSummary components={components} />
      </dl>
    </dd>
  </div>
);

const DataGridSummary = ({ label, components }) => (
  <>
    <dt>{label}</dt>
    <dd>
      {components.map((component) => (
        <DataGridRow key={component.key} label={component.label} components={component.components} />
      ))}
    </dd>
  </>
);

const DataGridRow = ({ label, components }) => (
  <div className="data-grid__row skjemagruppe">
    {label && <p className="skjemagruppe__legend">{label}</p>}
    <dl>
      <ComponentSummary components={components} />
    </dl>
  </div>
);

const PanelSummary = ({ label, components }) => (
  <section className="margin-bottom-default wizard-page">
    <Systemtittel tag="h3" className="margin-bottom-default">
      {label}
    </Systemtittel>
    <dl>
      <ComponentSummary components={components} />
    </dl>
  </section>
);

const ComponentSummary = ({ components }) => {
  return components.map(({ type, key, label, components, value }) => {
    if (type === "panel") {
      return <PanelSummary key={key} label={label} components={components} />;
    } else if (type === "fieldset" || type === "navSkjemagruppe") {
      return <FormSummaryFieldset key={key} label={label} components={components} />;
    } else if (type === "datagrid") {
      return <DataGridSummary key={key} label={label} components={components} />;
    } else {
      return <FormSummaryField key={key} label={label} value={value} />;
    }
  });
};

const FormSummary = ({ form, submission }) => {
  const formSummaryObject = createFormSummaryObject(form, submission);
  if (formSummaryObject.length === 0) {
    return null;
  }
  return <ComponentSummary components={formSummaryObject} />;
};

export function SummaryPage({ form, submission, formUrl }) {
  let { url } = useRouteMatch();
  const { featureToggles } = useContext(AppConfigContext);
  const { loggSkjemaStegFullfort } = useAmplitude();

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  useEffect(() => loggSkjemaStegFullfort(getPanels(form.components).length), [form.components, loggSkjemaStegFullfort]);

  return (
    <SummaryContent>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <Innholdstittel tag="h2" className="margin-bottom-default">
          Oppsummering av søknaden din
        </Innholdstittel>
        <Normaltekst className="margin-bottom-default">
          Vennligst sjekk at alle svarene dine er riktige. Hvis du finner noe som må korrigeres trykker du på
          "Rediger"-knappen nedenfor. Hvis alle svarene er riktige går du videre til steg 2.
        </Normaltekst>
        <FormSummary submission={!!submission ? submission.data : {}} form={form} />
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link className="btn btn-secondary btn-wizard-nav-previous" to={formUrl}>
              Rediger svar
            </Link>
          </div>
          <div className="list-inline-item">
            <Link
              className="btn btn-secondary btn-wizard-nav-previous"
              onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
              to={{ pathname: `${formUrl}/send-i-posten`, state: { previousPage: url } }}
            >
              Send i posten
            </Link>
          </div>
          <div className="list-inline-item">
            <Link
              className="btn btn-primary btn-wizard-nav-next wizard-button"
              onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
              to={{ pathname: `${formUrl}/forbered-innsending`, state: { previousPage: url } }}
            >
              Send inn digitalt
            </Link>
          </div>
        </nav>
      </main>
    </SummaryContent>
  );
}

const SummaryContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",

  "& .data-grid__row": {
    border: `1px solid ${navCssVariabler.navGra60}`,
    borderRadius: "7px",
    marginBottom: "1rem",
    padding: "1.5rem 2rem 0",
  },
});
