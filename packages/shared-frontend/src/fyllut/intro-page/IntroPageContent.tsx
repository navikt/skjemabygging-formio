import { useEffect } from 'react';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useValidationActions, useValidationFieldError } from '../../context/validation/ValidationContext';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { useNologinToken } from '../context/nologin-token/NologinTokenContext';
import { INTRO_KEY } from '../form-flow/constants';
import FormActionError from '../layout/FormActionError';
import IntroPageButtonRow from './IntroPageButtonRow';
import IntroPageDynamic from './IntroPageDynamic';
import IntroPageStatic from './IntroPageStatic';
import { SELF_DECLARATION_PATH } from './selfDeclarationValidation';

interface Props {
  onStart: () => void;
}

const IntroPage = ({ onStart }: Props) => {
  const { translate } = useLanguage();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const form = useFormDefinitionForm();
  const { saveDraft, canSaveDraft, status } = useFormActions();
  const { submission, setSubmission } = useSubmissionState();
  const { validatePage, schedulePageValidation } = useValidationActions();
  const selfDeclarationError = useValidationFieldError(SELF_DECLARATION_PATH, INTRO_KEY);
  const { tokenExpiration } = useNologinToken();
  const introPage = form.introPage;
  const isDynamic = introPage?.enabled;

  const setSelfDeclaration = (value: boolean) => {
    setSubmission((prev) => ({ ...(prev ?? { data: {} }), selfDeclaration: value }));
    schedulePageValidation(INTRO_KEY);
  };

  useEffect(() => {
    if (submissionMethod === 'digital') {
      setSubmission((prev) => prev ?? { data: {} });
    }
  }, [setSubmission, submissionMethod]);

  const validateSelfDeclaration = () => validatePage(INTRO_KEY);

  const handleStart = async () => {
    if (!validateSelfDeclaration()) {
      return;
    }
    if (canSaveDraft && (!(await saveDraft()) || !validateSelfDeclaration())) {
      return;
    }

    onStart();
  };

  return (
    <>
      {isDynamic ? (
        <IntroPageDynamic
          introPage={introPage}
          submissionMethod={submissionMethod}
          tokenExpiration={tokenExpiration}
          translate={translate}
          selfDeclaration={submission?.selfDeclaration}
          selfDeclarationError={selfDeclarationError}
          onSelfDeclarationChange={setSelfDeclaration}
        />
      ) : (
        <IntroPageStatic submissionMethod={submissionMethod} tokenExpiration={tokenExpiration} translate={translate} />
      )}
      <FormActionError />
      <IntroPageButtonRow onStart={handleStart} loading={status === 'saving'} />
    </>
  );
};

export default IntroPage;
