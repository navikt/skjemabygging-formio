import React, { useEffect, FunctionComponent } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import {makeStyles, styled} from "@material-ui/styles";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import { scrollToAndSetFocus } from "../util/focus-management";
import { useAmplitude } from "../context/amplitude";
import { getPanels } from "../util/form";
import navCssVariabler from "nav-frontend-core";
import { TEXTS, createFormSummaryObject } from "@navikt/skjemadigitalisering-shared-domain";
import { useLanguages } from "../context/languages";

// duplisert fra bygger
type InnsendingType = "PAPIR_OG_DIGITAL" | "KUN_PAPIR" | "KUN_DIGITAL" | "INGEN";

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

const panelStyles = makeStyles({
  panelHeading: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(21rem, 1fr))",
    justifyContent: "space-between",

    "& .knapp": {
      justifySelf: "flex-start",
      marginLeft: "-0.75rem",
      marginBottom: "1rem",

      "@media screen and (min-width: 48rem)": {
        justifySelf: "flex-end",
        marginLeft: "0",
        marginBottom: "0",
      }
    },
  },
})

const PanelSummary: FunctionComponent = ({ label, formUrl, path, components }) => {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const classes = panelStyles();
  return (
    <section className="margin-bottom-default wizard-page">
      <div className={classes.panelHeading}>
        <Systemtittel tag="h3" className="margin-bottom-default">
          {label}
        </Systemtittel>
        <Link className="knapp knapp--flat knapp--kompakt" to={{ pathname: `${formUrl}/${path}`, search }}>
          <span>{translate(TEXTS.grensesnitt.summaryPage.edit)} {label.toLowerCase()}</span>
          <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" role="presentation">
            <path fillRule="evenodd" clipRule="evenodd" d="M22.835 1.165a3.976 3.976 0 010 5.623L8.073 21.549.682 24 0 23.318l2.45-7.392L17.21 1.165a3.977 3.977 0 015.624 0zm-4.218 7.029l-2.811-2.812L4.188 17l-1.393 4.205 4.207-1.395L18.618 8.194zM21.43 2.57a1.989 1.989 0 00-2.703-.1l-.108.1-1.406 1.406 2.811 2.812 1.406-1.406a1.988 1.988 0 00.101-2.703l-.1-.109z" fill="currentColor" />
          </svg>
        </Link>
      </div>
      <dl>
        <ComponentSummary components={components} />
      </dl>
    </section>
  )
};

const ComponentSummary = ({ components, formUrl }) => {
  return components.map(({ type, key, label, components, value }) => {
    if (type === "panel") {
      return <PanelSummary key={key} label={label} formUrl={formUrl} path={key} components={components} />;
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

const FormSummary = ({ form, formUrl, submission }) => {
  const { translate } = useLanguages();
  const formSummaryObject = createFormSummaryObject(form, submission, translate);
  if (formSummaryObject.length === 0) {
    return null;
  }
  return <ComponentSummary components={formSummaryObject} formUrl={formUrl} />;
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
  const { search } = useLocation();

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  useEffect(() => loggSkjemaStegFullfort(getPanels(form.components).length), [form.components, loggSkjemaStegFullfort]);

  const innsending: InnsendingType =
    form.properties.innsending || (form.properties.hasPapirInnsendingOnly ? "KUN_PAPIR" : "PAPIR_OG_DIGITAL");

  return (
    <SummaryContent>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <Innholdstittel tag="h2" className="margin-bottom-default">
          {translate(TEXTS.statiske.summaryPage.title)}
        </Innholdstittel>
        <Normaltekst className="margin-bottom-default">{translate(TEXTS.statiske.summaryPage.description)}</Normaltekst>
        <FormSummary submission={submission} form={form} formUrl={formUrl} />
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link className="btn btn-secondary btn-wizard-nav-previous" to={{ pathname: formUrl, search }}>
              {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
            </Link>
          </div>
          {(innsending == "KUN_PAPIR" || innsending == "PAPIR_OG_DIGITAL") && (
            <div className="list-inline-item">
              <Link
                className={`btn ${
                  innsending == "KUN_PAPIR"
                    ? "btn-primary btn-wizard-nav-next"
                    : "btn-secondary btn-wizard-nav-previous"
                }`}
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/send-i-posten`, search, state: { previousPage: url } }}
              >
                {innsending == "KUN_PAPIR"
                  ? translate(TEXTS.grensesnitt.moveForward)
                  : translate(TEXTS.grensesnitt.summaryPage.continueToPostalSubmission)}
              </Link>
            </div>
          )}
          {(innsending == "KUN_DIGITAL" || innsending == "PAPIR_OG_DIGITAL") && (
            <div className="list-inline-item">
              <Link
                className="btn btn-primary btn-wizard-nav-next wizard-button"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/forbered-innsending`, search, state: { previousPage: url } }}
              >
                {innsending == "KUN_DIGITAL"
                  ? translate(TEXTS.grensesnitt.moveForward)
                  : translate(TEXTS.grensesnitt.summaryPage.continueToDigitalSubmission)}
              </Link>
            </div>
          )}
          {innsending == "INGEN" && (
            <div className="list-inline-item">
              <Link
                className="btn btn-primary btn-wizard-nav-next"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                 to={{ pathname: `${formUrl}/ingen-innsending`, search, state: { previousPage: url } }}
              >
                {translate(TEXTS.grensesnitt.moveForward)}
              </Link>
            </div>
          )}
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
