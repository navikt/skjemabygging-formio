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
      floatLeft
      previousButton={
        <PreviousButton
          label={{
            default: translate(TEXTS.grensesnitt.navigation.previous),
          }}
          href={{
            default: { pathname: goBackUrl, search },
          }}
        />
      }
      cancelButton={<CancelButton />}
    />
  );
};

export default NavigateButtonComponent;
