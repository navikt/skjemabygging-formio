import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation } from 'react-router';
import { useLanguages } from '../../../../context/languages';
import { CancelButton } from '../../../navigation/CancelButton';
import { NavigationButtonRow } from '../../../navigation/NavigationButtonRow';
import { PreviousButton } from '../../../navigation/PreviousButton';

const NavigateButtonComponent = ({ goBackUrl }) => {
  const { search } = useLocation();
  const { translate } = useLanguages();
  return (
    <NavigationButtonRow
      previousButton={
        <PreviousButton
          label={{
            digital: translate(TEXTS.grensesnitt.navigation.previous),
            paper: translate(TEXTS.grensesnitt.navigation.previous),
            digitalnologin: translate(TEXTS.grensesnitt.navigation.previous),
            none: translate(TEXTS.grensesnitt.navigation.previous),
          }}
          href={{
            digital: { pathname: goBackUrl, search },
            paper: { pathname: goBackUrl, search },
            digitalnologin: { pathname: goBackUrl, search },
            none: { pathname: goBackUrl, search },
          }}
        />
      }
      cancelButton={<CancelButton />}
    />
  );
};

export default NavigateButtonComponent;
