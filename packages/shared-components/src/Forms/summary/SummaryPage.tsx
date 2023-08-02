import { Alert, BodyShort, ConfirmationPanel, Heading } from "@navikt/ds-react";
import { DeclarationType, NavFormType, Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Form as FormioForm } from "formiojs";
import { useEffect, useRef, useState } from "react";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import Styles from "../../styles";
import { scrollToAndSetFocus } from "../../util/focus-management";
import makeStyles from "../../util/jss";
import FormStepper from "../components/FormStepper";
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
});

export interface Props {
  form: NavFormType;
  submission?: Submission;
  formUrl: string;
}

export function SummaryPage({ form, submission, formUrl }: Props) {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
  const styles = useStyles();
  const { declarationType, declarationText } = form.properties;
  const [declaration, setDeclaration] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [panelsWithValidationErrors, setPanelsWithValidationErrors] = useState<string[] | undefined>();

  useEffect(() => {
    const initializeFormio = async () => {
      const formio = new FormioForm(document.getElementById("formio-summary-hidden"), form, {
        language: "nb-NO",
        i18n: {},
      });

      const instance = await formio.ready;
      await instance.setSubmission(submission ?? { data: {} });
      const validation = instance.components
        .map((panel) => !panel.checkValidity(submission?.data ?? {}) && panel.key)
        .filter((key) => key);
      instance.destroy(true);
      setPanelsWithValidationErrors(validation);
    };
    if (!panelsWithValidationErrors) {
      initializeFormio();
    }
  }, [form, panelsWithValidationErrors, submission]);

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

  return (
    <div className={styles.content}>
      <main id="maincontent" className="fyllut-layout formio-form" tabIndex={-1}>
        <div className="main-col">
          <Heading level="2" size="large" spacing>
            {translate(TEXTS.statiske.summaryPage.title)}
          </Heading>
          <BodyShort className="mb-4">{translate(TEXTS.statiske.summaryPage.description)}</BodyShort>
          <div className="form-summary">
            <FormSummary
              submission={submission}
              form={form}
              formUrl={formUrl}
              panelsWithValidationErrors={panelsWithValidationErrors}
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
