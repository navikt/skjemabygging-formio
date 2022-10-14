import { makeStyles, styled } from "@material-ui/styles";
import { Accordion, Stepper } from "@navikt/ds-react";
import {
  Component,
  createFormSummaryObject,
  InnsendingType,
  NavFormType,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import AlertStripe from "nav-frontend-alertstriper";
import { Innholdstittel, Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { FunctionComponent, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import { getPanels } from "../util/form";
import { navCssVariables } from "../util/navCssVariables";
import DigitalSubmissionButton from "./components/DigitalSubmissionButton";

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
  <>
    <dt>{label}</dt>
    <dd>
      <dl className="component-collection">
        <ComponentSummary components={components} />
      </dl>
    </dd>
  </>
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
  link: {
    display: "block",
    marginBottom: "2rem",
  },
  fomSum: {
    marginTop: "2rem",
  },
});

const PanelSummary: FunctionComponent<PanelComponents> = ({ label, components, formUrl, path }) => {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { link } = panelStyles();
  const [defaultOpen] = useState(true);
  return (
    <section className="wizard-page">
      <Accordion>
        <Accordion.Item defaultOpen={defaultOpen}>
          <Accordion.Header>
            {" "}
            <Systemtittel tag="h3">{label}</Systemtittel>
          </Accordion.Header>
          <Accordion.Content>
            <Link to={{ pathname: `${formUrl}/${path}`, search }} className={link}>
              <span>
                {translate(TEXTS.grensesnitt.summaryPage.edit)} {label.toLowerCase()}
              </span>
            </Link>
            <dl>
              <ComponentSummary components={components} formUrl={formUrl} />
            </dl>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion>
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

  const innsending: InnsendingType | undefined = form.properties.innsending || "PAPIR_OG_DIGITAL";

  // @ts-ignore <- remove when createFormSummaryObject is converted to typescript
  const formSteps = useMemo(
    () =>
      createFormSummaryObject(form, submission, translate)
        .filter((component) => component.type === "panel")
        .map((panel) => ({ label: panel.label, url: `${formUrl}/${panel.key}` })),
    [form, submission, translate]
  );

  return (
    <SummaryContent>
      <main id="maincontent" className="fyllut-layout" tabIndex={-1}>
        <div className="main-col">
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
          <nav className="form-nav">
            <Link
              className="navds-button navds-button--secondary"
              to={{ pathname: getUrlToLastPanel(form, formUrl, submission), search }}
            >
              {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
            </Link>
            {submissionMethod !== "digital" && (innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") && (
              <Link
                className={`navds-button navds-button--secondary ${
                  innsending === "KUN_PAPIR"
                    ? "navds-button navds-button--primary"
                    : "navds-button navds-button--secondary"
                }`}
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/send-i-posten`, search, state: { previousPage: url } }}
              >
                {innsending === "KUN_PAPIR" || submissionMethod === "paper"
                  ? translate(TEXTS.grensesnitt.moveForward)
                  : translate(TEXTS.grensesnitt.summaryPage.continueToPostalSubmission)}
              </Link>
            )}
            {submissionMethod !== "paper" && (innsending === "KUN_DIGITAL" || innsending === "PAPIR_OG_DIGITAL") && (
              <>
                {submissionMethod === "digital" ? (
                  <DigitalSubmissionButton
                    form={form}
                    submission={submission}
                    translations={translations}
                    onError={(err) => setErrorMessage(err.message)}
                  />
                ) : (
                  <Link
                    className="navds-button navds-button--primary"
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
              </>
            )}
            {innsending === "INGEN" && (
              <Link
                className="navds-button navds-button--primary"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/ingen-innsending`, search, state: { previousPage: url } }}
              >
                {translate(TEXTS.grensesnitt.moveForward)}
              </Link>
            )}
          </nav>
          {errorMessage && <AlertStripe type="feil">{errorMessage}</AlertStripe>}
        </div>
        <aside className="right-col">
          <Stepper activeStep={1}>
            {formSteps.map((step) => (
              <Stepper.Step to={step.url} as={Link}>
                {step.label}
              </Stepper.Step>
            ))}
          </Stepper>
        </aside>
      </main>
      {}
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
  "& dt:not(.component-collection > dt)": {
    fontSize: "1.2rem",
    marginTop: "2rem",
  },
  "& .component-collection": {
    borderLeft: "4px solid #33AA5F",
    backgroundColor: "#F3FCF5",
    padding: "0.5rem 1rem",
    margin: "0.2srem 0",
  },
  "& section.wizard-page": {
    padding: "0",
    "&:first-of-type": {
      paddingTop: "2rem",
    },
    "&:last-of-type": {
      paddingBottom: "2.75rem",
    },
  },
  "& .fyllut-layout": {
    "@media screen and (min-width: 40rem)": {
      display: "grid",
      gap: "3rem",
      gridTemplateColumns: "minmax(20rem, 2fr) minmax(15rem, 1fr)",
      margin: "0 auto",
    },
  },
});
