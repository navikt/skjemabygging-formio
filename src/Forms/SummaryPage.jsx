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

function filterNonFormContent(components = [], submission = []) {
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

const DataGridRow = ({ key, label, components }) => (
  <div className="data-grid__row skjemagruppe" key={key}>
    <p className="skjemagruppe__legend">{label}</p>
    <dl>
      <ComponentSummary components={components} submission={{}} />
    </dl>
  </div>
);

const PanelSummary = ({ key, label, components }) => (
  <section key={key} className="margin-bottom-default wizard-page">
    <Systemtittel tag="h3" className="margin-bottom-default">
      {label}
    </Systemtittel>
    <dl>
      <ComponentSummary components={components} submission={{}} />
    </dl>
  </section>
);

const ComponentSummary = ({ components, submission }) => {
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

export function handleComponent(component, submission = {}, formSummaryObject) {
  switch (component.type) {
    case "panel": {
      const { label, key, type, components } = component;
      const subComponents = filterNonFormContent(components, submission).reduce(
        (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents),
        []
      );
      if (subComponents.length === 0) {
        console.log(JSON.stringify(subComponents, null, 2));
        return [...formSummaryObject];
      }
      return [
        ...formSummaryObject,
        {
          label,
          key,
          type,
          components: subComponents,
        },
      ];
    }
    case "content":
    case "htmlelement":
      return formSummaryObject;
    case "container": {
      const { components, key } = component;
      if (!components || components.length === 0) {
        return formSummaryObject;
      } else {
        const mappedSubComponents = components.reduce(
          (subComponents, subComponent) => handleComponent(subComponent, submission[key], subComponents),
          []
        );
        return [...formSummaryObject, ...mappedSubComponents];
      }
    }
    case "datagrid":
      const { label, key, components, type, rowTitle } = component;
      if (!submission[key]) {
        return [...formSummaryObject];
      }

      const dataGridRows = submission[key].reduce((handledRows, rowSubmission, index) => {
        const dataGridRowComponents = components.reduce(
          (handledComponents, subComponent) => handleComponent(subComponent, rowSubmission, handledComponents),
          []
        );

        if (dataGridRowComponents.length === 0) {
          return handledRows;
        }
        return [
          ...handledRows,
          {
            type: "datagrid-row",
            label: rowTitle,
            key: `${key}-row-${index}`,
            components: dataGridRowComponents,
          },
        ];
      }, []);

      if (dataGridRows.length === 0) {
        return formSummaryObject;
      }

      return [
        ...formSummaryObject,
        {
          label,
          key,
          type,
          components: dataGridRows,
        },
      ];
    case "fieldset":
    case "navSkjemagruppe": {
      const { legend, key, components, type } = component;
      if (!components || components.length === 0) {
        return formSummaryObject;
      }
      const mappedSubComponents = components.reduce(
        (subComponents, subComponent) => handleComponent(subComponent, submission, subComponents),
        []
      );
      if (mappedSubComponents.length === 0) {
        return formSummaryObject;
      }
      return [
        ...formSummaryObject,
        {
          label: legend,
          key,
          type,
          components: mappedSubComponents,
        },
      ];
    }
    default: {
      const { key, label, type } = component;
      if (!submission[key]) {
        return formSummaryObject;
      }
      return [
        ...formSummaryObject,
        {
          label,
          key,
          type,
          value: formatValue(component, submission[component.key]),
        },
      ];
    }
  }
}

export function createFormSummaryObject(form, submission) {
  const formSummaryObject = form.components.reduce(
    (formSummaryObject, component) => handleComponent(component, submission, formSummaryObject),
    []
  );
  return formSummaryObject;
}

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
