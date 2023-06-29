import { makeStyles, styled } from "@material-ui/styles";
import { Alert, BodyShort, ConfirmationPanel, Heading } from "@navikt/ds-react";
import { DeclarationType, NavFormType, Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useRef, useState } from "react";
import { useAppConfig } from "../../configContext";
import { useLanguages } from "../../context/languages";
import { Styles } from "../../index";
import { scrollToAndSetFocus } from "../../util/focus-management";
import FormStepper from "../components/FormStepper";
import FormSummary from "./FormSummary";
import SummaryPageNavigation from "./SummaryPageNavigation";

const useStyles = makeStyles(() => ({
  "@global": {
    ...Styles.form,
    ...Styles.global,
  },
}));

export interface Props {
  form: NavFormType;
  submission: Submission;
  formUrl: string;
}

export function SummaryPage({ form, submission, formUrl }: Props) {
  const { submissionMethod } = useAppConfig();
  const { translate } = useLanguages();
  useStyles();
  const { declarationType, declarationText } = form.properties;
  const [declaration, setDeclaration] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

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
    paddingBottom: "2.5rem",
  },
});
