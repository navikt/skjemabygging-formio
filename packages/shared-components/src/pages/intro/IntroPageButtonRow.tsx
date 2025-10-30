import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { useNavigate, useSearchParams } from 'react-router';
import { NavigationButtonRow } from '../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../components/navigation/NextButton';
import { PreviousButton } from '../../components/navigation/PreviousButton';
import { useLanguages } from '../../context/languages';
import { useIntroPage } from './IntroPageContext';

const IntroPageButtonRow = () => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const { form, selfDeclaration, setError } = useIntroPage();

  const href = `${form.path}?${searchParams.toString()}`;
  const validationError: Tkey = 'introPage.selfDeclaration.validationError';

  const navigateToFormPage = () => {
    if (form.introPage?.enabled && !selfDeclaration) {
      setError(translate(validationError));
      return;
    }
    navigate(`${form.firstPanelSlug}?${searchParams.toString()}`);
  };

  return (
    <NavigationButtonRow
      nextButton={
        <NextButton
          onClick={{
            default: () => navigateToFormPage(),
          }}
          label={{
            digital: translate(TEXTS.grensesnitt.navigation.saveAndContinue),
            default: translate(TEXTS.grensesnitt.navigation.next),
          }}
          href={{
            default: href,
          }}
        />
      }
      previousButton={
        <PreviousButton
          onClick={{
            default: () => navigate(-1),
          }}
          label={{
            digitalnologin: translate(TEXTS.grensesnitt.navigation.uploadID),
            default: translate(TEXTS.grensesnitt.navigation.cancelAndRestart),
          }}
        />
      }
    />
  );
};

export default IntroPageButtonRow;
