import { featureUtils } from '@navikt/skjemadigitalisering-shared-domain';
import dotenv from 'dotenv';
import { logger } from '../logger';
import { NaisCluster } from './nais-cluster.js';
import { AmplitudeConfig, ConfigType, DefaultConfig, IdportenConfig, SendInnConfig, TokenxConfig } from './types';

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

const amplitude: AmplitudeConfig = {
  apiEndpoint: process.env.AMPLITUDE_API_ENDPOINT ?? '',
};

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
    leggTilVedlegg: '/fyllUt/v1/leggTilVedlegg', //Deprecated
    soknad: '/fyllUt/v1/soknad',
    utfyltSoknad: '/fyllUt/v1/utfyltSoknad',
    prefillData: '/fyllUt/v1/prefill-data',
    activities: '/fyllUt/v1/aktiviteter',
  },
};

const localDevelopmentConfig: DefaultConfig = {
  gitVersion: 'local',
  useFormioApi: true,
  formioProjectUrl: process.env.FORMIO_PROJECT_URL || 'https://formio-api.intern.dev.nav.no/jvcemxwcpghcqjn',
  forstesideUrl: 'https://www.nav.no/soknader/api/forsteside',
  decoratorUrl: 'https://www.nav.no/dekoratoren?simple=true',
  fyllutFrontendUrl: process.env.FYLLUT_FRONTEND_URL || 'http://localhost:3001/fyllut',
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL || 'https://skjemabygging-proxy.dev-fss-pub.nais.io',
  skjemabyggingProxyClientId: '95170319-b4d7-4190-8271-118ed19bafbf',
  azureOpenidTokenEndpoint:
    process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT ||
    'https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token',
  clientId: process.env.AZURE_APP_CLIENT_ID || 'a1eddc14-0e91-40bc-b910-a0cf39ac3223', // <-- fyllut i dev-gcp
  mockIdportenPid: process.env.MOCK_IDPORTEN_PID || '12345678911',
  mockIdportenJwt: process.env.MOCK_IDPORTEN_JWT || 'IDPORTEN_JWT',
  noFormValidation: process.env.NO_FORM_VALIDATION === 'true',
  noDecorator: process.env.NO_DECORATOR === 'true',
  tokenx: {
    ...tokenx,
    wellKnownUrl:
      tokenx.wellKnownUrl || 'https://tokenx.dev-gcp.nav.cloud.nais.io/.well-known/oauth-authorization-server',
    fyllutClientId: tokenx.fyllutClientId || 'dev-gcp:skjemadigitalisering:fyllut',
  },
  sendInnConfig: {
    ...sendInnConfig,
    host: sendInnConfig.host || 'https://innsending-api.intern.dev.nav.no',
    tokenxClientId: sendInnConfig.tokenxClientId || 'dev-gcp:soknad:send-inn',
  },
  idporten: {
    ...idporten,
    idportenJwksUri: idporten.idportenJwksUri || 'https://test.idporten.no/jwks.json',
  },
  amplitude,
};

const defaultConfig: DefaultConfig = {
  sentryDsn: process.env.VITE_SENTRY_DSN!,
  gitVersion: process.env.GIT_SHA!,
  useFormioApi: process.env.FORMS_SOURCE === 'formioapi',
  formioProjectUrl: process.env.FORMIO_PROJECT_URL!,
  forstesideUrl: process.env.FOERSTESIDE_URL!,
  decoratorUrl: process.env.DECORATOR_URL!,
  fyllutFrontendUrl: process.env.FYLLUT_FRONTEND_URL!,
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL!,
  skjemabyggingProxyClientId: process.env.SKJEMABYGGING_PROXY_CLIENT_ID!,
  azureOpenidTokenEndpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT!,
  clientId: process.env.AZURE_APP_CLIENT_ID!,
  skjemaDir: process.env.SKJEMA_DIR!,
  resourcesDir: process.env.RESOURCES_DIR!,
  translationDir: process.env.TRANSLATION_DIR!,
  noFormValidation: false,
  noDecorator: false,
  tokenx,
  sendInnConfig,
  idporten,
  amplitude,
};

const config: ConfigType = {
  ...(process.env.NODE_ENV === 'development' ? localDevelopmentConfig : defaultConfig),
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
};

const checkConfigConsistency = (config: ConfigType, logError = logger.error, exit = process.exit) => {
  const { useFormioApi, naisClusterName, formioProjectUrl } = config;
  if (useFormioApi) {
    if (naisClusterName === NaisCluster.PROD) {
      logError(`Invalid configuration: FormioApi is not allowed in ${naisClusterName}`);
      exit(1);
    }
    if (!formioProjectUrl) {
      logError('Invalid configuration: FORMIO_PROJECT_URL is required when using FormioApi');
      exit(1);
    }
  }
};

export { checkConfigConsistency, config };
