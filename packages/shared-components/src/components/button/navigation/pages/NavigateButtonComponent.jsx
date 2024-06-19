import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { Link } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { Link as ReactRouterLink, useLocation } from 'react-router-dom';
import { useAmplitude } from '../../../../context/amplitude/index';
import makeStyles from '../../../../util/styles/jss/jss';
import CancelButton from '../cancel/CancelButton';

const useStyles = makeStyles({
  backButton: {
    textDecoration: 'none',
  },
});

const NavigateButtonComponent = ({ goBackUrl, translate }) => {
  const { search } = useLocation();
  const { loggNavigering } = useAmplitude();
  const styles = useStyles();

  return (
    <nav>
      <div className="button-row">
        <Link
          as={ReactRouterLink}
          className={`navds-button navds-button--secondary ${styles.backButton}`}
          onClick={() => {
            loggNavigering({
              lenkeTekst: translate(TEXTS.grensesnitt.goBack),
              destinasjon: goBackUrl,
            });
          }}
          to={{ pathname: goBackUrl, search }}
        >
          <span className="navds-button__icon">
            <ArrowLeftIcon aria-hidden />
          </span>
          <span aria-live="polite" className="navds-body-short font-bold">
            {translate(TEXTS.grensesnitt.goBack)}
          </span>
        </Link>
      </div>
      <div className="button-row">
        <CancelButton />
      </div>
    </nav>
  );
};

export default NavigateButtonComponent;
