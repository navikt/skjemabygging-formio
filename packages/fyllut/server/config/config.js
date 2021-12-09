import dotenv from "dotenv";
import { NaisCluster } from "./nais-cluster.js";

dotenv.config();

const localDevelopmentConfig = {
  gitVersion: "local",
  useFormioApi: true,
  formioProjectUrl: "https://protected-island-44773.herokuapp.com",
  forstesideUrl: "https://www.nav.no/soknader/api/forsteside",
  decoratorUrl: "https://www.nav.no/dekoratoren?simple=true",
  skjemabyggingProxyUrl: "https://skjemabygging-proxy.dev-fss-pub.nais.io",
  skjemabyggingProxyClientId: "95170319-b4d7-4190-8271-118ed19bafbf",
  azureOpenidTokenEndpoint: "https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token",
  clientId: "599b3553-24b0-416f-9a91-3866d1197e90",
};

const defaultConfig = {
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  naisClusterName: process.env.NAIS_CLUSTER_NAME,
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
