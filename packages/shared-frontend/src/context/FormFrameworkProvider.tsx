import { Provider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { Form, Submission, SubmissionMethod, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { AppConfigProvider, FrameworkLogger } from './app-config/AppConfigContext';
import { FormDefinitionProvider } from './form-definition/FormDefinitionContext';
import { LanguageProvider } from './language/LanguageContext';
import { FormPersistenceHandlers, FormPersistenceProvider } from './persistence/PersistenceContext';
import { SubmissionStateProvider } from './state/SubmissionStateContext';
import { ValidationProvider } from './validation/ValidationContext';

interface FormFrameworkProviderProps {
  children: ReactNode;
  form: Form;
  initialSubmission?: Submission;
  initialPagesWithErrors?: string[];
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
  initialPagesWithErrors,
  translate,
  currentLanguage,
  submissionMethod,
  logger,
  config,
  persistence,
}: FormFrameworkProviderProps) => {
  const akselLocale = currentLanguage === 'en' ? en : currentLanguage === 'nn' ? nn : nb;

  return (
    <AppConfigProvider submissionMethod={submissionMethod} logger={logger} config={config}>
      <LanguageProvider translate={translate} currentLanguage={currentLanguage}>
        <Provider locale={akselLocale}>
          <SubmissionStateProvider initialSubmission={initialSubmission}>
            <FormDefinitionProvider form={form}>
              <ValidationProvider initialPagesWithErrors={initialPagesWithErrors}>
                <FormPersistenceProvider saveDraft={persistence?.saveDraft} submitForm={persistence?.submitForm}>
                  {children}
                </FormPersistenceProvider>
              </ValidationProvider>
            </FormDefinitionProvider>
          </SubmissionStateProvider>
        </Provider>
      </LanguageProvider>
    </AppConfigProvider>
  );
};

export { FormFrameworkProvider };
export type { FormFrameworkProviderProps };
