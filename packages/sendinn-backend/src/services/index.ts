import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import {
  createDecorator,
  createGlobalTranslationService,
  createIdportenAuth,
  createTokenxHandler,
} from '@navikt/skjemadigitalisering-shared-backend';
import { sendinnLanguageUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { config } from '../config/config';
import { logger } from '../logger';

const metricsRegister = new Registry();
collectDefaultMetrics({ register: metricsRegister });

const globalTranslationService = createGlobalTranslationService({
  baseUrl: config.formsApiUrl,
  formsSource: config.formsSource,
});

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
    availableLanguages: sendinnLanguageUtils.languages.map((locale) => ({ locale, handleInApp: true })),
  },
});

export { decorator, globalTranslationService, idportenAuth, metricsRegister, tokenxForInnsendingApi };
