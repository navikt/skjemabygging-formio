import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode, useEffect, useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFormPersistence } from '../../context/persistence/PersistenceContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { FormButtonRow, FormNextButton } from '../../layout/FormButtonRow';
import DynamicIntro from './DynamicIntro';
import StaticIntro from './StaticIntro';

const IntroPage = ({
  onStart,
  tokenExpiration,
  getNoLoginToken,
  actions,
}: {
  onStart: () => void;
  tokenExpiration?: number;
  getNoLoginToken?: () => Promise<string | undefined>;
  actions?: ReactNode;
}) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const { form } = useFormDefinition();
  const { saveDraft, canSaveDraft, status } = useFormPersistence();
  const { submission, setSubmission } = useSubmissionState();
  const [selfDeclarationError, setSelfDeclarationError] = useState<string>();
  const isDynamic = form.introPage?.enabled;

  useEffect(() => {
    if (submissionMethod === 'digital') {
      setSubmission((current) => current ?? { data: {} });
    }
  }, [setSubmission, submissionMethod]);

  useEffect(() => {
    if (submissionMethod === 'digitalnologin') {
      void getNoLoginToken?.();
    }
  }, [getNoLoginToken, submissionMethod]);

  const start = async () => {
    if (isDynamic && !submission?.selfDeclaration) {
      setSelfDeclarationError(translate('introPage.selfDeclaration.validationError'));
      return;
    }
    if (canSaveDraft) {
      await saveDraft();
    }
    onStart();
  };

  return (
    <>
      {isDynamic ? (
        <DynamicIntro
          tokenExpiration={tokenExpiration}
          selfDeclarationError={selfDeclarationError}
          setSelfDeclaration={(value) => {
            setSubmission((current) => ({ ...(current ?? { data: {} }), selfDeclaration: value }));
            if (value) {
              setSelfDeclarationError(undefined);
            }
          }}
        />
      ) : (
        <StaticIntro tokenExpiration={tokenExpiration} />
      )}
      {actions}
      <FormButtonRow
        nextButton={
          <FormNextButton
            label={translate(
              submissionMethod === 'digital'
                ? TEXTS.grensesnitt.navigation.saveAndContinue
                : TEXTS.grensesnitt.navigation.next,
            )}
            loading={status === 'saving'}
            onClick={() => void start()}
          />
        }
      />
    </>
  );
};

export default IntroPage;
