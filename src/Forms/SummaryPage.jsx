import React, { useContext, useEffect } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { AppConfigContext } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { getPanels } from "../util/form";
import navCssVariabler from "nav-frontend-core";

function formatValue(component, value) {
  switch (component.type) {
    case "radiopanel":
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
    case "navCheckbox": {
      return value === "ja" ? "Ja" : "Nei";
    }
    default:
      return value;
  }
}

function filterNonFormContent(components, submission = []) {
  return components.filter((component) => {
    switch (component.type) {
      case "content":
      case "htmlelement":
        return false;
      case "container":
        return filterNonFormContent(component.components, submission[component.key]).length > 0;
      case "fieldset":
      case "navSkjemagruppe":
        return filterNonFormContent(component.components, submission).length > 0;
      default:
        return submission[component.key] !== "" && submission[component.key] !== undefined;
    }
  });
}

const FormSummaryField = ({ component, value }) => (
  <>
    <dt>{component.label}</dt>
    <dd>{formatValue(component, value)}</dd>
  </>
);

const FormSummaryFieldset = ({ component, submission }) => (
  <div>
    <dt>{component.legend}</dt>
    <dd>
      <dl className="margin-left-default">
        <ComponentSummary components={component.components} submission={submission} />
      </dl>
    </dd>
  </div>
);

const DataGridSummary = ({ component, submission }) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      {submission[component.key].map((dataGridRowSubmission, rowIndex) => (
        <div className="data-grid__row skjemagruppe" key={`${component.key}-${rowIndex}`}>
          <p className="skjemagruppe__legend">{component.rowTitle}</p>
          <dl>
            <ComponentSummary components={component.components} submission={dataGridRowSubmission} />
          </dl>
        </div>
      ))}
    </dd>
  </>
);

const ComponentSummary = ({ components, submission }) => {
  return filterNonFormContent(components, submission).map((component) => {
    if (component.type === "container") {
      return <ComponentSummary components={component.components} submission={submission[component.key]} />;
    } else if (component.type === "fieldset" || component.type === "navSkjemagruppe") {
      return <FormSummaryFieldset key={component.key} component={component} submission={submission} />;
    } else if (component.type === "datagrid") {
      return <DataGridSummary key={`${component.key}`} component={component} submission={submission} />;
    } else {
      return <FormSummaryField key={component.key} component={component} value={submission[component.key]} />;
    }
  });
};

const FormSummary = ({ form, submission }) => {
  return form.components.map((panel) => {
    if (!panel.components || filterNonFormContent(panel.components, submission).length === 0) {
      return null;
    }
    return (
      <section key={panel.title} className="margin-bottom-default wizard-page">
        <Systemtittel tag="h3" className="margin-bottom-default">
          {panel.title}
        </Systemtittel>
        <dl>
          <ComponentSummary components={panel.components} submission={submission} />
        </dl>
      </section>
    );
  });
};

export function SummaryPage({ form, submission, formUrl }) {
  const resultForm = form.display === "wizard" ? { ...form, display: "form" } : form;
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
        <FormSummary submission={!!submission ? submission.data : {}} form={resultForm} />
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link className="btn btn-secondary btn-wizard-nav-previous" to={formUrl}>
              Rediger svar
            </Link>
          </div>
          {featureToggles.sendPaaPapir && (
            <div className="list-inline-item">
              <Link
                className="btn btn-secondary btn-wizard-nav-previous"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/send-i-posten`, state: { previousPage: url } }}
              >
                Send i posten
              </Link>
            </div>
          )}
          <div className="list-inline-item">
            <Link
              className="btn btn-primary btn-wizard-nav-next wizard-button"
              onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
              to={{ pathname: `${formUrl}/forbered-innsending`, state: { previousPage: url } }}
            >
              {featureToggles.sendPaaPapir ? "Send inn digitalt" : "Gå videre"}
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
