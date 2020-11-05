import React from "react";
import { Link } from "react-router-dom";
import styled from "@material-ui/styles/styled";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";

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

const shouldShowConditionalField = (component, submission) =>
  submission[component.conditional.when] === component.conditional.eq
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
      (component) => component.type !== "fieldset" || filterNonFormContent(component.components, submission).length > 0
    )
    .filter((component) => (component.conditional.when ? shouldShowConditionalField(component, submission) : true))
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

export function SummaryPage({ form, submission }) {
  const resultForm = form.display === "wizard" ? { ...form, display: "form" } : form;

  return (
    <SummaryContent>
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
          <Link className="btn btn-secondary btn-wizard-nav-previous" to={`/${form.path}`}>
            Rediger svar
          </Link>
        </div>
        <div className="list-inline-item">
          <Link className="btn btn-primary btn-wizard-nav-next" to={`/${form.path}/forbered-innsending`}>
            Gå videre
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
