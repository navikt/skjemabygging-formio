import { FormsApiTranslationMap, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { ErrorInfo, useCallback } from 'react';
import { useAppConfig } from '../app/config/AppConfigProvider';
import { ErrorBoundary } from '../app/error/ErrorBoundary';
import { FormContainer } from '../app/layout/FormContainer';
import { SendinnRoutes } from './SendinnRoutes';
import { SendinnTranslationProvider } from './SendinnTranslationProvider';

// Expects AppConfigProvider and a router with basename /sendinn.
const SendinnApp = () => {
  const { baseUrl, http, logger } = useAppConfig();

  const loadGlobalTranslations = useCallback(
    (language: TranslationLang) => http.get<FormsApiTranslationMap>(`${baseUrl}/api/global-translations/${language}`),
    [baseUrl, http],
  );
  const logLoadError = useCallback(
    (error: unknown) =>
      logger.error('Failed to load global translations', { message: error instanceof Error ? error.message : '' }),
    [logger],
  );
  const logRenderError = useCallback(
    (error: Error, errorInfo: ErrorInfo) =>
      logger.error('Render error', { message: error.message, componentStack: errorInfo.componentStack }),
    [logger],
  );

  return (
    <SendinnTranslationProvider loadGlobalTranslations={loadGlobalTranslations} onLoadError={logLoadError}>
      <ErrorBoundary onError={logRenderError}>
        <FormContainer>
          <SendinnRoutes />
        </FormContainer>
      </ErrorBoundary>
    </SendinnTranslationProvider>
  );
};

export { SendinnApp };
