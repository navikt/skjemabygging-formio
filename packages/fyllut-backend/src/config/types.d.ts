import { FeatureTogglesMap, FrontendLoggerConfigType } from '@navikt/skjemadigitalisering-shared-domain';

export type TokenxConfig = {
  privateJwk: string;
  fyllutClientId: string;
  wellKnownUrl: string;
};

export type AmplitudeConfig = {
  apiEndpoint: string;
  disableBatch: boolean;
};

export type SendInnConfig = {
  host: string;
  tokenxClientId: string;
  paths: {
    opprettedeSoknaderForSkjema: (skjemanummer: string, soknadsTyper?: Array<'soknad' | 'ettersendelse'>) => string;
    soknad: string;
    utfyltSoknad: string;
    prefillData: string;
    activities: string;
  };
};

export type ServiceConfig = {
  url: string;
  scope?: string;
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
  formioApiServiceUrl?: string;
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
  kodeverk: ServiceConfig;
  norg2: ServiceConfig;
  idporten: IdportenConfig;
  mockIdportenPid?: string;
  mockIdportenJwt?: string;
  noFormValidation?: boolean;
  noDecorator?: boolean;
  amplitude: AmplitudeConfig;
  frontendLoggerConfig: FrontendLoggerConfigType;
  formsApiUrl: string;
};

export type ConfigType = DefaultConfig & {
  fyllutPath: string;
  clientSecret: string;
  featureToggles: FeatureTogglesMap;
  naisClusterName: string;
  isDevelopment: boolean;
  isTest: boolean;
  isProduction: boolean;
  isDelingslenke: boolean;
  backendLogLevel: string;
  pdlTokenScopeCluster: string;
  port: number;
};
