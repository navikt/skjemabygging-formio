import { NavFormType, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Link, useLocation } from "react-router-dom";
import { useAmplitude } from "../../../context/amplitude";
import { useLanguages } from "../../../context/languages";
import { PanelValidation, findFormStartingPoint } from "../../../util/panelValidation";

interface Props {
  form: NavFormType;
  formUrl: string;
  panelValidationList: PanelValidation[] | undefined;
}

const EditAnswersButton = ({ form, formUrl, panelValidationList }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { search } = useLocation();
  const { translate } = useLanguages();

  const formStartingPoint = findFormStartingPoint(form, panelValidationList);
  const hasValidationErrors = panelValidationList?.some((panelValidation) => panelValidation.hasValidationErrors);

  return (
    <Link
      className={`navds-button navds-button--${hasValidationErrors ? "primary" : "secondary"}`}
      onClick={() =>
        loggNavigering({
          lenkeTekst: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
          destinasjon: `${formUrl}/${formStartingPoint.panel}`,
        })
      }
      to={
        formStartingPoint.component
          ? { pathname: formStartingPoint.panel, hash: formStartingPoint.component, search }
          : { pathname: formStartingPoint.panel, search }
      }
    >
      <span aria-live="polite" className="navds-body-short font-bold">
        {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
      </span>
    </Link>
  );
};

export default EditAnswersButton;
