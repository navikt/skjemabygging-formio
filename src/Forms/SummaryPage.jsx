import React, { useContext, useEffect } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { AppConfigContext } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { getPanels } from "../util/form";

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

const shouldShowConditionalField = (component, submission) =>
  component.conditional && submission[component.conditional.when] === component.conditional.eq
    ? component.conditional.show
    : !component.conditional.show;

const filterNonFormContent = (components, submission = []) =>
  components
    .filter((component) => component.type !== "content")
    .filter((component) => component.type !== "htmlelement")
    .filter(
      (component) =>
        component.type !== "container" ||
        filterNonFormContent(component.components, submission[component.key]).length > 0
    )
    .filter(
      (component) =>
        (component.type !== "fieldset" && component.type !== "navSkjemagruppe") ||
        filterNonFormContent(component.components, submission).length > 0
    )
    .filter((component) =>
      component.conditional && component.conditional.when ? shouldShowConditionalField(component, submission) : true
    )
    .filter((component) => submission[component.key] !== "")
    .filter((component) => component.type !== "navDatepicker" || submission[component.key] !== undefined);

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
      <dl className="margin-left-default">
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
      <section key={panel.title} className="margin-bottom-default wizard-page">
        <Systemtittel tag="h3" className="margin-bottom-default">
          {panel.title}
        </Systemtittel>
        <dl>
          {filterNonFormContent(panel.components, submission).map((component) => {
            if (component.type === "container") {
              return filterNonFormContent(component.components, submission[component.key]).map((subComponent) => (
                <FormSummaryField
                  key={subComponent.key}
                  component={subComponent}
                  value={(submission[component.key] || {})[subComponent.key]}
                />
              ));
            } else if (
              component.type === "fieldset" ||
              component.type === "navSkjemagruppe" ||
              component.type === "datagrid"
            ) {
              return <FormSummaryFieldset key={component.key} component={component} submission={submission} />;
            }
            return <FormSummaryField key={component.key} component={component} value={submission[component.key]} />;
          })}
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
    <SummaryContent tabIndex={-1}>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
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
    </SummaryContent>
  );
}

const SummaryContent = styled("main")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
});
