import { ArrowLeftIcon } from '@navikt/aksel-icons';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router-dom';
import { useAmplitude } from '../../../../context/amplitude/index';
import LinkButton from '../../../link-button/LinkButton';
import CancelButton from '../cancel/CancelButton';

const NavigateButtonComponent = ({ goBackUrl, translate }) => {
  const { search } = useLocation();
  const { loggNavigering } = useAmplitude();

  return (
    <nav>
      <div className="button-row">
        <LinkButton
          buttonVariant="secondary"
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
        </LinkButton>
      </div>
      <div className="button-row">
        <CancelButton />
      </div>
    </nav>
  );
};

export default NavigateButtonComponent;
