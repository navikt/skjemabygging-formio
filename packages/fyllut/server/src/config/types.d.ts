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

export type ConfigType = {
  fyllutPath: string;
  featureToggles: FeatureTogglesMap;
  tokenx?: TokenxConfig;
  sendInnConfig?: SendInnConfig;
  idporten?: IdportenConfig;
  pdlTokenScopeCluster: string;
  clientSecret: string;
  naisClusterName: string;
  isDevelopment: boolean;
  isTest: boolean;
  isDelingslenke: boolean;
  formioProjectUrl?: string;
  useFormioApi?: boolean;
  gitVersion?: string;
  sentryDsn?: string;
  forstesideUrl?: string;
  decoratorUrl?: string;
  skjemabyggingProxyUrl?: string;
  skjemabyggingProxyClientId?: string;
  azureOpenidTokenEndpoint?: string;
  clientId?: string;
  skjemaDir?: string;
  resourcesDir?: string;
  translationDir?: string;
  mockIdportenPid?: string;
  mockIdportenJwt?: string;
};
