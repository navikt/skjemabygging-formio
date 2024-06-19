import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import { NavFormType, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import { useAmplitude } from '../../../../context/amplitude';
import { useLanguages } from '../../../../context/languages';
import { PanelValidation, findFormStartingPoint } from '../../../../util/form/panel-validation/panelValidation';
import makeStyles from '../../../../util/styles/jss/jss';

interface Props {
  form: NavFormType;
  formUrl: string;
  panelValidationList: PanelValidation[] | undefined;
}

const useStyles = makeStyles({
  removeUnderline: {
    textDecoration: 'none',
  },
});

const EditAnswersButton = ({ form, formUrl, panelValidationList }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { search } = useLocation();
  const { translate } = useLanguages();
  const styles = useStyles();

  const formStartingPoint = findFormStartingPoint(form, panelValidationList);
  const pathname = `${formUrl}/${formStartingPoint.panel}`;
  const hasValidationErrors = panelValidationList?.some((panelValidation) => panelValidation.hasValidationErrors);

  return (
    <Link
      as={ReactRouterLink}
      className={`navds-button navds-button--${hasValidationErrors ? 'primary' : 'secondary'} ${styles.removeUnderline}`}
      onClick={() =>
        loggNavigering({
          lenkeTekst: translate(TEXTS.grensesnitt.summaryPage.editAnswers),
          destinasjon: pathname,
        })
      }
      to={formStartingPoint.component ? { pathname, hash: formStartingPoint.component, search } : { pathname, search }}
    >
      <span className="navds-button__icon">
        <ArrowLeftIcon aria-hidden />
      </span>
      <span aria-live="polite" className="navds-body-short font-bold">
        {translate(TEXTS.grensesnitt.summaryPage.editAnswers)}
      </span>
    </Link>
  );
};

export default EditAnswersButton;
