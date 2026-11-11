import { type ContentSource, isContentSource } from '@navikt/skjemadigitalisering-shared-backend';
import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ quiet: true });
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
  if (!isContentSource(source)) {
    throw new Error("SENDINN_CONTENT_SOURCE must be 'published' or 'latest'");
  }
  if (process.env.NAIS_CLUSTER_NAME === 'prod-gcp' && source !== 'published') {
    throw new Error("SENDINN_CONTENT_SOURCE must be 'published' in prod-gcp");
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
  // Mock runs must never send a locally collected token to the real proxy.
  skjemabyggingProxyDevToken:
    isDevelopment && process.env.MOCKS_ENABLED !== 'true'
      ? process.env.SKJEMABYGGING_PROXY_M2M_ACCESS_TOKEN
      : undefined,
  texas: {
    introspectionEndpoint: env('NAIS_TOKEN_INTROSPECTION_ENDPOINT', 'http://127.0.0.1:3300/texas/introspect'),
    exchangeEndpoint: env('NAIS_TOKEN_EXCHANGE_ENDPOINT', 'http://127.0.0.1:3300/texas/exchange'),
    tokenEndpoint: env('NAIS_TOKEN_ENDPOINT', 'http://127.0.0.1:3300/texas/token'),
  },
  innsendingApi: {
    audience: env('INNSENDING_API_AUDIENCE', 'dev-gcp:team-soknad:innsending-api'),
  },
};

export { config };
