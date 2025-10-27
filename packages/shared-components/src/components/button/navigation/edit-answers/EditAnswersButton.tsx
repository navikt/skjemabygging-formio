import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { useLanguages } from '../../../../context/languages';
import { findFormStartingPoint, PanelValidation } from '../../../../util/form/panel-validation/panelValidation';
import { PreviousButton } from '../../../navigation/PreviousButton';

interface Props {
  form: NavFormType;
  panelValidationList: PanelValidation[] | undefined;
}

const EditAnswersButton = ({ form, panelValidationList }: Props) => {
  const { search } = useLocation();
  const { translate } = useLanguages();

  const formStartingPoint = findFormStartingPoint(form, panelValidationList);
  const pathname = `../${formStartingPoint.panel}`;
  const hasValidationErrors = panelValidationList?.some((panelValidation) => panelValidation.hasValidationErrors);
  const href = formStartingPoint.component
    ? { pathname, hash: encodeURIComponent(formStartingPoint.component), search }
    : { pathname, search };
  return (
    <PreviousButton
      variant={hasValidationErrors ? 'primary' : 'secondary'}
      href={{
        digital: href,
        paper: href,
        digitalnologin: href,
        none: href,
      }}
      label={{
        digital: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
        paper: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
        digitalnologin: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
        none: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
      }}
    />
  );
};

export default EditAnswersButton;
