import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { useLanguages } from '../../../../context/languages';
import { findFormStartingPoint, PanelValidation } from '../../../../util/form/panel-validation/panelValidation';
import LinkButton from '../../../link-button/LinkButton';

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

  return (
    <LinkButton
      buttonVariant={hasValidationErrors ? 'primary' : 'secondary'}
      to={
        formStartingPoint.component
          ? { pathname, hash: encodeURIComponent(formStartingPoint.component), search }
          : { pathname, search }
      }
    >
      <span className="navds-button__icon">
        <ArrowLeftIcon aria-hidden />
      </span>
      <span aria-live="polite" className="navds-body-short font-bold">
        {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
      </span>
    </LinkButton>
  );
};

export default EditAnswersButton;
