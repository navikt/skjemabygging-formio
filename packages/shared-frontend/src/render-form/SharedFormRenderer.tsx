import { Provider as AkselProvider } from '@navikt/ds-react';
import { en, nb, nn } from '@navikt/ds-react/locales';
import { AppConfigProvider } from '../context/app-config/AppConfigContext';
import { FormDefinitionProvider } from '../context/form-definition/FormDefinitionContext';
import { LanguageProvider } from '../context/language/LanguageContext';
import { FormPersistenceProvider } from '../context/persistence/PersistenceContext';
import { SubmissionStateProvider } from '../context/state/SubmissionStateContext';
import { ValidationProvider } from '../context/validation/ValidationContext';
import RendererContent from './RendererContent';
import type { SharedFormRendererProps } from './types';

const SharedFormRenderer = ({
  form,
  initialSubmission,
  initialPagesWithErrors,
  language,
  appConfig,
  persistence,
  route,
  host,
  mode,
}: SharedFormRendererProps) => {
  const locale = language.currentLanguage === 'en' ? en : language.currentLanguage === 'nn' ? nn : nb;
  return (
    <LanguageProvider {...language}>
      <AkselProvider locale={locale}>
        <AppConfigProvider {...appConfig}>
          <SubmissionStateProvider initialSubmission={initialSubmission}>
            <FormDefinitionProvider form={form}>
              <ValidationProvider initialPagesWithErrors={initialPagesWithErrors}>
                <FormPersistenceProvider {...persistence}>
                  <RendererContent host={host} route={route} mode={mode} />
                </FormPersistenceProvider>
              </ValidationProvider>
            </FormDefinitionProvider>
          </SubmissionStateProvider>
        </AppConfigProvider>
      </AkselProvider>
    </LanguageProvider>
  );
};

export default SharedFormRenderer;
