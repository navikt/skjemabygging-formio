import dotenv from "dotenv";
import { devAzure, devSkjemabyggingProxy } from "./development";
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

const config: ConfigType = {
  azure: {
    openidTokenEndpoint: env("AZURE_OPENID_CONFIG_TOKEN_ENDPOINT", devAzure.openidTokenEndpoint),
    clientId: env("AZURE_APP_CLIENT_ID", devAzure.clientId),
    clientSecret: env("AZURE_APP_CLIENT_SECRET"),
  },
  gitSha: env("GIT_SHA", "unknown-development-git-sha"),
  skjemabyggingProxy: {
    url: env("SKJEMABYGGING_PROXY_URL", devSkjemabyggingProxy.url),
    clientId: env("SKJEMABYGGING_PROXY_CLIENT_ID", devSkjemabyggingProxy.clientId),
  },
  publishRepo: {
    name: env("PUBLISH_REPO"),
    token: env("GITHUB_TEAM_TOKEN"),
    submoduleName: env("SUBMODULE_REPO"),
    owner: env("PUBLISH_REPO_OWNER"),
    base: env("PUBLISH_REPO_BASE"),
  },
  formio: {
    projectUrl: env("FORMIO_PROJECT_URL"),
  },
  nodeEnv,
  port: parseInt(process.env.PORT || "8080"),
  isProduction: nodeEnv === "production",
};

export default config;
