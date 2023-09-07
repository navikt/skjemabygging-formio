import { Alert, BodyShort, ConfirmationPanel, Heading, Link as NavLink } from "@navikt/ds-react";
import {
  DeclarationType,
  formSummaryUtil,
  InnsendingType,
  NavFormType,
  Submission,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import Styles from "../../styles";
import { scrollToAndSetFocus } from "../../util/focus-management";
import { getPanels } from "../../util/form";
import makeStyles from "../../util/jss";
import DigitalSubmissionButton from "../components/DigitalSubmissionButton";
import DigitalSubmissionWithPrompt from "../components/DigitalSubmissionWithPrompt";
import FormStepper from "../components/FormStepper";
import { hasRelevantAttachments } from "../components/attachmentsUtil";
import FormSummary from "./FormSummary";

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
  submission: Submission;
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

export function SummaryPage({ form, submission, formUrl }: Props) {
  const { submissionMethod, app } = useAppConfig();
  const location = useLocation();
  const url = location.pathname;
  const { loggSkjemaStegFullfort, loggSkjemaFullfort, loggSkjemaInnsendingFeilet, loggNavigering } = useAmplitude();
  const { translate } = useLanguages();
  const { search } = useLocation();
  const styles = useStyles();
  const { declarationType, declarationText } = form.properties;
  const [declaration, setDeclaration] = useState<boolean | undefined>(undefined);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  useEffect(() => scrollToAndSetFocus("main", "start"), []);
  const declarationRef = useRef<HTMLInputElement>(null);

  const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const linkBtStyle = {
    textDecoration: "none",
  };
  const hasAttachments = hasRelevantAttachments(form, submission);

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
            <FormSummary submission={submission} form={form} formUrl={formUrl} />
          </div>
          {hasDeclaration && (
            <ConfirmationPanel
              className="mb"
              checked={declaration || false}
              error={declaration === false && translate(TEXTS.statiske.summaryPage.confirmationError)}
              label={
                declarationType === DeclarationType.custom
                  ? translate(declarationText)
                  : translate(TEXTS.statiske.declaration.defaultText)
              }
              ref={declarationRef}
              onChange={() => {
                setDeclaration((v) => !v);
              }}
            />
          )}
          <nav>
            <div className="button-row button-row__center">
              {(submissionMethod === "paper" ||
                innsending === "KUN_PAPIR" ||
                (app === "bygger" && innsending === "PAPIR_OG_DIGITAL")) && (
                <Link
                  className="navds-button navds-button--primary"
                  onClick={(e) => {
                    if (!isValid(e)) {
                      return;
                    }
                    loggNavigering({
                      lenkeTekst: translate(TEXTS.grensesnitt.moveForward),
                      destinasjon: `${formUrl}/send-i-posten`,
                    });
                    loggSkjemaStegFullfort({
                      steg: getPanels(form.components).length + 1,
                      skjemastegNokkel: "oppsummering",
                    });
                  }}
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
                    submission={submission}
                    isValid={isValid}
                    onError={(err) => {
                      setErrorMessage(err.message);
                      loggSkjemaInnsendingFeilet();
                    }}
                    onSuccess={() => loggSkjemaFullfort()}
                  >
                    {translate(TEXTS.grensesnitt.moveForward)}
                  </DigitalSubmissionButton>
                ) : (
                  <DigitalSubmissionWithPrompt
                    submission={submission}
                    isValid={isValid}
                    onError={(err) => {
                      setErrorMessage(err.message);
                      loggSkjemaInnsendingFeilet();
                    }}
                    onSuccess={() => loggSkjemaFullfort()}
                  />
                ))}

              {innsending === "INGEN" && (
                <Link
                  className="navds-button navds-button--primary"
                  onClick={(e) => {
                    if (!isValid(e)) {
                      return;
                    }

                    loggSkjemaStegFullfort({
                      steg: getPanels(form.components).length + 1,
                      skjemastegNokkel: "oppsummering",
                    });
                  }}
                  to={{ pathname: `${formUrl}/ingen-innsending`, search, state: { previousPage: url } }}
                >
                  <span aria-live="polite" className="navds-body-short font-bold">
                    {translate(TEXTS.grensesnitt.moveForward)}
                  </span>
                </Link>
              )}
              <Link
                className="navds-button navds-button--secondary"
                onClick={() =>
                  loggNavigering({
                    lenkeTekst: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
                    destinasjon: getUrlToLastPanel(form, formUrl, submission),
                  })
                }
                to={{ pathname: getUrlToLastPanel(form, formUrl, submission), search }}
              >
                <span aria-live="polite" className="navds-body-short font-bold">
                  {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
                </span>
              </Link>
            </div>
            <div className="button-row button-row__center">
              <NavLink
                className={"navds-button navds-button--tertiary"}
                onClick={() =>
                  loggNavigering({
                    lenkeTekst: translate(TEXTS.grensesnitt.navigation.cancel),
                    destinasjon: "https://www.nav.no",
                  })
                }
                href="https://www.nav.no"
                style={linkBtStyle}
              >
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
    </div>
  );
}
