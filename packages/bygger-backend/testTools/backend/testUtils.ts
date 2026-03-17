import { Response } from 'node-fetch';
import { Backend } from '../../src/Backend';
import type { ConfigType } from '../../src/config/types';

export const configForTest: ConfigType = {
  azure: {
    openidTokenEndpoint: 'https://example.test/token',
    openidConfigJwksUri: 'https://example.test/jwks',
    openidConfigIssuer: 'https://example.test/issuer',
    clientId: 'azure-client-id',
    clientSecret: 'azure-client-secret',
  },
  skjemabyggingProxy: {
    clientId: 'proxy-client-id',
    url: 'https://proxy.test',
  },
  publishRepo: {
    owner: 'publish-repo-owner',
    name: 'publish-repo',
    base: 'publish-repo-main-branch',
    token: 'publishRepoToken',
  },
  fyllut: {
    baseUrl: 'https://fyllut.test',
    skjemadelingslenkeUrl: 'https://fyllut.test/skjema',
  },
  formsApi: {
    url: 'https://forms-api.test',
    adGroups: {
      user: 'forms-api-user',
      admin: 'forms-api-admin',
    },
  },
  pusher: {
    cluster: 'eu',
    key: 'pusher-key',
    app: 'pusher-app',
    secret: 'pusher-secret',
  },
  gitSha: 'publish-repo-git-sha',
  githubApp: {
    appId: 'test',
    clientId: 'id',
    clientSecret: 'secret',
    privateKey: 'privateKey',
    installationId: 'installation-id',
  },
  nodeEnv: 'test',
  port: 3000,
  isProduction: false,
  isDevelopment: false,
  featureToggles: {},
  frontendLoggerConfig: {
    enabled: false,
    browserOnly: true,
    logLevel: 'info',
  },
  mellomlagringDurationDays: '7',
};

export const createBackendForTest = () => {
  return new Backend(configForTest);
};

export const jsonToPromise = (json: unknown) => Promise.resolve(new Response(JSON.stringify(json)));
