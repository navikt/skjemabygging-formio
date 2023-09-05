import { FeatureTogglesMap } from "@navikt/skjemadigitalisering-shared-domain";

export type TokenxConfig = {
  privateJwk: string;
  fyllutClientId: string;
  wellKnownUrl: string;
};

export type SendInnConfig = {
  host: string;
  tokenxClientId: string;
  paths: {
    leggTilVedlegg: string;
    soknad: string;
    utfyltSoknad: string;
  };
};

export type IdportenConfig = {
  idportenClientId: string;
  idportenJwksUri: string;
  idportenIssuer: string;
};

export type DefaultConfig = {
  gitVersion: string;
  sentryDsn?: string;
  useFormioApi: boolean;
  formioProjectUrl: string;
  forstesideUrl: string;
  decoratorUrl: string;
  skjemabyggingProxyUrl: string;
  skjemabyggingProxyClientId: string;
  azureOpenidTokenEndpoint: string;
  clientId: string;
  skjemaDir?: string;
  resourcesDir?: string;
  translationDir?: string;
  tokenx: TokenxConfig;
  sendInnConfig: SendInnConfig;
  idporten: IdportenConfig;
  mockIdportenPid?: string;
  mockIdportenJwt?: string;
};

export type ConfigType = DefaultConfig & {
  fyllutPath: string;
  clientSecret: string;
  featureToggles: FeatureTogglesMap;
  naisClusterName: string;
  isDevelopment: boolean;
  isTest: boolean;
  isDelingslenke: boolean;
  pdlTokenScopeCluster: string;
};
