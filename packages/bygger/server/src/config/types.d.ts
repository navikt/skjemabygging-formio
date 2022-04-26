export type AzureConfig = {
  openidTokenEndpoint: string;
  clientId: string;
  clientSecret: string;
};

export type SkjemabyggingProxyConfig = {
  clientId: string;
  url: string;
};

export type PublishRepoConfig = {
  name: string;
  token: string;
  submoduleName: string;
  owner: string;
  base: string;
};

export type FormioConfig = {
  projectUrl: string;
};

export type NodeEnv = "production" | "development" | "test";

export type ConfigType = {
  azure: AzureConfig;
  skjemabyggingProxy: SkjemabyggingProxyConfig;
  publishRepo: PublishRepoConfig;
  formio: FormioConfig;
  gitSha: string;
  nodeEnv: NodeEnv;
  port: number;
  isProduction: boolean;
};
