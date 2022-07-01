import { makeStyles, styled } from "@material-ui/styles";
import {
  Component,
  createFormSummaryObject,
  InnsendingType,
  NavFormType,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import AlertStripe from "nav-frontend-alertstriper";
import { Innholdstittel, Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import { getPanels } from "../util/form";
import { navCssVariables } from "../util/navCssVariables";
import DigitalSubmissionButton from "./components/DigitalSubmissionButton";
import { FormTitle } from "./components/FormTitle";

type LabelValue = {
  label: string;
  value: string;
};
type LabelValues = {
  label: string;
  values: string[];
};
type LabelComponents = {
  label: string;
  components?: Component[];
};

type PanelComponents = {
  label: string;
  components?: Component[];
  formUrl: string;
  path: string;
};

type ImageComp = LabelValue & {
  alt: string;
  widthPercent: string;
};

const FormSummaryField: FunctionComponent<LabelValue> = ({ label, value }) => (
  <>
    <dt>{label}</dt>
    <dd>{value}</dd>
  </>
);

const SelectboxesSummary: FunctionComponent<LabelValues> = ({ label, values }) => (
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

const FormSummaryFieldset: FunctionComponent<LabelComponents> = ({ label, components }) => (
  <div>
    <dt>{label}</dt>
    <dd>
      <dl className="margin-left-default">
        <ComponentSummary components={components} />
      </dl>
    </dd>
  </div>
);

const DataGridSummary: FunctionComponent<LabelComponents> = ({ label, components }) => (
  <>
    <dt>{label}</dt>
    <dd>
      {components &&
        components.map((component) => (
          <DataGridRow key={component.key} label={component.label} components={component.components} />
        ))}
    </dd>
  </>
);

const DataGridRow: FunctionComponent<LabelComponents> = ({ label, components }) => (
  <div className="data-grid__row skjemagruppe">
    {label && <p className="skjemagruppe__legend">{label}</p>}
    <dl>
      <ComponentSummary components={components} />
    </dl>
  </div>
);

const useImgSummaryStyles = (widthPercent) =>
  makeStyles({
    description: { minWidth: 100, maxWidth: widthPercent + "%" },
  })();

const ImageSummary: FunctionComponent<ImageComp> = ({ label, value, alt, widthPercent }) => {
  const { description } = useImgSummaryStyles(widthPercent);
  return (
    <>
      <dt>{label}</dt>
      <dd>
        <img className={description} src={value} alt={alt}></img>
      </dd>
    </>
  );
};

const panelStyles = makeStyles({
  header: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(21rem, 1fr))",
    justifyContent: "space-between",

    "& > .knapp": {
      justifySelf: "flex-start",
      marginLeft: "-0.75rem",
      marginBottom: "1rem",
      "& > span": {
        whiteSpace: "normal",
      },
      "@media screen and (min-width: 48em)": {
        justifySelf: "flex-end",
        marginLeft: 0,
        marginBottom: 0,
      },
    },
  },
});

const PanelSummary: FunctionComponent<PanelComponents> = ({ label, components, formUrl, path }) => {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { header } = panelStyles();
  return (
    <section className="margin-bottom-default wizard-page">
      <div className={header}>
        <Systemtittel tag="h3" className="margin-bottom-default">
          {label}
        </Systemtittel>
        <Link to={{ pathname: `${formUrl}/${path}`, search }} className="knapp knapp--flat knapp--kompakt">
          <span>
            {translate(TEXTS.grensesnitt.summaryPage.edit)} {label.toLowerCase()}
          </span>
        </Link>
      </div>
      <dl>
        <ComponentSummary components={components} formUrl={formUrl} />
      </dl>
    </section>
  );
};

const ComponentSummary = ({ components, formUrl = "" }) => {
  return components.map(({ type, key, label, ...comp }) => {
    switch (type) {
      case "panel":
        return <PanelSummary key={key} label={label} components={comp.components} formUrl={formUrl} path={key} />;
      case "fieldset":
      case "navSkjemagruppe":
        return <FormSummaryFieldset key={key} label={label} components={comp.components} />;
      case "datagrid":
        return <DataGridSummary key={key} label={label} components={comp.components} />;
      case "selectboxes":
        return <SelectboxesSummary key={key} label={label} values={comp.value} />;
      case "image":
        return (
          <ImageSummary key={key} label={label} value={comp.value} alt={comp.alt} widthPercent={comp.widthPercent} />
        );
      default:
        return <FormSummaryField key={key} label={label} value={comp.value} />;
    }
  });
};

const FormSummary = ({ form, formUrl, submission }) => {
  const { translate } = useLanguages();
  // @ts-ignore <- remove when createFormSummaryObject is converted to typescript
  const formSummaryObject = createFormSummaryObject(form, submission, translate);
  if (formSummaryObject.length === 0) {
    return null;
  }
  return <ComponentSummary components={formSummaryObject} formUrl={formUrl} />;
};

export interface Props {
  form: NavFormType;
  submission: object;
  translations: object;
  formUrl: string;
}

function getUrlToLastPanel(form, formUrl, submission) {
  const formSummary = createFormSummaryObject(form, submission);
  const lastPanel = formSummary[formSummary.length - 1];
  const lastPanelSlug = lastPanel?.key;
  if (!lastPanelSlug) {
    return formUrl;
  }
  return `${formUrl}/${lastPanelSlug}`;
}

export function SummaryPage({ form, submission, translations, formUrl }: Props) {
  const { submissionMethod } = useAppConfig();
  const { url } = useRouteMatch();
  const { loggSkjemaStegFullfort } = useAmplitude();
  const { translate } = useLanguages();
  const { search } = useLocation();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  useEffect(() => loggSkjemaStegFullfort(getPanels(form.components).length), [form.components, loggSkjemaStegFullfort]);

  //const innsending: InnsendingType = form.properties.innsending || undefined:
  //const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const innsending: InnsendingType | undefined = form.properties.innsending || "PAPIR_OG_DIGITAL";

  return (
    <SummaryContent>
      <FormTitle form={form} className="margin-bottom-double" />
      <main id="maincontent" tabIndex={-1}>
        <Innholdstittel tag="h2" className="margin-bottom-default">
          {translate(TEXTS.statiske.summaryPage.title)}
        </Innholdstittel>
        <Normaltekst className="margin-bottom-default">
          {translate(TEXTS.statiske.summaryPage.description, {
            editAnswers: TEXTS.grensesnitt.summaryPage.editAnswers,
          })}
        </Normaltekst>
        <FormSummary submission={submission} form={form} formUrl={formUrl} />
        {/* <AlertStripe type="advarsel">{translate(TEXTS.statiske.warningAboutDifficultSubmission.alert)}</AlertStripe> */}
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link
              className="btn btn-secondary btn-wizard-nav-previous"
              to={{ pathname: getUrlToLastPanel(form, formUrl, submission), search }}
            >
              {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
            </Link>
          </div>
          {submissionMethod !== "digital" && (innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") && (
            <div className="list-inline-item">
              <Link
                className={`btn ${
                  innsending === "KUN_PAPIR"
                    ? "btn-primary btn-wizard-nav-next"
                    : "btn-secondary btn-wizard-nav-previous"
                }`}
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/send-i-posten`, search, state: { previousPage: url } }}
              >
                {innsending === "KUN_PAPIR" || submissionMethod === "paper"
                  ? translate(TEXTS.grensesnitt.moveForward)
                  : translate(TEXTS.grensesnitt.summaryPage.continueToPostalSubmission)}
              </Link>
            </div>
          )}
          {submissionMethod !== "paper" && (innsending === "KUN_DIGITAL" || innsending === "PAPIR_OG_DIGITAL") && (
            <div className="list-inline-item">
              {submissionMethod === "digital" ? (
                <DigitalSubmissionButton
                  form={form}
                  submission={submission}
                  translations={translations}
                  onError={(err) => setErrorMessage(err.message)}
                />
              ) : (
                <Link
                  className="btn btn-primary btn-wizard-nav-next wizard-button"
                  onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                  to={{
                    pathname: `${formUrl}/${submissionMethod === "digital" ? "send-inn" : "forbered-innsending"}`,
                    search,
                    state: { previousPage: url },
                  }}
                >
                  {innsending === "KUN_DIGITAL"
                    ? translate(TEXTS.grensesnitt.moveForward)
                    : translate(TEXTS.grensesnitt.summaryPage.continueToDigitalSubmission)}
                </Link>
              )}
            </div>
          )}
          {innsending === "INGEN" && (
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
        {errorMessage && <AlertStripe type="feil">{errorMessage}</AlertStripe>}
      </main>
    </SummaryContent>
  );
}

const SummaryContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",

  "& .data-grid__row": {
    border: `1px solid ${navCssVariables.navGra60}`,
    borderRadius: "7px",
    marginBottom: "1rem",
    padding: "1.5rem 2rem 0",
  },
});
