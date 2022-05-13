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
  projectId: string;
  roleIds: Record<string, string>;
  formIds: Record<string, string>;
  jwtSecret: string;
};

export type FyllutConfig = {
  baseUrl: string;
};

export type PusherConfig = {
  cluster: string;
  key: string;
};

export type NodeEnv = "production" | "development" | "test";

export type ConfigType = {
  azure: AzureConfig;
  skjemabyggingProxy: SkjemabyggingProxyConfig;
  publishRepo: PublishRepoConfig;
  formio: FormioConfig;
  fyllut: FyllutConfig;
  pusher: PusherConfig;
  gitSha: string;
  nodeEnv: NodeEnv;
  port: number;
  isProduction: boolean;
  isDevelopment: boolean;
};
