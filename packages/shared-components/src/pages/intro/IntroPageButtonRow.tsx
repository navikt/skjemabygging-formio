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
            digital: () => navigateToFormPage(),
            paper: () => navigateToFormPage(),
            digitalnologin: () => navigateToFormPage(),
          }}
          label={{
            digital: translate(TEXTS.grensesnitt.navigation.saveAndContinue),
            digitalnologin: translate(TEXTS.grensesnitt.navigation.next),
            paper: translate(TEXTS.grensesnitt.navigation.next),
          }}
          href={{
            digital: href,
            paper: href,
            digitalnologin: href,
          }}
        />
      }
      previousButton={
        <PreviousButton
          onClick={{
            digital: () => navigate(-1),
            digitalnologin: () => navigate(-1),
            paper: () => navigate(-1),
          }}
          label={{
            digital: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
            digitalnologin: translate(TEXTS.grensesnitt.navigation.uploadID),
            paper: translate(TEXTS.grensesnitt.navigation.cancelAndDiscard),
          }}
        />
      }
    />
  );
};

export default IntroPageButtonRow;
