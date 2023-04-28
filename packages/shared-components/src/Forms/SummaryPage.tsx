import { makeStyles, styled } from "@material-ui/styles";
import { Accordion, Alert, BodyShort, Heading, Link as NavLink } from "@navikt/ds-react";
import {
  InnsendingType,
  NavFormType,
  Summary,
  TEXTS,
  formSummaryUtil,
} from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { Styles } from "../index";
import { scrollToAndSetFocus } from "../util/focus-management";
import { getPanels } from "../util/form";
import DigitalSubmissionButton from "./components/DigitalSubmissionButton";
import DigitalSubmissionWithPrompt from "./components/DigitalSubmissionWithPrompt";
import FormStepper from "./components/FormStepper";
import { hasRelevantAttachments } from "./components/attachmentsUtil";

const useStyles = makeStyles(() => ({
  "@global": {
    ...Styles.form,
    ...Styles.global,
  },
}));

const SummaryField = ({ component }: { component: Summary.Field }) => (
  <>
    <dt>{component.label}</dt>
    <dd>{component.value}</dd>
  </>
);

const SelectboxesSummary = ({ component }: { component: Summary.Selectboxes }) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      <ul>
        {component.value.map((value) => (
          <li key={`${component.label}_${value}`}>{value}</li>
        ))}
      </ul>
    </dd>
  </>
);

const FormSummaryFieldset = ({ component }: { component: Summary.Fieldset }) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      <dl className="component-collection">
        <ComponentSummary components={component.components} />
      </dl>
    </dd>
  </>
);

const DataGridSummary = ({ component }: { component: Summary.DataGrid }) => (
  <>
    <dt>{component.label}</dt>
    <dd>{component.components && component.components.map((row) => <DataGridRow key={row.key} row={row} />)}</dd>
  </>
);

const DataGridRow = ({ row }: { row: Summary.DataGridRow }) => (
  <div className="data-grid__row">
    {row.label && <p className="navds-body-short font-bold">{row.label}</p>}
    <dl>
      <ComponentSummary components={row.components} />
    </dl>
  </div>
);

const useImgSummaryStyles = (widthPercent) =>
  makeStyles({
    description: { minWidth: 100, maxWidth: widthPercent + "%" },
  })();

