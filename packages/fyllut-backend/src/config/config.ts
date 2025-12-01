import { FrontendLoggerConfigType, configUtils, featureUtils } from '@navikt/skjemadigitalisering-shared-domain';
import dotenv from 'dotenv';
import { logger } from '../logger';
import { NaisCluster } from './nais-cluster.js';
import {
  ConfigType,
  DefaultConfig,
  IdportenConfig,
  SendInnConfig,
  ServiceConfig,
  TeamLogsConfig,
  TilleggsstonaderConfig,
  TokenxConfig,
} from './types';

const { DOTENV_FILE } = process.env;
if (DOTENV_FILE) {
  dotenv.config({ path: [`.env.${DOTENV_FILE}.local`, `.env.${DOTENV_FILE}`] });
} else if (process.env.NODE_ENV !== 'test') {
  dotenv.config();
}

const defaultEnabledFeatures = '';

const tokenx: TokenxConfig = {
  privateJwk: process.env.TOKEN_X_PRIVATE_JWK!,
  fyllutClientId: process.env.TOKEN_X_CLIENT_ID!,
  wellKnownUrl: process.env.TOKEN_X_WELL_KNOWN_URL!,
};

const frontendLoggerConfig: FrontendLoggerConfigType = configUtils.loadJsonFromEnv('FYLLUT_FRONTEND_LOGCONFIG');

const idporten: IdportenConfig = {
  idportenClientId: process.env.IDPORTEN_CLIENT_ID!,
  idportenJwksUri: process.env.IDPORTEN_JWKS_URI || 'https://oidc-ver2.difi.no/idporten-oidc-provider/jwk',
  idportenIssuer: process.env.IDPORTEN_ISSUER!,
};

const sendInnConfig: SendInnConfig = {
  host: process.env.SEND_INN_HOST!,
  tokenxClientId: process.env.SEND_INN_TOKEN_X_CLIENT_ID!,
  paths: {
    opprettedeSoknaderForSkjema: (skjemanummer, soknadstyper = ['soknad', 'ettersendelse']) =>
      `/frontend/v1/skjema/${skjemanummer}/soknader?soknadstyper=${soknadstyper.toString()}`,
    soknad: '/fyllUt/v1/soknad',
    utfyltSoknad: '/fyllUt/v1/utfyltSoknad',
    prefillData: '/fyllUt/v1/prefill-data',
    activities: '/fyllUt/v1/aktiviteter',
    mergeFiles: '/fyllUt/v1/merge-filer',
    nologinFile: '/v1/nologin-fillager',
    nologinSubmit: '/v1/nologin-soknad',
  },
};

const tilleggsstonaderConfig: TilleggsstonaderConfig = {
  host: process.env.TILLEGGSSTONADER_HOST!,
  tokenxClientId: process.env.TILLEGGSSTONADER_TOKEN_X_CLIENT_ID!,
  paths: {
    activities: '/api/ekstern/aktivitet',
  },
};

const teamLogsConfig: TeamLogsConfig = {
  enabled: !!process.env.TEAM_LOGS_URL,
  url: process.env.TEAM_LOGS_URL || '',
  mandatoryFields: {},
};

const kodeverk: ServiceConfig = {
  url: process.env.KODEVERK_URL!,
  scope: process.env.KODEVERK_SCOPE!,
};

const norg2: ServiceConfig = {
  url: process.env.NORG2_URL!,
};

function loadFormioApiServiceUrl() {
  const formioApiService = process.env.FORMIO_API_SERVICE;
  const formioProjectName = process.env.FORMIO_PROJECT_NAME;
  if (formioApiService && formioProjectName) {
    return `${formioApiService}/${formioProjectName}`;
  }
  return undefined;
}

