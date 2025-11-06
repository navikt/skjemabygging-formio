import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { CancelAndDeleteButton } from '../../components/navigation/CancelAndDeleteButton';
import { NavigationButtonRow } from '../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../components/navigation/NextButton';
import { PreviousButton } from '../../components/navigation/PreviousButton';
import { SaveButton } from '../../components/navigation/SaveButton';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { useIntroPage } from './IntroPageContext';

const IntroPageButtonRow = () => {
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const { form, selfDeclaration, setError } = useIntroPage();
  const { isMellomlagringActive } = useSendInn();
  const { submission } = useForm();
  const { search } = useLocation();

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
            digitalnologin: () => navigate({ pathname: 'legitimasjon', search }),
          }}
          label={{
            digitalnologin: translate(TEXTS.grensesnitt.navigation.uploadID),
          }}
        />
      }
      cancelButton={<CancelAndDeleteButton />}
      saveButton={isMellomlagringActive && <SaveButton submission={submission} />}
    />
  );
};

export default IntroPageButtonRow;
