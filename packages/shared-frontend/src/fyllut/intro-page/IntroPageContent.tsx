import { useEffect, useState } from 'react';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { useNologinToken } from '../context/nologin-token/NologinTokenContext';
import FormActionError from '../layout/FormActionError';
import IntroPageButtonRow from './IntroPageButtonRow';
import IntroPageDynamic from './IntroPageDynamic';
import IntroPageStatic from './IntroPageStatic';

interface Props {
  onStart: () => void;
}

const IntroPage = ({ onStart }: Props) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { form } = useFormDefinition();
  const { saveDraft, canSaveDraft, status } = useFormActions();
  const { submission, setSubmission } = useSubmissionState();
  const [selfDeclarationError, setSelfDeclarationError] = useState<string | undefined>();
  const { tokenExpiration } = useNologinToken();
  const introPage = form.introPage;
  const isDynamic = introPage?.enabled;

  const setSelfDeclaration = (value: boolean) => {
    setSubmission((prev) => ({ ...(prev ?? { data: {} }), selfDeclaration: value }));
    if (value) setSelfDeclarationError(undefined);
  };

  useEffect(() => {
    if (submissionMethod === 'digital') {
      setSubmission((prev) => prev ?? { data: {} });
    }
  }, [setSubmission, submissionMethod]);

  const handleStart = async () => {
    if (isDynamic && !submission?.selfDeclaration) {
      setSelfDeclarationError(translate('introPage.selfDeclaration.validationError'));
      return;
    }

    if (canSaveDraft && !(await saveDraft())) {
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
