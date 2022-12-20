import { makeStyles, styled } from "@material-ui/styles";
import { Accordion } from "@navikt/ds-react";
import {
  Component,
  formSummaryUtil,
  InnsendingType,
  NavFormType,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import AlertStripe from "nav-frontend-alertstriper";
import Lenke from "nav-frontend-lenker";
import { Innholdstittel, Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import { getPanels } from "../util/form";
import { hasRelevantAttachments } from "./components/attachmentsUtil";
import DigitalSubmissionButton from "./components/DigitalSubmissionButton";
import DigitalSubmissionWithPrompt from "./components/DigitalSubmissionWithPrompt";
import FormStepper from "./components/FormStepper";

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
});

const PanelSummary: FunctionComponent<PanelComponents> = ({ label, components, formUrl, path }) => {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { link } = panelStyles();
  return (
    <section>
      <Accordion>
        <Accordion.Item defaultOpen={true}>
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
  const formSummaryObject = formSummaryUtil.createFormSummaryObject(form, submission, translate);
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
  const formSummary = formSummaryUtil.createFormSummaryObject(form, submission);
  const lastPanel = formSummary[formSummary.length - 1];
  const lastPanelSlug = lastPanel?.key;
  if (!lastPanelSlug) {
    return formUrl;
  }
  return `${formUrl}/${lastPanelSlug}`;
}

export function SummaryPage({ form, submission, translations, formUrl }: Props) {
  const { submissionMethod, app } = useAppConfig();
  const { url } = useRouteMatch();
  const { loggSkjemaStegFullfort, loggSkjemaInnsendingFeilet } = useAmplitude();
  const { translate } = useLanguages();
  const { search } = useLocation();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => scrollToAndSetFocus("main", "start"), []);

  const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const linkBtStyle = {
    textDecoration: "none",
  };
  const hasAttachments = hasRelevantAttachments(form, submission);

  return (
    <SummaryContent>
      <main id="maincontent" className="fyllut-layout" tabIndex={-1}>
        <div className="main-col">
          <Innholdstittel tag="h2" className="margin-bottom-default">
            {translate(TEXTS.statiske.summaryPage.title)}
          </Innholdstittel>
          <Normaltekst className="margin-bottom-default">
            {translate(TEXTS.statiske.summaryPage.description)}
          </Normaltekst>
          <div className="form-summary">
            <FormSummary submission={submission} form={form} formUrl={formUrl} />
          </div>
          <nav className="form-nav">
            {(submissionMethod === "paper" ||
              innsending === "KUN_PAPIR" ||
              (app === "bygger" && innsending === "PAPIR_OG_DIGITAL")) && (
              <Link
                className="navds-button navds-button--primary"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/send-i-posten`, search, state: { previousPage: url } }}
              >
                <span aria-live="polite" className="navds-label">
                  {translate(TEXTS.grensesnitt.moveForward)}
                </span>
              </Link>
            )}
            {(submissionMethod === "digital" || innsending === "KUN_DIGITAL") &&
              (hasAttachments ? (
                <DigitalSubmissionButton
                  form={form}
                  submission={submission}
                  translations={translations}
                  onError={(err) => {
                    setErrorMessage(err.message);
                    loggSkjemaInnsendingFeilet();
                  }}
                >
                  {translate(TEXTS.grensesnitt.moveForward)}
                </DigitalSubmissionButton>
              ) : (
                <DigitalSubmissionWithPrompt
                  form={form}
                  submission={submission}
                  translations={translations}
                  onError={(err) => {
                    setErrorMessage(err.message);
                    loggSkjemaInnsendingFeilet();
                  }}
                />
              ))}

            {innsending === "INGEN" && (
              <Link
                className="navds-button navds-button--primary"
                onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                to={{ pathname: `${formUrl}/ingen-innsending`, search, state: { previousPage: url } }}
              >
                <span aria-live="polite" className="navds-label">
                  {translate(TEXTS.grensesnitt.moveForward)}
                </span>
              </Link>
            )}
            <Link
              className="navds-button navds-button--secondary"
              to={{ pathname: getUrlToLastPanel(form, formUrl, submission), search }}
            >
              <span aria-live="polite" className="navds-label">
                {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
              </span>
            </Link>
            <Lenke className={"navds-button navds-button--tertiary"} href="https://www.nav.no" style={linkBtStyle}>
              <span aria-live="polite" className="navds-label">
                {translate(TEXTS.grensesnitt.navigation.cancel)}
              </span>
            </Lenke>
          </nav>
          {errorMessage && (
            <AlertStripe data-testid="error-message" type="feil">
              {errorMessage}
            </AlertStripe>
          )}
        </div>
        <aside className="right-col">
          <FormStepper form={form} formUrl={formUrl} submission={submission} />
        </aside>
      </main>
    </SummaryContent>
  );
}

const SummaryContent = styled("div")({
  width: "100%",
  display: "flex",
  flexDirection: "column",
  "& .data-grid__row": {},
  "& dt:not(.component-collection  dt):not(.data-grid__row  dt)": {
    fontSize: "1.2rem",
    marginTop: "2rem",
  },
  "& .component-collection, & .data-grid__row": {
    borderLeft: "4px solid #368da8",
    backgroundColor: "#e6f1f8",
    padding: "0.75rem 1rem",
    margin: "0.375rem 0",
  },
  "& .form-summary": {
    paddingTop: "2rem",
    paddingBottom: "3.75rem",
  },
});
