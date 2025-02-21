import { FrontendLoggerConfigType } from '@navikt/skjemadigitalisering-shared-domain';

export type AzureConfig = {
  openidTokenEndpoint: string;
  openidConfigJwksUri: string;
  openidConfigIssuer: string;
  clientId: string;
  clientSecret: string;
};

export type SkjemabyggingProxyConfig = {
  clientId: string;
  url: string;
};

export type PublishRepoConfig = {
  name: string;
  token: string | undefined;
  owner: string;
  base: string;
};

export type FormioConfig = {
  apiService: string;
  projectName: string;
  projectId: string;
  roleIds: Record<string, string>;
  formIds: Record<string, string>;
  jwtSecret: string;
};

export type FyllutConfig = {
  baseUrl: string;
  skjemadelingslenkeUrl: string;
};

export type FormsApiConfig = {
  url: string;
  adGroups: {
    user: string;
    admin: string;
  };
  devToken?: string;
};

export type PusherConfig = {
  cluster: string;
  key: string;
  app: string;
  secret: string;
};

export type GithubAppConfig = {
  appId: string;
  privateKey: string;
  clientId: string;
  clientSecret: string;
  installationId: string;
};

export type NodeEnv = 'production' | 'development' | 'test';

export type ConfigType = {
  azure: AzureConfig;
  skjemabyggingProxy: SkjemabyggingProxyConfig;
  publishRepo: PublishRepoConfig;
  formio: FormioConfig;
  prodFormio?: Pick<FormioConfig, 'apiService' | 'projectName'>;
  fyllut: FyllutConfig;
  formsApi: FormsApiConfig;
  prodFormsApi?: Pick<FormsApiConfig, 'url'>;
  pusher: PusherConfig;
  githubApp: GithubAppConfig;
  gitSha: string;
  nodeEnv: NodeEnv;
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
  featureToggles: { [key: string]: boolean };
  frontendLoggerConfig: FrontendLoggerConfigType;
  naisClusterName?: 'dev-gcp' | 'prod-gcp';
  mellomlagringDurationDays: string;
};
