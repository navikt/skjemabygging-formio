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
  skjemabyggingProxyUrl: env('SKJEMABYGGING_PROXY_URL', 'https://skjemabygging-proxy.dev-fss-pub.nais.io'),
  skjemabyggingProxyClientId: env('SKJEMABYGGING_PROXY_CLIENT_ID', '95170319-b4d7-4190-8271-118ed19bafbf'),
  azure: {
    tokenEndpoint: env(
      'AZURE_OPENID_CONFIG_TOKEN_ENDPOINT',
      'https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token',
    ),
    clientId: isDevelopment || isTest ? (process.env.AZURE_APP_CLIENT_ID ?? '') : env('AZURE_APP_CLIENT_ID'),
    // Mock runs must never send a locally collected token to the real proxy.
    devToken:
      isDevelopment && process.env.MOCKS_ENABLED !== 'true'
        ? process.env.SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN
        : undefined,
    // Missing local credentials and token fail authentication, never fall back to an anonymous generator call.
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
