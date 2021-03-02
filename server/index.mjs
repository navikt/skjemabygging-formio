import express from "express";
import { Backend } from "../src/backend/index.js";
import { dispatcherWithBackend } from "../src/backend/webApp.js";
import { buildDirectory, buildDirectoryIndexHtml } from "./context.js";
import { gitVersionFromBuild } from "./commit_version.js";
import fs from "fs";

const app = express();
const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";

function githubKey() {
  try {
    return fs.readFileSync("/var/run/secrets/another-file-based/secret", "utf8");
  } catch (err) {
    console.error(err);
  }
}

const githubAppConfig = {
  gitRef: process.env.GITHUB_GIT_REF || "master",
  baseURL: "https://api.github.com/",
  key: process.env.GITHUB_KEY || githubKey(),
  appID: process.env.GITHUB_PUBLISHING_APP_ID,
  installationID: process.env.GITHUB_PUBLISHING_INSTALLATION_ID,
};

function gitVersion() {
  if (process.env.NODE_ENV === "development") {
    if (!process.env.GIT_VERSION) {
      return "dø-detta-er-development-vet-ikke-hva-versionen-er";
    }
    return process.env.GIT_VERSION;
  } else {
    return gitVersionFromBuild();
  }
}

console.log("gitVersion", gitVersion());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.get("/isAlive", (req, res) => res.send("Alive"));
app.get("/isReady", (req, res) => res.send("Ready"));
app.use("/api", dispatcherWithBackend(new Backend(projectURL, githubAppConfig, gitVersion())));

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === "production") {
  // serve built app in production (served by weback dev server in development)
  app.use(express.static(buildDirectory));
  app.get("/*", (req, res) => {
    res.sendFile(buildDirectoryIndexHtml);
  });
}

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port, nodeEnv);
app.listen(port);
