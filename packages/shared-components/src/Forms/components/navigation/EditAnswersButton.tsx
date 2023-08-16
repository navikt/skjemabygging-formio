import { Component, formSummaryUtil, NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Link, useLocation } from "react-router-dom";
import { useAmplitude } from "../../../context/amplitude";
import { useLanguages } from "../../../context/languages";
import { PanelValidation } from "../../summary/SummaryPage";

interface Props {
  form: NavFormType;
  formUrl: string;
  panelValidationList: PanelValidation[] | undefined;
}

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

const EditAnswersButton = ({ form, formUrl, panelValidationList }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { search } = useLocation();
  const { translate } = useLanguages();

  const pathAndHashForNavigation = getPathToFirstErrorOrPanelWithoutSubmission(form, formUrl, panelValidationList);

  return (
    <Link
      className="navds-button navds-button--primary"
      onClick={() =>
        loggNavigering({
          lenkeTekst: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
          destinasjon: pathAndHashForNavigation.pathname,
        })
      }
      to={{ ...pathAndHashForNavigation, search }}
    >
      <span aria-live="polite" className="navds-body-short font-bold">
        {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
      </span>
    </Link>
  );
};

export default EditAnswersButton;
