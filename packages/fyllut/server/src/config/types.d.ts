import { FeatureTogglesMap } from "@navikt/skjemadigitalisering-shared-domain";

export type TokenxConfig = {
  privateJwk: string;
  fyllutClientId: string;
  wellKnownUrl: string;
};

export type SendInnConfig = {
  host: string;
  tokenxClientId: string;
};

export type ConfigType = {
  featureToggles: FeatureTogglesMap;
  tokenx?: TokenxConfig;
  sendInnConfig?: SendInnConfig;
  clientSecret: string;
  naisClusterName: string;
  isDevelopment: boolean;
  isTest: boolean;
  idportenClientId: string;
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
