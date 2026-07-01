import { Form, Submission, SubmissionMethod, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { AppConfigProvider, FrameworkLogger } from './app-config/AppConfigContext';
import { FormDefinitionProvider } from './form-definition/FormDefinitionContext';
import { LanguageProvider } from './language/LanguageContext';
import { FormPersistenceHandlers, PersistenceProvider } from './persistence/PersistenceContext';
import { SubmissionProvider } from './submission/SubmissionContext';
import { ValidationProvider } from './validation/ValidationContext';

interface FormFrameworkProviderProps {
  children: ReactNode;
  form: Form;
  initialSubmission?: Submission;
  translate: TranslateFunction;
  currentLanguage: string;
  submissionMethod?: SubmissionMethod;
  logger?: FrameworkLogger;
  config?: { NAIS_CLUSTER_NAME?: string };
  persistence?: FormPersistenceHandlers;
}

const FormFrameworkProvider = ({
  children,
  form,
  initialSubmission,
  translate,
  currentLanguage,
  submissionMethod,
  logger,
  config,
  persistence,
}: FormFrameworkProviderProps) => {
  return (
    <AppConfigProvider submissionMethod={submissionMethod} logger={logger} config={config}>
      <LanguageProvider translate={translate} currentLanguage={currentLanguage}>
        <SubmissionProvider initialSubmission={initialSubmission}>
          <FormDefinitionProvider form={form}>
            <ValidationProvider>
              <PersistenceProvider saveDraft={persistence?.saveDraft} submitForm={persistence?.submitForm}>
                {children}
              </PersistenceProvider>
            </ValidationProvider>
          </FormDefinitionProvider>
        </SubmissionProvider>
      </LanguageProvider>
    </AppConfigProvider>
  );
};

export { FormFrameworkProvider };
export type { FormFrameworkProviderProps };
