import { makeStyles, styled } from "@material-ui/styles";
import { createFormSummaryObject, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import AlertStripe from "nav-frontend-alertstriper";
import { Innholdstittel, Normaltekst, Sidetittel, Systemtittel } from "nav-frontend-typografi";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../configContext";
import { useAmplitude } from "../context/amplitude";
import { useLanguages } from "../context/languages";
import { scrollToAndSetFocus } from "../util/focus-management";
import { getPanels } from "../util/form";
import { navCssVariables } from "../util/navCssVariables";
import DigitalSubmissionButton from "./components/DigitalSubmissionButton";

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

const useImgSummaryStyles = (widthPercent) =>
  makeStyles({
    description: { minWidth: 100, maxWidth: widthPercent + "%" },
  })();

const ImageSummary: FunctionComponent = ({ label, values, alt, widthPercent }) => {
  const { description } = useImgSummaryStyles(widthPercent);
  return (
    <>
      <dt>{label}</dt>
      <dd>
        <img className={description} src={values} alt={alt}></img>
      </dd>
    </>
  );
};

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
  return components.map(({ type, key, label, ...comp }) => {
    switch (type) {
      case "panel":
        return <PanelSummary key={key} label={label} components={comp.components} />;
      case "fieldset":
      case "navSkjemagruppe":
        return <FormSummaryFieldset key={key} label={label} components={comp.components} />;
      case "datagrid":
        return <DataGridSummary key={key} label={label} components={comp.components} />;
      case "selectboxes":
        return <SelectboxesSummary key={key} label={label} values={comp.value} />;
      case "image":
        return (
          <ImageSummary key={key} label={label} values={comp.value} alt={comp.alt} widthPercent={comp.widthPercent} />
        );
      default:
        return <FormSummaryField key={key} label={label} value={comp.value} />;
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
  form: object;
  submission: object;
  translations: object;
  formUrl: string;
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

  const innsending: InnsendingType =
    form.properties.innsending || (form.properties.hasPapirInnsendingOnly ? "KUN_PAPIR" : "PAPIR_OG_DIGITAL");

  return (
    <SummaryContent>
      <Sidetittel className="margin-bottom-large">{form.title}</Sidetittel>
      <main id="maincontent" tabIndex={-1}>
        <Innholdstittel tag="h2" className="margin-bottom-default">
          {translate(TEXTS.statiske.summaryPage.title)}
        </Innholdstittel>
        <Normaltekst className="margin-bottom-default">
          {translate(TEXTS.statiske.summaryPage.description, {
            editAnswers: TEXTS.grensesnitt.summaryPage.editAnswers,
          })}
        </Normaltekst>
        <FormSummary submission={submission} form={form} />
        {/* <AlertStripe type="advarsel">{translate(TEXTS.statiske.warningAboutDifficultSubmission.alert)}</AlertStripe> */}
        <nav className="list-inline">
          <div className="list-inline-item">
            <Link className="btn btn-secondary btn-wizard-nav-previous" to={{ pathname: formUrl, search }}>
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
