import {
  AzureConfig,
  FormioConfig,
  FormsApiConfig,
  FyllutConfig,
  GithubAppConfig,
  PublishRepoConfig,
  PusherConfig,
  SkjemabyggingProxyConfig,
} from './types';

export const devAzure: Partial<AzureConfig> = {
  openidTokenEndpoint: 'https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token',
  openidConfigJwksUri: 'https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/discovery/v2.0/keys',
  clientId: '599b3553-24b0-416f-9a91-3866d1197e90',
};

export const devSkjemabyggingProxy: Partial<SkjemabyggingProxyConfig> = {
  url: 'https://skjemabygging-proxy.dev-fss-pub.nais.io',
  clientId: '95170319-b4d7-4190-8271-118ed19bafbf',
};

export const devFormio: Partial<FormioConfig> = {
  apiService: 'https://formio-api.intern.dev.nav.no',
  projectName: 'jvcemxwcpghcqjn',
  roleIds: {
    administrator: '628ca77305690db58c974d04',
    authenticated: '628ca77305690db58c974d09',
    everyone: '000000000000000000000000',
  },
};

export const prodFormio: Pick<FormioConfig, 'apiService' | 'projectName'> = {
  apiService: 'https://formio-api-server.ekstern.dev.nav.no',
  projectName: 'jvcemxwcpghcqjn',
};

export const devFyllut: Partial<FyllutConfig> = {
  baseUrl: 'https://skjemadelingslenke.ekstern.dev.nav.no/fyllut',
};

export const devFormsApi: FormsApiConfig = {
  url: 'https://forms-api.intern.dev.nav.no',
  adGroups: {
    user: 'b7012a89-90b9-4215-b7dc-988b929216e9',
    admin: '5398ed9e-bb41-43f5-9434-120b0116953c',
  },
};

export const devPusher: Partial<PusherConfig> = {
  cluster: 'eu',
};

export const devGithub: Partial<PublishRepoConfig> = {
  name: 'skjemautfylling-formio',
  owner: 'navikt',
  base: 'test-publishing',
};

export const devGithubApp: Partial<GithubAppConfig> = {
  appId: 'test',
};

export const devEnabledFeatures = 'translations,diff';
