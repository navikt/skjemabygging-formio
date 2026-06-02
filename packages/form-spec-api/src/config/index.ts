import dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isDevelopment = nodeEnv === 'development';
const isTest = nodeEnv === 'test';
const isProduction = nodeEnv === 'production';

const optionalEnv = (name: string) => process.env[name];

const env = (name: string, developmentValue?: string) => {
  const value = process.env[name] ?? (isDevelopment || isTest ? developmentValue : undefined);

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const config = {
  port: parseInt(process.env.PORT || '8080'),
  nodeEnv,
  isDevelopment,
  isProduction,
  isTest,
  formsApiUrl: env('FORMS_API_URL', 'https://forms-api.intern.dev.nav.no'),
  entraId: {
    introspectionEndpoint: isProduction
      ? env('NAIS_TOKEN_INTROSPECTION_ENDPOINT')
      : optionalEnv('NAIS_TOKEN_INTROSPECTION_ENDPOINT'),
  },
};

export { config, env, optionalEnv };
