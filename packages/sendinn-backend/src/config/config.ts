import type { ContentSource } from '@navikt/skjemadigitalisering-shared-backend';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isDevelopment = nodeEnv === 'development';
const isTest = nodeEnv === 'test';
const isProduction = nodeEnv === 'production';

const env = (name: string, developmentValue?: string) => {
  const value = process.env[name] ?? (isDevelopment || isTest ? developmentValue : undefined);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const readContentSource = (): ContentSource => {
  const source = env('SENDINN_CONTENT_SOURCE', 'latest');
  if (source !== 'published' && source !== 'latest') {
    throw new Error('SENDINN_CONTENT_SOURCE must be published or latest');
  }
  if (process.env.NAIS_CLUSTER_NAME === 'prod-gcp' && source !== 'published') {
    throw new Error('SENDINN_CONTENT_SOURCE must be published in prod-gcp');
  }
  return source;
};

const config = {
  port: parseInt(process.env.PORT || '8083'),
  basePath: '/sendinn',
  nodeEnv,
  isDevelopment,
  isProduction,
  isTest,
  naisClusterName: process.env.NAIS_CLUSTER_NAME,
  noDecorator: process.env.NO_DECORATOR === 'true',
  formsApiUrl: env('FORMS_API_URL', 'https://forms-api.intern.dev.nav.no'),
  norg2Url: env('NORG2_URL', 'https://norg2.dev.intern.nav.no'),
  contentSource: readContentSource(),
  skjemabyggingProxyUrl: env('SKJEMABYGGING_PROXY_URL', 'http://127.0.0.1:3300/skjemabygging-proxy'),
  skjemabyggingProxyClientId: env('SKJEMABYGGING_PROXY_CLIENT_ID', 'local-proxy'),
  azure: {
    tokenEndpoint: env('AZURE_OPENID_CONFIG_TOKEN_ENDPOINT', 'http://127.0.0.1:3300/azure-openid/oauth2/v2.0/token'),
    clientId: env('AZURE_APP_CLIENT_ID', 'local-sendinn'),
    // Missing local credentials fail token acquisition, never fall back to an anonymous generator call.
    clientSecret:
      isDevelopment || isTest ? (process.env.AZURE_APP_CLIENT_SECRET ?? '') : env('AZURE_APP_CLIENT_SECRET'),
  },
  texas: {
    introspectionEndpoint: env('NAIS_TOKEN_INTROSPECTION_ENDPOINT', 'http://127.0.0.1:3300/texas/introspect'),
    exchangeEndpoint: env('NAIS_TOKEN_EXCHANGE_ENDPOINT', 'http://127.0.0.1:3300/texas/exchange'),
  },
  innsendingApi: {
    audience: env('INNSENDING_API_AUDIENCE', 'dev-gcp:team-soknad:innsending-api'),
  },
};

export { config };
