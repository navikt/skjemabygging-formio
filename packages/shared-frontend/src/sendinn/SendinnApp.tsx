import { FormsApiTranslationMap, ResponseError, TranslationLang } from '@navikt/skjemadigitalisering-shared-domain';
import { ErrorInfo, useCallback, useMemo } from 'react';
import { useAppConfig } from '../app/config/AppConfigProvider';
import { ErrorBoundary } from '../app/error/ErrorBoundary';
import { FormContainer } from '../app/layout/FormContainer';
import { SendinnRoutes } from './SendinnRoutes';
import { SendinnTranslationProvider } from './SendinnTranslationProvider';
import { createSendinnFormService } from './form/createSendinnFormService';

// Expects AppConfigProvider and a router with basename /sendinn.
const SendinnApp = () => {
  const { baseUrl, http, logger } = useAppConfig();
  const { loadForm } = useMemo(() => createSendinnFormService({ baseUrl, http }), [baseUrl, http]);
  const logFormLoadError = useCallback(
    (error: unknown) =>
      logger.error('Failed to load Sendinn form', {
        errorCode: error instanceof ResponseError ? error.errorCode : undefined,
        correlationId: error instanceof ResponseError ? error.correlationId : undefined,
      }),
    [logger],
  );

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
          <SendinnRoutes loadForm={loadForm} onLoadError={logFormLoadError} />
        </FormContainer>
      </ErrorBoundary>
    </SendinnTranslationProvider>
  );
};

export { SendinnApp };
