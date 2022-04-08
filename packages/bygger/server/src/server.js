import dotenv from "dotenv";
import express from "express";
import { Backend } from "./Backend.js";
import { buildDirectory, buildDirectoryIndexHtml } from "./context.js";
import { fsAccessRateLimiter } from "./middleware/ratelimit";
import { dispatcherWithBackend } from "./webApp.js";

dotenv.config();
const app = express();
const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://formio-api-server.ekstern.dev.nav.no";

function gitVersion() {
  const GIT_SHA = process.env.GIT_SHA;
  if (process.env.NODE_ENV === "development") {
    if (!GIT_SHA) {
      return "dø-detta-er-development-vet-ikke-hva-versionen-er";
    }
    return GIT_SHA;
  } else {
    if (!GIT_SHA) {
      throw new Error("missing GIT_SHA");
    }
    return GIT_SHA;
  }
}

const localDevelopmentConfig = {
  azureOpenidTokenEndpoint: "https://login.microsoftonline.com/966ac572-f5b7-4bbe-aa88-c76419c0f851/oauth2/v2.0/token",
  clientId: "599b3553-24b0-416f-9a91-3866d1197e90",
  skjemabyggingProxyClientId: "95170319-b4d7-4190-8271-118ed19bafbf",
  skjemabyggingProxyUrl: "https://skjemabygging-proxy.dev-fss-pub.nais.io",
};

const defaultConfig = {
  azureOpenidTokenEndpoint: process.env.AZURE_OPENID_CONFIG_TOKEN_ENDPOINT,
  clientId: process.env.AZURE_APP_CLIENT_ID,
  skjemabyggingProxyClientId: process.env.SKJEMABYGGING_PROXY_CLIENT_ID,
  skjemabyggingProxyUrl: process.env.SKJEMABYGGING_PROXY_URL,
  publishRepoToken: process.env.akg_pat,
  publishRepo: process.env.PUBLISH_REPO,
  submoduleRepo: process.env.SUBMODULE_REPO,
  publishRepoOwner: process.env.PUBLISH_REPO_OWNER,
  publishRepoBase: process.env.PUBLISH_REPO_BASE,
};

const config = {
  ...(process.env.NODE_ENV === "development" ? localDevelopmentConfig : defaultConfig),
  gitSha: gitVersion(),
  clientSecret: process.env.AZURE_APP_CLIENT_SECRET,
};

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.get("/isAlive", (req, res) => res.send("Alive"));
app.get("/isReady", (req, res) => res.send("Ready"));
app.use("/api", dispatcherWithBackend(new Backend(projectURL, config)));

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === "production") {
  // serve built app in production (served by weback dev server in development)
  app.use(express.static(buildDirectory));
  app.get("/*", fsAccessRateLimiter, (req, res) => {
    res.sendFile(buildDirectoryIndexHtml);
  });
}

const port = parseInt(process.env.PORT || "8080");
console.log(`serving on ${port} (${nodeEnv})`);
app.listen(port);
