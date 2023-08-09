import { Link as NavLink } from "@navikt/ds-react";
import {
  Component,
  formSummaryUtil,
  InnsendingType,
  NavFormType,
  Submission,
  TEXTS,
} from "@navikt/skjemadigitalisering-shared-domain";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { getPanels } from "../../util/form";
import { hasRelevantAttachments } from "../components/attachmentsUtil";
import DigitalSubmissionButton from "../components/DigitalSubmissionButton";
import DigitalSubmissionWithPrompt from "../components/DigitalSubmissionWithPrompt";
import { PanelValidation } from "./SummaryPage";

const getPathToFirstErrorOrPanelWithoutSubmission = (
  form: NavFormType,
  formUrl: string,
  panelValidations?: PanelValidation[]
): { pathname: string; hash?: string } => {
  if (!panelValidations || panelValidations.length === 0) {
    return { pathname: `${formUrl}/${form.components[0].key}` };
  }
  let indexOfFirstPanelWithEmptySubmission;
  let indexOfFirstPanelWithError;

  panelValidations.forEach((validation, index) => {
    if (validation.hasValidationErrors && indexOfFirstPanelWithError === undefined) {
      indexOfFirstPanelWithError = index;
    }
    if (validation.summaryComponents?.length === 0 && indexOfFirstPanelWithEmptySubmission === undefined) {
      indexOfFirstPanelWithEmptySubmission = index;
    }
  });

  if (indexOfFirstPanelWithError < indexOfFirstPanelWithEmptySubmission) {
    const hash = panelValidations[indexOfFirstPanelWithError].firstInputWithValidationError;
    return { pathname: `${formUrl}/${panelValidations[indexOfFirstPanelWithError].key}`, hash };
  }

  const panel = panelValidations[indexOfFirstPanelWithEmptySubmission].key;
  const firstInputInPanel: Component | undefined = formSummaryUtil.findFirstInput(
    form.components?.[indexOfFirstPanelWithEmptySubmission]
  );
  const hash = firstInputInPanel?.key ?? "";
  return { pathname: `${formUrl}/${panel}`, hash };
};

export interface Props {
  form: NavFormType;
  submission?: Submission;
  formUrl: string;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: (error: Error) => void;
}

const SummaryPageNavigation = ({ form, submission, formUrl, panelValidationList, isValid, onError }: Props) => {
  const { submissionMethod, app } = useAppConfig();
  const { url } = useRouteMatch();
  const { search } = useLocation();
  const { loggSkjemaStegFullfort, loggSkjemaFullfort, loggSkjemaInnsendingFeilet, loggNavigering } = useAmplitude();
  const { translate } = useLanguages();

  const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const linkBtStyle = {
    textDecoration: "none",
  };
  const hasAttachments = hasRelevantAttachments(form, submission);

  const onClickPapirOrIngenInnsending = (e, path) => {
    if (!isValid(e)) {
      return;
    }
    loggNavigering({
      lenkeTekst: translate(TEXTS.grensesnitt.moveForward),
      destinasjon: `${formUrl}/${path}`,
    });
    loggSkjemaStegFullfort({
      steg: getPanels(form.components).length + 1,
      skjemastegNokkel: "oppsummering",
    });
  };

  return (
    <nav>
      <div className="button-row button-row__center">
        {(submissionMethod === "paper" ||
          innsending === "KUN_PAPIR" ||
          (app === "bygger" && innsending === "PAPIR_OG_DIGITAL")) && (
          <Link
            className="navds-button navds-button--primary"
            onClick={(e) => onClickPapirOrIngenInnsending(e, "send-i-posten")}
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
                onError(err);
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
                onError(err);
                loggSkjemaInnsendingFeilet();
              }}
              onSuccess={() => loggSkjemaFullfort()}
            />
          ))}

        {innsending === "INGEN" && (
          <Link
            className="navds-button navds-button--primary"
            onClick={(e) => onClickPapirOrIngenInnsending(e, "ingen-innsending")}
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
              destinasjon: getPathToFirstErrorOrPanelWithoutSubmission(form, formUrl, panelValidationList).pathname,
            })
          }
          to={{ ...getPathToFirstErrorOrPanelWithoutSubmission(form, formUrl, panelValidationList), search }}
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
  );
};

export default SummaryPageNavigation;
