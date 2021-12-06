import dotenv from "dotenv";
import { NaisCluster } from "./nais-cluster.js";

dotenv.config();

const config = {
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  naisClusterName: process.env.NAIS_CLUSTER_NAME,
  useFormioApi: process.env.FORMS_SOURCE === "formioapi",
  skjemaDir: process.env.SKJEMA_DIR,
  formioProjectUrl: process.env.FORMIO_PROJECT_URL,
  resourcesDir: process.env.RESOURCES_DIR,
  translationDir: process.env.TRANSLATION_DIR,
  gitVersion: process.env.GIT_SHA,
  skjemabyggingProxyUrl: process.env.SKJEMABYGGER_PROXY_URL,
  skjemabyggingProxyClientId: process.env.SKJEMABYGGER_PROXY_CLIENT_ID,
  azureOpenidTokenEndpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT,
  clientId: process.env.AZURE_APP_CLIENT_ID,
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
