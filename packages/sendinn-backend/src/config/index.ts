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

const config = {
  port: parseInt(process.env.PORT || '8083'),
  basePath: '/sendinn',
  nodeEnv,
  isDevelopment,
  isProduction,
  isTest,
  naisClusterName: process.env.NAIS_CLUSTER_NAME,
  noDecorator: process.env.NO_DECORATOR === 'true',
  umamiWebsiteId: process.env.UMAMI_WEBSITE_ID,
  formsApiUrl: env('FORMS_API_URL', 'https://forms-api.intern.dev.nav.no'),
  texas: {
    introspectionEndpoint: env('NAIS_TOKEN_INTROSPECTION_ENDPOINT', 'http://localhost:3300/texas/introspect'),
    exchangeEndpoint: env('NAIS_TOKEN_EXCHANGE_ENDPOINT', 'http://localhost:3300/texas/exchange'),
  },
  innsendingApi: {
    audience: env('INNSENDING_API_AUDIENCE', 'dev-gcp:team-soknad:innsending-api'),
  },
};

export { config };
