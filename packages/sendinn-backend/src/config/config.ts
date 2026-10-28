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
  const source = env('SENDINN_CONTENT_SOURCE');
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
  contentSource: readContentSource(),
  texas: {
    introspectionEndpoint: env('NAIS_TOKEN_INTROSPECTION_ENDPOINT', 'http://127.0.0.1:3300/texas/introspect'),
    exchangeEndpoint: env('NAIS_TOKEN_EXCHANGE_ENDPOINT', 'http://127.0.0.1:3300/texas/exchange'),
  },
  innsendingApi: {
    audience: env('INNSENDING_API_AUDIENCE', 'dev-gcp:team-soknad:innsending-api'),
  },
};

export { config };