const localDevelopmentConfig: DefaultConfig = {
  applicationName: 'skjemautfylling-local',
  gitVersion: 'local',
  isMocksEnabled: process.env.MOCKS_ENABLED === 'true',
  useFormioMockApi: process.env.FORMS_SOURCE === 'mock',
  useFormsApiStaging: !process.env.FORMS_SOURCE || process.env.FORMS_SOURCE === 'formsapi-staging',
  formioApiServiceUrl: loadFormioApiServiceUrl() || 'https://formio-api.intern.dev.nav.no/jvcemxwcpghcqjn',
  forstesideUrl: 'https://www.nav.no/soknader/api/forsteside',
  decoratorUrl: 'https://www.nav.no/dekoratoren?simple=true',
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL || 'https://skjemabygging-proxy.dev-fss-pub.nais.io',
  skjemabyggingProxyClientId: '95170319-b4d7-4190-8271-118ed19bafbf',
  familiePdfGeneratorUrl: process.env.FAMILIE_PDF_GENERATOR_URL || 'https://familie-pdf.intern.dev.nav.no',
  familiePdfGeneratorScope: process.env.FAMILIE_PDF_GENERATOR_SCOPE || 'dev-gcp.teamfamilie.familie-pdf',
  familiePdfDevToken: process.env.FAMILIE_PDF_M2M_ACCESS_TOKEN,
  mergePdfScope: process.env.MERGE_PDF_SCOPE || 'dev-gcp.team-soknad.innsending-api',
  azureOpenidTokenEndpoint:
    process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT ||
    'https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token',
  clientId: process.env.AZURE_APP_CLIENT_ID || 'a1eddc14-0e91-40bc-b910-a0cf39ac3223', // <-- fyllut i dev-gcp
  mockIdportenPid: process.env.MOCK_IDPORTEN_PID || '12345678911',
  mockIdportenJwt: process.env.MOCK_IDPORTEN_JWT || 'IDPORTEN_JWT',
  noDecorator: process.env.NO_DECORATOR === 'true',
  tokenx: {
    ...tokenx,
    wellKnownUrl:
      tokenx.wellKnownUrl || 'https://tokenx.dev-gcp.nav.cloud.nais.io/.well-known/oauth-authorization-server',
    fyllutClientId: tokenx.fyllutClientId || 'dev-gcp:skjemadigitalisering:fyllut',
  },
  sendInnConfig: {
    ...sendInnConfig,
    devM2MToken: process.env.INNSENDING_API_M2M_ACCESS_TOKEN,
    devOBOToken: process.env.INNSENDING_API_OBO_ACCESS_TOKEN,
    host: sendInnConfig.host || 'https://innsending-api-gcp.intern.dev.nav.no',
    tokenxClientId: sendInnConfig.tokenxClientId || 'dev-gcp:soknad:send-inn',
  },
  tilleggsstonaderConfig: {
    // TODO løse lokal utvikling for tilleggsstonader
    ...tilleggsstonaderConfig,
    host: tilleggsstonaderConfig.host || '',
    tokenxClientId: tilleggsstonaderConfig.tokenxClientId || '',
  },
  idporten: {
    ...idporten,
    idportenJwksUri: idporten.idportenJwksUri || 'https://test.idporten.no/jwks.json',
  },
  kodeverk: {
    ...kodeverk,
    url: kodeverk.url || 'https://kodeverk-api.intern.nav.no',
    scope: kodeverk.scope || 'dev-gcp:team-rocket:kodeverk',
  },
  norg2: {
    ...norg2,
    url: norg2.url || 'https://norg2.dev.intern.nav.no',
  },
  frontendLoggerConfig,
  formsApiUrl: process.env.FORMS_API_URL || 'https://forms-api.intern.dev.nav.no',
  nologin: {
    jwtSecret: 'verysecret',
    tokenLifetimeHours: 6,
  },
  teamLogsConfig,
};

