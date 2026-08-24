import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLocation, useNavigate } from 'react-router';
import { useFormActions } from '../../context/form-actions/FormActionsContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { FormButtonRow, FormNextButton, FormPrevButton } from '../../layout/FormButtonRow';
import CancelAndDeleteButton from '../navigation/CancelAndDeleteButton';
import SaveButton from '../navigation/SaveButton';

interface Props {
  onStart: () => void;
  loading: boolean;
}

const IntroPageButtonRow = ({ onStart, loading }: Props) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { canSaveDraft } = useFormActions();
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
