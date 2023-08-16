import { ExclamationmarkTriangleFillIcon } from "@navikt/aksel-icons";
import { Alert, BodyShort, ConfirmationPanel, Heading } from "@navikt/ds-react";
import {
  Component,
  DeclarationType,
  NavFormType,
  Submission,
  TEXTS,
  formSummaryUtil,
} from "@navikt/skjemadigitalisering-shared-domain";
import { Form as FormioForm } from "formiojs";
import { useEffect, useRef, useState } from "react";
import NavForm from "../../components/NavForm";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import Styles from "../../styles";
import { SANITIZE_CONFIG } from "../../template/sanitizeConfig";
import { scrollToAndSetFocus } from "../../util/focus-management";
import makeStyles from "../../util/jss";
import FormStepper from "../components/FormStepper";
import EditAnswersButton from "../components/navigation/EditAnswersButton";
import FormSummary from "./FormSummary";
import SummaryPageNavigation from "./SummaryPageNavigation";

const useStyles = makeStyles({
  "@global": {
    ...Styles.form,
    ...Styles.global,
  },
  content: {
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
      paddingBottom: "2.5rem",
    },
  },
  validationAlert: {
    marginBottom: "1rem",
  },
  exclamationmarkIcon: {
    verticalAlign: "sub",
    color: "var(--a-orange-600)",
  },
});

export type PanelValidation = {
  key: string;
  summaryComponents?: string[];
  hasValidationErrors: boolean;
  firstInputWithValidationError?: string;
};
export interface Props {
  form: NavFormType;
  submission?: Submission;
  formUrl: string;
}

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export function SummaryPage({ form, submission, formUrl }: Props) {
  const { submissionMethod, featureToggles } = useAppConfig();
  const { translate } = useLanguages();
  const styles = useStyles();
  const { declarationType, declarationText } = form.properties;
  const [declaration, setDeclaration] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const [panelValidationList, setPanelValidationList] = useState<PanelValidation[] | undefined>();

  useEffect(() => {
    const initializePanelValidation = async () => {
      const formio = new FormioForm(document.getElementById("formio-summary-hidden"), form, {
        language: "nb-NO",
        i18n: {},
        sanitizeConfig: SANITIZE_CONFIG,
        events: NavForm.getDefaultEmitter(),
      });

      const instance = await formio.ready;
      await instance.setSubmission(submission ?? { data: {} });
      await instance.submissionReady;
      await instance.formReady;
      await instance.dataReady;

      //TODO: For some reason, formio mutates the components in more than one iteration, but returns before all changes are done,
      // leaving us with components that are false positively "valid" (e.g. components hidden by conditionals).
      // find a way to re-render/re-calculate when formio instance changes due to
      await delay(150);

      const formSummaryPanels = formSummaryUtil.createFormSummaryPanels(form, submission, translate, false);
      const panelValidations = instance.components
        .map((panel): PanelValidation => {
          const firstInputWithValidationError: Component | undefined =
            formSummaryUtil.findFirstInputWithValidationError(panel, submission?.data ?? {});
          return {
            key: panel.key as string,
            hasValidationErrors: firstInputWithValidationError !== undefined,
            firstInputWithValidationError: firstInputWithValidationError?.key,
            summaryComponents: formSummaryPanels.find((formSummaryPanel) => formSummaryPanel.key === panel.key)
              .components,
          };
        })
        .filter((panelValidation) => panelValidation);
      setPanelValidationList(panelValidations);
      instance.destroy(true);
    };
    if (featureToggles?.enableMellomlagring) {
      initializePanelValidation();
    }
  }, [featureToggles, form, submission, translate]);

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const declarationRef = useRef<HTMLInputElement>(null);

  const hasDeclaration = declarationType === DeclarationType.custom || declarationType === DeclarationType.default;

  const isValid = (e: React.MouseEvent<HTMLElement>) => {
    if (hasDeclaration && !declaration) {
      if (declaration === undefined) {
        setDeclaration(false);
      }

      e.preventDefault();
      declarationRef.current?.focus();
      return false;
    }

    return true;
  };

  const hasValidationErrors = panelValidationList?.some((panelValidation) => panelValidation.hasValidationErrors);

  return (
    <div className={styles.content}>
      <main id="maincontent" className="fyllut-layout formio-form" tabIndex={-1}>
        <div className="main-col">
          <Heading level="2" size="large" spacing>
            {translate(TEXTS.statiske.summaryPage.title)}
          </Heading>
          {!hasValidationErrors && (
            <BodyShort className="mb-4">{translate(TEXTS.statiske.summaryPage.description)}</BodyShort>
          )}
          {hasValidationErrors && (
            <>
              <Alert variant="info" className={styles.validationAlert}>
                <span>
                  {translate(TEXTS.statiske.summaryPage.validationMessage.start)}
                  <ExclamationmarkTriangleFillIcon
                    className={styles.exclamationmarkIcon}
                    title="Opplysninger mangler"
                    fontSize="1.5rem"
                  />
                  {translate(TEXTS.statiske.summaryPage.validationMessage.end)}
                </span>
              </Alert>
              <EditAnswersButton form={form} formUrl={formUrl} panelValidationList={panelValidationList} />
            </>
          )}
          <div className="form-summary">
            <FormSummary
              submission={submission}
              form={form}
              formUrl={formUrl}
              panelValidationList={panelValidationList}
            />
          </div>
          {hasDeclaration && (
            <ConfirmationPanel
              className="mb"
              checked={declaration || false}
              error={declaration === false && translate(TEXTS.statiske.summaryPage.confirmationError)}
              label={
                declarationType === DeclarationType.custom
                  ? declarationText
                  : translate(TEXTS.statiske.declaration.defaultText)
              }
              ref={declarationRef}
              onChange={() => {
                setDeclaration((v) => !v);
              }}
            />
          )}
          <SummaryPageNavigation
            form={form}
            submission={submission}
            formUrl={formUrl}
            panelValidationList={panelValidationList}
            isValid={isValid}
            onError={(err) => setErrorMessage(err.message)}
          />
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
    </div>
  );
}