const defaultConfig: DefaultConfig = {
  applicationName: process.env.NAIS_APP_NAME!,
  sentryDsn: process.env.VITE_SENTRY_DSN!,
  gitVersion: process.env.GIT_SHA!,
  isMocksEnabled: process.env.MOCKS_ENABLED === 'true',
  useFormioMockApi: process.env.FORMS_SOURCE === 'mock',
  useFormsApiStaging: process.env.FORMS_SOURCE === 'formsapi-staging',
  formioApiServiceUrl: loadFormioApiServiceUrl(),
  forstesideUrl: process.env.FOERSTESIDE_URL!,
  decoratorUrl: process.env.DECORATOR_URL!,
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL!,
  skjemabyggingProxyClientId: process.env.SKJEMABYGGING_PROXY_CLIENT_ID!,
  familiePdfGeneratorUrl: process.env.FAMILIE_PDF_GENERATOR_URL!,
  familiePdfGeneratorScope: process.env.FAMILIE_PDF_GENERATOR_SCOPE!,
  mergePdfScope: process.env.MERGE_PDF_SCOPE!,
  azureOpenidTokenEndpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!,
  clientId: process.env.AZURE_APP_CLIENT_ID!,
  skjemaDir: process.env.SKJEMA_DIR!,
  resourcesDir: process.env.RESOURCES_DIR!,
  translationDir: process.env.TRANSLATION_DIR!,
  noDecorator: false,
  tokenx,
  sendInnConfig,
  tilleggsstonaderConfig,
  kodeverk,
  norg2,
  idporten,
  frontendLoggerConfig,
  formsApiUrl: process.env.FORMS_API_URL!,
  nologin: {
    jwtSecret: process.env.NOLOGIN_JWT_SECRET!,
    tokenLifetimeHours: 6,
  },
  teamLogsConfig: {
    ...teamLogsConfig,
    mandatoryFields: {
      ...teamLogsConfig.mandatoryFields,
      google_cloud_project: process.env.GOOGLE_CLOUD_PROJECT!,
      nais_namespace_name: process.env.NAIS_NAMESPACE!,
      nais_pod_name: process.env.NAIS_POD_NAME!,
      nais_container_name: process.env.NAIS_APP_NAME!,
    },
  },
};

const config: ConfigType = {
  ...(process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test'
    ? localDevelopmentConfig
    : defaultConfig),
  fyllutPath: '/fyllut',
  clientSecret: process.env.AZURE_APP_CLIENT_SECRET!,
  naisClusterName: process.env.NAIS_CLUSTER_NAME!,
  featureToggles: featureUtils.toFeatureToggles(process.env.ENABLED_FEATURES ?? defaultEnabledFeatures),
  isDevelopment: process.env.NODE_ENV === 'development',
  isTest: process.env.NODE_ENV === 'test',
  isProduction: process.env.NODE_ENV === 'production',
  isDelingslenke: process.env.NAIS_APP_NAME === 'skjemautfylling-delingslenke',
  pdlTokenScopeCluster: process.env.PDL_TOKEN_SCOPE_CLUSTER!,
  backendLogLevel: process.env.FYLLUT_BACKEND_LOGLEVEL || (process.env.NODE_ENV === 'test' ? 'warning' : 'info'),
  umamiWebsiteId: process.env.UMAMI_WEBSITE_ID,
  port: parseInt(process.env.PORT || '8080'),
};

const checkConfigConsistency = (config: ConfigType, logError = logger.error, exit = process.exit) => {
  const { isMocksEnabled, useFormioMockApi, useFormsApiStaging, naisClusterName, formioApiServiceUrl, formsApiUrl } =
    config;
  if (isMocksEnabled) {
    if (naisClusterName === NaisCluster.PROD || naisClusterName === NaisCluster.DEV) {
      logError(`Invalid configuration: Mocks is not allowed in ${naisClusterName}`);
      exit(1);
    }
  }
  if (useFormioMockApi) {
    if (naisClusterName === NaisCluster.PROD) {
      logError(`Invalid configuration: FormioApi is not allowed in ${naisClusterName}`);
      exit(1);
    }
    if (!formioApiServiceUrl) {
      logError('Invalid configuration: Formio api service url is required when using FormioApi');
      exit(1);
    }
  }
  if (useFormsApiStaging) {
    if (naisClusterName === NaisCluster.PROD) {
      logError(`Invalid configuration: FormsApi staging is not allowed in ${naisClusterName}`);
      exit(1);
    }
    if (!formsApiUrl) {
      logError('Invalid configuration: Forms api url is required when using FormsApi staging');
      exit(1);
    }
  }
};

export { checkConfigConsistency, config };
