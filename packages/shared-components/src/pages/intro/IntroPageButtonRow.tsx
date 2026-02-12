import { TEXTS, Tkey } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate, useSearchParams } from 'react-router';
import { CancelAndDeleteButton } from '../../components/navigation/CancelAndDeleteButton';
import NavigationButtonRow from '../../components/navigation/NavigationButtonRow';
import { NextButton } from '../../components/navigation/NextButton';
import { PreviousButton } from '../../components/navigation/PreviousButton';
import { SaveButton } from '../../components/navigation/SaveButton';
import { useAppConfig } from '../../context/config/configContext';
import { useForm } from '../../context/form/FormContext';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import { formUtils } from '../../index';
import { useIntroPage } from './IntroPageContext';

const IntroPageButtonRow = () => {
  const { submissionMethod } = useAppConfig();
  const navigate = useNavigate();
  const { translate } = useLanguages();
  const [searchParams] = useSearchParams();
  const { form, selfDeclaration, setError } = useIntroPage();
  const { isMellomlagringActive, updateMellomlagring } = useSendInn();
  const { submission } = useForm();
  const { search } = useLocation();

  const href = `${form.path}?${searchParams.toString()}`;
  const validationError: Tkey = 'introPage.selfDeclaration.validationError';
  const firstPanelSlug = form.firstPanelSlug ? form.firstPanelSlug : formUtils.getPanelSlug(form, 0);

  const navigateToFormPage = async () => {
    if (form.introPage?.enabled && !selfDeclaration) {
      setError(translate(validationError));
      return;
    }

    if (submissionMethod === 'digital' && submission) {
      await updateMellomlagring(submission);
    }
    navigate(`${firstPanelSlug}?${searchParams.toString()}`);
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
        submissionMethod === 'digitalnologin' && (
          <PreviousButton
            onClick={{
              digitalnologin: () => navigate({ pathname: 'legitimasjon', search }),
            }}
            label={{
              digitalnologin: translate(TEXTS.grensesnitt.navigation.uploadID),
            }}
          />
        )
      }
      cancelButton={<CancelAndDeleteButton />}
      saveButton={isMellomlagringActive && <SaveButton submission={submission} />}
    />
  );
};

export default IntroPageButtonRow;
