import { getAnalyticsInstance } from '@navikt/nav-dekoratoren-moduler';
import { localizationUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FrontendLogger from '../../api/frontend-logger/FrontendLogger';
import { EventData, EventName, FyllutUmamiEvent } from './types';

export type LogEventFunction = (event: FyllutUmamiEvent) => Promise<void>;

export const umamiEventHandler =
  (config: Record<string, string | boolean | object>, frontendLogger: FrontendLogger): LogEventFunction =>
  (event: FyllutUmamiEvent) => {
    return (async () => {
      const isGcp = config?.NAIS_CLUSTER_NAME === 'prod-gcp' || config?.NAIS_CLUSTER_NAME === 'dev-gcp';
      const applicationName = config?.applicationName as string;
      try {
        const logEvent = isGcp
          ? getAnalyticsInstance('fyllut-sendinn')
          : getLocalAnalyticsInstance(config, frontendLogger);
        const sanitizedLanguage = event.data.language
          ? { language: localizationUtils.getLanguageCodeAsIso639_1(event.data.language) }
          : undefined;
        await logEvent(event.name, { ...event.data, ...sanitizedLanguage, applicationName });
      } catch (e: any) {
        frontendLogger.info('Failed to log umami event', {
          errorMessage: e?.message,
        });
      }
    })();
  };

const getLocalAnalyticsInstance = (
  config: Record<string, string | boolean | object>,
  frontendLogger: FrontendLogger,
): ReturnType<typeof getAnalyticsInstance> => {
  // @ts-expect-error simple mock implementation used when dekoratoren is not available
  return async (name: EventName, data: EventData) => {
    if (config.isMocksEnabled) {
      await fetch('http://localhost:3300/umami', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, data }),
      });
    } else {
      frontendLogger.debug(`Log umami event: '${name}'`, data);
    }
  };
};
