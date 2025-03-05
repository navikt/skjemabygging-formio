import { configUtils, featureUtils } from '@navikt/skjemadigitalisering-shared-domain';
import dotenv from 'dotenv';
import {
  devAzure,
  devEnabledFeatures,
  devFormsApi,
  devFyllut,
  devGithub,
  devGithubApp,
  devPusher,
  devSkjemabyggingProxy,
  prodFormsApi,
} from './development';
import { ConfigType, NodeEnv } from './types';

const nodeEnv = process.env.NODE_ENV as NodeEnv;

if (nodeEnv !== 'test') {
  dotenv.config();
}

const env = (name: string, devValue?: string): string => {
  const value = process.env[name];
  const exists = !!value;
  if (nodeEnv === 'production' && !exists) {
    throw new Error(`Missing env var: ${name}`);
  }
  if (nodeEnv === 'development' && !exists && devValue) {
    return devValue;
  }
  return value!;
};

const optionalEnv = (name: string): string | undefined => {
  return process.env[name];
};

const naisClusterName = env('NAIS_CLUSTER_NAME') as 'dev-gcp' | 'prod-gcp' | undefined;
const isProduction = nodeEnv === 'production';
const isDevelopment = nodeEnv === 'development';

const config: ConfigType = {
  azure: {
    openidTokenEndpoint: env('AZURE_OPENID_CONFIG_TOKEN_ENDPOINT', devAzure.openidTokenEndpoint),
    openidConfigJwksUri: env('AZURE_OPENID_CONFIG_JWKS_URI', devAzure.openidConfigJwksUri),
    openidConfigIssuer: env('AZURE_OPENID_CONFIG_ISSUER'),
    clientId: env('AZURE_APP_CLIENT_ID', devAzure.clientId),
    clientSecret: env('AZURE_APP_CLIENT_SECRET'),
  },
  gitSha: env('GIT_SHA', 'unknown-development-git-sha'),
  skjemabyggingProxy: {
    url: env('SKJEMABYGGING_PROXY_URL', devSkjemabyggingProxy.url),
    clientId: env('SKJEMABYGGING_PROXY_CLIENT_ID', devSkjemabyggingProxy.clientId),
  },
  publishRepo: {
    name: env('PUBLISH_REPO', devGithub.name),
    token: optionalEnv('GITHUB_ACCESS_TOKEN'),
    owner: env('PUBLISH_REPO_OWNER', devGithub.owner),
    base: env('PUBLISH_REPO_BASE', devGithub.base),
  },
  githubApp: {
    appId: env('GITHUB_APP_ID', devGithubApp.appId),
    privateKey: env('GITHUB_APP_PRIVATE_KEY'),
    clientId: env('GITHUB_CLIENT_ID'),
    clientSecret: env('GITHUB_CLIENT_SECRET'),
    installationId: env('GITHUB_APP_INSTALLATION_ID'),
  },
  fyllut: {
    baseUrl: env('FYLLUT_BASE_URL', devFyllut.baseUrl),
    skjemadelingslenkeUrl: 'https://skjemadelingslenke.ekstern.dev.nav.no/fyllut',
  },
  formsApi: {
    url: env('FORMS_API_URL', devFormsApi.url),
    adGroups: {
      user: env('FORMS_API_AD_GROUP_USER', devFormsApi.adGroups.user),
      admin: env('FORMS_API_AD_GROUP_ADMIN', devFormsApi.adGroups.admin),
    },
    devToken: isDevelopment ? optionalEnv('FORMS_API_ACCESS_TOKEN') : undefined,
  },
  prodFormsApi:
    naisClusterName !== 'prod-gcp'
      ? {
          url: env('FORMS_API_URL_PROD', prodFormsApi.url),
        }
      : undefined,
  pusher: {
    cluster: env('PUSHER_CLUSTER', devPusher.cluster),
    key: env('PUSHER_KEY'),
    app: env('PUSHER_APP'),
    secret: env('PUSHER_SECRET'),
  },
  nodeEnv,
  port: parseInt(process.env.PORT || '8080'),
  isProduction,
  isDevelopment,
  featureToggles: featureUtils.toFeatureToggles(env('ENABLED_FEATURES', devEnabledFeatures)),
  naisClusterName,
  frontendLoggerConfig: configUtils.loadJsonFromEnv('BYGGER_FRONTEND_LOGCONFIG'),
  mellomlagringDurationDays: '28',
};

export default config;
