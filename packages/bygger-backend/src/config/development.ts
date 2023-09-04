import {
  AzureConfig,
  FormioConfig,
  FyllutConfig,
  GithubAppConfig,
  PublishRepoConfig,
  PusherConfig,
  SkjemabyggingProxyConfig,
} from "./types";

export const devAzure: Partial<AzureConfig> = {
  openidTokenEndpoint: "https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token",
  openidConfigJwksUri: "https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/discovery/v2.0/keys",
  clientId: "599b3553-24b0-416f-9a91-3866d1197e90",
};

export const devSkjemabyggingProxy: Partial<SkjemabyggingProxyConfig> = {
  url: "https://skjemabygging-proxy.dev-fss-pub.nais.io",
  clientId: "95170319-b4d7-4190-8271-118ed19bafbf",
};

export const devFormio: Partial<FormioConfig> = {
  projectUrl: "https://formio-api.intern.dev.nav.no/jvcemxwcpghcqjn",
};

export const devFyllut: FyllutConfig = {
  baseUrl: "https://skjemadelingslenke.ekstern.dev.nav.no/fyllut",
};

export const devPusher: Partial<PusherConfig> = {
  cluster: "eu",
};

export const devGithub: Partial<PublishRepoConfig> = {
  name: "skjemautfylling-formio",
  owner: "navikt",
  base: "test-publishing",
};

export const devGithubApp: Partial<GithubAppConfig> = {
  appId: "test",
};

export const devEnabledFeatures = "translations,diff";
