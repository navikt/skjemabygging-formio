import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import {
  createDecorator,
  createIdportenAuth,
  createPublishedTranslationService,
  createTokenxHandler,
} from '@navikt/skjemadigitalisering-shared-backend';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { config } from '../config';
import { supportedLanguages } from '../language';
import { logger } from '../logger';

const metricsRegister = new Registry();
collectDefaultMetrics({ register: metricsRegister });

const publishedTranslationService = createPublishedTranslationService({ baseUrl: config.formsApiUrl });

const idportenAuth = createIdportenAuth({ introspectionEndpoint: config.texas.introspectionEndpoint, logger });

// Configured for innsending-api. No route mounts it until a journey calls innsending-api.
const tokenxForInnsendingApi = createTokenxHandler({
  exchangeEndpoint: config.texas.exchangeEndpoint,
  audience: config.innsendingApi.audience,
  logger,
});

const decorator = createDecorator({
  enabled: !config.noDecorator,
  env: config.naisClusterName === 'prod-gcp' ? 'prod' : 'dev',
  fetchDecoratorHtml,
  logger,
  params: {
    level: 'Level4',
    simple: true,
    logoutWarning: true,
    // The SPA updates lang when the user selects a language in the decorator's menu.
    availableLanguages: supportedLanguages.map((locale) => ({ locale, handleInApp: true })),
  },
});

export { decorator, idportenAuth, metricsRegister, publishedTranslationService, tokenxForInnsendingApi };
