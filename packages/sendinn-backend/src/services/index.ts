import { fetchDecoratorHtml } from '@navikt/nav-dekoratoren-moduler/ssr';
import {
  createAzureTokenService,
  createContentService,
  createCoverPageService,
  createDecorator,
  createIdportenAuth,
  createNavUnitService,
  createSendinnCoverPageService,
  createSendinnFormService,
  createTokenxHandler,
} from '@navikt/skjemadigitalisering-shared-backend';
import { sendinnLanguageUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { collectDefaultMetrics, Registry } from 'prom-client';
import { config } from '../config/config';
import { logger } from '../logger';

const metricsRegister = new Registry();
collectDefaultMetrics({ register: metricsRegister });

const contentService = createContentService({ baseUrl: config.formsApiUrl, source: config.contentSource });
const sendinnFormService = createSendinnFormService({ contentService });
const navUnitService = createNavUnitService({ baseUrl: config.norg2Url, consumerId: 'sendinn' });
const coverPageService = createCoverPageService({ baseUrl: config.skjemabyggingProxyUrl });
const generatorTokenService = createAzureTokenService({
  ...config.azure,
  scope: `openid api://${config.skjemabyggingProxyClientId}/.default`,
});
const sendinnCoverPageService = createSendinnCoverPageService({
  formService: sendinnFormService,
  coverPageService,
  navUnitService,
  getAccessToken: generatorTokenService.getAccessToken,
  allowTestIdentityNumbers: config.naisClusterName !== 'prod-gcp',
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

export {
  contentService,
  decorator,
  idportenAuth,
  metricsRegister,
  navUnitService,
  sendinnCoverPageService,
  sendinnFormService,
  tokenxForInnsendingApi,
};