const ImageSummary = ({ component }: { component: Summary.Image }) => {
  const { label, value, alt, widthPercent } = component;
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

const PanelSummary = ({ component, formUrl }: { component: Summary.Panel; formUrl: string }) => {
  const { translate } = useLanguages();
  const { search } = useLocation();
  const { link } = panelStyles();
  const { key, label, components } = component;
  return (
    <section>
      <Accordion>
        <Accordion.Item defaultOpen={true}>
          <Accordion.Header>
            {" "}
            <Heading level="3" size="medium">
              {label}
            </Heading>
          </Accordion.Header>
          <Accordion.Content>
            <Link to={{ pathname: `${formUrl}/${key}`, search }} className={link}>
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

const ComponentSummary = ({ components, formUrl = "" }: { components: Summary.Component[]; formUrl?: string }) => {
  return (
    <>
      {components.map((comp) => {
        const { type, key } = comp;
        switch (type) {
          case "panel":
            return <PanelSummary key={key} component={comp} formUrl={formUrl} />;
          case "fieldset":
          case "navSkjemagruppe":
            return <FormSummaryFieldset key={key} component={comp} />;
          case "datagrid":
            return <DataGridSummary key={key} component={comp} />;
          case "selectboxes":
            return <SelectboxesSummary key={key} component={comp} />;
          case "image":
            return <ImageSummary key={key} component={comp} />;
          default:
            return <SummaryField key={key} component={comp as Summary.Field} />;
        }
      })}
    </>
  );
};

const FormSummary = ({ form, formUrl, submission }: { form: NavFormType; formUrl: string; submission: object }) => {
  const { logger } = useAppConfig();
  const { translate } = useLanguages();
  // @ts-ignore <- remove when createFormSummaryObject is converted to typescript
  const summaryComponents: Summary.Component[] = formSummaryUtil.createFormSummaryObject(form, submission, translate);
  const summaryPanels = summaryComponents.filter((component) => component.type === "panel");
  if (summaryPanels.length < summaryComponents.length) {
    logger?.info(
      `OBS! Skjemaet ${form.title} (${form.properties.skjemanummer}) har komponenter som ikke ligger inne i et panel`
    );
  }

  if (summaryPanels.length === 0) {
    return null;
  }
  return <ComponentSummary components={summaryPanels} formUrl={formUrl} />;
};

export interface Props {
  form: NavFormType;
  submission: object;
  translations: object;
  formUrl: string;
}

function getUrlToLastPanel(form, formUrl, submission) {
  const formSummary = formSummaryUtil.createFormSummaryPanels(form, submission);
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
  const { loggSkjemaStegFullfort, loggSkjemaFullfort, loggSkjemaInnsendingFeilet } = useAmplitude();
  const { translate } = useLanguages();
  const { search } = useLocation();
  useStyles();

  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => scrollToAndSetFocus("main", "start"), []);

  const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const linkBtStyle = {
    textDecoration: "none",
  };
  const hasAttachments = hasRelevantAttachments(form, submission);

  return (
    <SummaryContent>
      <main id="maincontent" className="fyllut-layout formio-form" tabIndex={-1}>
        <div className="main-col">
          <Heading level="2" size="large" spacing>
            {translate(TEXTS.statiske.summaryPage.title)}
          </Heading>
          <BodyShort className="mb-4">{translate(TEXTS.statiske.summaryPage.description)}</BodyShort>
          <div className="form-summary">
            <FormSummary submission={submission} form={form} formUrl={formUrl} />
          </div>
          <nav>
            <div className="button-row button-row__center">
              {(submissionMethod === "paper" ||
                innsending === "KUN_PAPIR" ||
                (app === "bygger" && innsending === "PAPIR_OG_DIGITAL")) && (
                <Link
                  className="navds-button navds-button--primary"
                  onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                  to={{ pathname: `${formUrl}/send-i-posten`, search, state: { previousPage: url } }}
                >
                  <span aria-live="polite" className="navds-body-short font-bold">
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
                    onSuccess={() => loggSkjemaFullfort("digital")}
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
                    onSuccess={() => loggSkjemaFullfort("digital")}
                  />
                ))}

              {innsending === "INGEN" && (
                <Link
                  className="navds-button navds-button--primary"
                  onClick={() => loggSkjemaStegFullfort(getPanels(form.components).length + 1)}
                  to={{ pathname: `${formUrl}/ingen-innsending`, search, state: { previousPage: url } }}
                >
                  <span aria-live="polite" className="navds-body-short font-bold">
                    {translate(TEXTS.grensesnitt.moveForward)}
                  </span>
                </Link>
              )}
              <Link
                className="navds-button navds-button--secondary"
                to={{ pathname: getUrlToLastPanel(form, formUrl, submission), search }}
              >
                <span aria-live="polite" className="navds-body-short font-bold">
                  {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
                </span>
              </Link>
            </div>
            <div className="button-row button-row__center">
              <NavLink className={"navds-button navds-button--tertiary"} href="https://www.nav.no" style={linkBtStyle}>
                <span aria-live="polite" className="navds-body-short font-bold">
                  {translate(TEXTS.grensesnitt.navigation.cancel)}
                </span>
              </NavLink>
            </div>
          </nav>
          {errorMessage && (
            <Alert variant="error" data-testid="error-message">
              {errorMessage}
            </Alert>
          )}
        </div>
        <aside className="right-col">
          <FormStepper form={form} formUrl={formUrl} submissionMethod={submissionMethod} submission={submission} />
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
