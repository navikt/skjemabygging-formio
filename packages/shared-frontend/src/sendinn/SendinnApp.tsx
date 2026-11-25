import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { ErrorInfo, useCallback } from 'react';
import { useAppConfig } from '../app/config/AppConfigProvider';
import { ErrorBoundary } from '../app/error/ErrorBoundary';
import { FormContainer } from '../app/layout/FormContainer';
import { SendinnRoutes } from './SendinnRoutes';
import { SendinnServices } from './SendinnServices';
import { SendinnTranslationProvider } from './SendinnTranslationProvider';

// Expects AppConfigProvider and a router with basename /sendinn.
const SendinnApp = ({ services }: { services: SendinnServices }) => {
  const { logger } = useAppConfig();
  const logFormLoadError = useCallback(
    (error: unknown) =>
      logger.error('Failed to load Sendinn form', {
        errorCode: error instanceof ResponseError ? error.errorCode : undefined,
        correlationId: error instanceof ResponseError ? error.correlationId : undefined,
      }),
    [logger],
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
    <SendinnTranslationProvider loadGlobalTranslations={services.loadGlobalTranslations} onLoadError={logLoadError}>
      <ErrorBoundary onError={logRenderError}>
        <FormContainer>
          <SendinnRoutes services={services} onLoadError={logFormLoadError} />
        </FormContainer>
      </ErrorBoundary>
    </SendinnTranslationProvider>
  );
};

export { SendinnApp };
