import { Alert, Heading, Link as NavLink } from "@navikt/ds-react";
import { InnsendingType, NavFormType, Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { useState } from "react";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { useSendInn } from "../../context/sendInn/sendInnContext";
import { getPanels } from "../../util/form";
import { PanelValidation } from "../../util/panelValidation";
import DigitalSubmissionButton from "../components/DigitalSubmissionButton";
import DigitalSubmissionWithPrompt from "../components/DigitalSubmissionWithPrompt";
import { hasRelevantAttachments } from "../components/attachmentsUtil";
import EditAnswersButton from "../components/navigation/EditAnswersButton";
import SaveAndDeleteButtons from "../components/navigation/SaveAndDeleteButtons";

export interface Props {
  form: NavFormType;
  submission?: Submission;
  formUrl: string;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
}

const SummaryPageNavigation = ({ form, submission, formUrl, panelValidationList, isValid }: Props) => {
  const { submissionMethod, app } = useAppConfig();
  const { url } = useRouteMatch();
  const { search } = useLocation();
  const { loggSkjemaStegFullfort, loggSkjemaFullfort, loggSkjemaInnsendingFeilet, loggNavigering } = useAmplitude();
  const { translate } = useLanguages();
  const { mellomlagringError, isMellomlagringActive } = useSendInn();
  const [error, setError] = useState<Error>();

  const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const linkBtStyle = {
    textDecoration: "none",
  };
  const hasAttachments = hasRelevantAttachments(form, submission?.data ?? {});
  const canSubmit = (panelValidationList ?? []).every((panelValidation) => !panelValidation.hasValidationErrors);

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
    <>
      {mellomlagringError && (
        <Alert variant="error" className="mb">
          <Heading size="small" level="4">
            {mellomlagringError.title}
          </Heading>
          {mellomlagringError.message}
        </Alert>
      )}
      {error && !mellomlagringError && (
        <Alert variant="error" className="mb" data-testid="error-message">
          {error.message}
        </Alert>
      )}

      <nav>
        <div className="button-row">
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
          {canSubmit &&
            (submissionMethod === "digital" || innsending === "KUN_DIGITAL") &&
            (hasAttachments ? (
              <DigitalSubmissionButton
                submission={submission}
                isValid={isValid}
                onError={(err) => {
                  setError(err);
                  loggSkjemaInnsendingFeilet();
                }}
                onSuccess={() => loggSkjemaFullfort()}
              >
                {translate(
                  isMellomlagringActive ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.moveForward,
                )}
              </DigitalSubmissionButton>
            ) : (
              <DigitalSubmissionWithPrompt
                submission={submission}
                isValid={isValid}
                onError={(err) => {
                  setError(err);
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
          <EditAnswersButton form={form} formUrl={formUrl} panelValidationList={panelValidationList} />
        </div>
        {isMellomlagringActive && <SaveAndDeleteButtons submission={submission} onError={(error) => setError(error)} />}
        {!isMellomlagringActive && (
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
        )}
      </nav>
    </>
  );
};

export default SummaryPageNavigation;
