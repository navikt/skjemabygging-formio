import express from "express";
import {Backend} from "../src/backend/index.js";
import {dispatcherWithBackend} from "../src/backend/webApp.js";
import {buildDirectory, buildDirectoryIndexHtml} from "./context.js";
import {gitVersionFromBuild} from "./commit_version.js";



const app = express();
const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";
const githubBaseURL = "https://api.github.com/";
const gh = {
  key: process.env.GITHUB_KEY,
  appID: process.env.GITHUB_PUBLISHING_APP_ID,
  installationID: process.env.GITHUB_PUBLISHING_INSTALLATION_ID
}

function gitVersion() {
  if (process.env.NODE_ENV === "development") {
    return "dø-detta-er-development-vet-ikke-hva-versionen-er";
  } else {
    return gitVersionFromBuild();
  }
}

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  "/api",
  dispatcherWithBackend(
    new Backend(projectURL, githubBaseURL, gh, gitVersion())
  )
);

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
