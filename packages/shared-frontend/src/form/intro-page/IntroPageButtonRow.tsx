import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import { useFyllutAppConfig } from '../../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import {
  CancelAndDeleteButton,
  FormButtonRow,
  FormNextButton,
  FormPrevButton,
  SaveButton,
  useFormPersistence,
} from '../framework';

interface Props {
  onStart: () => void;
  loading: boolean;
}

const IntroPageButtonRow = ({ onStart, loading }: Props) => {
  const { translate } = useFyllutLanguage();
  const { submissionMethod } = useFyllutAppConfig();
  const { canSaveDraft } = useFormPersistence();
  const { search } = useLocation();
  const navigate = useNavigate();
  const nextLabel =
    submissionMethod === 'digital' ? TEXTS.grensesnitt.navigation.saveAndContinue : TEXTS.grensesnitt.navigation.next;

  return (
    <FormButtonRow
      cancelButton={<CancelAndDeleteButton />}
      previousButton={
        submissionMethod === 'digitalnologin' ? (
          <FormPrevButton
            label={translate(TEXTS.grensesnitt.navigation.uploadID)}
            onClick={() => navigate({ pathname: 'legitimasjon', search })}
          />
        ) : undefined
      }
      nextButton={<FormNextButton label={translate(nextLabel)} loading={loading} onClick={onStart} />}
      saveButton={canSaveDraft && <SaveButton />}
    />
  );
};

export default IntroPageButtonRow;
