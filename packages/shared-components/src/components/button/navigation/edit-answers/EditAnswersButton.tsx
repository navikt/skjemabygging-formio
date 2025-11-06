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
  const href = formStartingPoint.component
    ? { pathname, hash: encodeURIComponent(formStartingPoint.component), search }
    : { pathname, search };
  return (
    <PreviousButton
      variant="primary"
      href={{
        default: href,
      }}
      label={{
        default: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
      }}
    />
  );
};

export default EditAnswersButton;
