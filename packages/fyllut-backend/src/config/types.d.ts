import { FeatureTogglesMap, FrontendLoggerConfigType } from '@navikt/skjemadigitalisering-shared-domain';

export type TokenxConfig = {
  privateJwk: string;
  fyllutClientId: string;
  wellKnownUrl: string;
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
    mergeFiles: string;
  };
};

export type TilleggsstonaderConfig = {
  host: string;
  tokenxClientId: string;
  paths: {
    activities: string;
  };
};

export type NologinConfig = {
  jwtSecret: string;
};

type ValkeyConfigDisabled = {
  enabled: false;
};

type ValkeyConfigEnabled = {
  enabled: true;
  port: number;
  url: string;
  host: string;
  username: string;
  password: string;
};

export type ValkeyConfig = ValkeyConfigDisabled | ValkeyConfigEnabled;

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
  useFormioMockApi: boolean;
  useFormsApiStaging: boolean;
  formioApiServiceUrl?: string;
  forstesideUrl: string;
  decoratorUrl: string;
  skjemabyggingProxyUrl: string;
  skjemabyggingProxyClientId: string;
  familiePdfGeneratorUrl: string;
  familiePdfGeneratorScope: string;
  mergePdfScope: string;
  gotenbergUrl: string;
  gotenbergUrlEn: string;
  azureOpenidTokenEndpoint: string;
  clientId: string;
  skjemaDir?: string;
  resourcesDir?: string;
  translationDir?: string;
  tokenx: TokenxConfig;
  sendInnConfig: SendInnConfig;
  tilleggsstonaderConfig: TilleggsstonaderConfig;
  kodeverk: ServiceConfig;
  norg2: ServiceConfig;
  idporten: IdportenConfig;
  mockIdportenPid?: string;
  mockIdportenJwt?: string;
  noDecorator?: boolean;
  frontendLoggerConfig: FrontendLoggerConfigType;
  formsApiUrl: string;
  nologin: NologinConfig;
  valkey: ValkeyConfig;
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
  umamiWebsiteId?: string;
  port: number;
};
