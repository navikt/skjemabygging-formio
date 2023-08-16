import { Link as NavLink } from "@navikt/ds-react";
import { InnsendingType, NavFormType, Submission, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Link, useLocation, useRouteMatch } from "react-router-dom";
import { useAppConfig } from "../../configContext";
import { useAmplitude } from "../../context/amplitude";
import { useLanguages } from "../../context/languages";
import { getPanels } from "../../util/form";
import DigitalSubmissionButton from "../components/DigitalSubmissionButton";
import DigitalSubmissionWithPrompt from "../components/DigitalSubmissionWithPrompt";
import { hasRelevantAttachments } from "../components/attachmentsUtil";
import EditAnswersButton from "../components/navigation/EditAnswersButton";
import SaveAndDeleteButtons from "../components/navigation/SaveAndDeleteButtons";
import { PanelValidation } from "./SummaryPage";

export interface Props {
  form: NavFormType;
  submission?: Submission;
  formUrl: string;
  panelValidationList?: PanelValidation[];
  isValid: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: (error: Error) => void;
}

const SummaryPageNavigation = ({ form, submission, formUrl, panelValidationList, isValid, onError }: Props) => {
  const { submissionMethod, app, featureToggles } = useAppConfig();
  const { url } = useRouteMatch();
  const { search } = useLocation();
  const { loggSkjemaStegFullfort, loggSkjemaFullfort, loggSkjemaInnsendingFeilet, loggNavigering } = useAmplitude();
  const { translate } = useLanguages();
  const innsendingsId = new URLSearchParams(search).get("innsendingsId");
  const isMellomlagringActive = featureToggles?.enableMellomlagring && innsendingsId && submissionMethod === "digital";

  const innsending: InnsendingType = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const linkBtStyle = {
    textDecoration: "none",
  };
  const hasAttachments = hasRelevantAttachments(form, submission);
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

  console.log("search", search);

  return (
    <nav>
      <div className="button-row button-row__start">
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
        <EditAnswersButton form={form} formUrl={formUrl} panelValidationList={panelValidationList} />
      </div>
      {isMellomlagringActive && <SaveAndDeleteButtons submission={submission} />}
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
  );
};

export default SummaryPageNavigation;
