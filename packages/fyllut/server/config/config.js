import { featureUtils } from "@navikt/skjemadigitalisering-shared-domain";
import { NaisCluster } from "./nais-cluster.js";

const localDevelopmentConfig = {
  gitVersion: "local",
  useFormioApi: true,
  formioProjectUrl: "https://formio-api-server.ekstern.dev.nav.no",
  forstesideUrl: "https://www.nav.no/soknader/api/forsteside",
  decoratorUrl: "https://www.nav.no/dekoratoren?simple=true",
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL || "https://skjemabygging-proxy.dev-fss-pub.nais.io",
  skjemabyggingProxyClientId: "95170319-b4d7-4190-8271-118ed19bafbf",
  azureOpenidTokenEndpoint: "https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token",
  clientId: process.env.AZURE_APP_CLIENT_ID || "a1eddc14-0e91-40bc-b910-a0cf39ac3223", // <-- fyllut i dev-gcp
};

const defaultConfig = {
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  gitVersion: process.env.GIT_SHA,
  useFormioApi: process.env.FORMS_SOURCE === "formioapi",
  formioProjectUrl: process.env.FORMIO_PROJECT_URL,
  forstesideUrl: process.env.FOERSTESIDE_URL,
  decoratorUrl: process.env.DECORATOR_URL,
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL,
  skjemabyggingProxyClientId: process.env.SKJEMABYGGING_PROXY_CLIENT_ID,
  azureOpenidTokenEndpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT,
  clientId: process.env.AZURE_APP_CLIENT_ID,
  skjemaDir: process.env.SKJEMA_DIR,
  resourcesDir: process.env.RESOURCES_DIR,
  translationDir: process.env.TRANSLATION_DIR,
};

const config = {
  ...(process.env.NODE_ENV === "development" ? localDevelopmentConfig : defaultConfig),
  clientSecret: process.env.AZURE_APP_CLIENT_SECRET,
  naisClusterName: process.env.NAIS_CLUSTER_NAME,
  featureToggles: featureUtils.toFeatureToggles(process.env.ENABLED_FEATURES),
  skipLogging: process.env.SKIP_LOGGING === "true",
};

const checkConfigConsistency = (config, logError = console.error, exit = process.exit) => {
  const { useFormioApi, naisClusterName, formioProjectUrl } = config;
  if (useFormioApi) {
    if (naisClusterName === NaisCluster.PROD) {
      logError(`FormioApi is not allowed in ${naisClusterName}`);
      exit(1);
    }
    if (!formioProjectUrl) {
      logError("FORMIO_PROJECT_URL is required when using FormioApi");
      exit(1);
    }
  }
};

export { config, checkConfigConsistency };
