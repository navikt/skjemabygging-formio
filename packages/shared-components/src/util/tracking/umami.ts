import { getAnalyticsInstance } from '@navikt/nav-dekoratoren-moduler';
import { localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FrontendLogger from '../../api/frontend-logger/FrontendLogger';
import { FyllutUmamiEvent } from './types';

export type LogEventFunction = (event: FyllutUmamiEvent) => Promise<void>;

export const umamiEventHandler =
  (config: Record<string, string | boolean | object>, frontendLogger: FrontendLogger): LogEventFunction =>
  (event: FyllutUmamiEvent) => {
    if (config.isMocksEnabled) {
      return (async () => {
        await fetch('http://localhost:3300/umami', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
        });
      })();
    }
    return (async () => {
      const isGcp = config?.NAIS_CLUSTER_NAME === 'prod-gcp' || config?.NAIS_CLUSTER_NAME === 'dev-gcp';
      const applicationName = config?.applicationName as string;
      try {
        if (isGcp) {
          const logEvent = getAnalyticsInstance('fyllut-sendinn');
          const sanitizedLanguage = event.data.language
            ? { language: localizationUtils.getLanguageCodeAsIso639_1(event.data.language) }
            : undefined;
          await logEvent(event.name, { ...event.data, ...sanitizedLanguage, applicationName });
        } else {
          frontendLogger.debug(`Log umami event: '${event.name}'`, event.data);
        }
      } catch (e: any) {
        frontendLogger.info('Failed to log umami event', {
          errorMessage: e?.message,
        });
      }
    })();
  };
