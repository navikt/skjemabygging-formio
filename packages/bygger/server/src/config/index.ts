import { featureUtils } from "@navikt/skjemadigitalisering-shared-domain";
import dotenv from "dotenv";
import {
  devAzure,
  devEnabledFeatures,
  devFormio,
  devFyllut,
  devGithub,
  devGithubApp,
  devPusher,
  devSkjemabyggingProxy,
} from "./development";
import { ConfigType, NodeEnv } from "./types";

const nodeEnv = process.env.NODE_ENV as NodeEnv;

if (nodeEnv !== "test") {
  dotenv.config();
}

const env = (name: string, devValue?: string): string => {
  const value = process.env[name];
  const exists = !!value;
  if (nodeEnv === "production" && !exists) {
    throw new Error(`Missing env var: ${name}`);
  }
  if (nodeEnv === "development" && !exists && devValue) {
    return devValue;
  }
  return value!;
};

const optionalEnv = (name: string): string | undefined => {
  return process.env[name];
};

const config: ConfigType = {
  azure: {
    openidTokenEndpoint: env("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT", devAzure.openidTokenEndpoint),
    openidConfigJwksUri: env("AZURE_OPENID_CONFIG_JWKS_URI", devAzure.openidConfigJwksUri),
    openidConfigIssuer: env("AZURE_OPENID_CONFIG_ISSUER"),
    clientId: env("AZURE_APP_CLIENT_ID", devAzure.clientId),
    clientSecret: env("AZURE_APP_CLIENT_SECRET"),
  },
  gitSha: env("GIT_SHA", "unknown-development-git-sha"),
  skjemabyggingProxy: {
    url: env("SKJEMABYGGING_PROXY_URL", devSkjemabyggingProxy.url),
    clientId: env("SKJEMABYGGING_PROXY_CLIENT_ID", devSkjemabyggingProxy.clientId),
  },
  publishRepo: {
    name: env("PUBLISH_REPO", devGithub.name),
    token: optionalEnv("GITHUB_ACCESS_TOKEN"),
    owner: env("PUBLISH_REPO_OWNER", devGithub.owner),
    base: env("PUBLISH_REPO_BASE", devGithub.base),
  },
  githubApp: {
    appId: env("GITHUB_APP_ID", devGithubApp.appId),
    privateKey: env("GITHUB_APP_PRIVATE_KEY"),
    clientId: env("GITHUB_CLIENT_ID"),
    clientSecret: env("GITHUB_CLIENT_SECRET"),
    installationId: env("GITHUB_APP_INSTALLATION_ID"),
  },
  formio: {
    projectUrl: env("FORMIO_PROJECT_URL", devFormio.projectUrl),
    projectId: env("FORMIO_PROJECT_ID"),
    roleIds: {
      administrator: env("FORMIO_ROLE_ID_ADMINISTRATOR"),
      authenticated: env("FORMIO_ROLE_ID_AUTHENTICATED"),
    },
    formIds: {
      userResource: env("FORMIO_FORM_ID_USER"),
    },
    jwtSecret: env("FORMIO_JWT_SECRET"),
  },
  fyllut: {
    baseUrl: env("FYLLUT_BASE_URL", devFyllut.baseUrl),
  },
  pusher: {
    cluster: env("PUSHER_CLUSTER", devPusher.cluster),
    key: env("PUSHER_KEY"),
    app: env("PUSHER_APP"),
    secret: env("PUSHER_SECRET"),
  },
  nodeEnv,
  port: parseInt(process.env.PORT || "8080"),
  isProduction: nodeEnv === "production",
  isDevelopment: nodeEnv === "development",
  featureToggles: featureUtils.toFeatureToggles(env("ENABLED_FEATURES", devEnabledFeatures)),
};

export default config;
