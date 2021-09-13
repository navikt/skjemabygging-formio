import React, { useEffect, FunctionComponent } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { styled } from "@material-ui/styles";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { useAmplitude } from "../context/amplitude";
import { getPanels } from "../util/form";
import navCssVariabler from "nav-frontend-core";
import { TEXTS, createFormSummaryObject } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";

// duplisert fra bygger
type InnsendingType = 'PAPIR_OG_DIGITAL' | 'KUN_PAPIR' | 'KUN_DIGITAL' | 'INGEN';

const FormSummaryField: FunctionComponent = ({ label, value }) => (
  <>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </>
);

const SelectboxesSummary: FunctionComponent = ({ label, values }) => (
  <>
    <dt>{label}</dt>
    <dd>
      <ul>
        {values.map((value) => (
          <li key={`${label}_${value}`}>{value}</li>
        ))}
      </ul>
    </dd>
  </>
);

const FormSummaryFieldset: FunctionComponent = ({ label, components }) => (
  <div>
    <dt>{label}</dt>
    <dd>
      <dl className="margin-left-default">
        <ComponentSummary components={components} />
      </dl>
    </dd>
  </div>
);

const DataGridSummary: FunctionComponent = ({ label, components }) => (
  <>
    <dt>{label}</dt>
    <dd>
      {components.map((component) => (
        <DataGridRow key={component.key} label={component.label} components={component.components} />
      ))}
    </dd>
  </>
);

const DataGridRow: FunctionComponent = ({ label, components }) => (
  <div className="data-grid__row skjemagruppe">
    {label && <p className="skjemagruppe__legend">{label}</p>}
    <dl>
      <ComponentSummary components={components} />
    </dl>
  </div>
);

const PanelSummary: FunctionComponent = ({ label, components }) => (
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
    } else if (type === "selectboxes") {
      return <SelectboxesSummary key={key} label={label} values={value} />;
    } else {
      return <FormSummaryField key={key} label={label} value={value} />;
    }
  });
};

const FormSummary = ({ form, submission }) => {
  const { translate } = useLanguages();
  const formSummaryObject = createFormSummaryObject(form, submission, translate);
  if (formSummaryObject.length === 0) {
    return null;
  }
  return <ComponentSummary components={formSummaryObject} />;
};

export interface Props {
  form: any;
  submission: any;
  formUrl: string;
}

export function SummaryPage({ form, submission, formUrl }: Props) {
  let { url } = useRouteMatch();
  const { loggSkjemaStegFullfort } = useAmplitude();
  const { translate } = useLanguages();

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  useEffect(() => loggSkjemaStegFullfort(getPanels(form.components).length), [form.components, loggSkjemaStegFullfort]);

  const innsending: InnsendingType = form.properties.innsending
    || (form.properties.hasPapirInnsendingOnly ? 'KUN_PAPIR' : 'PAPIR_OG_DIGITAL');

  return (
    <SummaryContent>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <Innholdstittel tag="h2" className="margin-bottom-default">
          {translate(TEXTS.statiske.summaryPage.title)}
        </Innholdstittel>
        <Normaltekst className="margin-bottom-default">{translate(TEXTS.statiske.summaryPage.description)}</Normaltekst>
        <FormSummary submission={submission} form={form} />
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link className="btn btn-secondary btn-wizard-nav-previous" to={formUrl}>
              {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
            </Link>
          </div>
          {(innsending == 'KUN_PAPIR' || innsending == 'PAPIR_OG_DIGITAL') && (
            <div className="list-inline-item">
              <Link
                className={`btn ${
                  innsending == 'KUN_PAPIR'
                    ? "btn-primary btn-wizard-nav-next"
                    : "btn-secondary btn-wizard-nav-previous"
                }`}
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/send-i-posten`, state: { previousPage: url } }}
              >
                {innsending == 'KUN_PAPIR'
                  ? translate(TEXTS.grensesnitt.summaryPage.continue)
                  : translate(TEXTS.grensesnitt.summaryPage.continueToPostalSubmission)}
              </Link>
            </div>
          )}
          {(innsending == 'KUN_DIGITAL' || innsending == 'PAPIR_OG_DIGITAL') && (
            <div className="list-inline-item">
              <Link
                className="btn btn-primary btn-wizard-nav-next wizard-button"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/forbered-innsending`, state: { previousPage: url } }}
              >
                {innsending == 'KUN_DIGITAL'
                  ? translate(TEXTS.grensesnitt.summaryPage.continue)
                  : translate(TEXTS.grensesnitt.summaryPage.continueToDigitalSubmission)}
              </Link>
            </div>
          )}
          {innsending == 'INGEN' &&
          <div className="list-inline-item">
            <Link
              className="btn btn-primary btn-wizard-nav-next"
              onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
              to={{ pathname: `${formUrl}/ingen-innsending`, state: { previousPage: url } }}
            >
              {translate(TEXTS.grensesnitt.summaryPage.continue)}
            </Link>
          </div>
          }
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
