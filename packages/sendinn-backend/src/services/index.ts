import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import {
  createDecorator,
  createIdportenAuth,
  createPublishedTranslationService,
  createTokenxHandler,
} from '@navikt/skjemadigitalisering-shared-backend';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { config } from '../config';
import { logger } from '../logger';

const metricsRegister = new Registry();
collectDefaultMetrics({ register: metricsRegister });

const publishedTranslationService = createPublishedTranslationService({ baseUrl: config.formsApiUrl });

const idportenAuth = createIdportenAuth({ introspectionEndpoint: config.texas.introspectionEndpoint, logger });

// Configured for innsending-api. No route mounts it until a journey calls innsending-api.
const tokenxForInnsendingApi = createTokenxHandler({ exchangeEndpoint: config.texas.exchangeEndpoint, logger })(
  config.innsendingApi.audience,
);

const decorator = createDecorator({
  enabled: !config.noDecorator,
  env: config.naisClusterName === 'prod-gcp' ? 'prod' : 'dev',
  fetchDecoratorHtml,
  logger,
  params: {
    level: 'Level4',
    simple: true,
    logoutWarning: true,
  },
});

export { decorator, idportenAuth, metricsRegister, publishedTranslationService, tokenxForInnsendingApi };
